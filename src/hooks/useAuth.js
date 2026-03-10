import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser, logoutUser, registerUser } from '../services/authService';
import { logActivity } from '../services/activityService';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setUser = useAuthStore((state) => state.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const login = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      const loggedInUser = await loginUser(payload);
      setUser(loggedInUser);
      await logActivity('login', 'auth', loggedInUser.uid, `User ${loggedInUser.email || 'unknown'} logged in.`);
      toast.success('Logged in successfully.');
      return loggedInUser;
    } catch (err) {
      const message = err?.message || 'Login failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const register = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      const registeredUser = await registerUser(payload);
      setUser(registeredUser);
      await logActivity(
        'register',
        'auth',
        registeredUser.uid,
        `User ${registeredUser.email || 'unknown'} created an account.`,
      );
      toast.success('Account created successfully.');
      return registeredUser;
    } catch (err) {
      const message = err?.message || 'Registration failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    setSubmitting(true);
    setError('');

    try {
      await logoutUser();
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (err) {
      const message = err?.message || 'Logout failed.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    loading,
    submitting,
    error,
    clearError: () => setError(''),
    login,
    register,
    logout,
  };
};
