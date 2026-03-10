import {
  createCollectionRecord,
  deleteCollectionRecord,
  listCollection,
  subscribeCollection,
  updateCollectionRecord,
} from './firestoreClient';

const COLLECTION = 'appointments';

export const normalizeAppointments = (rows) =>
  rows
    .map((item) => ({
      ...item,
      status: item.status || 'scheduled',
    }))
    .sort((a, b) => {
      const left = new Date(`${a.date}T${a.time || '00:00'}`);
      const right = new Date(`${b.date}T${b.time || '00:00'}`);
      return left - right;
    });

export const listAppointments = async (companyId) => {
  const rows = await listCollection(COLLECTION, companyId);
  return normalizeAppointments(rows);
};

export const subscribeAppointments = (companyId, onData, onError) =>
  subscribeCollection(COLLECTION, companyId, (rows) => onData(normalizeAppointments(rows)), onError);

export const createAppointment = async (userId, companyId, payload) => {
  return createCollectionRecord(COLLECTION, userId, companyId, {
    ...payload,
    status: payload.status || 'scheduled',
    date: payload.date || new Date().toISOString().slice(0, 10),
  });
};

export const updateAppointment = async (userId, companyId, recordId, payload) => {
  await updateCollectionRecord(COLLECTION, recordId, payload);
};

export const deleteAppointment = async (userId, companyId, recordId) => {
  await deleteCollectionRecord(COLLECTION, recordId);
};
