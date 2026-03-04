import { useAuth } from '../../../context/AuthContext';
import { ProtectedRoute } from '../../../components/routing/ProtectedRoute';

export const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['User', 'Admin']}>
      <section>
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.email}</p>
        <p>Role: {user?.role}</p>

        <button type="button" onClick={() => void logout()}>
          Sign out
        </button>
      </section>
    </ProtectedRoute>
  );
};
