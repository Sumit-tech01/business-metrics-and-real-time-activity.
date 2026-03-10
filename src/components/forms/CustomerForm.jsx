import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { CUSTOMER_STATUS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';

const getInitialState = (initialValues = null) => ({
  name: initialValues?.name || '',
  email: initialValues?.email || '',
  phone: initialValues?.phone || '',
  status: initialValues?.status || CUSTOMER_STATUS[0],
  lastContact: toInputDate(initialValues?.lastContact || new Date()),
  note: '',
});

const isValidEmail = (value) => {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const CustomerForm = ({ onSubmit, loading, initialValues = null, onCancel }) => {
  const isEditing = Boolean(initialValues?.id);
  const [form, setForm] = useState(() => getInitialState(initialValues));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Customer name is required.';
    }

    if (!isValidEmail(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      note: form.note.trim(),
    });

    if (!isEditing) {
      setForm(getInitialState(null));
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Edit Customer' : 'Add Customer'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep customer details updated for stronger relationship tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          name="name"
          label="Customer Name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input name="phone" label="Phone" value={form.phone} onChange={handleChange} />

        <Select
          name="status"
          label="Status"
          value={form.status}
          onChange={handleChange}
          options={CUSTOMER_STATUS}
        />

        <Input
          name="lastContact"
          label="Last Contact"
          type="date"
          value={form.lastContact}
          onChange={handleChange}
        />

        <Textarea
          name="note"
          label={isEditing ? 'Add Note' : 'Initial Note'}
          value={form.note}
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
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
};
