import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, hasFirebaseConfig } from '../firebase/config';

const USERS_COLLECTION = 'users';
const MOCK_USERS_KEY = 'erp_mock_auth_users';
const MOCK_SESSION_KEY = 'erp_mock_auth_session';

const normalizeRole = (role) => (role === 'admin' ? 'admin' : 'staff');
const normalizeCompanyId = (companyId) => {
  const value = String(companyId || '').trim();
  return value || null;
};

const readMockUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const writeMockUsers = (users) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const readMockSession = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) ?? 'null');
  } catch {
    return null;
  }
};

const writeMockSession = (sessionUser) => {
  if (!sessionUser) {
    localStorage.removeItem(MOCK_SESSION_KEY);
    return;
  }

  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
};

export const createUserProfile = async ({ uid, email, role = 'admin', displayName = '', companyId = null }) => {
  const normalizedRole = normalizeRole(role);
  const normalizedCompanyId = normalizeCompanyId(companyId);
  const nowIso = new Date().toISOString();

  if (hasFirebaseConfig) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const existingSnapshot = await getDoc(userRef);
    const existingData = existingSnapshot.exists() ? existingSnapshot.data() : null;

    await setDoc(
      userRef,
      {
        uid,
        email,
        role: normalizedRole,
        companyId: normalizedCompanyId,
        displayName,
        createdAt: existingData?.createdAt || nowIso,
        updatedAt: nowIso,
      },
      { merge: true },
    );

    return {
      uid,
      email,
      role: normalizedRole,
      companyId: normalizedCompanyId,
      displayName,
      createdAt: existingData?.createdAt || nowIso,
    };
  }

  const users = readMockUsers();
  const matchedUser = users.find((user) => user.uid === uid);
  const nextUsers = matchedUser
    ? users.map((user) => {
        if (user.uid !== uid) {
          return user;
        }

        return {
          ...user,
          email,
          role: normalizedRole,
          companyId: normalizedCompanyId,
          displayName,
          createdAt: user.createdAt || nowIso,
        };
      })
    : [
        ...users,
        {
          uid,
          email,
          role: normalizedRole,
          companyId: normalizedCompanyId,
          displayName,
          createdAt: nowIso,
        },
      ];

  writeMockUsers(nextUsers);

  const sessionUser = readMockSession();

  if (sessionUser?.uid === uid) {
    writeMockSession({
      ...sessionUser,
      email,
      role: normalizedRole,
      companyId: normalizedCompanyId,
      displayName: displayName || sessionUser.displayName,
    });
  }

  return {
    uid,
    email,
    role: normalizedRole,
    companyId: normalizedCompanyId,
    displayName,
    createdAt: matchedUser?.createdAt || nowIso,
  };
};

export const getUserProfileByUid = async (uid) => {
  if (!uid) {
    return null;
  }

  if (hasFirebaseConfig) {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      uid: data.uid || uid,
      email: data.email || '',
      role: normalizeRole(data.role),
      companyId: normalizeCompanyId(data.companyId),
      displayName: data.displayName || '',
      createdAt:
        typeof data.createdAt?.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || '',
    };
  }

  const users = readMockUsers();
  const matchedUser = users.find((user) => user.uid === uid);

  if (!matchedUser) {
    return null;
  }

  return {
    uid: matchedUser.uid,
    email: matchedUser.email,
    role: normalizeRole(matchedUser.role),
    companyId: normalizeCompanyId(matchedUser.companyId),
    displayName: matchedUser.displayName || '',
    createdAt: matchedUser.createdAt || '',
  };
};
