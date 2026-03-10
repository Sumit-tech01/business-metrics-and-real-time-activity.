import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ExpenseCategoryPieChart } from '../components/charts/ExpenseCategoryPieChart';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart';
import { RevenueExpenseChart } from '../components/charts/RevenueExpenseChart';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DataTable } from '../components/common/DataTable';
import { Select } from '../components/common/Select';
import { StatCard } from '../components/common/StatCard';
import { CustomerGrowthChart } from '../components/reports/CustomerGrowthChart';
import { DateFilter } from '../components/reports/DateFilter';
import { InventoryAnalyticsChart } from '../components/reports/InventoryAnalyticsChart';
import { SectionLoader } from '../components/ui/Loader';
import { useReports } from '../hooks/useReports';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';
import { formatCurrency, formatDate } from '../utils/formatters';

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const REPORT_PDF_COLUMNS = [
  { header: 'Module', key: 'module' },
  { header: 'Date', key: 'date' },
  { header: 'Name', key: 'name' },
  { header: 'Customer', key: 'customer' },
  { header: 'Type', key: 'type' },
  { header: 'Category', key: 'category' },
  { header: 'Amount / Value', key: 'amount' },
  { header: 'Note', key: 'note' },
];

const ReportsPage = () => {
  const [exporting, setExporting] = useState(false);
  const {
    loading,
    error,
    filters,
    setDateRange,
    setTypeFilter,
    setCustomerFilter,
    resetFilters,
    financeReport,
    customerReport,
    inventoryReport,
    customerOptions,
    exportRows,
  } = useReports();

  const customerFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'All Customers' },
      ...customerOptions.map((customerName) => ({
        value: customerName,
        label: customerName,
      })),
    ],
    [customerOptions],
  );

  const handleExportExcel = async () => {
    setExporting(true);

    try {
      await exportToExcel(exportRows, 'erp-reports');
      toast.success(`Exported ${exportRows.length} report rows to Excel.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export reports to Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);

    try {
      await exportToPDF(REPORT_PDF_COLUMNS, exportRows, 'erp-reports');
      toast.success(`Exported ${exportRows.length} report rows to PDF.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export reports to PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Realtime finance, customer, and inventory analytics with filters and exports.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <Card
        title="Filters"
        subtitle="Date range, transaction type, and customer"
        className="p-5"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportExcel} disabled={exporting}>
              Export Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} disabled={exporting}>
              Export PDF
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <DateFilter value={filters.dateRange} onChange={setDateRange} />
          </div>

          <Select
            label="Transaction Type"
            value={filters.type}
            onChange={(event) => setTypeFilter(event.target.value)}
            options={TRANSACTION_TYPE_OPTIONS}
          />

          <Select
            label="Customer"
            value={filters.customer}
            onChange={(event) => setCustomerFilter(event.target.value)}
            options={customerFilterOptions}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">Realtime sync enabled via Firestore listeners</span>
        </div>
      </Card>

      {loading ? (
        <SectionLoader label="Loading reports..." />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Revenue" value={formatCurrency(financeReport.totals.revenue)} />
            <StatCard title="Expenses" value={formatCurrency(financeReport.totals.expenses)} />
            <StatCard title="Net Profit" value={formatCurrency(financeReport.totals.netProfit)} />
            <StatCard title="Total Customers" value={customerReport.totalCustomers} />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Products" value={inventoryReport.totalProducts} />
            <StatCard title="Low Stock" value={inventoryReport.lowStockCount} />
            <StatCard title="Stock Value" value={formatCurrency(inventoryReport.stockValue)} />
            <StatCard title="Filtered Transactions" value={financeReport.tableRows.length} />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card title="Revenue vs Expense" subtitle="Bar chart" className="p-5 xl:col-span-2">
              <RevenueExpenseChart data={financeReport.chartRevenueExpense} />
            </Card>
            <Card title="Expense Categories" subtitle="Pie chart" className="p-5">
              <ExpenseCategoryPieChart data={financeReport.chartExpenseCategory} />
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card title="Monthly Sales" subtitle="Line chart" className="p-5">
              <MonthlySalesChart data={financeReport.chartMonthlySales} />
            </Card>
            <Card title="New Customers per Month" subtitle="Line chart" className="p-5">
              <CustomerGrowthChart data={customerReport.chartNewCustomers} />
            </Card>
          </section>

          <Card title="Inventory by Category" subtitle="Stock and value by category" className="p-5">
            <InventoryAnalyticsChart data={inventoryReport.chartStockByCategory} />
          </Card>

          <section className="grid gap-4">
            <Card title="Finance Transactions" subtitle="Filtered finance records" className="p-5">
              <DataTable
                rows={financeReport.tableRows}
                emptyMessage="No transactions match current filters."
                columns={[
                  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
                  { key: 'title', header: 'Title' },
                  { key: 'customer', header: 'Customer' },
                  { key: 'type', header: 'Type' },
                  { key: 'category', header: 'Category' },
                  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
                ]}
              />
            </Card>

            <Card title="Customer Analytics Table" subtitle="Filtered customer records" className="p-5">
              <DataTable
                rows={customerReport.tableRows}
                emptyMessage="No customers match current filters."
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'email', header: 'Email' },
                  { key: 'phone', header: 'Phone' },
                  { key: 'status', header: 'Status' },
                  { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
                ]}
              />
            </Card>

            <Card title="Inventory Analytics Table" subtitle="Filtered product records" className="p-5">
              <DataTable
                rows={inventoryReport.tableRows}
                emptyMessage="No inventory records match current filters."
                columns={[
                  { key: 'name', header: 'Product' },
                  { key: 'category', header: 'Category' },
                  { key: 'stock', header: 'Stock' },
                  { key: 'lowStockLimit', header: 'Low Stock Limit' },
                  { key: 'stockValue', header: 'Stock Value', render: (row) => formatCurrency(row.stockValue) },
                ]}
              />
            </Card>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
