import { useMemo } from 'react';
import { addMinutes, format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarView = ({ appointments, onSelectAppointment, onSelectSlotDate }) => {
  const events = useMemo(
    () =>
      appointments
        .map((item) => {
          const start = new Date(`${item.date}T${item.time || '09:00'}`);

          if (Number.isNaN(start.getTime())) {
            return null;
          }

          const end = addMinutes(start, 45);

          return {
            id: item.id,
            title: item.title || 'Untitled appointment',
            start,
            end,
            notes: item.notes || '',
            resource: item,
          };
        })
        .filter(Boolean),
    [appointments],
  );

  return (
    <div className="calendar-shell h-[28rem] overflow-hidden rounded-xl border border-slate-200 md:h-[34rem] dark:border-slate-800">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        tooltipAccessor={(event) => (event.notes ? `${event.title} - ${event.notes}` : event.title)}
        selectable
        popup
        views={['month', 'week', 'day', 'agenda']}
        onSelectEvent={(event) => onSelectAppointment?.(event.resource)}
        onSelectSlot={(slotInfo) => onSelectSlotDate?.(slotInfo.start)}
      />
    </div>
  );
};
