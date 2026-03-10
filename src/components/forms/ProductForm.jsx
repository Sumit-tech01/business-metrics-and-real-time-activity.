import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { INVENTORY_CATEGORIES } from '../../utils/constants';

const getInitialState = (initialValues = null) => ({
  name: initialValues?.name || '',
  sku: initialValues?.sku || '',
  category: initialValues?.category || INVENTORY_CATEGORIES[0],
  stock: initialValues?.stock || 0,
  lowStockThreshold: initialValues?.lowStockThreshold || 10,
  price: initialValues?.price || 0,
});

export const ProductForm = ({ onSubmit, loading, initialValues = null, onCancel }) => {
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
      nextErrors.name = 'Product name is required.';
    }

    if (Number(form.stock) < 0) {
      nextErrors.stock = 'Stock cannot be negative.';
    }

    if (Number(form.price) < 0) {
      nextErrors.price = 'Price cannot be negative.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      stock: Number(form.stock) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
      price: Number(form.price) || 0,
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
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep catalog items accurate with stock and pricing details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input name="name" label="Product" value={form.name} onChange={handleChange} error={errors.name} required />

        <Input name="sku" label="SKU" value={form.sku} onChange={handleChange} />

        <Select
          name="category"
          label="Category"
          value={form.category}
          onChange={handleChange}
          options={INVENTORY_CATEGORIES}
        />

        <Input
          name="stock"
          label="Stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          error={errors.stock}
          required
        />

        <Input
          name="lowStockThreshold"
          label="Low Stock Alert"
          type="number"
          min="0"
          value={form.lowStockThreshold}
          onChange={handleChange}
          required
        />

        <Input
          name="price"
          label="Unit Price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};
