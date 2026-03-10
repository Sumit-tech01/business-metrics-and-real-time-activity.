import { Filter, Plus, Search } from 'lucide-react';
import { Button } from './Button';

export const TableToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilterClick,
  onAddClick,
  addLabel = 'Add',
  showSearch = true,
  showFilter = true,
}) => {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
      {showSearch ? (
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-9 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      ) : (
        <div />
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {showFilter ? (
          <Button variant="secondary" size="sm" onClick={onFilterClick}>
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        ) : null}

        {onAddClick ? (
          <Button size="sm" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
