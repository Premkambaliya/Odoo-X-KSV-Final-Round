'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  History,
  Pencil,
  Plus,
  Receipt,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import FilterPanel from '@/components/forms/FilterPanel';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import FinancialStatsCard from '@/components/finance/FinancialStatsCard';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import paymentService from '@/services/paymentService';
import { APP_ROUTES } from '@/constants/routes';
import { PAYMENT_METHODS, PAYMENT_STATUS_OPTIONS } from '@/lib/finance';
import { customerName, formatCurrency, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const EMPTY_FILTERS = {
  transactionId: '',
  orderNumber: '',
  customerName: '',
  paymentStatus: '',
  paymentMethod: '',
  date: '',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('paymentDate');
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
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order: sortOrder,
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const result = await paymentService.getPayments(params);
      setPayments(result.data?.payments || []);
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

  const stats = useMemo(() => {
    const success = payments.filter((p) => p.paymentStatus === 'Paid');
    const refunded = payments.filter((p) => p.paymentStatus === 'Refunded');
    const failed = payments.filter((p) => p.paymentStatus === 'Failed');
    const totalAmount = success.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    return {
      count: pagination.total,
      totalAmount,
      refunded: refunded.length,
      failed: failed.length,
    };
  }, [payments, pagination.total]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await paymentService.remove(deleteTarget.id);
      notify.success('Payment deleted');
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
      key: 'paymentDate',
      header: 'Date',
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-medium text-primary">
            {formatDateTime(v || row.createdAt)}
          </p>
          <p className="text-[11px] text-muted truncate max-w-[140px]">
            {row.transactionId || row.id?.slice(0, 8)}
          </p>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Rental',
      render: (_, row) => (
        <div>
          <p className="font-medium text-primary">
            {row.order?.orderNumber || '—'}
          </p>
          <p className="text-[11px] text-muted">
            {customerName(row.customer)}
          </p>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (v) => (
        <span className="font-semibold tabular-nums text-primary">
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (v) => <PaymentStatusBadge status={v} />,
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (v) => <PaymentStatusBadge status={v} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link href={APP_ROUTES.ADMIN.PAYMENT_DETAIL(row.id)}>
            <Button variant="ghost" size="sm" aria-label="View payment">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.PAYMENT_RECEIPT(row.id)}>
            <Button variant="ghost" size="sm" aria-label="Receipt">
              <Receipt size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.PAYMENT_EDIT(row.id)}>
            <Button variant="ghost" size="sm" aria-label="Update status">
              <Pencil size={14} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            aria-label="Delete payment"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (error && !payments.length && !loading) {
    return (
      <MasterPage
        title="Payments"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Payments' },
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
      title="Payments"
      description="Record settlements, Stripe collections, and refunds"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href={APP_ROUTES.ADMIN.PAYMENT_HISTORY}>
            <Button variant="outline" size="sm">
              <History size={14} />
              History
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh">
            <RefreshCcw size={14} />
          </Button>
          <Link href={APP_ROUTES.ADMIN.PAYMENT_NEW}>
            <Button size="sm">
              <Plus size={14} />
              New Payment
            </Button>
          </Link>
        </div>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialStatsCard
          title="Total payments"
          value={stats.count}
          description="Matching current filters"
          tone="accent"
          loading={loading}
        />
        <FinancialStatsCard
          title="Page success total"
          value={stats.totalAmount}
          format="currency"
          description="Successful on this page"
          tone="success"
          loading={loading}
        />
        <FinancialStatsCard
          title="Refunded (page)"
          value={stats.refunded}
          description="Refunded records visible"
          tone="warning"
          loading={loading}
        />
        <FinancialStatsCard
          title="Failed (page)"
          value={stats.failed}
          description="Failed attempts visible"
          tone="danger"
          loading={loading}
        />
      </div>

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
              key: 'transactionId',
              label: 'Transaction ID',
              placeholder: 'Reference',
            },
            {
              key: 'paymentStatus',
              label: 'Status',
              type: 'select',
              options: PAYMENT_STATUS_OPTIONS,
            },
            {
              key: 'paymentMethod',
              label: 'Method',
              type: 'select',
              options: PAYMENT_METHODS,
            },
            { key: 'date', label: 'Payment date', type: 'date' },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={payments}
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
        emptyTitle="No payments yet"
        emptyDescription="Record a cash/UPI payment or collect the balance with Stripe."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete payment?"
        description="This removes the payment record and recalculates the rental balance."
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
