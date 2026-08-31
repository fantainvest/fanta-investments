import { Router } from 'express';
import { queryAll, queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/wallets
router.get('/', authenticate, (req: AuthRequest, res) => {
  const wallets = queryAll(
    `SELECT w.*, a.symbol, a.name as asset_name, a.coingecko_id
     FROM wallets w
     JOIN crypto_assets a ON w.asset_id = a.id
     WHERE w.user_id = ?`,
    [req.user?.id]
  );

  // Get summary stats
  const totalDeposited = (queryOne(
    "SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE user_id = ? AND status = 'confirmed'",
    [req.user?.id]
  )?.total as number) || 0;

  const totalWithdrawn = (queryOne(
    "SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE user_id = ? AND status IN ('approved', 'completed', 'pending')",
    [req.user?.id]
  )?.total as number) || 0;

  const totalInvested = (queryOne(
    'SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = ?',
    [req.user?.id]
  )?.total as number) || 0;

  const totalReturns = (queryOne(
    'SELECT COALESCE(SUM(return_amount), 0) as total FROM investments WHERE user_id = ?',
    [req.user?.id]
  )?.total as number) || 0;

  // Total wallet balance (virtual)
  const totalBalance = wallets.reduce((sum: number, w: any) => sum + (w.balance as number), 0);

  res.json({
    wallets: wallets.map((w) => ({
      id: String(w.id),
      user_id: String(w.user_id),
      asset_id: String(w.asset_id),
      balance: w.balance,
      asset: { id: String(w.asset_id), symbol: w.symbol, name: w.asset_name, is_active: 1 },
    })),
    summary: {
      totalBalance,
      totalDeposited,
      totalWithdrawn,
      totalInvested,
      totalReturns,
    },
  });
});

export default router;
