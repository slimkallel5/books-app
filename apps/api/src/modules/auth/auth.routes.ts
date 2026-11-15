import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema, type AdminUser } from '@maktaba/shared';
import { query } from '../../db/pool.js';
import { unauthorized } from '../../lib/errors.js';
import { signAccessToken } from '../../lib/jwt.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

export const authRouter = Router();

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
}

/** POST /auth/login — admin sign-in, returns an access token. */
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const rows = await query<UserRow>(
      'SELECT id, email, password_hash, name, role FROM users WHERE lower(email) = lower($1)',
      [email],
    );
    const user = rows.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw unauthorized('Invalid email or password');
    }
    const admin: AdminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'admin',
    };
    res.json({ token: signAccessToken(admin), user: admin });
  } catch (err) {
    next(err);
  }
});

/** GET /auth/me — current admin profile. */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
