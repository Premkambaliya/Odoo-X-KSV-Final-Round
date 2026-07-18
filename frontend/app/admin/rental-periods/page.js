'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/master/StatusBadge';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalPeriodService from '@/services/rentalPeriodService';
import { APP_ROUTES } from '@/constants/routes';
import { filterAndPaginate } from '@/lib/listUtils';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function RentalPeriodsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await rentalPeriodService.getAll();
      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const { data, pagination } = useMemo(
    () =>
      filterAndPaginate(items, {
        search,
        searchKeys: ['name', 'description'],
        page,
        limit: 10,
        sortBy,
        order: sortOrder,
      }),
    [items, search, page, sortBy, sortOrder]
  );

  async function handleDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await rentalPeriodService.remove(deleting.id);
      notify.success('Rental period deleted');
      setDeleting(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (v) => <span className="font-medium text-primary">{v}</span>,
    },
    {
      key: 'days',
      header: 'Days',
      sortable: true,
      render: (v) => <span className="tabular-nums">{v}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (v) => <span className="line-clamp-1 max-w-xs text-secondary">{v || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => <StatusBadge active={Boolean(v)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Link href={APP_ROUTES.ADMIN.RENTAL_PERIOD_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.RENTAL_PERIOD_EDIT(row.id)}>
            <Button variant="ghost" size="sm" aria-label="Edit">
              <Pencil size={14} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-red-50"
            aria-label="Delete"
            onClick={() => setDeleting(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (error && !items.length && !loading) {
    return (
      <MasterPage
        title="Rental Periods"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Rental Periods' },
        ]}
      >
        <div className="surface-card">
          <ErrorState description={error} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Rental Periods"
      description="Define booking durations used across rental workflows"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Periods' },
      ]}
      actions={
        <Link href={APP_ROUTES.ADMIN.RENTAL_PERIOD_NEW}>
          <Button size="sm">
            <Plus size={14} />
            Add Period
          </Button>
        </Link>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No rental periods"
        emptyDescription="Create daily, weekly, or custom rental period definitions."
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete rental period?"
        description={
          deleting
            ? `Delete “${deleting.name}”? Periods used by rental orders cannot be removed.`
            : ''
        }
      />
    </MasterPage>
  );
}
