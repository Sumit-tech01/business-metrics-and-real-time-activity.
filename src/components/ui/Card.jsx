import { cn } from '../../utils/cn';

export const Card = ({ title, subtitle, actions, className, children }) => {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
};
