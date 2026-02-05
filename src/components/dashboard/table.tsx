import React from 'react';

// 类型定义
interface Column<T = Record<string, unknown>> {
  prop: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface TableOptions {
  change?: (page: number) => void;
  noDataText?: string;
}

interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  options?: TableOptions;
  pagination?: PaginationInfo | null;
}

const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  options = {},
  pagination = null,
}: TableProps<T>) => {
  const handlePageChange = (type: 'prev' | 'next') => {
    if (!pagination || !options.change) return;
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
            {columns.map((column) => (
              <th key={column.prop}>{column.label}</th>
            ))}
          </tr>
        </thead>
        {Boolean(data.length) ? (
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th>{rowIndex + 1}</th>
                {columns.map((column) => (
                  <td key={column.prop}>
                    {column.render ? column.render(row) : (row[column.prop] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
                {options.noDataText || '暂无数据'}
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
