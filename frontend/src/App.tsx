import { useAuth } from './hooks/useAuth';
import { AuthPage } from './features/auth/components/AuthPage';
import { UserDashboard } from './features/dashboard/components/UserDashboard';
import { AdminPostsPanel } from './features/posts/components/AdminPostsPanel';

export const App = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <main>
      <UserDashboard />
      <AdminPostsPanel />
    </main>
  );
};
