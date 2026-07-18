'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import Button from '@/components/ui/Button';

function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  pagination,
  onPageChange,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting filters or create a new record.',
  rowKey = 'id',
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const controlled = searchValue !== undefined;
  const q = controlled ? searchValue : internalSearch;

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible !== false),
    [columns]
  );

  const filteredData = useMemo(() => {
    if (!searchable || controlled || !q?.trim()) return data;
    const needle = q.trim().toLowerCase();
    return data.filter((row) =>
      visibleColumns.some((column) => {
        const value = row[column.key];
        if (value == null) return false;
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value).toLowerCase().includes(needle);
          } catch {
            return false;
          }
        }
        return String(value).toLowerCase().includes(needle);
      })
    );
  }, [searchable, controlled, q, data, visibleColumns]);

  function handleSort(column) {
    if (!column.sortable || !onSortChange) return;
    const nextOrder =
      sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(column.key, nextOrder);
  }

  function SortIcon({ column }) {
    if (!column.sortable) return null;
    if (sortBy !== column.key) return <ArrowUpDown size={13} className="opacity-40" />;
    return sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  }

  return (
    <div className="surface-card overflow-hidden">
      {searchable ? (
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                const value = e.target.value;
                if (controlled) onSearchChange?.(value);
                else setInternalSearch(value);
              }}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-2xl border border-border bg-white pr-4 pl-10 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
              aria-label="Search table"
            />
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/70 text-[11px] tracking-wide text-muted uppercase">
              {visibleColumns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium sm:px-5">
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-1.5 transition hover:text-primary"
                    >
                      {column.header}
                      <SortIcon column={column} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-border/60">
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-4 py-4 sm:px-5">
                      <SkeletonLoader height="1rem" width="80%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !filteredData.length ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <motion.tr
                  key={row[rowKey] || index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border/70 transition hover:bg-slate-50/80 last:border-0"
                >
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5 align-middle sm:px-5">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? '—'}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted">
            Showing page {pagination.page} of {pagination.totalPages} ·{' '}
            {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange?.(pagination.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onPageChange?.(pagination.page + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default memo(DataTable);
