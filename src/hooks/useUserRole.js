import { useEffect, useState } from 'react';
import { createUserProfile, getUserProfileByUid } from '../services/usersService';
import { useAuthStore } from '../store/authStore';

const DEFAULT_ROLE = 'admin';

export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const [roleState, setRoleState] = useState({
    uid: null,
    role: null,
    ready: false,
  });

  useEffect(() => {
    if (authLoading || !user?.uid) {
      return;
    }

    let active = true;

    const loadRole = async () => {
      try {
        const profile = await getUserProfileByUid(user.uid);
        let resolvedRole = profile?.role || DEFAULT_ROLE;

        if (!profile) {
          const companyId = user.companyId || null;

          if (companyId) {
            try {
              await createUserProfile({
                uid: user.uid,
                email: user.email || '',
                role: DEFAULT_ROLE,
                companyId,
                displayName: user.displayName || '',
              });
            } catch (profileError) {
              console.error('[RBAC] Failed to auto-create missing user profile:', profileError);
            }
          }

          resolvedRole = DEFAULT_ROLE;
        }

        if (!active) {
          return;
        }

        setRoleState({
          uid: user.uid,
          role: resolvedRole,
          ready: true,
        });
      } catch {
        if (!active) {
          return;
        }

        const fallbackRole = user.role || DEFAULT_ROLE;
        setRoleState({
          uid: user.uid,
          role: fallbackRole,
          ready: true,
        });
      }
    };

    loadRole();

    return () => {
      active = false;
    };
  }, [authLoading, user?.companyId, user?.displayName, user?.email, user?.role, user?.uid]);

  const role = user?.uid && roleState.uid === user.uid ? roleState.role || DEFAULT_ROLE : null;
  const loading = authLoading || (Boolean(user?.uid) && (!roleState.ready || roleState.uid !== user.uid));

  return {
    role,
    loading,
  };
};
