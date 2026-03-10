import { CalendarClock } from 'lucide-react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const UpcomingAppointmentsWidget = ({ appointments }) => {
  return (
    <Card title="Upcoming Appointments" subtitle="Next scheduled meetings" className="p-5">
      {!appointments.length ? (
        <EmptyState title="No upcoming appointments" message="New appointments will appear here." />
      ) : (
        <ul className="space-y-3">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">{appointment.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.customerName || 'General'}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarClock className="h-4 w-4" />
                <span>
                  {formatDate(appointment.date, 'MMM dd')} {appointment.time || '--:--'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
