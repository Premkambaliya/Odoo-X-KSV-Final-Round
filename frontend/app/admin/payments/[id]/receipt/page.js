'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import ReceiptCard from '@/components/finance/ReceiptCard';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import paymentService from '@/services/paymentService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';

export default function PaymentReceiptPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await paymentService.getPaymentById(id);
      const paymentData = result.data;
      setPayment(paymentData);
      if (paymentData?.rentalOrderId) {
        const orderResult = await rentalService.getRentalOrderById(
          paymentData.rentalOrderId
        );
        setOrder(orderResult.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <MasterPage title="Payment Receipt" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <PageLoader label="Preparing receipt…" />
      </MasterPage>
    );
  }

  if (error || !payment) {
    return (
      <MasterPage title="Payment Receipt" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <div className="surface-card">
          <ErrorState description={error || 'Receipt unavailable'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Payment Receipt"
      backHref={APP_ROUTES.ADMIN.PAYMENT_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Receipt' },
      ]}
    >
      <ReceiptCard payment={payment} order={order} />
    </MasterPage>
  );
}
