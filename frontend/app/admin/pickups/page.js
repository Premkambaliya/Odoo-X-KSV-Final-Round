'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import FilterPanel from '@/components/forms/FilterPanel';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import FuelIndicator from '@/components/operations/FuelIndicator';
import pickupService from '@/services/pickupService';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatDateTime, vehicleLabel } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const EMPTY_FILTERS = {
  orderNumber: '',
  customerName: '',
  vehicleRegistration: '',
  date: '',
};

export default function PickupsPage() {
  const [pickups, setPickups] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const result = await pickupService.getPickups(params);
      setPickups(result.data?.pickups || []);
      setPagination((prev) => ({ ...prev, ...(result.data?.pagination || {}) }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await pickupService.remove(deleteTarget.id);
      notify.success('Pickup deleted — rental rolled back to CONFIRMED');
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      key: 'pickupTime',
      header: 'Pickup time',
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-medium text-primary">{formatDateTime(v)}</p>
          <p className="text-[11px] text-muted">{row.executiveName}</p>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Rental',
      render: (_, row) => (
        <div>
          <p className="font-medium text-primary">
            {row.rentalOrder?.bookingNumber || '—'}
          </p>
          <p className="text-[11px] text-muted">
            {customerName(row.rentalOrder?.customer)}
          </p>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (_, row) => vehicleLabel(row.rentalOrder?.rentalItems),
    },
    {
      key: 'odometerReading',
      header: 'Odometer',
      render: (v) => (
        <span className="tabular-nums">
          {v != null ? `${Number(v).toLocaleString('en-IN')} km` : '—'}
        </span>
      ),
    },
    {
      key: 'fuelLevel',
      header: 'Fuel',
      render: (v) => (
        <div className="min-w-[100px]">
          <FuelIndicator fuelLevel={v} label="" />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link href={APP_ROUTES.ADMIN.PICKUP_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View pickup">
              <Eye size={14} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            aria-label="Delete pickup"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (error && !pickups.length && !loading) {
    return (
      <MasterPage
        title="Pickups"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Pickups' },
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
      title="Vehicle Pickups"
      description="Hand over confirmed rentals and start active trips"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Pickups' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh">
            <RefreshCcw size={14} />
          </Button>
          <Link href={APP_ROUTES.ADMIN.PICKUP_NEW}>
            <Button size="sm">
              <Plus size={14} />
              New Pickup
            </Button>
          </Link>
        </div>
      }
    >
      <div className="mb-4">
        <FilterPanel
          values={filters}
          onChange={(key, value) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onReset={() => {
            setFilters(EMPTY_FILTERS);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          filters={[
            { key: 'orderNumber', label: 'Booking #', placeholder: 'BKG-…' },
            { key: 'customerName', label: 'Customer', placeholder: 'Name' },
            {
              key: 'vehicleRegistration',
              label: 'Registration',
              placeholder: 'Plate no.',
            },
            { key: 'date', label: 'Pickup date', type: 'date' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={pickups}
        loading={loading}
        searchable={false}
        sortBy={sortBy === 'date' ? 'pickupTime' : sortBy}
        sortOrder="desc"
        onSortChange={(key) => {
          setSortBy(key === 'pickupTime' ? 'date' : key);
        }}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyTitle="No pickups yet"
        emptyDescription="Complete a pickup for a CONFIRMED rental to activate it."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete pickup?"
        description="This rolls the rental status back to CONFIRMED."
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
