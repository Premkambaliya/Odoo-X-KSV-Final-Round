'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import UpdatePaymentStatusForm from '@/components/finance/UpdatePaymentStatusForm';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import paymentService from '@/services/paymentService';
import { APP_ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function UpdatePaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await paymentService.getPaymentById(id);
      setPayment(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(values) {
    setSaving(true);
    try {
      await paymentService.updateStatus(id, values.status);
      notify.success('Payment status updated');
      router.push(APP_ROUTES.ADMIN.PAYMENT_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Update Payment" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !payment) {
    return (
      <MasterPage title="Update Payment" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <div className="surface-card">
          <ErrorState description={error || 'Payment not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Update Payment"
      description={`${formatCurrency(payment.amount)} · ${payment.rentalOrder?.bookingNumber || ''}`}
      backHref={APP_ROUTES.ADMIN.PAYMENT_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Update' },
      ]}
    >
      <div className="mb-4 flex items-center gap-2">
        <PaymentStatusBadge status={payment.paymentStatus} />
        <PaymentStatusBadge status={payment.paymentMethod} />
      </div>
      <div className="mx-auto max-w-lg">
        <UpdatePaymentStatusForm
          defaultStatus={payment.paymentStatus}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </MasterPage>
  );
}
