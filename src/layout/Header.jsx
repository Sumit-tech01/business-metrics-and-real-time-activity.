import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { NotificationBell } from '../components/ui/NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../hooks/useCompany';
import { useThemeStore } from '../store/themeStore';
import { useUiStore } from '../store/uiStore';

export const Header = () => {
  const { user, logout, submitting } = useAuth();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { role, companyName, loading: companyLoading } = useCompany();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initials = user?.displayName?.slice(0, 1).toUpperCase() || 'U';
  const profileMeta = companyLoading
    ? 'Loading company...'
    : `${companyName || 'No company'} • ${(role || 'admin').toUpperCase()}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-500"
          />
        </div>

        <div className="hidden max-w-[180px] truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 md:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {companyLoading ? 'Loading company...' : companyName || 'No company'}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationBell />

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((state) => !state)}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-left hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              {initials}
            </div>
            <div className="hidden max-w-[110px] md:block">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.displayName}</p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{role || 'admin'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.displayName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <p className="mt-2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {profileMeta}
              </p>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={logout}
                  disabled={submitting}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
