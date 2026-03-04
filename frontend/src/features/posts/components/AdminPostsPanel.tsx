import { ProtectedRoute } from '../../../components/routing/ProtectedRoute';

export const AdminPostsPanel = () => {
  return (
    <ProtectedRoute allowedRoles={['Admin']} fallback={<p>Only admins can manage posts.</p>}>
      <section>
        <h2>Posts Administration</h2>
        <p>Create, update, and delete posts from this panel.</p>
      </section>
    </ProtectedRoute>
  );
};
