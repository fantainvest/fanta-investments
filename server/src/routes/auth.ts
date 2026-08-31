import { Router } from 'express';
import bcrypt from 'bcrypt';
import { run, queryOne } from '../config/database';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = run(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, country_code) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password_hash, firstName, lastName, 'user', req.body.countryCode || 'KE']
    );

    const userId = result.lastInsertRowid;

    // Create default wallets for all assets
    const assets = (await import('../config/database')).queryAll('SELECT id FROM crypto_assets');
    for (const asset of assets) {
      run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, 0)', [userId, asset.id]);
    }

    const token = generateToken({ id: String(userId), email, role: 'user' });

    res.status(201).json({
      token,
      user: { id: String(userId), email, firstName, lastName, role: 'user' },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.is_suspended) {
      res.status(403).json({ error: 'Account is suspended' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: String(user.id), email: user.email as string, role: user.role as string });

    res.json({
      token,
      user: {
        id: String(user.id),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res) => {
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user?.id]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: String(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    isVerified: !!user.is_verified,
    createdAt: user.created_at,
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  // In production, send actual reset email
  res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
});

export default router;
