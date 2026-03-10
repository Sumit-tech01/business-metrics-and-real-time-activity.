import { useMemo, useState } from 'react';
import { useCustomers } from './useCustomers';
import { useInventory } from './useInventory';
import { useTransactions } from './useTransactions';
import {
  buildCustomerFilterOptions,
  buildCustomerReport,
  buildFinanceReport,
  buildInventoryReport,
  buildReportsExportRows,
} from '../services/reportService';

const DEFAULT_DATE_RANGE = {
  from: '',
  to: '',
};

export const useReports = () => {
  const transactionsData = useTransactions();
  const customersData = useCustomers();
  const inventoryData = useInventory();
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [typeFilter, setTypeFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const filters = useMemo(
    () => ({
      dateRange,
      type: typeFilter,
      customer: customerFilter,
    }),
    [customerFilter, dateRange, typeFilter],
  );

  const financeReport = useMemo(
    () => buildFinanceReport(transactionsData.transactions, filters),
    [filters, transactionsData.transactions],
  );

  const customerReport = useMemo(
    () => buildCustomerReport(customersData.customers, filters),
    [customersData.customers, filters],
  );

  const inventoryReport = useMemo(
    () => buildInventoryReport(inventoryData.products, filters),
    [filters, inventoryData.products],
  );

  const customerOptions = useMemo(
    () => buildCustomerFilterOptions(customersData.customers, transactionsData.transactions),
    [customersData.customers, transactionsData.transactions],
  );

  const exportRows = useMemo(
    () =>
      buildReportsExportRows({
        financeRows: financeReport.tableRows,
        customerRows: customerReport.tableRows,
        inventoryRows: inventoryReport.tableRows,
      }),
    [customerReport.tableRows, financeReport.tableRows, inventoryReport.tableRows],
  );

  const loading = transactionsData.loading || customersData.loading || inventoryData.loading;
  const error = transactionsData.error || customersData.error || inventoryData.error;

  const resetFilters = () => {
    setDateRange({ ...DEFAULT_DATE_RANGE });
    setTypeFilter('all');
    setCustomerFilter('all');
  };

  return {
    loading,
    error,
    filters: {
      dateRange,
      type: typeFilter,
      customer: customerFilter,
    },
    setDateRange,
    setTypeFilter,
    setCustomerFilter,
    resetFilters,
    financeReport,
    customerReport,
    inventoryReport,
    customerOptions,
    exportRows,
  };
};
