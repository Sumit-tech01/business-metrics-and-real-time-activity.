import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase/config';
import { generateId } from '../utils/id';

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

const normalizeCompanyName = (name, ownerId) => {
  const trimmed = String(name || '').trim();
  return trimmed || `Company ${String(ownerId || '').slice(0, 6) || 'ERP'}`;
};

export const createCompany = async ({ name, ownerId }) => {
  const companyName = normalizeCompanyName(name, ownerId);

  if (hasFirebaseConfig) {
    const companyRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      name: companyName,
      ownerId,
      email: '',
      phone: '',
      address: '',
      logoUrl: '',
      createdAt: serverTimestamp(),
    });

    return {
      id: companyRef.id,
      name: companyName,
      ownerId,
      email: '',
      phone: '',
      address: '',
      logoUrl: '',
      createdAt: new Date().toISOString(),
    };
  }

  const companies = readMockCompanies();
  const nextCompany = {
    id: generateId(),
    name: companyName,
    ownerId,
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
    createdAt: new Date().toISOString(),
  };

  writeMockCompanies([nextCompany, ...companies]);
  return nextCompany;
};

export const getCompanyById = async (companyId) => {
  const normalizedCompanyId = String(companyId || '').trim();

  if (!normalizedCompanyId) {
    return null;
  }

  if (hasFirebaseConfig) {
    const snapshot = await getDoc(doc(db, COMPANIES_COLLECTION, normalizedCompanyId));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
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
    };
  }

  const companies = readMockCompanies();
  return companies.find((company) => company.id === normalizedCompanyId) || null;
};
