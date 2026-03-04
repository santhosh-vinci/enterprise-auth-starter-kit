export type Role = 'User' | 'Admin';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tokenId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  tokenId: string;
}
