import {
  createCollectionRecord,
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from './firestoreClient';

const COLLECTION = 'transactions';

export const normalizeTransactions = (rows) =>
  rows
    .map((item) => ({
      ...item,
      amount: Number(item.amount) || 0,
      type: item.type || 'expense',
      category: item.category || 'Other',
    }))
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

export const listTransactions = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeTransactions(rows);
};

export const subscribeTransactions = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeTransactions(rows)), onError);

export const createTransaction = async (userId, companyId, payload) => {
  return createCollectionRecord(COLLECTION, userId, companyId, {
    ...payload,
    amount: Number(payload.amount) || 0,
    date: payload.date || new Date().toISOString().slice(0, 10),
  });
};

export const updateTransaction = async (userId, companyId, recordId, payload) => {
  await updateCollectionRecord(COLLECTION, recordId, {
    ...payload,
    amount: payload.amount !== undefined ? Number(payload.amount) || 0 : undefined,
  });
};

export const deleteTransaction = async (userId, companyId, recordId) => {
  await deleteCollectionRecord(COLLECTION, recordId);
};
