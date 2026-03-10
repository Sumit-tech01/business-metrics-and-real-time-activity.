import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { TRANSACTION_CATEGORIES } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';

const getInitialState = (initialValues = null) => ({
  type: initialValues?.type || 'income',
  title: initialValues?.title || '',
  amount: initialValues?.amount || '',
  category: initialValues?.category || TRANSACTION_CATEGORIES[0],
  date: toInputDate(initialValues?.date || initialValues?.createdAt || new Date()),
  notes: initialValues?.notes || '',
});

export const TransactionForm = ({ onSubmit, loading, initialValues = null, onCancel }) => {
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

    if (!form.title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (!String(form.amount).trim() || Number(form.amount) <= 0) {
      nextErrors.amount = 'Amount must be greater than 0.';
    }

    if (!form.date) {
      nextErrors.date = 'Date is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmit({
      ...form,
      amount: Number(form.amount) || 0,
      title: form.title.trim(),
      notes: form.notes.trim(),
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
          {isEditing ? 'Edit Money Entry' : 'Add Money Entry'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record income and expenses with clean, structured details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          name="type"
          label="Type"
          value={form.type}
          onChange={handleChange}
          options={[
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
        />

        <Select
          name="category"
          label="Category"
          value={form.category}
          onChange={handleChange}
          options={TRANSACTION_CATEGORIES}
        />

        <Input
          name="title"
          label="Title"
          value={form.title}
          onChange={handleChange}
          placeholder="Invoice #1023"
          error={errors.title}
          required
        />

        <Input
          name="amount"
          label="Amount"
          value={form.amount}
          onChange={handleChange}
          type="number"
          min="0"
          step="0.01"
          error={errors.amount}
          required
        />

        <Input
          name="date"
          label="Date"
          value={form.date}
          onChange={handleChange}
          type="date"
          error={errors.date}
          required
        />

        <Textarea
          name="notes"
          label="Notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Optional memo"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
};
