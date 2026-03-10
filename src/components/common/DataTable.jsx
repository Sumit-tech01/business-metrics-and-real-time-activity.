export const DataTable = ({ columns, rows, emptyMessage = 'No records found.' }) => {
  if (!rows.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60">
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`} className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
