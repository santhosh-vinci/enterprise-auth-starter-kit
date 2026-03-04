import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { api } from '../api/client';
import { tokenStore } from '../api/tokenStore';
import type { AuthUser, LoginResponse, RefreshResponse } from '../types/auth';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthState = useCallback((payload: { accessToken: string; user: AuthUser }) => {
    tokenStore.setToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await api.post<RefreshResponse>('/auth/refresh');
    applyAuthState(data);
  }, [applyAuthState]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { data } = await api.post<LoginResponse>('/auth/login', input);
      applyAuthState(data);
    },
    [applyAuthState],
  );

  const register = useCallback(async (input: RegisterInput) => {
    await api.post('/auth/register', input);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshSession();
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [isLoading, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
