import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase/config';
import { createRecord, deleteRecord, listRecords, updateRecord } from '../utils/storage';

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }

    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, normalizeValue(nestedValue)]));
  }

  return value;
};

const stripUndefined = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, stripUndefined(nestedValue)]),
    );
  }

  return value;
};

const mapDoc = (document) => ({
  id: document.id,
  ...normalizeValue(document.data()),
});

export const listCollection = async (collectionName, companyId) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    return [];
  }

  if (hasFirebaseConfig) {
    const ref = collection(db, collectionName);
    const snapshotQuery = query(ref, where('companyId', '==', normalizedCompanyId));

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        snapshotQuery,
        (snapshot) => {
          resolve(snapshot.docs.map(mapDoc));
          unsubscribe();
        },
        (error) => {
          reject(error);
          unsubscribe();
        },
      );
    });
  }

  return listRecords(collectionName, normalizedCompanyId);
};

export const subscribeCollection = (collectionName, companyId, onData, onError) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    onData([]);
    return () => {};
  }

  if (hasFirebaseConfig) {
    const ref = collection(db, collectionName);
    const snapshotQuery = query(ref, where('companyId', '==', normalizedCompanyId));

    return onSnapshot(
      snapshotQuery,
      (snapshot) => {
        onData(snapshot.docs.map(mapDoc));
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      },
    );
  }

  onData(listRecords(collectionName, normalizedCompanyId));
  return () => {};
};

export const createCollectionRecord = async (collectionName, userId, companyId, payload) => {
  const normalizedCompanyId = String(companyId || '').trim();
  const sanitizedPayload = stripUndefined(payload);

  if (!normalizedCompanyId) {
    throw new Error('Missing company context.');
  }

  if (hasFirebaseConfig) {
    const documentRef = await addDoc(collection(db, collectionName), {
      ...sanitizedPayload,
      userId,
      companyId: normalizedCompanyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: documentRef.id,
      userId,
      companyId: normalizedCompanyId,
      ...sanitizedPayload,
    };
  }

  return createRecord(collectionName, userId, normalizedCompanyId, sanitizedPayload);
};

export const updateCollectionRecord = async (collectionName, recordId, payload) => {
  const sanitizedPayload = stripUndefined(payload);

  if (hasFirebaseConfig) {
    await updateDoc(doc(db, collectionName, recordId), {
      ...sanitizedPayload,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  updateRecord(collectionName, recordId, sanitizedPayload);
};

export const deleteCollectionRecord = async (collectionName, recordId) => {
  if (hasFirebaseConfig) {
    await deleteDoc(doc(db, collectionName, recordId));
    return;
  }

  deleteRecord(collectionName, recordId);
};
