'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, FilePlus2, FileText } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import DataTable from '@/components/tables/DataTable';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalService from '@/services/rentalService';
import quotationService from '@/services/quotationService';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatCurrency, formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function QuotationsPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await rentalService.getRentalOrders({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        order: 'desc',
      });
      setOrders(result.data?.orders || []);
      setPagination((prev) => ({ ...prev, ...(result.data?.pagination || {}) }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate(orderId) {
    setBusyId(orderId);
    try {
      const result = await quotationService.generate(orderId);
      notify.success(result.message || 'Quotation generated');
      const qid = result.data?.quotation?.id;
      if (qid) window.location.href = APP_ROUTES.ADMIN.QUOTATION_DETAIL(qid);
      else window.location.href = APP_ROUTES.ADMIN.QUOTATION_BY_ORDER(orderId);
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes('already')) {
        notify.info('Opening existing quotation');
        window.location.href = APP_ROUTES.ADMIN.QUOTATION_BY_ORDER(orderId);
      } else {
        notify.error(message);
      }
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    {
      key: 'bookingNumber',
      header: 'Booking',
      render: (v) => <span className="font-medium text-primary">{v}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_, row) => customerName(row.customer),
    },
    {
      key: 'status',
      header: 'Rental Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'pickupDate',
      header: 'Pickup',
      render: (v) => formatDate(v),
    },
    {
      key: 'grandTotal',
      header: 'Amount',
      render: (v) => (
        <span className="font-medium tabular-nums">{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Quotation',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            loading={busyId === row.id}
            onClick={() => handleGenerate(row.id)}
          >
            <FilePlus2 size={14} />
            Generate
          </Button>
          <Link href={APP_ROUTES.ADMIN.QUOTATION_BY_ORDER(row.id)}>
            <Button size="sm" variant="ghost" aria-label="View quotation">
              <Eye size={14} />
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(row.id)}>
            <Button size="sm" variant="ghost" aria-label="Open rental">
              <FileText size={14} />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (error && !orders.length && !loading) {
    return (
      <MasterPage
        title="Quotations"
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Quotations' },
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
      title="Quotations"
      description="Generate and review rental quotations from bookings"
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Quotations' },
      ]}
    >
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable={false}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyTitle="No rentals for quotations"
        emptyDescription="Create a rental order first, then generate a quotation."
      />
    </MasterPage>
  );
}
