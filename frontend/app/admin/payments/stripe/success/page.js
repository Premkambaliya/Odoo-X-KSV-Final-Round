'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterPage from '@/components/master/MasterPage';
import PaymentSummary from '@/components/finance/PaymentSummary';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalService from '@/services/rentalService';
import paymentService from '@/services/paymentService';
import { APP_ROUTES } from '@/constants/routes';
import { computeBalanceFromOrder } from '@/lib/finance';
import { formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';

function StripeSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const load = useCallback(async () => {
    if (!orderId) {
      setError('Missing rental order reference from Stripe return URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const orderResult = await rentalService.getRentalOrderById(orderId);
      const orderData = orderResult.data;
      setOrder(orderData);

      let list = [];
      if (orderData?.bookingNumber) {
        const payResult = await paymentService.getPayments({
          orderNumber: orderData.bookingNumber,
          limit: 50,
          page: 1,
        });
        list = payResult.data?.payments || [];
      }
      setPayments(list);
      setAttempts((n) => n + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Webhook may lag — soft refresh once if still unpaid after first load
  useEffect(() => {
    if (!order || attempts !== 1) return;
    const balance = computeBalanceFromOrder(order, payments);
    if (balance <= 0) return;
    const timer = setTimeout(() => load(), 2500);
    return () => clearTimeout(timer);
  }, [order, payments, attempts, load]);

  if (loading && !order) {
    return <PageLoader label="Verifying payment with backend…" />;
  }

  if (error && !order) {
    return (
      <div className="surface-card">
        <ErrorState description={error} onRetry={load} />
      </div>
    );
  }

  const balance = computeBalanceFromOrder(order, payments);
  const paid = Number(order?.grandTotal || 0) - balance;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-card px-6 py-10 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-success">
          <CheckCircle2 size={28} aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-primary">
          Payment successful
        </h2>
        <p className="mt-2 text-sm text-muted">
          Stripe checkout completed. Order balance is refreshed from the backend
          after webhook verification.
        </p>
        <div className="mt-4 flex justify-center">
          <PaymentStatusBadge status={order?.paymentStatus || 'PENDING'} />
        </div>
        {balance > 0 ? (
          <p className="mt-3 text-xs text-warning">
            Remaining balance {formatCurrency(balance)}. If you just paid, wait a
            moment for webhook confirmation, then refresh.
          </p>
        ) : null}
      </motion.div>

      <PaymentSummary
        orderTotal={order?.grandTotal}
        amountPaid={paid}
        balance={balance}
        paymentStatus={order?.paymentStatus}
      />

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={load} loading={loading}>
          Refresh status
        </Button>
        <Link href={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(orderId)}>
          <Button variant="outline" size="sm">
            View rental
          </Button>
        </Link>
        <Link href={APP_ROUTES.ADMIN.PAYMENTS}>
          <Button size="sm">Back to payments</Button>
        </Link>
      </div>
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <MasterPage
      title="Stripe Success"
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Success' },
      ]}
    >
      <Suspense fallback={<PageLoader label="Loading…" />}>
        <StripeSuccessContent />
      </Suspense>
    </MasterPage>
  );
}
