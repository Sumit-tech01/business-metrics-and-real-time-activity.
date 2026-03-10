import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createCollectionRecord,
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from '../services/firestoreClient';
import { useCompany } from './useCompany';
import { useAuthStore } from '../store/authStore';

const getActionLabel = (action) => {
  if (action === 'create') {
    return 'added';
  }

  if (action === 'update') {
    return 'updated';
  }

  if (action === 'delete') {
    return 'deleted';
  }

  return 'saved';
};

export const useCollection = (collectionName, options = {}) => {
  const {
    mapData = (rows) => rows,
    createFn,
    updateFn,
    removeFn,
    entityName = 'Record',
    realtime = true,
  } = options;

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { companyId, loading: companyLoading } = useCompany();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!collectionName || !user || !companyId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const rows = await listCollection(collectionName, companyId);
      setData(mapData(rows));
      setError('');
    } catch (err) {
      const message = err?.message || `Failed to load ${entityName.toLowerCase()} data.`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, companyId, entityName, mapData, user]);

  useEffect(() => {
    if (authLoading || companyLoading) {
      setLoading(true);
      return;
    }

    if (!collectionName || !user || !companyId) {
      setData([]);
      setLoading(false);
      return;
    }

    if (!realtime) {
      refresh();
      return undefined;
    }

    setLoading(true);

    const unsubscribe = subscribeCollection(
      collectionName,
      companyId,
      (rows) => {
        setData(mapData(rows));
        setError('');
        setLoading(false);
      },
      (snapshotError) => {
        const message = snapshotError?.message || `Realtime sync failed for ${entityName.toLowerCase()}.`;
        setError(message);
        setLoading(false);
        toast.error(message);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [authLoading, collectionName, companyId, companyLoading, entityName, mapData, realtime, refresh, user]);

  const addMutation =
    createFn ?? ((userId, nextCompanyId, payload) => createCollectionRecord(collectionName, userId, nextCompanyId, payload));
  const updateMutation =
    updateFn ?? ((userId, nextCompanyId, recordId, payload) => updateCollectionRecord(collectionName, recordId, payload));
  const removeMutation =
    removeFn ?? ((userId, nextCompanyId, recordId) => deleteCollectionRecord(collectionName, recordId));

  const runMutation = async (action, callback) => {
    if (!collectionName || !user || !companyId) {
      return null;
    }

    setSaving(true);

    try {
      const result = await callback();

      if (!realtime) {
        await refresh();
      }

      setError('');
      toast.success(`${entityName} ${getActionLabel(action)}.`);
      return result;
    } catch (err) {
      const message = err?.message || `Failed to ${action} ${entityName.toLowerCase()}.`;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (payload) => runMutation('create', () => addMutation(user.uid, companyId, payload));

  const updateItem = async (itemId, payload) =>
    runMutation('update', () => updateMutation(user.uid, companyId, itemId, payload));

  const removeItem = async (itemId) => runMutation('delete', () => removeMutation(user.uid, companyId, itemId));

  return {
    data,
    items: data,
    loading,
    saving,
    error,
    refresh,
    addItem,
    updateItem,
    removeItem,
  };
};
