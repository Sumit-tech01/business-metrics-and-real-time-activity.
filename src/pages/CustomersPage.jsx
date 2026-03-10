import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CustomerForm } from '../components/forms/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { logActivity } from '../services/activityService';
import { useUiStore } from '../store/uiStore';
import { formatDate } from '../utils/formatters';
import { generateId } from '../utils/id';
import { Input } from '../components/common/Input';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';

const CustomersPage = () => {
  const { customers, addItem, updateItem, removeItem, saving, loading, error } = useCustomers();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [activeNotesCustomerId, setActiveNotesCustomerId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [exporting, setExporting] = useState(false);

  const editingCustomer = useMemo(
    () => customers.find((customer) => customer.id === editingCustomerId) || null,
    [customers, editingCustomerId],
  );

  const activeNotesCustomer = useMemo(
    () => customers.find((customer) => customer.id === activeNotesCustomerId) || null,
    [customers, activeNotesCustomerId],
  );

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query),
    );
  }, [customers, searchQuery]);

  const customerExportRows = useMemo(
    () =>
      filteredCustomers.map((customer) => ({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
      })),
    [filteredCustomers],
  );

  const closeCustomerFormModal = () => {
    setIsCustomerFormOpen(false);
    setEditingCustomerId(null);
  };

  const handleSubmit = async (payload) => {
    const { note, ...customerPayload } = payload;
    const now = new Date().toISOString();

    if (editingCustomer) {
      const updatedNotes = [...(editingCustomer.notes || [])];
      const updatedHistory = [...(editingCustomer.history || [])];
      updatedHistory.push({ id: generateId(), action: 'Profile updated', at: now });

      if (note) {
        updatedNotes.push({ id: generateId(), text: note, createdAt: now });
        updatedHistory.push({ id: generateId(), action: 'Note added from edit form', at: now });
      }

      await updateItem(editingCustomer.id, {
        ...customerPayload,
        notes: updatedNotes,
        history: updatedHistory,
      });
      await logActivity(
        'edit',
        'customer',
        editingCustomer.id,
        `Updated customer ${customerPayload.name || editingCustomer.name || 'Unknown customer'}.`,
      );
      closeCustomerFormModal();
      return;
    }

    const createdCustomer = await addItem({
      ...customerPayload,
      notes: note ? [{ id: generateId(), text: note, createdAt: now }] : [],
      history: [{ id: generateId(), action: 'Customer created', at: now }],
    });
    await logActivity(
      'add',
      'customer',
      createdCustomer?.id || '',
      `Added customer ${customerPayload.name || 'Unknown customer'}.`,
    );
    closeCustomerFormModal();
  };

  const handleAddNote = async () => {
    if (!activeNotesCustomer || !newNote.trim()) {
      return;
    }

    const now = new Date().toISOString();

    await updateItem(activeNotesCustomer.id, {
      notes: [...(activeNotesCustomer.notes || []), { id: generateId(), text: newNote.trim(), createdAt: now }],
      history: [...(activeNotesCustomer.history || []), { id: generateId(), action: 'Note added', at: now }],
    });

    setNewNote('');
  };

  const openCreateCustomerModal = () => {
    setEditingCustomerId(null);
    setIsCustomerFormOpen(true);
  };

  const openEditCustomerModal = (customerId) => {
    setEditingCustomerId(customerId);
    setIsCustomerFormOpen(true);
  };

  const handleDeleteCustomer = async (customer) => {
    await removeItem(customer.id);
    await logActivity('delete', 'customer', customer.id, `Deleted customer ${customer.name || 'Unknown customer'}.`);
  };

  const handleExportExcel = async () => {
    setExporting(true);

    try {
      await exportToExcel(customerExportRows, 'customers');
      toast.success(`Exported ${customerExportRows.length} customers to Excel.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export customer data.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);

    try {
      await exportToPDF(
        [
          { header: 'Name', key: 'name' },
          { header: 'Phone', key: 'phone' },
          { header: 'Email', key: 'email' },
        ],
        customerExportRows,
        'customers',
      );
      toast.success(`Exported ${customerExportRows.length} customers to PDF.`);
    } catch (exportError) {
      toast.error(exportError?.message || 'Unable to export customer data.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage CRM profiles, relationship notes, and customer activity timeline.
          </p>
        </div>
        <Button onClick={openCreateCustomerModal}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="CRM Summary" subtitle="Customer relationship health" className="p-5 xl:col-span-2">
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">{customers.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total contacts in your CRM</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="success">Active: {customers.filter((customer) => customer.status === 'active').length}</Badge>
            <Badge tone="info">Leads: {customers.filter((customer) => customer.status === 'lead').length}</Badge>
            <Badge tone="muted">Inactive: {customers.filter((customer) => customer.status === 'inactive').length}</Badge>
          </div>
        </Card>

        <Card title="Customer Actions" subtitle="Add or edit records in modal forms" className="p-5">
          <Button className="w-full" onClick={openCreateCustomerModal}>
            <Plus className="h-4 w-4" />
            Add New Customer
          </Button>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Use table actions to edit customer details or manage notes.
          </p>
        </Card>
      </section>

      <Card
        title="Customer Directory"
        subtitle="Add, edit, remove customers"
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
          rows={filteredCustomers}
          loading={loading}
          emptyMessage="No customers yet."
          columns={[
            { key: 'name', header: 'Customer' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <Badge tone={row.status === 'active' ? 'green' : row.status === 'lead' ? 'blue' : 'gray'}>
                  {row.status}
                </Badge>
              ),
            },
            {
              key: 'lastContact',
              header: 'Last Contact',
              render: (row) => formatDate(row.lastContact),
            },
            {
              key: 'history',
              header: 'Latest Event',
              render: (row) => row.history?.at(-1)?.action || '---',
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
              onClick: () => setActiveNotesCustomerId(row.id),
            },
            {
              label: 'Edit',
              onClick: () => openEditCustomerModal(row.id),
            },
            {
              label: 'Delete',
              tone: 'danger',
              onClick: () => {
                void handleDeleteCustomer(row);
              },
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search customers...',
            onFilterClick: () => toast('Search by name, email, or phone to filter customers.'),
            onAddClick: openCreateCustomerModal,
            addLabel: 'Add Customer',
          }}
        />
      </Card>

      {activeNotesCustomer ? (
        <Card
          title={`Notes & History: ${activeNotesCustomer.name}`}
          subtitle="Track interactions and updates"
          className="p-5"
          actions={
            <Button variant="secondary" size="sm" onClick={() => setActiveNotesCustomerId(null)}>
              Close
            </Button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Input
                label="New Note"
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Add follow-up reminder"
              />
              <Button onClick={handleAddNote} disabled={saving || !newNote.trim()}>
                Add Note
              </Button>

              <div className="space-y-2">
                {(activeNotesCustomer.notes || []).length ? (
                  activeNotesCustomer.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="text-slate-700 dark:text-slate-200">{note.text}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(note.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet.</p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Customer History</p>
              <div className="space-y-2">
                {(activeNotesCustomer.history || []).length ? (
                  [...activeNotesCustomer.history].reverse().map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                    >
                      <p className="text-slate-700 dark:text-slate-200">{entry.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.at, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No history recorded.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Modal
        open={isCustomerFormOpen}
        onClose={closeCustomerFormModal}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        description="Enter customer details and save your CRM record."
        maxWidthClassName="max-w-3xl"
      >
        <CustomerForm
          key={editingCustomer?.id || 'new-customer'}
          onSubmit={handleSubmit}
          loading={saving}
          initialValues={editingCustomer}
          onCancel={closeCustomerFormModal}
        />
      </Modal>
    </div>
  );
};

export default CustomersPage;
