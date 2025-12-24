import React from 'react';

const Table = ({
  data,
  columns,
  options = {},
  pagination = null,
}: {
  data: any[];
  columns: any[];
  options?: any;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}) => {
  const handlePageChange = (type: 'prev' | 'next') => {
    if (!pagination) return;
    let page = pagination.page;
    if (type === 'prev') {
      page--;
    }
    if (type === 'next') {
      page++;
    }
    options.change(page);
  };

  return (
    <>
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            {columns.map((column, index) => (
              <th>{column.label}</th>
            ))}
          </tr>
        </thead>
        {Boolean(data.length) ? (
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                {columns.map((column, index) => (
                  <td>
                    {column.render
                      ? column.render(row)
                      : column.render
                      ? column.render(row)
                      : row[column.prop]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
                {(options.noDataText && options.noDataText) || '暂无数据'}
              </td>
            </tr>
          </tbody>
        )}
      </table>

      {pagination && (
        <div className="p-2 flex justify-between items-center">
          <div>共 {pagination.total} 条记录</div>
          <div className="pagination">
            <div className="join">
              <button
                className="join-item btn"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange('prev')}
              >
                «
              </button>
              <button className="join-item btn">
                第<span className="py-2">{pagination.page || 1}</span>页
              </button>
              <button
                disabled={
                  pagination.totalPages < 1 ||
                  pagination.page >= pagination.totalPages
                }
                className="join-item btn"
                onClick={() => handlePageChange('next')}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
