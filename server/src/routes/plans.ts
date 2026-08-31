import { Router } from 'express';
import { queryAll, queryOne } from '../config/database';

const router = Router();

// GET /api/plans
router.get('/', (_req, res) => {
  const plans = queryAll('SELECT * FROM investment_plans WHERE is_active = 1 ORDER BY min_investment ASC');
  res.json(plans);
});

// GET /api/plans/:slug
router.get('/:slug', (req, res) => {
  const plan = queryOne('SELECT * FROM investment_plans WHERE slug = ?', [req.params.slug]);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  res.json(plan);
});

export default router;
