'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, RefreshCcw, Trash2, Calculator } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import FilterPanel from '@/components/forms/FilterPanel';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import OperationsStatusBadge from '@/components/operations/OperationsStatusBadge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import penaltyService from '@/services/penaltyService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import {
  PENALTY_TYPE_OPTIONS,
  PENALTY_STATUS_OPTIONS,
} from '@/lib/operations';
import { customerName, formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const EMPTY_FILTERS = {
  orderNumber: '',
  customerName: '',
  type: '',
  status: '',
};

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('amount');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcOrderId, setCalcOrderId] = useState('');
  const [completedOrders, setCompletedOrders] = useState([]);

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
      const result = await penaltyService.getPenalties(params);
      setPenalties(result.data?.penalties || []);
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

  async function openCalculate() {
    setCalcOpen(true);
    try {
      const result = await rentalService.getRentalOrders({
        page: 1,
        limit: 50,
        status: 'COMPLETED',
        sortBy: 'createdAt',
        order: 'desc',
      });
      setCompletedOrders(result.data?.orders || []);
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  }

  async function handleCalculate() {
    if (!calcOrderId) {
      notify.error('Select a rental order');
      return;
    }
    setBusy(true);
    try {
      const result = await penaltyService.calculate(calcOrderId);
      const count = Array.isArray(result.data) ? result.data.length : 0;
      notify.success(
        count
          ? `Generated ${count} penalt${count === 1 ? 'y' : 'ies'}`
          : result.message || 'Calculation complete'
      );
      setCalcOpen(false);
      setCalcOrderId('');
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await penaltyService.remove(deleteTarget.id);
      notify.success('Penalty deleted');
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
      key: 'type',
      header: 'Type',
      render: (v) => <OperationsStatusBadge status={v} kind="penalty" />,
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
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (v) => (
        <span className="font-semibold tabular-nums text-primary">
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (v) => (
        <p className="max-w-[220px] truncate text-sm text-muted" title={v}>
          {v}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <OperationsStatusBadge status={v} kind="penalty" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link href={APP_ROUTES.ADMIN.PENALTY_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View penalty">
              <Eye size={14} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            aria-label="Delete penalty"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (error && !penalties.length && !loading) {
    return (
      <MasterPage
        title="Penalties"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Penalties' },
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
      title="Penalties"
      description="Late fees, damage, cleaning, and other rental charges"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Penalties' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={openCalculate}>
            <Calculator size={14} />
            Auto calculate
          </Button>
          <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh">
            <RefreshCcw size={14} />
          </Button>
          <Link href={APP_ROUTES.ADMIN.PENALTY_NEW}>
            <Button size="sm">
              <Plus size={14} />
              New Penalty
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
              key: 'type',
              label: 'Type',
              type: 'select',
              options: PENALTY_TYPE_OPTIONS,
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: PENALTY_STATUS_OPTIONS,
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={penalties}
        loading={loading}
        searchable={false}
        sortBy={sortBy}
        sortOrder="desc"
        onSortChange={(key) => setSortBy(key)}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyTitle="No penalties"
        emptyDescription="Create a penalty or run automatic calculation after a return."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete penalty?"
        description="This removes the penalty record. Deposit adjustments already applied are not automatically reversed by the API."
        confirmLabel="Delete"
        tone="danger"
      />

      <Modal
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        title="Calculate automatic penalties"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Backend calculates late return, low fuel, damage, and extra distance
            penalties for a returned rental.
          </p>
          <Select
            label="Completed rental"
            options={completedOrders.map((o) => ({
              value: o.id,
              label: `${o.bookingNumber} · ${customerName(o.customer)}`,
            }))}
            value={calcOrderId}
            onChange={(e) => setCalcOrderId(e.target.value)}
            placeholder="Select rental"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCalcOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={busy} onClick={handleCalculate}>
              Calculate
            </Button>
          </div>
        </div>
      </Modal>
    </MasterPage>
  );
}
