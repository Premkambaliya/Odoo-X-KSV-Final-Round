'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import DataTable from '@/components/tables/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import userService from '@/services/userService';
import { APP_ROUTES } from '@/constants/routes';
import {
  customerName,
  formatCurrency,
  formatDateTime,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await userService.getById(id);
      setCustomer(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    setBusy(true);
    try {
      await userService.remove(id);
      notify.success('Customer deleted');
      router.push(APP_ROUTES.ADMIN.CUSTOMERS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Customer" backHref={APP_ROUTES.ADMIN.CUSTOMERS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !customer) {
    return (
      <MasterPage title="Customer" backHref={APP_ROUTES.ADMIN.CUSTOMERS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rentals = customer.rentalOrders || [];
  const rentalCount = customer._count?.rentalOrders ?? rentals.length;

  const rentalColumns = [
    {
      key: 'bookingNumber',
      header: 'Booking',
      render: (v, row) => (
        <Link
          href={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(row.id)}
          className="font-medium text-accent hover:underline"
        >
          {v}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'grandTotal',
      header: 'Total',
      render: (v) => formatCurrency(v),
    },
    {
      key: 'pickupDate',
      header: 'Pickup',
      render: (v) => formatDateTime(v),
    },
  ];

  return (
    <MasterPage
      title={customerName(customer)}
      description={customer.email}
      backHref={APP_ROUTES.ADMIN.CUSTOMERS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Customers', href: APP_ROUTES.ADMIN.CUSTOMERS },
        { label: customerName(customer) },
      ]}
      actions={
        <Button
          size="sm"
          variant="danger"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={14} />
          Delete
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <InfoCard title="Profile">
          <dl>
            <InfoRow label="Name" value={customerName(customer)} />
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone || '—'} />
            <InfoRow
              label="Status"
              value={<StatusBadge status={customer.status} />}
            />
            <InfoRow label="Role" value={customer.role} />
            <InfoRow
              label="Email verified"
              value={customer.emailVerified ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Joined"
              value={formatDateTime(customer.createdAt)}
            />
            <InfoRow
              label="Last login"
              value={
                customer.lastLogin
                  ? formatDateTime(customer.lastLogin)
                  : 'Never'
              }
            />
            <InfoRow label="Total rentals" value={String(rentalCount)} />
          </dl>
        </InfoCard>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-primary">
              Recent rentals
            </h2>
            <p className="mt-1 text-xs text-muted">
              Latest bookings for this customer
            </p>
          </div>
          <DataTable
            columns={rentalColumns}
            data={rentals}
            loading={false}
            searchable={false}
            emptyTitle="No rentals yet"
            emptyDescription="This customer has not booked any rentals."
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete customer?"
        description={`Permanently remove ${customerName(customer)}.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
