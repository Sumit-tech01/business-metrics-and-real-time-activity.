import { cn } from '../../utils/cn';

export const FormField = ({
  label,
  htmlFor,
  required = false,
  description,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}

      {description ? <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}

      {children}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};
