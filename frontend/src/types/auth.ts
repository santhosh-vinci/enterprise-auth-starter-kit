export type Role = 'User' | 'Admin';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  user: AuthUser;
}
