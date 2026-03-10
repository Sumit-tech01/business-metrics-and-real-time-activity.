import { Navigate } from 'react-router-dom';
import { InlineLoader } from '../ui/Loader';
import { useAuthStore } from '../../store/authStore';
import { useUserRole } from '../../hooks/useUserRole';

export const RequireRole = ({ allowedRoles, children }) => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { role: currentRole, loading: roleLoading } = useUserRole();

  const normalizedAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [];
  const resolvedRole = currentRole || user?.role || 'admin';

  if (authLoading || roleLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70">
        <InlineLoader label="Checking access..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!normalizedAllowedRoles.includes(resolvedRole)) {
    return (
      <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Not authorized</p>
      </div>
    );
  }

  return children;
};
