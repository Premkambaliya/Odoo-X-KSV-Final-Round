'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import priceListService from '@/services/priceListService';
import { APP_ROUTES } from '@/constants/routes';
import { filterAndPaginate } from '@/lib/listUtils';
import { formatCurrency, formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PriceListsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('pricingType');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await priceListService.getAll();
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

  const searchable = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        vehicleLabel: item.vehicle
          ? `${item.vehicle.brand} ${item.vehicle.model}`
          : '',
      })),
    [items]
  );

  const { data, pagination } = useMemo(
    () =>
      filterAndPaginate(searchable, {
        search,
        searchKeys: ['pricingType', 'vehicleLabel'],
        page,
        limit: 10,
        sortBy,
        order: sortOrder,
      }),
    [searchable, search, page, sortBy, sortOrder]
  );

  async function handleDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await priceListService.remove(deleting.id);
      notify.success('Price list deleted');
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
      key: 'vehicleLabel',
      header: 'Vehicle',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-primary">
            {row.vehicle ? `${row.vehicle.brand} ${row.vehicle.model}` : '—'}
          </p>
          <p className="text-[11px] text-muted">
            {row.vehicle?.registrationNumber}
          </p>
        </div>
      ),
    },
    {
      key: 'pricingType',
      header: 'Type',
      sortable: true,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (v) => (
        <span className="font-medium tabular-nums">{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'validFrom',
      header: 'Valid From',
      render: (v) => formatDate(v),
    },
    {
      key: 'validTo',
      header: 'Valid To',
      render: (v) => formatDate(v),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Link href={APP_ROUTES.ADMIN.PRICE_LIST_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.PRICE_LIST_EDIT(row.id)}>
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
        title="Price Lists"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Price Lists' },
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
      title="Price Lists"
      description="Vehicle pricing by type and validity window"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Price Lists' },
      ]}
      actions={
        <Link href={APP_ROUTES.ADMIN.PRICE_LIST_NEW}>
          <Button size="sm">
            <Plus size={14} />
            Add Price
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
        emptyTitle="No price lists"
        emptyDescription="Create pricing entries for vehicles and rental types."
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete price list?"
        description="Remove this pricing entry? Entries used by rental items cannot be deleted."
      />
    </MasterPage>
  );
}
