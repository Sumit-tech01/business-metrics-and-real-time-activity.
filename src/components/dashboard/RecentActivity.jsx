import { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const toTimestamp = (value, time) => {
  if (!value) {
    return 0;
  }

  const raw = time ? `${value}T${time}` : value;
  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  return parsed.getTime();
};

export const RecentActivity = ({ transactions = [], query = '' }) => {
  const items = useMemo(() => {
    const transactionItems = transactions.slice(0, 20).map((item) => ({
      id: `transaction-${item.id}`,
      type: 'transaction',
      title: item.title || 'Transaction',
      detail: `${item.category || 'General'} • ${formatCurrency(item.amount)}`,
      date: item.date || item.createdAt || '',
      timestamp: toTimestamp(item.date || item.createdAt || ''),
    }));

    const keyword = String(query || '').trim().toLowerCase();
    const merged = transactionItems.sort(
      (left, right) => right.timestamp - left.timestamp,
    );

    if (!keyword) {
      return merged.slice(0, 10);
    }

    return merged
      .filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.detail.toLowerCase().includes(keyword) ||
          item.type.includes(keyword),
      )
      .slice(0, 10);
  }, [query, transactions]);

  return (
    <Card title="Recent Activity" subtitle="Last transactions" className="bg-white p-4 shadow dark:bg-gray-800">
      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => {
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mt-0.5 rounded-lg bg-white p-1.5 text-slate-600 shadow-sm dark:bg-gray-800 dark:text-slate-200">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-white">{item.title}</p>
                    <Badge tone="info" className="capitalize">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-300">{item.detail}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-500 dark:text-slate-300">{formatDate(item.date)}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">No recent activity found.</p>
      )}
    </Card>
  );
};
