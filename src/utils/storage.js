import { generateId } from './id';

const DB_KEY = 'erp_dashboard_local_db_v1';

const DEFAULT_DB = {
  transactions: [],
  customers: [],
  inventory: [],
  appointments: [],
};

const readDb = () => {
  const rawDb = localStorage.getItem(DB_KEY);

  if (!rawDb) {
    return { ...DEFAULT_DB };
  }

  try {
    const parsed = JSON.parse(rawDb);
    return {
      ...DEFAULT_DB,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_DB };
  }
};

const writeDb = (nextDb) => {
  localStorage.setItem(DB_KEY, JSON.stringify(nextDb));
};

export const listRecords = (collectionName, companyId) => {
  const normalizedCompanyId = String(companyId || '').trim();
  const db = readDb();
  return (db[collectionName] ?? []).filter((item) => item.companyId === normalizedCompanyId);
};

export const createRecord = (collectionName, userId, companyId, payload) => {
  const normalizedCompanyId = String(companyId || '').trim();
  const db = readDb();
  const nextRecord = {
    id: generateId(),
    userId,
    companyId: normalizedCompanyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };

  db[collectionName] = [nextRecord, ...(db[collectionName] ?? [])];
  writeDb(db);
  return nextRecord;
};

export const updateRecord = (collectionName, recordId, payload) => {
  const db = readDb();

  db[collectionName] = (db[collectionName] ?? []).map((item) => {
    if (item.id !== recordId) {
      return item;
    }

    return {
      ...item,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
  });

  writeDb(db);
};

export const deleteRecord = (collectionName, recordId) => {
  const db = readDb();
  db[collectionName] = (db[collectionName] ?? []).filter((item) => item.id !== recordId);
  writeDb(db);
};

export const clearLocalDataForUser = (userId) => {
  const db = readDb();

  Object.keys(DEFAULT_DB).forEach((collectionName) => {
    db[collectionName] = (db[collectionName] ?? []).filter((item) => item.userId !== userId);
  });

  writeDb(db);
};
