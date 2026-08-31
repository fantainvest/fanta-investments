import { Router } from 'express';
import { queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticate, (req: AuthRequest, res) => {
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
    countryCode: user.country_code,
    phoneNumber: user.phone_number,
    createdAt: user.created_at,
  });
});

export default router;
