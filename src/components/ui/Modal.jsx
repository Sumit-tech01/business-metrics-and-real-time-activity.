import { X } from 'lucide-react';

export const Modal = ({
  open,
  title,
  description,
  children,
  onClose,
  actions,
  maxWidthClassName = 'max-w-2xl',
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidthClassName} rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
        {actions ? <div className="mt-5 flex justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  );
};
