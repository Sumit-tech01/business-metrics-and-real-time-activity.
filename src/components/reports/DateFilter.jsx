import { Input } from '../common/Input';

export const DateFilter = ({ value = { from: '', to: '' }, onChange }) => {
  const handleChange = (event) => {
    const { name, value: nextValue } = event.target;

    if (!onChange) {
      return;
    }

    onChange({
      ...value,
      [name]: nextValue,
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label="From Date"
        type="date"
        name="from"
        value={value.from || ''}
        onChange={handleChange}
      />
      <Input
        label="To Date"
        type="date"
        name="to"
        value={value.to || ''}
        onChange={handleChange}
      />
    </div>
  );
};
