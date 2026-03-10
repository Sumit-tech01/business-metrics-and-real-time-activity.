import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AppointmentForm } from '../components/forms/AppointmentForm';
import { CalendarView } from '../components/calendar/CalendarView';
import { useAppointments } from '../hooks/useAppointments';
import { useCustomers } from '../hooks/useCustomers';
import { logActivity } from '../services/activityService';
import { useUiStore } from '../store/uiStore';
import { formatDate, toInputDate, toInputTime } from '../utils/formatters';
import { SectionLoader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';

const AppointmentsPage = () => {
  const { appointments, upcomingAppointments, addItem, updateItem, removeItem, saving, loading, error } = useAppointments();
  const { customerNames } = useCustomers();
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaults, setFormDefaults] = useState(null);

  const editingAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === editingAppointmentId) || null,
    [appointments, editingAppointmentId],
  );

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return appointments;
    }

    return appointments.filter(
      (appointment) =>
        appointment.title?.toLowerCase().includes(query) ||
        appointment.customerName?.toLowerCase().includes(query) ||
        appointment.status?.toLowerCase().includes(query),
    );
  }, [appointments, searchQuery]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId) || null,
    [appointments, selectedAppointmentId],
  );

  const openCreateDialog = (date = new Date()) => {
    const defaultTime = toInputTime(date);

    setEditingAppointmentId(null);
    setFormDefaults({
      date: toInputDate(date),
      time: defaultTime && defaultTime !== '00:00' ? defaultTime : '10:00',
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (appointment) => {
    setSelectedAppointmentId(appointment.id);
    setEditingAppointmentId(appointment.id);
    setFormDefaults(null);
    setIsFormOpen(true);
  };

  const closeDialog = () => {
    setIsFormOpen(false);
    setEditingAppointmentId(null);
  };

  const handleDeleteOrder = async (appointment) => {
    if (!appointment?.id) {
      return;
    }

    await removeItem(appointment.id);
    if (selectedAppointmentId === appointment.id) {
      setSelectedAppointmentId(null);
    }
    if (editingAppointmentId === appointment.id) {
      setEditingAppointmentId(null);
    }
    await logActivity(
      'delete',
      'order',
      appointment.id,
      `Deleted order ${appointment.title || 'Untitled order'}.`,
    );
  };

  const handleSubmit = async (payload) => {
    if (editingAppointment) {
      await updateItem(editingAppointment.id, payload);
      setSelectedAppointmentId(editingAppointment.id);
      closeDialog();
      return;
    }

    const createdOrder = await addItem(payload);
    await logActivity(
      'add',
      'order',
      createdOrder?.id || '',
      `Added order ${payload.title || 'Untitled order'} on ${payload.date || 'scheduled date'}.`,
    );
    closeDialog();
  };

  const handleDeleteSelected = async () => {
    if (!selectedAppointment) {
      return;
    }

    await handleDeleteOrder(selectedAppointment);
    setSelectedAppointmentId(null);

    if (editingAppointmentId === selectedAppointment.id) {
      setEditingAppointmentId(null);
    }
  };

  const handleDeleteEditing = async () => {
    if (!editingAppointment) {
      return;
    }

    await handleDeleteOrder(editingAppointment);
    setSelectedAppointmentId(null);
    closeDialog();
  };

  const formKey = editingAppointment?.id || `new-${formDefaults?.date || 'today'}-${formDefaults?.time || '10:00'}`;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Appointments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create, edit, and track appointments with a full calendar workflow.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="Upcoming" subtitle="Next scheduled items" className="p-5 xl:col-span-2">
          <ul className="space-y-2">
            {upcomingAppointments.length ? (
              upcomingAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-100">{appointment.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(appointment.date)} {appointment.time}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming appointments.</p>
            )}
          </ul>
        </Card>

        <Card title="Create Appointment" subtitle="Click date on calendar or use quick action" className="p-5">
          <Button onClick={() => openCreateDialog(new Date())} className="w-full">
            <CalendarPlus className="h-4 w-4" />
            New Appointment
          </Button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tip: click any calendar date/time slot to open the create form with that date.
          </p>
        </Card>
      </section>

      <Card
        title="Appointments Calendar"
        subtitle="Month / week / day view with realtime updates"
        className="p-5"
        actions={
          selectedAppointment ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => openEditDialog(selectedAppointment)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">Select an event to edit or delete.</span>
          )
        }
      >
        {loading ? (
          <SectionLoader label="Syncing appointments..." />
        ) : (
          <div className="space-y-4">
            <CalendarView
              appointments={filteredAppointments}
              onSelectAppointment={(appointment) => openEditDialog(appointment)}
              onSelectSlotDate={(selectedDate) => {
                setSelectedAppointmentId(null);
                openCreateDialog(selectedDate);
              }}
            />

            {selectedAppointment ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedAppointment.title}</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {formatDate(selectedAppointment.date)} at {selectedAppointment.time || '--:--'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      selectedAppointment.status === 'completed'
                        ? 'success'
                        : selectedAppointment.status === 'cancelled'
                          ? 'danger'
                          : 'info'
                    }
                  >
                    {selectedAppointment.status}
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedAppointment.customerName || 'General'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <Card title="Orders Table" subtitle="Search, review, edit, and delete orders in one place" className="p-5">
        <Table
          rows={filteredAppointments}
          loading={loading}
          emptyMessage="No orders found."
          columns={[
            { key: 'title', header: 'Title' },
            {
              key: 'customerName',
              header: 'Customer',
              render: (row) => row.customerName || 'General',
            },
            {
              key: 'dateTime',
              header: 'Date & Time',
              render: (row) => `${formatDate(row.date)} ${row.time || '--:--'}`,
              searchAccessor: (row) => `${row.date || ''} ${row.time || ''}`,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <Badge
                  tone={
                    row.status === 'completed' ? 'green' : row.status === 'cancelled' ? 'red' : 'blue'
                  }
                >
                  {row.status}
                </Badge>
              ),
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
              onClick: () => {
                setSelectedAppointmentId(row.id);
                toast(`${row.title || 'Order'} selected.`);
              },
            },
            {
              label: 'Edit',
              onClick: () => openEditDialog(row),
            },
            {
              label: 'Delete',
              tone: 'danger',
              onClick: () => {
                void handleDeleteOrder(row);
              },
            },
          ]}
          toolbar={{
            searchValue: searchQuery,
            onSearchChange: setSearchQuery,
            searchPlaceholder: 'Search orders...',
            onFilterClick: () => toast('Search by title, customer, status, or date to filter orders.'),
            onAddClick: () => openCreateDialog(new Date()),
            addLabel: 'New Order',
          }}
        />
      </Card>

      <Modal
        open={isFormOpen}
        onClose={closeDialog}
        title={editingAppointment ? 'Edit Order' : 'Create Order'}
        description={
          editingAppointment
            ? 'Update details or delete this order.'
            : 'Fill in details to create a new order.'
        }
        maxWidthClassName="max-w-3xl"
      >
        <AppointmentForm
          key={formKey}
          onSubmit={handleSubmit}
          loading={saving}
          initialValues={editingAppointment}
          defaultValues={formDefaults}
          onCancel={closeDialog}
          customerOptions={customerNames}
        />

        {editingAppointment ? (
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button variant="danger" onClick={handleDeleteEditing} disabled={saving}>
              <Trash2 className="h-4 w-4" />
              Delete Order
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
