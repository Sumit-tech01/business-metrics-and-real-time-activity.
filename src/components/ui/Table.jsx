import { useMemo, useState } from 'react';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';
import { TableToolbar } from './TableToolbar';
import { Pagination } from './Pagination';

const defaultSearchAccessor = (row, column) => {
  const value = row?.[column.key];

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return '';
};

const resolveActions = (rowActions, row) => {
  if (typeof rowActions === 'function') {
    return rowActions(row) || [];
  }

  if (Array.isArray(rowActions)) {
    return rowActions;
  }

  return [];
};

export const Table = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No data found',
  pageSize = 8,
  rowActions,
  toolbar = {},
  rowKey = 'id',
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [paginationState, setPaginationState] = useState({ page: 1, scope: '' });
  const [openActionRowId, setOpenActionRowId] = useState(null);

  const isControlledSearch = typeof toolbar.searchValue === 'string' && typeof toolbar.onSearchChange === 'function';
  const searchValue = isControlledSearch ? toolbar.searchValue : internalSearch;

  const handleSearchChange = (value) => {
    if (isControlledSearch) {
      toolbar.onSearchChange(value);
      return;
    }

    setInternalSearch(value);
  };

  const filteredRows = useMemo(() => {
    const keyword = String(searchValue || '').trim().toLowerCase();

    if (!keyword) {
      return rows;
    }

    const searchableColumns = columns.filter((column) => column.searchable !== false && column.key !== 'actions');

    return rows.filter((row) =>
      searchableColumns.some((column) => {
        const rawValue = column.searchAccessor
          ? column.searchAccessor(row)
          : defaultSearchAccessor(row, column);

        return String(rawValue || '')
          .toLowerCase()
          .includes(keyword);
      }),
    );
  }, [columns, rows, searchValue]);
  const paginationScope = `${searchValue || ''}-${rows.length}`;
  const currentPage = paginationState.scope === paginationScope ? paginationState.page : 1;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const handlePageChange = (nextPage) => {
    setPaginationState({
      page: Math.max(1, nextPage),
      scope: paginationScope,
    });
  };

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageSize, safePage]);

  const hasActionsColumn = columns.some((column) => column.key === 'actions');

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-slate-900">
      <TableToolbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={toolbar.searchPlaceholder || 'Search records...'}
        onFilterClick={toolbar.onFilterClick}
        onAddClick={toolbar.onAddClick}
        addLabel={toolbar.addLabel || 'Add'}
        showSearch={toolbar.showSearch !== false}
        showFilter={toolbar.showFilter !== false}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableCell key={column.key} as="th" className={column.headerClassName}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <tbody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : !paginatedRows.length ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const key = row?.[rowKey] ?? row?.id;

                return (
                  <TableRow key={key}>
                    {columns.map((column) => {
                      if (column.key === 'actions' && hasActionsColumn) {
                        const actions = resolveActions(rowActions, row);

                        if (!actions.length) {
                          return <TableCell key={`${key}-${column.key}`}>---</TableCell>;
                        }

                        return (
                          <TableCell key={`${key}-${column.key}`} className="relative">
                            <button
                              type="button"
                              className="inline-flex rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                              onClick={() =>
                                setOpenActionRowId((prev) => (prev === key ? null : key))
                              }
                              aria-label="Open row actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {openActionRowId === key ? (
                              <div className="absolute right-4 z-20 mt-2 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                {actions.map((action) => (
                                  <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => {
                                      setOpenActionRowId(null);
                                      action.onClick?.(row);
                                    }}
                                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition ${
                                      action.tone === 'danger'
                                        ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={`${key}-${column.key}`} className={column.className}>
                          {column.render ? column.render(row) : row?.[column.key] ?? '---'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};
