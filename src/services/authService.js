import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase/config';
import { generateId } from '../utils/id';
import { createCompany, getCompanyById } from './companiesService';
import { createUserProfile, getUserProfileByUid } from './usersService';

const MOCK_USERS_KEY = 'erp_mock_auth_users';
const MOCK_SESSION_KEY = 'erp_mock_auth_session';

const mapFirebaseUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'ERP User',
  };
};

const withProfile = async (user) => {
  if (!user?.uid) {
    return null;
  }

  try {
    const profile = await getUserProfileByUid(user.uid);
    const company = profile?.companyId ? await getCompanyById(profile.companyId) : null;

    return {
      ...user,
      displayName: user.displayName || profile?.displayName || user.email?.split('@')[0] || 'ERP User',
      role: profile?.role || 'admin',
      companyId: profile?.companyId || null,
      companyName: company?.name || null,
    };
  } catch {
    return {
      ...user,
      role: user.role || 'admin',
      companyId: user.companyId || null,
      companyName: user.companyName || null,
    };
  }
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

const writeMockSession = (user) => {
  if (user) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(MOCK_SESSION_KEY);
};

export const registerUser = async ({ email, password, name }) => {
  if (hasFirebaseConfig) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = name || credential.user.displayName || email.split('@')[0];

    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }

    const company = await createCompany({
      name: `${displayName} Company`,
      ownerId: credential.user.uid,
    });

    const profile = await createUserProfile({
      uid: credential.user.uid,
      email,
      role: 'admin',
      companyId: company.id,
      displayName,
    });

    return {
      ...mapFirebaseUser(credential.user),
      role: profile.role,
      companyId: profile.companyId,
      companyName: company.name,
      displayName: profile.displayName || displayName,
    };
  }

  const users = readMockUsers();
  const existingUser = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const uid = generateId();
  const displayName = name || email.split('@')[0];
  const company = await createCompany({
    name: `${displayName} Company`,
    ownerId: uid,
  });

  const mockUser = {
    uid,
    email,
    password,
    displayName,
    role: 'admin',
    companyId: company.id,
    companyName: company.name,
  };

  users.push(mockUser);
  writeMockUsers(users);

  const sessionUser = {
    uid: mockUser.uid,
    email: mockUser.email,
    displayName: mockUser.displayName,
    role: mockUser.role,
    companyId: mockUser.companyId,
    companyName: mockUser.companyName,
  };

  writeMockSession(sessionUser);
  return sessionUser;
};

export const loginUser = async ({ email, password }) => {
  if (hasFirebaseConfig) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return withProfile(mapFirebaseUser(credential.user));
  }

  const users = readMockUsers();
  const matchedUser = users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
  );

  if (!matchedUser) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = {
    uid: matchedUser.uid,
    email: matchedUser.email,
    displayName: matchedUser.displayName,
    role: matchedUser.role || 'admin',
    companyId: matchedUser.companyId || null,
    companyName: matchedUser.companyName || null,
  };

  writeMockSession(sessionUser);
  return sessionUser;
};

export const logoutUser = async () => {
  if (hasFirebaseConfig) {
    await signOut(auth);
    return;
  }

  writeMockSession(null);
};

export const observeAuthState = (callback) => {
  if (hasFirebaseConfig) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      const mappedUser = mapFirebaseUser(firebaseUser);
      const enrichedUser = await withProfile(mappedUser);
      callback(enrichedUser);
    });
  }

  callback(readMockSession());
  return () => {};
};
