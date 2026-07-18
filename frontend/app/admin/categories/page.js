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
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { filterAndPaginate } from '@/lib/listUtils';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('categoryName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await categoryService.getAll();
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
        searchKeys: ['categoryName', 'description'],
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
      await categoryService.remove(deleting.id);
      notify.success('Category deleted');
      setDeleting(null);
      load();
    } catch (err) {
      const message = getErrorMessage(err);
      notify.error(message);
      if (message.toLowerCase().includes('associated vehicles')) {
        setDeleting(null);
      }
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns = [
    {
      key: 'categoryName',
      header: 'Category Name',
      sortable: true,
      render: (value) => <span className="font-medium text-primary">{value}</span>,
    },
    {
      key: 'vehicleType',
      header: 'Vehicle Type',
      sortable: true,
      render: (value) => (
        <span className="text-secondary">
          {value === 'Four_Wheeler' ? 'Four Wheeler' : 'Two Wheeler'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span className="line-clamp-1 max-w-xs text-secondary">{value || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge active={Boolean(value)} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Link href={APP_ROUTES.ADMIN.CATEGORY_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.CATEGORY_EDIT(row.id)}>
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
        title="Categories"
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Categories' }]}
      >
        <div className="surface-card">
          <ErrorState description={error} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Categories"
      description="Organize the fleet taxonomy used across vehicles and pricing"
      breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Categories' }]}
      actions={
        <Link href={APP_ROUTES.ADMIN.CATEGORY_NEW}>
          <Button size="sm">
            <Plus size={14} />
            Add Category
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
        emptyTitle="No categories yet"
        emptyDescription="Create your first vehicle category to start structuring the fleet."
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete category?"
        description={
          deleting
            ? `Delete “${deleting.categoryName}”? Categories linked to vehicles cannot be deleted.`
            : ''
        }
      />
    </MasterPage>
  );
}
