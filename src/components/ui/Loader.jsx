import { LoaderCircle } from 'lucide-react';

export const FullPageLoader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-950">
      <LoaderCircle className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
};

export const SectionLoader = ({ label = 'Loading data...' }) => {
  return (
    <div className="grid min-h-[24vh] place-items-center rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
};

export const InlineLoader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
};
