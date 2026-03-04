import type { PropsWithChildren, ReactElement } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/auth';

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: Role[];
  fallback?: ReactElement;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  fallback = <p>Access denied.</p>,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Loading session...</p>;
  }

  if (!isAuthenticated || !user) {
    return <p>Unauthorized. Please sign in.</p>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};
