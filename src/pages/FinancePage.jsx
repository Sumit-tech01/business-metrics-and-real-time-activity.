import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { ExpenseCategoryPieChart } from '../components/charts/ExpenseCategoryPieChart';
import { RevenueExpenseChart } from '../components/charts/RevenueExpenseChart';
import { TransactionForm } from '../components/forms/TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useUiStore } from '../store/uiStore';
import { logActivity } from '../services/activityService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';

const FinancePage = () => {
  const {
    transactions,
    totals,
    netProfit,
    monthlyOverview,
    expenseByCategory,
    addItem,
    updateItem,
    removeItem,
    saving,
    loading,
    error,
  } = useTransactions();

  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);

  const editingTransaction = useMemo(
    () => transactions.find((transaction) => transaction.id === editingTransactionId) || null,
    [editingTransactionId, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return transactions;
    }

    return transactions.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query),
    );
  }, [searchQuery, transactions]);

  const transactionExportRows = useMemo(
    () =>
      filteredTransactions.map((item) => ({
        date: item.date || '',
        type: item.type || '',
        category: item.category || '',
        amount: Number(item.amount) || 0,
        note: item.notes || '',
      })),
    [filteredTransactions],
  );

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingTransactionId(null);
  };

  const handleSubmit = async (payload) => {
    if (editingTransaction) {
      await updateItem(editingTransaction.id, payload);
      closeFormModal();
      return;
    }

    const createdTransaction = await addItem(payload);
    await logActivity(
      'add',
      'money',
      createdTransaction?.id || '',
      `Added ${payload.type || 'transaction'} entry of ${formatCurrency(payload.amount)}.`,
    );
    closeFormModal();
  };

  const openCreateForm = () => {
    setEditingTransactionId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (transactionId) => {
    setEditingTransactionId(transactionId);
    setIsFormOpen(true);
  };

  const handleExportExcel = async () => {
    setExporting(true);

    try {
      await exportToExcel(transactionExportRows, 'finance-transactions');
      toast.success(`Exported ${transactionExportRows.length} transactions to Excel.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export finance data.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);

    try {
      await exportToPDF(
        [
          { header: 'Date', key: 'date' },
          { header: 'Type', key: 'type' },
          { header: 'Category', key: 'category' },
          { header: 'Amount', key: 'amount' },
          { header: 'Note', key: 'note' },
        ],
        transactionExportRows,
        'finance-transactions',
      );
      toast.success(`Exported ${transactionExportRows.length} transactions to PDF.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export finance data.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Finance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track income, expenses, profitability, and category-level spend trends.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Add Money
        </Button>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(totals.revenue)} />
        <StatCard title="Total Expenses" value={formatCurrency(totals.expenses)} />
        <StatCard title="Net Profit" value={formatCurrency(netProfit)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="Expense Categories" className="p-5 xl:col-span-2">
          <ExpenseCategoryPieChart data={expenseByCategory} />
        </Card>

        <Card title="Money Actions" subtitle="Create and edit entries with modal forms" className="p-5">
          <Button className="w-full" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            Add Income / Expense
          </Button>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Use table actions to edit or delete existing records.
          </p>
        </Card>
      </section>

      <Card title="Revenue vs Expenses" subtitle="6-month financial movement" className="p-5">
        <RevenueExpenseChart data={monthlyOverview} />
      </Card>

      <Card
        title="Transaction History"
        subtitle="All income and expense records"
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
        <Table
          rows={filteredTransactions}
          loading={loading}
          emptyMessage="No transactions found."
          columns={[
            { key: 'title', header: 'Title' },
            {
              key: 'type',
              header: 'Type',
              render: (row) => <Badge tone={row.type === 'income' ? 'green' : 'yellow'}>{row.type}</Badge>,
            },
            { key: 'category', header: 'Category' },
            {
              key: 'date',
              header: 'Date',
              render: (row) => formatDate(row.date),
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (row) => formatCurrency(row.amount),
            },
            {
              key: 'actions',
              header: 'Actions',
              searchable: false,
              className: 'w-20',
            },
          ]}
          rowActions={(row) => [
            {
              label: 'View',
              onClick: () =>
                toast(
                  `${row.title || 'Transaction'} • ${formatCurrency(row.amount)} • ${formatDate(row.date)}`,
                ),
            },
            {
              label: 'Edit',
              onClick: () => openEditForm(row.id),
            },
            {
              label: 'Delete',
              tone: 'danger',
              onClick: () => {
                void removeItem(row.id);
              },
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search transactions...',
            onFilterClick: () => toast('Search by title, category, or type to filter records.'),
            onAddClick: openCreateForm,
            addLabel: 'Add Money',
          }}
        />
      </Card>

      <Modal
        open={isFormOpen}
        onClose={closeFormModal}
        title={editingTransaction ? 'Edit Money Entry' : 'Add Money Entry'}
        description="Fill in transaction details and save your finance record."
        maxWidthClassName="max-w-3xl"
      >
        <TransactionForm
          key={editingTransaction?.id || 'new-transaction'}
          onSubmit={handleSubmit}
          loading={saving}
          initialValues={editingTransaction}
          onCancel={closeFormModal}
        />
      </Modal>
    </div>
  );
};

export default FinancePage;
