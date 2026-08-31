import { Router } from 'express';
import { queryAll } from '../config/database';
import { fetchPrices } from '../services/coingecko';

const router = Router();

// GET /api/crypto/prices — real-time prices from CoinGecko
router.get('/prices', async (_req, res) => {
  try {
    const prices = await fetchPrices();
    res.json(prices);
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// GET /api/crypto/assets
router.get('/assets', (_req, res) => {
  const assets = queryAll('SELECT * FROM crypto_assets WHERE is_active = 1');
  res.json(assets);
});

export default router;
