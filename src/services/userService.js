import {
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from './firestoreClient';

const COLLECTION = 'users';

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeRole = (role) => (role === 'admin' ? 'admin' : 'staff');

const normalizeUsers = (rows) =>
  [...rows]
    .map((item) => ({
      ...item,
      uid: item.uid || item.id,
      email: item.email || '',
      role: normalizeRole(item.role),
      companyId: item.companyId || '',
      createdAt: item.createdAt || item.updatedAt || '',
    }))
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt));

export const getUsers = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeUsers(rows);
};

export const subscribeUsers = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeUsers(rows)), onError);

export const updateUserRole = async (uid, role) => {
  if (!uid) {
    throw new Error('Missing user id.');
  }

  await updateCollectionRecord(COLLECTION, uid, {
    role: normalizeRole(role),
  });
};

export const deleteUser = async (uid) => {
  if (!uid) {
    throw new Error('Missing user id.');
  }

  await deleteCollectionRecord(COLLECTION, uid);
};
