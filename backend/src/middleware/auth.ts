import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from '../types/auth';

const ACCESS_HEADER_PREFIX = 'Bearer ';

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader || !authorizationHeader.startsWith(ACCESS_HEADER_PREFIX)) {
    return null;
  }

  return authorizationHeader.slice(ACCESS_HEADER_PREFIX.length).trim();
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === 'string') {
    throw new Error('Token payload must be an object.');
  }

  return decoded as JwtPayload;
};

export const authenticateAccessToken =
  () => (req: Request, res: Response, next: NextFunction): void => {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ message: 'Access token missing.' });
      return;
    }

    try {
      const secret = process.env.ACCESS_TOKEN_SECRET;

      if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET is not configured.');
      }

      const payload = verifyToken(token, secret);

      if (payload.type !== 'access') {
        res.status(401).json({ message: 'Invalid token type.' });
        return;
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tokenId: payload.tokenId,
      };
      req.tokenType = payload.type;

      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired access token.' });
    }
  };

export const authenticateRefreshToken =
  () => (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: 'Refresh token missing.' });
      return;
    }

    try {
      const secret = process.env.REFRESH_TOKEN_SECRET;

      if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not configured.');
      }

      const payload = verifyToken(token, secret);

      if (payload.type !== 'refresh') {
        res.status(401).json({ message: 'Invalid token type.' });
        return;
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tokenId: payload.tokenId,
      };
      req.tokenType = payload.type;

      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
  };

export const authorizeRoles =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden. Insufficient role.' });
      return;
    }

    next();
  };
