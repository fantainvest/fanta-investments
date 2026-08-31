import { Router } from 'express';
import { queryOne } from '../config/database';

const router = Router();

// GET /api/content/:key
router.get('/:key', (req, res) => {
  // For now, return static content
  const content: Record<string, string> = {
    site_name: 'Fanta Investments',
    site_tagline: 'Smart Crypto Investing',
    hero_title: 'Invest in the Future of Finance',
    hero_subtitle: 'Access diversified cryptocurrency investment strategies designed for every risk profile.',
  };
  const value = content[req.params.key];
  if (!value) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  res.json({ key: req.params.key, value });
});

export default router;
