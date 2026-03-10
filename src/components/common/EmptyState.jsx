export const EmptyState = ({ title, message }) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};
