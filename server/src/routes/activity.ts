import { Router } from 'express';
import { getActivityFeed } from '../mockData';

const router = Router();

// GET /api/activity/feed — Public activity feed (deposits & withdrawals from fake users)
router.get('/feed', (_req, res) => {
  const feed = getActivityFeed();
  const page = Math.max(1, parseInt(_req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(_req.query.limit as string) || 50));
  const offset = (page - 1) * limit;

  const sliced = feed.slice(offset, offset + limit);

  res.json({
    activities: sliced,
    total: feed.length,
    page,
    limit,
    totalPages: Math.ceil(feed.length / limit),
  });
});

export default router;
