import type { Role } from '../types/auth';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface PostRecord {
  id: string;
  title: string;
  body: string;
  createdBy: string;
}

export const users: UserRecord[] = [];
export const posts: PostRecord[] = [
  {
    id: 'post-1',
    title: 'Secure Auth Starter',
    body: 'This is a seeded post visible to all authenticated users.',
    createdBy: 'system',
  },
];

export const activeRefreshTokenIds = new Set<string>();
export const revokedRefreshTokenIds = new Set<string>();
