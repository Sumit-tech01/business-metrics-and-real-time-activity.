import { cn } from '../../utils/cn';

export const TableRow = ({ children, className, ...props }) => {
  return (
    <tr
      className={cn(
        'border-b border-slate-200 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800/60',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
};
