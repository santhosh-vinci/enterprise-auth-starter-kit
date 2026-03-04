import type { Request, Response } from 'express';
import { users } from '../data/store';
import {
  isRefreshTokenActive,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
} from '../utils/jwt';
import { generateId } from '../utils/ids';

const refreshCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = (req: Request, res: Response): void => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    res.status(400).json({ message: 'Email already registered.' });
    return;
  }

  const role = users.length === 0 ? 'Admin' : 'User';
  const user = { id: generateId('user'), name, email, password, role } as const;
  users.push(user);

  res.status(201).json({
    message: 'Registration successful.',
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
};

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body as { email: string; password: string };

  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    res.status(401).json({ message: 'Invalid credentials.' });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refresh = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  res.cookie('refreshToken', refresh.token, refreshCookieOptions);
  res.status(200).json({
    accessToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
};

export const refresh = (req: Request, res: Response): void => {
  if (!req.user || req.tokenType !== 'refresh') {
    res.status(401).json({ message: 'Refresh token required.' });
    return;
  }

  if (!isRefreshTokenActive(req.user.tokenId)) {
    res.status(401).json({ message: 'Refresh token has been revoked.' });
    return;
  }

  const user = users.find((entry) => entry.id === req.user?.id);
  if (!user) {
    res.status(401).json({ message: 'User no longer exists.' });
    return;
  }

  const nextRefresh = rotateRefreshToken(req.user.tokenId, {
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

  res.cookie('refreshToken', nextRefresh.token, refreshCookieOptions);
  res.status(200).json({
    accessToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
};

export const logout = (req: Request, res: Response): void => {
  if (req.user?.tokenId) {
    revokeRefreshToken(req.user.tokenId);
  }

  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(200).json({ message: 'Logged out successfully.' });
};
