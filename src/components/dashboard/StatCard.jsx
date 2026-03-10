import { Card } from '../ui/Card';

export const StatCard = ({ title, value, icon: Icon, accent = 'slate' }) => {
  const accentClasses = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };

  return (
    <Card className="bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-xl p-2.5 ${accentClasses[accent] || accentClasses.slate}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
};
