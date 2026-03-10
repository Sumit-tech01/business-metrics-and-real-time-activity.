import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FullPageLoader } from '../components/ui/Loader';

export const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
