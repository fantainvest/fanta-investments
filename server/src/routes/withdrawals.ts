import { Router } from 'express';
import { run, queryAll, queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { fetchPriceBySymbol } from '../services/coingecko';

const router = Router();

// GET /api/withdrawals
router.get('/', authenticate, (req: AuthRequest, res) => {
  const withdrawals = queryAll(
    `SELECT w.*, a.symbol, a.name as asset_name
     FROM withdrawals w
     JOIN crypto_assets a ON w.asset_id = a.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [req.user?.id]
  );
  res.json(withdrawals.map((w) => ({
    id: String(w.id),
    user_id: String(w.user_id),
    asset_id: String(w.asset_id),
    amount: w.amount,
    wallet_address: w.wallet_address,
    network: w.network,
    tx_hash: w.tx_hash,
    reference_id: w.reference_id,
    status: w.status,
    admin_notes: w.admin_notes,
    created_at: w.created_at,
    asset: { id: String(w.asset_id), symbol: w.symbol, name: w.asset_name, is_active: 1 },
  })));
});

// POST /api/withdrawals
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { assetId, amount, walletAddress, network } = req.body;

  if (!assetId || !amount || !walletAddress || !network) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const MIN_WITHDRAWAL_USD = 10;

  // Check 5000 KES investment threshold
  const totalInvested = (queryOne(
    'SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = ?',
    [req.user?.id]
  )?.total as number) || 0;

  const INVESTMENT_THRESHOLD_KES = 5000;
  if (totalInvested < INVESTMENT_THRESHOLD_KES) {
    res.status(400).json({
      error: `Investment threshold not met. You need to invest at least KSh${INVESTMENT_THRESHOLD_KES.toLocaleString()} before withdrawing.`,
      code: 'INVESTMENT_THRESHOLD_NOT_MET',
    });
    return;
  }

  const asset = queryOne('SELECT * FROM crypto_assets WHERE id = ?', [assetId]);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  // Check withdrawal threshold ($10 USD minimum)
  const assetPrice = await fetchPriceBySymbol(asset.symbol as string);
  const withdrawalValueUSD = (amount as number) * assetPrice;
  if (withdrawalValueUSD < MIN_WITHDRAWAL_USD) {
    res.status(400).json({
      error: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD} USD. Your withdrawal is worth ~$${withdrawalValueUSD.toFixed(2)}.`,
    });
    return;
  }

  // Check user has sufficient balance
  const wallet = queryOne('SELECT balance FROM wallets WHERE user_id = ? AND asset_id = ?', [req.user?.id, assetId]);
  if (!wallet || (wallet.balance as number) < amount) {
    res.status(400).json({ error: 'Insufficient balance' });
    return;
  }

  // DO NOT deduct from user wallet — user keeps seeing their balance
  // Instead, credit the admin wallet with these funds

  // Ensure admin wallet exists for this asset
  const adminWallet = queryOne('SELECT id, balance FROM admin_wallets WHERE asset_id = ?', [assetId]);
  if (adminWallet) {
    run('UPDATE admin_wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [amount, adminWallet.id]);
  } else {
    run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [assetId, amount]);
  }

  const refId = `WD-${Date.now().toString(36).toUpperCase()}`;

  const result = run(
    'INSERT INTO withdrawals (user_id, asset_id, amount, wallet_address, network, reference_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user?.id, assetId, amount, walletAddress, network, refId, 'pending']
  );

  // Log transaction
  run(
    'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user?.id, 'withdrawal', amount, asset.symbol, refId, `Withdrawal request via ${network} — pending admin approval`]
  );

  res.status(201).json({
    id: String(result.lastInsertRowid),
    reference_id: refId,
    status: 'pending',
    amount,
    wallet_address: walletAddress,
    network,
  });
});

export default router;
