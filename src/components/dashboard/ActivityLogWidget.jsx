import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

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

export const ActivityLogWidget = ({ logs = [], loading = false }) => {
  return (
    <Card title="Activity Logs" subtitle="Last 5 audit events" className="bg-white p-4 shadow dark:bg-gray-800">
      {loading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">Loading activity...</p>
      ) : logs.length ? (
        <ul className="mt-4 space-y-2">
          {logs.slice(0, 5).map((log) => (
            <li
              key={log.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={resolveTone(log.action)} className="capitalize">
                  {log.action}
                </Badge>
                <p className="text-xs text-slate-500 dark:text-slate-300">{formatDate(log.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-slate-800 dark:text-white">{log.message || 'Activity recorded.'}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{log.userEmail || 'Unknown user'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">No activity logs found.</p>
      )}
    </Card>
  );
};
