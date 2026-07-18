'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import FilterPanel from '@/components/forms/FilterPanel';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/master/StatusBadge';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import vehicleService from '@/services/vehicleService';
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import {
  AVAILABILITY_OPTIONS,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
} from '@/constants/masterData';
import { formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const EMPTY_FILTERS = {
  brand: '',
  model: '',
  registrationNumber: '',
  category: '',
  fuelType: '',
  transmission: '',
  availability: '',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order: sortOrder,
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const result = await vehicleService.getVehicles(params);
      setVehicles(result.data?.vehicles || []);
      setPagination((prev) => ({
        ...prev,
        ...(result.data?.pagination || {}),
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await vehicleService.remove(deleting.id);
      notify.success('Vehicle deleted');
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
      key: 'thumbnail',
      header: 'Image',
      render: (_, row) => {
        const src =
          row.images?.[0]?.imageUrl ||
          row.thumbnail ||
          null;
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${row.brand} ${row.model}`}
            className="h-12 w-16 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-muted">
            No img
          </div>
        );
      },
    },
    {
      key: 'brand',
      header: 'Vehicle',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-primary">
            {row.brand} {row.model}
          </p>
          <p className="text-[11px] text-muted">{row.registrationNumber}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (_, row) => row.category?.name || '—',
    },
    {
      key: 'availabilityStatus',
      header: 'Availability',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'transmission',
      header: 'Transmission',
    },
    {
      key: 'fuelType',
      header: 'Fuel',
    },
    {
      key: 'basePrice',
      header: 'Base Price',
      sortable: true,
      render: (v) => (
        <span className="font-medium tabular-nums">{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Link href={APP_ROUTES.ADMIN.VEHICLE_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.VEHICLE_EDIT(row.id)}>
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

  if (error && !vehicles.length && !loading) {
    return (
      <MasterPage
        title="Vehicles"
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Vehicles' }]}
      >
        <div className="surface-card">
          <ErrorState description={error} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Vehicles"
      description="Manage fleet inventory, availability, and media"
      breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Vehicles' }]}
      actions={
        <Link href={APP_ROUTES.ADMIN.VEHICLE_NEW}>
          <Button size="sm">
            <Plus size={14} />
            Add Vehicle
          </Button>
        </Link>
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
            { key: 'brand', label: 'Brand', placeholder: 'Search brand' },
            { key: 'model', label: 'Model', placeholder: 'Search model' },
            {
              key: 'registrationNumber',
              label: 'Registration',
              placeholder: 'Reg. number',
            },
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
            {
              key: 'availability',
              label: 'Availability',
              type: 'select',
              options: AVAILABILITY_OPTIONS,
            },
            {
              key: 'transmission',
              label: 'Transmission',
              type: 'select',
              options: TRANSMISSION_OPTIONS,
            },
            {
              key: 'fuelType',
              label: 'Fuel Type',
              type: 'select',
              options: FUEL_OPTIONS,
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        searchable={false}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyTitle="No vehicles found"
        emptyDescription="Add a vehicle or relax your filters to see fleet inventory."
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete vehicle?"
        description={
          deleting
            ? `Delete ${deleting.brand} ${deleting.model}? Vehicles linked to rental items cannot be deleted.`
            : ''
        }
      />
    </MasterPage>
  );
}
