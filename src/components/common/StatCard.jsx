import { Card } from './Card';

export const StatCard = ({ title, value, trend, icon: Icon, iconClassName = '' }) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          {trend ? <p className="mt-1 text-xs text-teal-600 dark:text-teal-300">{trend}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-200 ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
};
