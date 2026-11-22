import Card from './Card';
import TablePagination from './TablePagination';
const ALIGN_CLASS = {
  left: '',
  center: 'text-center',
  right: 'text-right',
};

function DataTable({
  title,
  columns,
  data,
  loading = false,
  loadingText = 'Cargando...',
  emptyText = 'No se encontraron registros.',
  rowKey,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  return (
    <Card className="p-0 overflow-hidden border-med-border">
      <div className="p-5 border-b border-med-border">
        <h2 className="text-base font-bold text-med-primary-900">{title}</h2>
      </div>
      {loading ? (
        <div className="p-10 text-center text-sm text-med-text-muted">
          {loadingText}
        </div>
      ) : data.length === 0 ? (
        <div className="p-10 text-center text-sm text-med-text-muted">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-3.5 ${ALIGN_CLASS[col.align] || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-med-border-subtle">
              {data.map((item) => (
                <tr
                  key={rowKey(item)}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`px-6 py-4 ${ALIGN_CLASS[col.align] || ''} ${col.className || ''}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
export default DataTable;
