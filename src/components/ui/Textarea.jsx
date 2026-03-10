import { cn } from '../../utils/cn';
import { FormField } from './FormField';

export const Textarea = ({ label, error, className, rows = 3, id, required, description, ...props }) => {
  const inputId = id || props.name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} required={required} description={description}>
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...props}
      />
    </FormField>
  );
};

export const TextArea = Textarea;
