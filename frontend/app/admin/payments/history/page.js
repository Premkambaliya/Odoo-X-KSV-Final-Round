'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import MasterPage from '@/components/master/MasterPage';
import TransactionCard from '@/components/finance/TransactionCard';
import FilterPanel from '@/components/forms/FilterPanel';
import ErrorState from '@/components/dashboard/ErrorState';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import Button from '@/components/ui/Button';
import paymentService from '@/services/paymentService';
import { APP_ROUTES } from '@/constants/routes';
import { PAYMENT_STATUS_OPTIONS } from '@/lib/finance';
import { getErrorMessage } from '@/lib/apiResponse';

const EMPTY_FILTERS = {
  paymentStatus: '',
  orderNumber: '',
  customerName: '',
  date: '',
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'paidAt',
        order: 'desc',
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
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MasterPage
      title="Payment History"
      description="Chronological ledger of all payment activity"
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'History' },
      ]}
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
              key: 'paymentStatus',
              label: 'Status',
              type: 'select',
              options: PAYMENT_STATUS_OPTIONS,
            },
            { key: 'date', label: 'Date', type: 'date' },
          ]}
        />
      </div>

      {error && !payments.length && !loading ? (
        <div className="surface-card">
          <ErrorState description={error} onRetry={load} />
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} height="4.5rem" rounded="xl" />
          ))}
        </div>
      ) : null}

      {!loading && !error && payments.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            title="No payment history"
            description="Settlements will appear here as they are recorded."
          />
        </div>
      ) : null}

      {!loading && payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <Link
              key={payment.id}
              href={APP_ROUTES.ADMIN.PAYMENT_DETAIL(payment.id)}
              className="block"
            >
              <TransactionCard
                title={`${payment.rentalOrder?.bookingNumber || 'Payment'} · ${payment.paymentMethod}`}
                amount={payment.amount}
                status={payment.paymentStatus}
                method={payment.paymentMethod}
                date={payment.paidAt || payment.createdAt}
                reference={payment.transactionId}
                type={
                  payment.paymentStatus === 'REFUNDED' ? 'refund' : 'payment'
                }
                delay={Math.min(index * 0.03, 0.3)}
              />
            </Link>
          ))}

          {pagination.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </MasterPage>
  );
}
