import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/ui/Table';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { useUiStore } from '../store/uiStore';
import { formatDate } from '../utils/formatters';

const resolveTone = (action) => {
  const normalized = String(action || '').toLowerCase();

  if (normalized.includes('delete')) {
    return 'red';
  }

  if (normalized.includes('add') || normalized.includes('create') || normalized.includes('register')) {
    return 'green';
  }

  if (normalized.includes('update') || normalized.includes('edit')) {
    return 'yellow';
  }

  return 'blue';
};

const ActivityPage = () => {
  const { logs, loading, error } = useActivityLogs();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);

  const tableRows = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        time: formatDate(log.createdAt, 'MMM dd, yyyy HH:mm'),
        user: log.userEmail || 'Unknown user',
      })),
    [logs],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Activity</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Realtime audit trail of user actions across your ERP modules.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Logs" className="p-5">
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{logs.length}</p>
        </Card>
        <Card title="Latest Action" className="p-5 sm:col-span-1 lg:col-span-3">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {logs[0]?.message || 'No actions logged yet.'}
          </p>
        </Card>
      </section>

      <Card title="Activity Logs" subtitle="Realtime user actions" className="p-5">
        <Table
          rows={tableRows}
          loading={loading}
          emptyMessage="No activity logs found."
          columns={[
            { key: 'time', header: 'Time' },
            { key: 'user', header: 'User' },
            {
              key: 'action',
              header: 'Action',
              render: (row) => (
                <Badge tone={resolveTone(row.action)} className="capitalize">
                  {row.action}
                </Badge>
              ),
            },
            {
              key: 'message',
              header: 'Message',
              render: (row) => row.message || '---',
              searchAccessor: (row) =>
                `${row.message || ''} ${row.entity || ''} ${row.entityId || ''} ${row.action || ''} ${
                  row.userEmail || ''
                }`,
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search activity logs...',
            onFilterClick: () => toast('Use search to filter by action, user, or message.'),
            showFilter: true,
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityPage;
