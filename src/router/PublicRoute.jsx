import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FullPageLoader } from '../components/ui/Loader';

export const PublicRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
