'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, RefreshCcw, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import FilterPanel from '@/components/forms/FilterPanel';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import StatusBadge from '@/components/dashboard/StatusBadge';
import userService from '@/services/userService';
import { APP_ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { customerName, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const EMPTY_FILTERS = {
  search: '',
  status: '',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        role: ROLES.CUSTOMER,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order: sortOrder,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const result = await userService.getUsers(params);
      setCustomers(result.data?.users || []);
      setPagination((prev) => ({ ...prev, ...(result.data?.pagination || {}) }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await userService.remove(deleteTarget.id);
      notify.success('Customer deleted');
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
      key: 'name',
      header: 'Customer',
      render: (_, row) => (
        <div>
          <p className="font-medium text-primary">{customerName(row)}</p>
          <p className="text-[11px] text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (v) => v || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (v) => formatDateTime(v),
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      sortable: true,
      render: (v) => (v ? formatDateTime(v) : 'Never'),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Link href={APP_ROUTES.ADMIN.CUSTOMER_DETAIL(row.id)}>
            <Button size="sm" variant="ghost" aria-label="View customer">
              <Eye size={14} />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger"
            aria-label="Delete customer"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (error && !loading && !customers.length) {
    return (
      <MasterPage
        title="Customers"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Customers' },
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
      title="Customers"
      description="Registered customer accounts and booking history"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Customers' },
      ]}
      actions={
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCcw size={14} />
          Refresh
        </Button>
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
            {
              key: 'search',
              label: 'Search',
              placeholder: 'Name, email, or phone',
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: STATUS_OPTIONS,
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchable={false}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyTitle="No customers found"
        emptyDescription="Customers appear after they register via signup."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete customer?"
        description={`Permanently remove ${customerName(deleteTarget)}. Related rentals may block deletion if the database enforces relations.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
