import { useMemo } from 'react';
import { isAfter, startOfDay } from 'date-fns';
import { useCollection } from './useCollection';
import {
  createAppointment,
  deleteAppointment,
  normalizeAppointments,
  updateAppointment,
} from '../services/appointmentsService';

export const useAppointments = () => {
  const resource = useCollection('appointments', {
    mapData: normalizeAppointments,
    createFn: createAppointment,
    updateFn: updateAppointment,
    removeFn: deleteAppointment,
    entityName: 'Appointment',
  });

  const upcomingAppointments = useMemo(() => {
    const now = startOfDay(new Date());

    return resource.items
      .filter((item) => {
        const appointmentDate = new Date(`${item.date}T${item.time || '00:00'}`);
        return isAfter(appointmentDate, now) || appointmentDate.getTime() === now.getTime();
      })
      .slice(0, 6);
  }, [resource.items]);

  return {
    ...resource,
    appointments: resource.items,
    upcomingAppointments,
  };
};
