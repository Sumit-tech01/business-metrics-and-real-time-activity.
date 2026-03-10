import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteUser, subscribeUsers, updateUserRole } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { useCompany } from './useCompany';

export const useUsers = () => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { companyId, loading: companyLoading } = useCompany();
  const scopeKey = user?.uid && companyId ? `${user.uid}:${companyId}` : null;
  const [snapshotState, setSnapshotState] = useState({
    scopeKey: null,
    users: [],
    error: '',
    ready: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || companyLoading || !scopeKey) {
      return;
    }

    const unsubscribe = subscribeUsers(
      companyId,
      (rows) => {
        setSnapshotState({
          scopeKey,
          users: rows,
          error: '',
          ready: true,
        });
      },
      (snapshotError) => {
        setSnapshotState({
          scopeKey,
          users: [],
          error: snapshotError?.message || 'Failed to load users.',
          ready: true,
        });
      },
    );

    return () => {
      unsubscribe();
    };
  }, [authLoading, companyId, companyLoading, scopeKey]);

  const users = scopeKey && snapshotState.scopeKey === scopeKey ? snapshotState.users : [];
  const error = scopeKey && snapshotState.scopeKey === scopeKey ? snapshotState.error : '';
  const loading =
    authLoading ||
    companyLoading ||
    (Boolean(scopeKey) && (!snapshotState.ready || snapshotState.scopeKey !== scopeKey));

  const changeRole = async (uid, role) => {
    setSaving(true);

    try {
      await updateUserRole(uid, role);
      toast.success('User role updated.');
    } catch (mutationError) {
      toast.error(mutationError?.message || 'Failed to update user role.');
      throw mutationError;
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (uid) => {
    setSaving(true);

    try {
      await deleteUser(uid);
      toast.success('User deleted.');
    } catch (mutationError) {
      toast.error(mutationError?.message || 'Failed to delete user.');
      throw mutationError;
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    loading,
    saving,
    error,
    changeRole,
    removeUser,
  };
};
