import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { clearLocalDataForUser } from '../utils/storage';
import { hasFirebaseConfig } from '../firebase/config';

const SettingsPage = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [themeDraft, setThemeDraft] = useState(theme);

  useEffect(() => {
    setThemeDraft(theme);
  }, [theme]);

  const handleClearLocalData = () => {
    if (!user) {
      return;
    }

    clearLocalDataForUser(user.uid);
    setMessage('Local fallback records have been reset for this account.');
  };

  const handleSaveAppearance = (event) => {
    event.preventDefault();
    setTheme(themeDraft);
    setMessage('Appearance settings saved.');
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Control theme, account preferences, and data source status.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Appearance" subtitle="Theme preferences" className="p-5">
          <form onSubmit={handleSaveAppearance} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Theme"
                value={themeDraft}
                onChange={(event) => setThemeDraft(event.target.value)}
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setThemeDraft(theme)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>

        <Card title="Account" subtitle="Current signed-in user" className="p-5">
          <p className="text-sm text-slate-700 dark:text-slate-200">{user?.displayName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </Card>

        <Card title="Firebase Status" subtitle="Auth + Firestore integration" className="p-5">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {hasFirebaseConfig
              ? 'Connected via environment variables. Data writes go to Firestore.'
              : 'No Firebase env config detected. Running in local fallback mode.'}
          </p>
        </Card>

        <Card title="Data Utilities" subtitle="Local fallback controls" className="p-5">
          <Button variant="danger" onClick={handleClearLocalData} disabled={hasFirebaseConfig}>
            Clear Local Data
          </Button>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Available only in local fallback mode.
          </p>
        </Card>

        <Card title="Backup & Restore" subtitle="Company backup management" className="p-5">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Export or restore your company backup from the dedicated backup workspace.
          </p>
          <div className="mt-4 flex justify-end">
            <Link to="/backup">
              <Button>Open Backup</Button>
            </Link>
          </div>
        </Card>
      </section>

      {message ? <p className="rounded-xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
};

export default SettingsPage;
