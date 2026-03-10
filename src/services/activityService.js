import { auth } from '../firebase/config';
import {
  createCollectionRecord,
  listCollection,
  subscribeCollection,
} from './firestoreClient';
import { getUserProfileByUid } from './usersService';
import { useAuthStore } from '../store/authStore';

const COLLECTION = 'activityLogs';

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeActivityLogs = (rows) =>
  [...rows]
    .map((item) => ({
      ...item,
      action: item.action || 'unknown',
      entity: item.entity || 'system',
      entityId: item.entityId || '',
      message: item.message || '',
      userEmail: item.userEmail || 'Unknown user',
    }))
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt));

export const listActivityLogs = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeActivityLogs(rows);
};

export const subscribeActivityLogs = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeActivityLogs(rows)), onError);

export const logActivity = async (action, entity, entityId, message) => {
  try {
    const storeUser = useAuthStore.getState().user;
    const authUser = auth?.currentUser || null;
    const userId = storeUser?.uid || authUser?.uid || null;
    const userEmail = storeUser?.email || authUser?.email || '';
    let companyId = storeUser?.companyId || null;

    if (!userId) {
      return null;
    }

    if (!companyId) {
      const profile = await getUserProfileByUid(userId);
      companyId = profile?.companyId || null;
    }

    if (!companyId) {
      return null;
    }

    return await createCollectionRecord(COLLECTION, userId, companyId, {
      userEmail: userEmail || 'Unknown user',
      action: String(action || 'unknown'),
      entity: String(entity || 'system'),
      entityId: String(entityId || ''),
      message: String(message || ''),
    });
  } catch (error) {
    console.error('Activity logging failed:', error);
    return null;
  }
};
