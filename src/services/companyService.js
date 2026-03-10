import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase/config';

const COMPANIES_COLLECTION = 'companies';
const MOCK_COMPANIES_KEY = 'erp_mock_companies';

const readMockCompanies = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_COMPANIES_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const writeMockCompanies = (companies) => {
  localStorage.setItem(MOCK_COMPANIES_KEY, JSON.stringify(companies));
};

const emitCompanyUpdated = (companyId) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('erp-company-updated', { detail: { companyId } }));
};

const normalizeCompany = (companyId, data = {}) => ({
  id: companyId,
  name: data.name || 'Company',
  ownerId: data.ownerId || '',
  email: data.email || '',
  phone: data.phone || '',
  address: data.address || '',
  logoUrl: data.logoUrl || '',
  createdAt:
    typeof data.createdAt?.toDate === 'function'
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || '',
});

export const getCompany = async (companyId) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    return null;
  }

  if (hasFirebaseConfig) {
    const snapshot = await getDoc(doc(db, COMPANIES_COLLECTION, normalizedCompanyId));

    if (!snapshot.exists()) {
      return null;
    }

    return normalizeCompany(snapshot.id, snapshot.data());
  }

  const companies = readMockCompanies();
  const matched = companies.find((company) => company.id === normalizedCompanyId);
  return matched ? normalizeCompany(matched.id, matched) : null;
};

export const updateCompany = async (companyId, payload) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    throw new Error('Missing company id.');
  }

  const nextPayload = {
    name: String(payload?.name || '').trim() || 'Company',
    email: String(payload?.email || '').trim(),
    phone: String(payload?.phone || '').trim(),
    address: String(payload?.address || '').trim(),
    logoUrl: String(payload?.logoUrl || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  if (hasFirebaseConfig) {
    const companyRef = doc(db, COMPANIES_COLLECTION, normalizedCompanyId);
    const snapshot = await getDoc(companyRef);

    if (!snapshot.exists()) {
      await setDoc(
        companyRef,
        {
          ...nextPayload,
          ownerId: auth?.currentUser?.uid || '',
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
      emitCompanyUpdated(normalizedCompanyId);
      return;
    }

    await updateDoc(companyRef, nextPayload);
    emitCompanyUpdated(normalizedCompanyId);
    return;
  }

  const companies = readMockCompanies();
  const matched = companies.find((company) => company.id === normalizedCompanyId);

  if (!matched) {
    writeMockCompanies([
      ...companies,
      {
        id: normalizedCompanyId,
        ownerId: '',
        createdAt: new Date().toISOString(),
        ...nextPayload,
      },
    ]);
    emitCompanyUpdated(normalizedCompanyId);
    return;
  }

  const nextCompanies = companies.map((company) => {
    if (company.id !== normalizedCompanyId) {
      return company;
    }

    return {
      ...company,
      ...nextPayload,
    };
  });

  writeMockCompanies(nextCompanies);
  emitCompanyUpdated(normalizedCompanyId);
};
