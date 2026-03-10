import { useMemo, useState } from 'react';
import { Bell, Boxes, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/formatters';

export const NotificationBell = () => {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const { notifications, count, loading, lowStockItems, upcomingAppointments } = useNotifications({
    enableToasts: true,
  });

  const visibleAppointments = user?.uid ? upcomingAppointments : [];
  const visibleLowStockItems = user?.uid ? lowStockItems : [];

  const notificationCount = useMemo(
    () => (user?.uid ? count : 0),
    [count, user?.uid],
  );

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        aria-label="Notifications"
        onClick={() => setOpen((state) => !state)}
      >
        <Bell className="h-4 w-4" />
        {notificationCount ? (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {notificationCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(88vw,22rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Notifications</p>
              <span className="text-xs text-slate-500 dark:text-slate-400">{notificationCount} active</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-slate-500 dark:text-slate-400">Appointments</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{visibleAppointments.length}</p>
              </div>
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-amber-700 dark:text-amber-300">Low Stock</p>
                <p className="font-semibold text-amber-900 dark:text-amber-200">{visibleLowStockItems.length}</p>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading notifications...</p>
            ) : notifications.length ? (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <li
                    key={item.id}
                    className={`rounded-lg border px-2.5 py-2 text-xs ${
                      item.type === 'inventory'
                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <p className="flex items-center gap-1.5 font-medium">
                      {item.type === 'inventory' ? <Boxes className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">{item.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No active notifications.</p>
            )}

            <section>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" />
                Upcoming Appointments
              </div>

              {!visibleAppointments.length ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No appointments in the next 24 hours.</p>
              ) : (
                <ul className="space-y-2">
                  {visibleAppointments.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs dark:border-slate-800">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {formatDate(item.date)} {item.time || '--:--'}
                      </p>
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

              {!visibleLowStockItems.length ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No low-stock alerts.</p>
              ) : (
                <ul className="space-y-2">
                  {visibleLowStockItems.map((item) => (
                    <li key={item.id} className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      <p className="font-medium">{item.name}</p>
                      <p>{item.stock} remaining</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
};
