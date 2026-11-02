export default function Table({
  headers,
  rows,
  columnClassName = "",
  emptyMessage = "No hay datos para mostrar.",
  emptyAction,
  className = "",
  bodyClassName = "",
  ...props
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <div className={className} {...props}>
      <div className="-m-1 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-zinc-800 ${bodyClassName}`}>
            {hasRows ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-zinc-200">
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 whitespace-nowrap ${columnClassName}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div>{emptyMessage}</div>
                    {emptyAction && emptyAction}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
