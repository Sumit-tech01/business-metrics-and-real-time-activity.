import { cn } from '../../utils/cn';
import { FormField } from './FormField';

export const Select = ({ label, options = [], error, className, id, required, description, ...props }) => {
  const inputId = id || props.name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} required={required} description={description}>
      <select
        id={inputId}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...props}
      >
        {options.map((option) => {
          const normalizedOption = typeof option === 'string' ? { value: option, label: option } : option;

          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    </FormField>
  );
};
