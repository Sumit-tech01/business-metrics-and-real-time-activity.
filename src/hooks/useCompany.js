import { useEffect, useState } from 'react';
import { getCompany } from '../services/companyService';
import { getUserProfileByUid } from '../services/usersService';
import { useAuthStore } from '../store/authStore';

export const useCompany = () => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const [refreshToken, setRefreshToken] = useState(0);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = user?.uid;
  const fallbackRole = user?.role;
  const fallbackCompanyId = user?.companyId;
  const fallbackCompanyName = user?.companyName;

  useEffect(() => {
    const handleCompanyUpdated = () => {
      setRefreshToken((value) => value + 1);
    };

    window.addEventListener('erp-company-updated', handleCompanyUpdated);

    return () => {
      window.removeEventListener('erp-company-updated', handleCompanyUpdated);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      if (authLoading) {
        if (active) {
          setLoading(true);
        }
        return;
      }

      if (!userId) {
        if (active) {
          setCompanyId(null);
          setRole(null);
          setCompanyName(null);
          setCompany(null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setLoading(true);
      }

      try {
        const profile = await getUserProfileByUid(userId);
        const resolvedCompanyId = profile?.companyId || fallbackCompanyId || null;
        const resolvedRole = profile?.role || fallbackRole || 'admin';
        const nextCompany = resolvedCompanyId ? await getCompany(resolvedCompanyId) : null;

        if (!active) {
          return;
        }

        setCompanyId(resolvedCompanyId);
        setRole(resolvedRole);
        setCompany(nextCompany);
        setCompanyName(nextCompany?.name || fallbackCompanyName || null);
      } catch {
        if (!active) {
          return;
        }

        setCompanyId(fallbackCompanyId || null);
        setRole(fallbackRole || 'admin');
        setCompanyName(fallbackCompanyName || null);
        setCompany(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCompany();

    return () => {
      active = false;
    };
  }, [authLoading, fallbackCompanyId, fallbackCompanyName, fallbackRole, refreshToken, userId]);

  return {
    companyId,
    role,
    companyName,
    company,
    loading,
  };
};
