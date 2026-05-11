import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

export default function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
