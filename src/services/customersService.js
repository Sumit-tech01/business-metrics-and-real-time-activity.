import {
  createCollectionRecord,
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from './firestoreClient';

const COLLECTION = 'customers';

export const normalizeCustomers = (rows) =>
  rows
    .map((item) => ({
      ...item,
      status: item.status || 'active',
      notes: item.notes || [],
      history: item.history || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const listCustomers = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeCustomers(rows);
};

export const subscribeCustomers = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeCustomers(rows)), onError);

export const createCustomer = async (userId, companyId, payload) => {
  return createCollectionRecord(COLLECTION, userId, companyId, {
    ...payload,
    notes: payload.notes || [],
    history: payload.history || [],
    status: payload.status || 'active',
  });
};

export const updateCustomer = async (userId, companyId, recordId, payload) => {
  await updateCollectionRecord(COLLECTION, recordId, payload);
};

export const deleteCustomer = async (userId, companyId, recordId) => {
  await deleteCollectionRecord(COLLECTION, recordId);
};
