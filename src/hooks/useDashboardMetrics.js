import { useMemo } from 'react';
import { useAppointments } from './useAppointments';
import { useCustomers } from './useCustomers';
import { useInventory } from './useInventory';
import { useTransactions } from './useTransactions';

export const useDashboardMetrics = () => {
  const transactionsData = useTransactions();
  const customersData = useCustomers();
  const inventoryData = useInventory();
  const appointmentsData = useAppointments();

  const isLoading =
    transactionsData.loading || customersData.loading || inventoryData.loading || appointmentsData.loading;

  const hasError =
    transactionsData.error || customersData.error || inventoryData.error || appointmentsData.error;

  const kpiData = useMemo(
    () => ({
      revenue: transactionsData.totals.revenue,
      expenses: transactionsData.totals.expenses,
      profit: transactionsData.netProfit,
      activeCustomers: customersData.activeCustomers,
    }),
    [customersData.activeCustomers, transactionsData.netProfit, transactionsData.totals.expenses, transactionsData.totals.revenue],
  );

  return {
    isLoading,
    hasError,
    kpiData,
    transactionsData,
    customersData,
    inventoryData,
    appointmentsData,
  };
};
