import { useEffect } from 'react';
import { observeAuthState } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export const useAuthInitialization = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = observeAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [setLoading, setUser]);
};
