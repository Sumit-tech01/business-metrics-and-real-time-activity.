import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase/config';
import { createRecord, deleteRecord, listRecords } from '../utils/storage';

const BACKUP_VERSION = 1;

const COLLECTION_MAPPINGS = [
  { backupKey: 'customers', collectionName: 'customers' },
  { backupKey: 'products', collectionName: 'inventory' },
  { backupKey: 'transactions', collectionName: 'transactions' },
  { backupKey: 'orders', collectionName: 'appointments' },
  { backupKey: 'activityLogs', collectionName: 'activityLogs' },
];

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeValue(nestedValue)]),
    );
  }

  return value;
};

const mapDoc = (snapshotDoc) => ({
  id: snapshotDoc.id,
  ...normalizeValue(snapshotDoc.data()),
});

const sanitizeRecordForImport = (record, companyId, userId) => {
  const payload = { ...(record || {}) };
  delete payload.id;

  return {
    ...payload,
    companyId,
    userId: userId || payload.userId || 'system',
  };
};

const getCompanyRows = async (collectionName, companyId) => {
  if (hasFirebaseConfig) {
    const ref = collection(db, collectionName);
    const snapshotQuery = query(ref, where('companyId', '==', companyId));
    const snapshot = await getDocs(snapshotQuery);
    return snapshot.docs.map(mapDoc);
  }

  return listRecords(collectionName, companyId);
};

const clearCompanyRows = async (collectionName, companyId) => {
  const existingRows = await getCompanyRows(collectionName, companyId);

  if (hasFirebaseConfig) {
    await Promise.all(
      existingRows.map((row) => {
        if (!row?.id) {
          return Promise.resolve();
        }

        return deleteDoc(doc(db, collectionName, row.id));
      }),
    );
    return;
  }

  existingRows.forEach((row) => {
    if (row?.id) {
      deleteRecord(collectionName, row.id);
    }
  });
};

const writeCompanyRows = async (
  collectionName,
  companyId,
  userId,
  records = [],
  options = { preserveIds: true },
) => {
  const preserveIds = options?.preserveIds !== false;

  for (const record of records) {
    const payload = sanitizeRecordForImport(record, companyId, userId);
    const restoreId = String(record?.id || '').trim();

    if (hasFirebaseConfig) {
      if (preserveIds && restoreId) {
        await setDoc(doc(db, collectionName, restoreId), payload, { merge: false });
      } else {
        await addDoc(collection(db, collectionName), payload);
      }
      continue;
    }

    createRecord(collectionName, userId || payload.userId || 'system', companyId, payload);
  }
};

const parseBackupData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {};
  }

  if (rawData.data && typeof rawData.data === 'object') {
    return rawData.data;
  }

  return rawData;
};

export const exportAllData = async (companyId) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    throw new Error('Missing company context.');
  }

  const backupData = {};

  for (const { backupKey, collectionName } of COLLECTION_MAPPINGS) {
    backupData[backupKey] = await getCompanyRows(collectionName, normalizedCompanyId);
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    companyId: normalizedCompanyId,
    data: backupData,
  };
};

export const importBackup = async (companyId, rawBackup, userId) => {
  const normalizedCompanyId = String(companyId || '').trim();
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedCompanyId) {
    throw new Error('Missing company context.');
  }

  if (!normalizedUserId) {
    throw new Error('Missing authenticated user context.');
  }

  const sourceCompanyId = String(rawBackup?.companyId || '').trim();
  if (sourceCompanyId && sourceCompanyId !== normalizedCompanyId) {
    throw new Error('This backup belongs to a different company and cannot be restored here.');
  }

  const payloadData = parseBackupData(rawBackup);
  const importedCounts = {};

  for (const { backupKey, collectionName } of COLLECTION_MAPPINGS) {
    const records = Array.isArray(payloadData[backupKey]) ? payloadData[backupKey] : [];
    const shouldClear = collectionName !== 'activityLogs' || !hasFirebaseConfig;

    if (shouldClear) {
      await clearCompanyRows(collectionName, normalizedCompanyId);
    }

    await writeCompanyRows(collectionName, normalizedCompanyId, normalizedUserId, records, {
      preserveIds: collectionName !== 'activityLogs',
    });
    importedCounts[backupKey] = records.length;
  }

  return {
    companyId: normalizedCompanyId,
    importedCounts,
    restoredAt: new Date().toISOString(),
  };
};
