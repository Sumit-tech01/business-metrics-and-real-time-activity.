import { AlertTriangle, BellRing, CalendarClock, PackageSearch } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

export const AlertsWidget = ({
  lowStockItems = [],
  upcomingAppointments = [],
  notifications = [],
  loading = false,
}) => {
  return (
    <Card
      title="Alerts / Notifications"
      subtitle="Low stock and upcoming orders"
      className="bg-white p-4 shadow dark:bg-gray-800"
      actions={<Badge tone="info">{notifications.length} alerts</Badge>}
    >
      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">Loading alerts...</p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Low Stock</p>
            </div>

            {lowStockItems.length ? (
              <ul className="space-y-2">
                {lowStockItems.slice(0, 6).map((item) => (
                  <li key={item.id} className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-gray-800/60">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800 dark:text-white">{item.name || 'Product'}</p>
                      <Badge tone="warning">{item.stock} left</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm text-slate-600 dark:bg-gray-800/60 dark:text-slate-300">
                <PackageSearch className="h-4 w-4" />
                No low stock items.
              </div>
            )}
          </section>

          <section className="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-900/20">
            <div className="mb-2 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Upcoming Orders</p>
            </div>

            {upcomingAppointments.length ? (
              <ul className="space-y-2">
                {upcomingAppointments.slice(0, 6).map((item) => (
                  <li key={item.id} className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-gray-800/60">
                    <p className="font-medium text-slate-800 dark:text-white">{item.title || 'Order'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {formatDate(item.date)} {item.time || '--:--'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm text-slate-600 dark:bg-gray-800/60 dark:text-slate-300">
                <BellRing className="h-4 w-4" />
                No upcoming orders.
              </div>
            )}
          </section>
        </div>
      )}
    </Card>
  );
};
