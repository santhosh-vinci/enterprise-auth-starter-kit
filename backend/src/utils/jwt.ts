import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { activeRefreshTokenIds, revokedRefreshTokenIds } from '../data/store';
import type { JwtPayload, Role } from '../types/auth';
import { generateId } from './ids';

interface TokenInput {
  userId: string;
  email: string;
  role: Role;
}

export const signAccessToken = ({ userId, email, role }: TokenInput): string => {
  const payload: JwtPayload = {
    sub: userId,
    email,
    role,
    tokenId: generateId('access'),
    type: 'access',
  };

  return jwt.sign(payload, env.accessTokenSecret, { expiresIn: '15m' });
};

export const signRefreshToken = ({ userId, email, role }: TokenInput): { token: string; tokenId: string } => {
  const tokenId = generateId('refresh');
  const payload: JwtPayload = {
    sub: userId,
    email,
    role,
    tokenId,
    type: 'refresh',
  };

  activeRefreshTokenIds.add(tokenId);

  return {
    token: jwt.sign(payload, env.refreshTokenSecret, { expiresIn: '7d' }),
    tokenId,
  };
};

export const rotateRefreshToken = (oldTokenId: string, next: TokenInput) => {
  activeRefreshTokenIds.delete(oldTokenId);
  revokedRefreshTokenIds.add(oldTokenId);

  return signRefreshToken(next);
};

export const isRefreshTokenActive = (tokenId: string): boolean => {
  if (revokedRefreshTokenIds.has(tokenId)) {
    return false;
  }

  return activeRefreshTokenIds.has(tokenId);
};

export const revokeRefreshToken = (tokenId: string): void => {
  activeRefreshTokenIds.delete(tokenId);
  revokedRefreshTokenIds.add(tokenId);
};
