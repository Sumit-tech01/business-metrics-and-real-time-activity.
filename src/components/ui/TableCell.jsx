import { cn } from '../../utils/cn';

export const TableCell = ({ as = 'td', className, children, ...props }) => {
  const Component = as;
  const baseClassName =
    as === 'th'
      ? 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-300'
      : 'px-4 py-3 text-sm text-slate-700 dark:text-slate-200';

  return (
    <Component className={cn(baseClassName, className)} {...props}>
      {children}
    </Component>
  );
};
