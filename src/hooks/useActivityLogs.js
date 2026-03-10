import { useEffect, useState } from 'react';
import { subscribeActivityLogs } from '../services/activityService';
import { useAuthStore } from '../store/authStore';
import { useCompany } from './useCompany';

export const useActivityLogs = ({ limit } = {}) => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { companyId, loading: companyLoading } = useCompany();
  const scopeKey = user?.uid && companyId ? `${user.uid}:${companyId}` : null;
  const [snapshotState, setSnapshotState] = useState({
    scopeKey: null,
    logs: [],
    error: '',
    ready: false,
  });

  useEffect(() => {
    if (authLoading || companyLoading || !scopeKey) {
      return;
    }

    const unsubscribe = subscribeActivityLogs(
      companyId,
      (rows) => {
        const nextLogs = Number.isFinite(limit) ? rows.slice(0, Math.max(0, limit)) : rows;
        setSnapshotState({
          scopeKey,
          logs: nextLogs,
          error: '',
          ready: true,
        });
      },
      (snapshotError) => {
        setSnapshotState({
          scopeKey,
          logs: [],
          error: snapshotError?.message || 'Failed to load activity logs.',
          ready: true,
        });
      },
    );

    return () => {
      unsubscribe();
    };
  }, [authLoading, companyId, companyLoading, limit, scopeKey]);

  const scopedLogs = scopeKey && snapshotState.scopeKey === scopeKey ? snapshotState.logs : [];
  const scopedError = scopeKey && snapshotState.scopeKey === scopeKey ? snapshotState.error : '';
  const loading =
    authLoading ||
    companyLoading ||
    (Boolean(scopeKey) && (!snapshotState.ready || snapshotState.scopeKey !== scopeKey));

  return {
    logs: scopedLogs,
    loading,
    error: scopedError,
    count: scopedLogs.length,
  };
};
