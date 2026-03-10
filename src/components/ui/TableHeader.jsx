import { cn } from '../../utils/cn';

export const TableHeader = ({ children, className }) => {
  return <thead className={cn('bg-gray-50 dark:bg-slate-800/70', className)}>{children}</thead>;
};
