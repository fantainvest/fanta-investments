import { Router } from 'express';
import { run, queryAll, queryOne } from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { fetchPriceBySymbol } from '../services/coingecko';

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/analytics
router.get('/analytics', (_req: AuthRequest, res) => {
  const totalUsers = (queryOne('SELECT COUNT(*) as count FROM users')?.count as number) || 0;
  const totalDeposits = (queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'confirmed'")?.total as number) || 0;
  const totalWithdrawals = (queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('approved', 'completed')")?.total as number) || 0;
  const activeInvestments = (queryOne("SELECT COUNT(*) as count FROM investments WHERE status = 'active'")?.count as number) || 0;
  const totalInvested = (queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM investments')?.total as number) || 0;
  const pendingDeposits = (queryOne("SELECT COUNT(*) as count FROM deposits WHERE status = 'pending'")?.count as number) || 0;
  const pendingWithdrawals = (queryOne("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'")?.count as number) || 0;

  res.json({
    totalUsers,
    totalDeposits,
    totalWithdrawals,
    activeInvestments,
    totalInvested,
    pendingDeposits,
    pendingWithdrawals,
    platformValue: totalDeposits - totalWithdrawals,
  });
});

// GET /api/admin/users
router.get('/users', (_req: AuthRequest, res) => {
  const users = queryAll('SELECT id, email, first_name, last_name, role, is_verified, is_suspended, two_factor_enabled, country_code, phone_number, created_at FROM users ORDER BY created_at DESC');
  res.json(users.map((u) => ({ ...u, id: String(u.id) })));
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', (req: AuthRequest, res) => {
  run('UPDATE users SET is_verified = 1, updated_at = datetime("now") WHERE id = ?', [req.params.id]);
  res.json({ message: 'User verified' });
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', (req: AuthRequest, res) => {
  const user = queryOne('SELECT is_suspended FROM users WHERE id = ?', [req.params.id]);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const newStatus = user.is_suspended ? 0 : 1;
  run('UPDATE users SET is_suspended = ?, updated_at = datetime("now") WHERE id = ?', [newStatus, req.params.id]);
  res.json({ message: newStatus ? 'User suspended' : 'User unsuspended' });
});

// GET /api/admin/deposits
router.get('/deposits', (_req: AuthRequest, res) => {
  const deposits = queryAll(
    `SELECT d.*, u.email as user_email, u.first_name, u.last_name, a.symbol, a.name as asset_name
     FROM deposits d
     JOIN users u ON d.user_id = u.id
     JOIN crypto_assets a ON d.asset_id = a.id
     ORDER BY d.created_at DESC`
  );
  res.json(deposits.map((d) => ({
    id: String(d.id), user_id: String(d.user_id), asset_id: String(d.asset_id),
    amount: d.amount, reference_id: d.reference_id, status: d.status,
    payment_method: d.payment_method, network: d.network, phone_number: d.phone_number,
    mpesa_receipt: d.mpesa_receipt, created_at: d.created_at,
    asset: { id: String(d.asset_id), symbol: d.symbol, name: d.asset_name, is_active: 1 },
    user: { id: String(d.user_id), email: d.user_email, firstName: d.first_name, lastName: d.last_name },
  })));
});

// PATCH /api/admin/deposits/:id/status
router.patch('/deposits/:id/status', (req: AuthRequest, res) => {
  const { status } = req.body;
  const deposit = queryOne('SELECT * FROM deposits WHERE id = ?', [req.params.id]);
  if (!deposit) { res.status(404).json({ error: 'Deposit not found' }); return; }

  run('UPDATE deposits SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, req.params.id]);

  // If confirmed, credit admin wallet (real money) AND user wallet (virtual balance)
  if (status === 'confirmed' && deposit.status !== 'confirmed') {
    // 1. Credit admin wallet with real money
    const adminWallet = queryOne('SELECT id FROM admin_wallets WHERE asset_id = ?', [deposit.asset_id]);
    if (adminWallet) {
      run('UPDATE admin_wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [deposit.amount, adminWallet.id]);
    } else {
      run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [deposit.asset_id, deposit.amount]);
    }

    // 2. Credit user wallet with virtual balance (user sees this number)
    const wallet = queryOne('SELECT id FROM wallets WHERE user_id = ? AND asset_id = ?', [deposit.user_id, deposit.asset_id]);
    if (wallet) {
      run('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [deposit.amount, wallet.id]);
    } else {
      run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [deposit.user_id, deposit.asset_id, deposit.amount]);
    }

    const asset = queryOne('SELECT symbol FROM crypto_assets WHERE id = ?', [deposit.asset_id]);
    run(
      'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
      [deposit.user_id, 'deposit', deposit.amount, asset?.symbol || 'USDT', deposit.reference_id, `Deposit confirmed via ${deposit.payment_method} — funds received in admin wallet`]
    );
  }

  res.json({ message: `Deposit ${status}` });
});

// GET /api/admin/withdrawals
router.get('/withdrawals', (_req: AuthRequest, res) => {
  const withdrawals = queryAll(
    `SELECT w.*, u.email as user_email, u.first_name, u.last_name, a.symbol, a.name as asset_name
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     JOIN crypto_assets a ON w.asset_id = a.id
     ORDER BY w.created_at DESC`
  );
  res.json(withdrawals.map((w) => ({
    id: String(w.id), user_id: String(w.user_id), asset_id: String(w.asset_id),
    amount: w.amount, wallet_address: w.wallet_address, network: w.network,
    reference_id: w.reference_id, status: w.status, admin_notes: w.admin_notes,
    created_at: w.created_at,
    asset: { id: String(w.asset_id), symbol: w.symbol, name: w.asset_name, is_active: 1 },
    user: { id: String(w.user_id), email: w.user_email, firstName: w.first_name, lastName: w.last_name },
  })));
});

// GET /api/admin/investments
router.get('/investments', (_req: AuthRequest, res) => {
  const investments = queryAll(
    `SELECT i.*, u.email as user_email, u.first_name, u.last_name, p.name as plan_name
     FROM investments i
     JOIN users u ON i.user_id = u.id
     JOIN investment_plans p ON i.plan_id = p.id
     ORDER BY i.created_at DESC`
  );
  res.json(investments.map((i) => ({
    id: String(i.id), user_id: String(i.user_id),
    amount: i.amount, status: i.status, start_date: i.start_date,
    end_date: i.end_date, return_amount: i.return_amount, created_at: i.created_at,
    plan: { id: String(i.plan_id), name: i.plan_name },
    user: { id: String(i.user_id), email: i.user_email, firstName: i.first_name, lastName: i.last_name },
  })));
});

// GET /api/admin/transactions
router.get('/transactions', (_req: AuthRequest, res) => {
  const txns = queryAll('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 200');
  res.json(txns.map((t) => ({ ...t, id: String(t.id), user_id: String(t.user_id) })));
});

// GET /api/admin/plans
router.get('/plans', (_req: AuthRequest, res) => {
  res.json(queryAll('SELECT * FROM investment_plans ORDER BY min_investment ASC'));
});

// POST /api/admin/withdraw — Admin withdrawal from deposited crypto
router.post('/withdraw', async (req: AuthRequest, res) => {
  const { userId, assetId, amount, walletAddress, network, notes } = req.body;

  if (!userId || !assetId || !amount || !walletAddress || !network) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  // Verify target user exists
  const targetUser = queryOne('SELECT id FROM users WHERE id = ?', [userId]);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const asset = queryOne('SELECT * FROM crypto_assets WHERE id = ?', [assetId]);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  // Check user's wallet balance
  const wallet = queryOne('SELECT balance FROM wallets WHERE user_id = ? AND asset_id = ?', [userId, assetId]);
  if (!wallet || (wallet.balance as number) < amount) {
    res.status(400).json({ error: 'Insufficient balance in user wallet' });
    return;
  }

  // Deduct from wallet
  run('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now") WHERE user_id = ? AND asset_id = ?', [amount, userId, assetId]);

  const refId = `ADMIN-WD-${Date.now().toString(36).toUpperCase()}`;

  const result = run(
    'INSERT INTO withdrawals (user_id, asset_id, amount, wallet_address, network, reference_id, status, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, assetId, amount, walletAddress, network, refId, 'completed', notes || 'Admin-initiated withdrawal']
  );

  // Log transaction
  run(
    'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, 'withdrawal', amount, asset.symbol, refId, `Admin withdrawal: ${amount} ${asset.symbol} to ${walletAddress.slice(0, 15)}...`]
  );

  res.status(201).json({
    id: String(result.lastInsertRowid),
    reference_id: refId,
    status: 'completed',
    amount,
    wallet_address: walletAddress,
    network,
    message: `Successfully withdrew ${amount} ${asset.symbol} from user`,
  });
});

// GET /api/admin/user-wallets — Get all user wallets with balances
router.get('/user-wallets', (_req: AuthRequest, res) => {
  const wallets = queryAll(
    `SELECT w.*, u.email, u.first_name, u.last_name, a.symbol, a.name as asset_name
     FROM wallets w
     JOIN users u ON w.user_id = u.id
     JOIN crypto_assets a ON w.asset_id = a.id
     WHERE w.balance > 0
     ORDER BY w.balance DESC`
  );
  res.json(wallets.map((w) => ({
    id: String(w.id),
    user_id: String(w.user_id),
    asset_id: String(w.asset_id),
    balance: w.balance,
    email: w.email,
    firstName: w.first_name,
    lastName: w.last_name,
    asset: { id: String(w.asset_id), symbol: w.symbol, name: w.asset_name },
  })));
});

// GET /api/admin/admin-wallet — Get admin wallet balances
router.get('/admin-wallet', (_req: AuthRequest, res) => {
  const wallets = queryAll(
    `SELECT aw.*, a.symbol, a.name as asset_name
     FROM admin_wallets aw
     JOIN crypto_assets a ON aw.asset_id = a.id
     ORDER BY aw.balance DESC`
  );
  res.json(wallets.map((w) => ({
    id: String(w.id),
    asset_id: String(w.asset_id),
    balance: w.balance,
    asset: { id: String(w.asset_id), symbol: w.symbol, name: w.asset_name },
  })));
});

// POST /api/admin/admin-wallet/withdraw — Withdraw from admin wallet to main wallet
router.post('/admin-wallet/withdraw', async (req: AuthRequest, res) => {
  const { assetId, amount, walletAddress, network, notes } = req.body;

  if (!assetId || !amount || !walletAddress || !network) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const asset = queryOne('SELECT * FROM crypto_assets WHERE id = ?', [assetId]);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  // Check admin wallet balance
  const adminWallet = queryOne('SELECT balance FROM admin_wallets WHERE asset_id = ?', [assetId]);
  if (!adminWallet || (adminWallet.balance as number) < amount) {
    res.status(400).json({ error: 'Insufficient balance in admin wallet' });
    return;
  }

  // Deduct from admin wallet
  run('UPDATE admin_wallets SET balance = balance - ?, updated_at = datetime("now") WHERE asset_id = ?', [amount, assetId]);

  // Remove empty admin wallets
  run('DELETE FROM admin_wallets WHERE balance <= 0 AND asset_id = ?', [assetId]);

  const refId = `MAIN-WD-${Date.now().toString(36).toUpperCase()}`;

  // Log as admin transaction
  run(
    'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user?.id, 'admin_withdrawal', amount, asset.symbol, refId, `Admin withdrawal to main wallet: ${amount} ${asset.symbol} → ${walletAddress.slice(0, 15)}... ${notes ? `(${notes})` : ''}`]
  );

  res.status(201).json({
    reference_id: refId,
    status: 'completed',
    amount,
    wallet_address: walletAddress,
    network,
    asset: { symbol: asset.symbol, name: asset.name },
    message: `Successfully withdrew ${amount} ${asset.symbol} to main wallet`,
  });
});

// PATCH /api/admin/withdrawals/:id/status — Approve user withdrawal (moves from admin wallet)
router.patch('/withdrawals/:id/status', (req: AuthRequest, res) => {
  const { status, notes } = req.body;
  const withdrawal = queryOne('SELECT * FROM withdrawals WHERE id = ?', [req.params.id]);
  if (!withdrawal) { res.status(404).json({ error: 'Withdrawal not found' }); return; }

  run('UPDATE withdrawals SET status = ?, admin_notes = ?, updated_at = datetime("now") WHERE id = ?', [status, notes || null, req.params.id]);

  // If rejected, remove from admin wallet and refund user wallet
  if (status === 'rejected' && withdrawal.status !== 'rejected') {
    // Remove from admin wallet
    const adminW = queryOne('SELECT balance FROM admin_wallets WHERE asset_id = ?', [withdrawal.asset_id]);
    if (adminW && (adminW.balance as number) >= (withdrawal.amount as number)) {
      run('UPDATE admin_wallets SET balance = balance - ?, updated_at = datetime("now") WHERE asset_id = ?', [withdrawal.amount, withdrawal.asset_id]);
    }
    // Refund user wallet
    run('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now") WHERE user_id = ? AND asset_id = ?', [withdrawal.amount, withdrawal.user_id, withdrawal.asset_id]);
    run(
      'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
      [withdrawal.user_id, 'refund', withdrawal.amount, 'USDT', withdrawal.reference_id, 'Withdrawal rejected — funds refunded']
    );
  }

  res.json({ message: `Withdrawal ${status}` });
});

export default router;
