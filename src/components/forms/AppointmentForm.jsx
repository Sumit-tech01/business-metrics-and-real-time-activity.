import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';

const getInitialState = (initialValues = null, defaultValues = null) => ({
  title: initialValues?.title ?? defaultValues?.title ?? '',
  customerName: initialValues?.customerName ?? defaultValues?.customerName ?? '',
  date: toInputDate(initialValues?.date ?? defaultValues?.date ?? new Date()),
  time: initialValues?.time ?? defaultValues?.time ?? '10:00',
  status: initialValues?.status ?? defaultValues?.status ?? APPOINTMENT_STATUS[0],
  notes: initialValues?.notes ?? defaultValues?.notes ?? '',
});

export const AppointmentForm = ({
  onSubmit,
  loading,
  initialValues = null,
  defaultValues = null,
  onCancel,
  customerOptions = [],
}) => {
  const isEditing = Boolean(initialValues?.id);
  const [form, setForm] = useState(() => getInitialState(initialValues, defaultValues));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (!form.date) {
      nextErrors.date = 'Date is required.';
    }

    if (!form.time) {
      nextErrors.time = 'Time is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      customerName: form.customerName.trim(),
      notes: form.notes.trim(),
    });

    if (!isEditing) {
      setForm(getInitialState(null, defaultValues));
      setErrors({});
    }
  };

  const customerSelectOptions = [
    { value: '', label: 'General' },
    ...customerOptions.map((name) => ({ value: name, label: name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Edit Order' : 'Add Order'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Schedule and maintain upcoming customer orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          name="title"
          label="Order Title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <Select
          name="customerName"
          label="Customer"
          value={form.customerName}
          onChange={handleChange}
          options={customerSelectOptions}
        />

        <Input
          name="date"
          label="Date"
          type="date"
          value={form.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <Input
          name="time"
          label="Time"
          type="time"
          value={form.time}
          onChange={handleChange}
          error={errors.time}
          required
        />

        <Select
          name="status"
          label="Status"
          value={form.status}
          onChange={handleChange}
          options={APPOINTMENT_STATUS}
        />

        <Textarea
          name="notes"
          label="Notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Order'}
        </Button>
      </div>
    </form>
  );
};
