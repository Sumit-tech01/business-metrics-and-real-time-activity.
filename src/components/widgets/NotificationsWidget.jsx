import { BellRing, Boxes, CalendarClock } from 'lucide-react';
import { Card } from '../common/Card';

export const NotificationsWidget = ({ notifications, loading }) => {
  const appointmentAlerts = notifications.filter((item) => item.type === 'appointment').slice(0, 5);
  const inventoryAlerts = notifications.filter((item) => item.type === 'inventory').slice(0, 5);

  return (
    <Card
      title="Notifications / Alerts"
      subtitle="Realtime low stock and upcoming appointments"
      className="p-5 xl:col-span-3"
    >
      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading alerts...</p>
      ) : !notifications.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No active alerts.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <CalendarClock className="h-3.5 w-3.5" />
              Upcoming Appointments
            </div>

            {!appointmentAlerts.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming appointments in the next 24 hours.</p>
            ) : (
              <ul className="space-y-2">
                {appointmentAlerts.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Boxes className="h-3.5 w-3.5" />
              Low Stock Alerts
            </div>

            {!inventoryAlerts.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No low stock products.</p>
            ) : (
              <ul className="space-y-2">
                {inventoryAlerts.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                  >
                    <p className="inline-flex items-center gap-1.5 font-medium">
                      <BellRing className="h-3.5 w-3.5" />
                      {item.title}
                    </p>
                    <p className="text-xs">{item.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Card>
  );
};
