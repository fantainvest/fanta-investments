import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { queryOne } from '../config/database';
import { isMpesaConfigured, querySTKPush } from '../services/mpesa';

const router = Router();

// GET /api/mpesa/status — check if M-Pesa is configured
router.get('/status', (_req, res) => {
  res.json({ configured: isMpesaConfigured() });
});

// GET /api/mpesa/query/:checkoutRequestId — query STK push result
router.get('/query/:checkoutRequestId', authenticate, async (req: AuthRequest, res) => {
  const result = await querySTKPush(req.params.checkoutRequestId);
  res.json(result);
});

export default router;
