import { cn } from '../../utils/cn';

const toneClasses = {
  green:
    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  yellow:
    'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800',
  gray: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

const toneAliases = {
  success: 'green',
  warning: 'yellow',
  info: 'blue',
  muted: 'gray',
  danger: 'red',
};

export const Badge = ({ children, tone = 'muted', className }) => {
  const resolvedTone = toneAliases[tone] || tone;

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[resolvedTone] || toneClasses.gray,
        className,
      )}
    >
      {children}
    </span>
  );
};
