import { Router } from 'express';
import { run, queryAll, queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/investments
router.get('/', authenticate, (req: AuthRequest, res) => {
  const investments = queryAll(
    `SELECT i.*, p.name as plan_name, p.slug as plan_slug, p.duration_days, p.fee_percentage, p.expected_return_min, p.expected_return_max
     FROM investments i
     JOIN investment_plans p ON i.plan_id = p.id
     WHERE i.user_id = ?
     ORDER BY i.created_at DESC`,
    [req.user?.id]
  );
  res.json(investments);
});

// POST /api/investments
router.post('/', authenticate, (req: AuthRequest, res) => {
  const { planId, amount } = req.body;

  if (!planId || !amount) {
    res.status(400).json({ error: 'Plan ID and amount are required' });
    return;
  }

  const plan = queryOne('SELECT * FROM investment_plans WHERE id = ?', [planId]);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }

  if (amount < plan.min_investment || amount > plan.max_investment) {
    res.status(400).json({
      error: `Amount must be between ${plan.min_investment} and ${plan.max_investment}`,
    });
    return;
  }

  // Check user has enough virtual balance (USDT)
  const usdtAsset = queryOne('SELECT id FROM crypto_assets WHERE symbol = ?', ['USDT']);
  if (usdtAsset) {
    const wallet = queryOne('SELECT balance FROM wallets WHERE user_id = ? AND asset_id = ?', [req.user?.id, usdtAsset.id]);
    if (!wallet || (wallet.balance as number) < amount) {
      res.status(400).json({ error: 'Insufficient balance. Please deposit first.' });
      return;
    }
    // Deduct from user's virtual balance
    run('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now") WHERE user_id = ? AND asset_id = ?', [amount, req.user?.id, usdtAsset.id]);
  }

  // Credit admin wallet with the invested amount (real money moves to admin)
  if (usdtAsset) {
    const adminWallet = queryOne('SELECT id FROM admin_wallets WHERE asset_id = ?', [usdtAsset.id]);
    if (adminWallet) {
      run('UPDATE admin_wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [amount, adminWallet.id]);
    } else {
      run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [usdtAsset.id, amount]);
    }
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + (plan.duration_days as number));

  const result = run(
    'INSERT INTO investments (user_id, plan_id, amount, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user?.id, planId, amount, 'active', now.toISOString(), endDate.toISOString()]
  );

  // Log transaction
  run(
    'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user?.id, 'investment', amount, 'USDT', `INV-${result.lastInsertRowid}`, `Invested ${amount} in ${plan.name} plan — funds transferred to admin wallet`]
  );

  const investment = queryOne(
    `SELECT i.*, p.name as plan_name FROM investments i JOIN investment_plans p ON i.plan_id = p.id WHERE i.id = ?`,
    [result.lastInsertRowid]
  );

  res.status(201).json(investment);
});

export default router;
