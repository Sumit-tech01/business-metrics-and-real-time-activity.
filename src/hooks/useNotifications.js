import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeAppointments } from '../services/appointmentsService';
import { subscribeProducts } from '../services/inventoryService';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/formatters';
import { useCompany } from './useCompany';

const NEXT_24_HOURS_MS = 24 * 60 * 60 * 1000;

const getLowStockLimit = (item) => {
  const parsedLimit = Number(item.lowStockLimit ?? item.lowStockThreshold);
  return Number.isFinite(parsedLimit) ? parsedLimit : 10;
};

const getAppointmentTimestamp = (appointment) => {
  const parsedDate = new Date(`${appointment.date}T${appointment.time || '00:00'}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

const isAppointmentSoon = (appointment, nowMs) => {
  const appointmentMs = new Date(`${appointment.date}T${appointment.time || '00:00'}`).getTime();

  if (Number.isNaN(appointmentMs)) {
    return false;
  }

  const diff = appointmentMs - nowMs;
  return diff >= 0 && diff <= NEXT_24_HOURS_MS;
};

export const useNotifications = ({ enableToasts = false } = {}) => {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { companyId, role, loading: companyLoading } = useCompany();
  const scopeKey = user?.uid && companyId ? `${user.uid}:${companyId}` : null;
  const [lowStockItems, setLowStockItems] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [syncState, setSyncState] = useState({
    scopeKey: null,
    appointmentsReady: false,
    inventoryReady: false,
  });
  const inventorySeenIdsRef = useRef(new Set());
  const appointmentSeenIdsRef = useRef(new Set());
  const inventoryInitializedRef = useRef(false);
  const appointmentInitializedRef = useRef(false);

  useEffect(() => {
    if (authLoading || companyLoading || !user?.uid || !companyId || !scopeKey) {
      return;
    }

    let appointmentsReady = false;
    let inventoryReady = role !== 'admin';

    const publishReadyState = () => {
      setSyncState({
        scopeKey,
        appointmentsReady,
        inventoryReady,
      });
    };

    const unsubscribeAppointments = subscribeAppointments(
      companyId,
      (rows) => {
        const nowMs = Date.now();
        const nextAppointments = rows
          .filter((item) => isAppointmentSoon(item, nowMs))
          .sort((a, b) => getAppointmentTimestamp(a).localeCompare(getAppointmentTimestamp(b)));

        setUpcomingAppointments(nextAppointments);

        if (enableToasts && appointmentInitializedRef.current) {
          nextAppointments.forEach((item) => {
            if (!appointmentSeenIdsRef.current.has(item.id)) {
              toast(`Appointment soon: ${item.title || 'Scheduled appointment'} at ${formatDate(item.date)} ${item.time || '--:--'}`);
            }
          });
        }

        appointmentSeenIdsRef.current = new Set(nextAppointments.map((item) => item.id));
        appointmentInitializedRef.current = true;
        appointmentsReady = true;
        publishReadyState();
      },
      () => {
        setUpcomingAppointments([]);
        appointmentSeenIdsRef.current = new Set();
        appointmentInitializedRef.current = true;
        appointmentsReady = true;
        publishReadyState();
      },
    );

    let unsubscribeInventory = () => {};

    if (role === 'admin') {
      unsubscribeInventory = subscribeProducts(
        companyId,
        (rows) => {
          const lowStockRows = rows
            .filter((item) => Number(item.stock) <= getLowStockLimit(item))
            .sort((a, b) => Number(a.stock) - Number(b.stock));

          setLowStockItems(lowStockRows);

          if (enableToasts && inventoryInitializedRef.current) {
            lowStockRows.forEach((item) => {
              if (!inventorySeenIdsRef.current.has(item.id)) {
                const limit = getLowStockLimit(item);
                toast.error(`Low stock detected: ${item.name || 'Product'} (${item.stock} left, limit ${limit})`);
              }
            });
          }

          inventorySeenIdsRef.current = new Set(lowStockRows.map((item) => item.id));
          inventoryInitializedRef.current = true;
          inventoryReady = true;
          publishReadyState();
        },
        () => {
          setLowStockItems([]);
          inventorySeenIdsRef.current = new Set();
          inventoryInitializedRef.current = true;
          inventoryReady = true;
          publishReadyState();
        },
      );
    }

    return () => {
      unsubscribeAppointments();
      unsubscribeInventory();
    };
  }, [authLoading, companyId, companyLoading, enableToasts, role, scopeKey, user?.uid]);

  const scopedUpcomingAppointments = useMemo(() => {
    if (!scopeKey || syncState.scopeKey !== scopeKey || !syncState.appointmentsReady) {
      return [];
    }

    return upcomingAppointments;
  }, [scopeKey, syncState.appointmentsReady, syncState.scopeKey, upcomingAppointments]);

  const scopedLowStockItems = useMemo(() => {
    if (role !== 'admin') {
      return [];
    }

    if (!scopeKey || syncState.scopeKey !== scopeKey || !syncState.inventoryReady) {
      return [];
    }

    return lowStockItems;
  }, [lowStockItems, role, scopeKey, syncState.inventoryReady, syncState.scopeKey]);

  const loading = useMemo(() => {
    if (authLoading || companyLoading) {
      return true;
    }

    if (!scopeKey) {
      return false;
    }

    if (syncState.scopeKey !== scopeKey) {
      return true;
    }

    if (!syncState.appointmentsReady) {
      return true;
    }

    return role === 'admin' && !syncState.inventoryReady;
  }, [
    authLoading,
    companyLoading,
    role,
    scopeKey,
    syncState.appointmentsReady,
    syncState.inventoryReady,
    syncState.scopeKey,
  ]);

  const notifications = useMemo(() => {
    const appointmentNotifications = scopedUpcomingAppointments.map((item) => ({
      id: `appointment-${item.id}`,
      type: 'appointment',
      title: item.title || 'Upcoming appointment',
      message: `${formatDate(item.date)} ${item.time || '--:--'}`,
      timestamp: getAppointmentTimestamp(item),
      raw: item,
    }));

    const lowStockNotifications = scopedLowStockItems.map((item) => {
      const limit = getLowStockLimit(item);

      return {
        id: `low-stock-${item.id}`,
        type: 'inventory',
        title: item.name || 'Low stock alert',
        message: `${item.stock} left (limit ${limit})`,
        timestamp: item.updatedAt || item.createdAt || new Date().toISOString(),
        raw: item,
      };
    });

    return [...appointmentNotifications, ...lowStockNotifications].sort((left, right) =>
      left.timestamp.localeCompare(right.timestamp),
    );
  }, [scopedLowStockItems, scopedUpcomingAppointments]);

  return {
    notifications,
    count: notifications.length,
    loading,
    lowStockItems: scopedLowStockItems,
    upcomingAppointments: scopedUpcomingAppointments,
  };
};
