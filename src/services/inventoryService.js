import {
  createCollectionRecord,
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from './firestoreClient';

const COLLECTION = 'inventory';

export const normalizeProducts = (rows) =>
  rows
    .map((item) => ({
      ...item,
      stock: Number(item.stock) || 0,
      price: Number(item.price) || 0,
      lowStockThreshold: Number(item.lowStockThreshold) || 10,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const listProducts = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeProducts(rows);
};

export const subscribeProducts = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeProducts(rows)), onError);

export const createProduct = async (userId, companyId, payload) => {
  return createCollectionRecord(COLLECTION, userId, companyId, {
    ...payload,
    stock: Number(payload.stock) || 0,
    price: Number(payload.price) || 0,
    lowStockThreshold: Number(payload.lowStockThreshold) || 10,
  });
};

export const updateProduct = async (userId, companyId, recordId, payload) => {
  await updateCollectionRecord(COLLECTION, recordId, {
    ...payload,
    stock: payload.stock !== undefined ? Number(payload.stock) || 0 : undefined,
    price: payload.price !== undefined ? Number(payload.price) || 0 : undefined,
    lowStockThreshold:
      payload.lowStockThreshold !== undefined ? Number(payload.lowStockThreshold) || 0 : undefined,
  });
};

export const deleteProduct = async (userId, companyId, recordId) => {
  await deleteCollectionRecord(COLLECTION, recordId);
};
