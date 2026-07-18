'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Pencil,
  Printer,
  Receipt,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import PaymentSummary from '@/components/finance/PaymentSummary';
import TransactionTimeline from '@/components/finance/TransactionTimeline';
import StripeButton from '@/components/finance/StripeButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import paymentService from '@/services/paymentService';
import stripeService from '@/services/stripeService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { computeBalanceFromOrder } from '@/lib/finance';
import {
  customerName,
  formatCurrency,
  formatDateTime,
  vehicleLabel,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [relatedPayments, setRelatedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

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
        const orderData = orderResult.data;
        setOrder(orderData);

        if (orderData?.bookingNumber) {
          const payResult = await paymentService.getPayments({
            orderNumber: orderData.bookingNumber,
            limit: 100,
            page: 1,
          });
          setRelatedPayments(payResult.data?.payments || []);
        }
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

  async function handleDelete() {
    setBusy(true);
    try {
      await paymentService.remove(id);
      notify.success('Payment deleted');
      router.push(APP_ROUTES.ADMIN.PAYMENTS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleStripeRefund() {
    setBusy(true);
    try {
      const result = await stripeService.refund(id);
      notify.success(result.message || 'Stripe refund processed');
      setConfirm(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkRefunded() {
    setBusy(true);
    try {
      await paymentService.updateStatus(id, 'REFUNDED');
      notify.success('Payment marked as refunded');
      setConfirm(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Payment Details" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !payment) {
    return (
      <MasterPage title="Payment Details" backHref={APP_ROUTES.ADMIN.PAYMENTS}>
        <div className="surface-card">
          <ErrorState description={error || 'Payment not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rental = order || payment.rentalOrder;
  const balance = order
    ? computeBalanceFromOrder(order, relatedPayments)
    : null;
  const paid = order
    ? Number(order.grandTotal || 0) - (balance ?? 0)
    : null;
  const canStripeRefund =
    payment.paymentGateway === 'STRIPE' &&
    payment.paymentStatus === 'SUCCESS' &&
    Boolean(payment.transactionId);

  return (
    <MasterPage
      title="Payment Details"
      description={formatCurrency(payment.amount)}
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Details' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href={APP_ROUTES.ADMIN.PAYMENT_RECEIPT(payment.id)}>
            <Button variant="outline" size="sm">
              <Receipt size={14} />
              Receipt
            </Button>
          </Link>
          <Link href={APP_ROUTES.ADMIN.PAYMENT_EDIT(payment.id)}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
              Update
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh">
            <RefreshCcw size={14} />
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PaymentStatusBadge status={payment.paymentStatus} />
        <PaymentStatusBadge status={payment.paymentMethod} />
        {rental?.paymentStatus ? (
          <PaymentStatusBadge
            status={rental.paymentStatus}
            label={`Order: ${rental.paymentStatus}`}
          />
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <InfoCard title="Transaction details">
            <dl>
              <InfoRow label="Amount" value={formatCurrency(payment.amount)} />
              <InfoRow
                label="Reference"
                value={payment.transactionId || '—'}
              />
              <InfoRow
                label="Gateway"
                value={payment.paymentGateway || 'Manual'}
              />
              <InfoRow
                label="Paid at"
                value={formatDateTime(payment.paidAt || payment.createdAt)}
              />
              <InfoRow
                label="Created"
                value={formatDateTime(payment.createdAt)}
              />
              <InfoRow
                label="Updated"
                value={formatDateTime(payment.updatedAt)}
              />
            </dl>
          </InfoCard>

          <InfoCard title="Rental details">
            <dl>
              <InfoRow
                label="Booking"
                value={
                  rental?.id ? (
                    <Link
                      href={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(rental.id)}
                      className="text-accent hover:underline"
                    >
                      {rental.bookingNumber}
                    </Link>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoRow
                label="Customer"
                value={customerName(rental?.customer)}
              />
              <InfoRow
                label="Vehicle"
                value={vehicleLabel(rental?.rentalItems)}
              />
              <InfoRow
                label="Order total"
                value={formatCurrency(rental?.grandTotal)}
              />
            </dl>
          </InfoCard>

          <TransactionTimeline
            payment={payment}
            relatedPayments={relatedPayments}
          />
        </div>

        <div className="space-y-4">
          {order ? (
            <PaymentSummary
              orderTotal={order.grandTotal}
              amountPaid={paid}
              balance={balance}
              paymentStatus={order.paymentStatus}
            />
          ) : null}

          <div className="surface-card space-y-3 p-5">
            <h3 className="text-sm font-semibold text-primary">Actions</h3>
            {canStripeRefund ? (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setConfirm({ type: 'stripe-refund' })}
              >
                <RefreshCcw size={14} />
                Stripe refund
              </Button>
            ) : null}
            {payment.paymentStatus === 'SUCCESS' && !canStripeRefund ? (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setConfirm({ type: 'mark-refund' })}
              >
                Mark as refunded
              </Button>
            ) : null}
            {order && balance > 0 ? (
              <>
                <StripeButton
                  rentalOrderId={order.id}
                  mode="checkout"
                  size="sm"
                  className="w-full"
                />
                <Link
                  href={`${APP_ROUTES.ADMIN.PAYMENT_NEW}?rentalOrderId=${order.id}`}
                  className="block"
                >
                  <Button variant="ghost" size="sm" fullWidth>
                    Record another payment
                  </Button>
                </Link>
              </>
            ) : null}
            <Link href={APP_ROUTES.ADMIN.PAYMENT_RECEIPT(payment.id)}>
              <Button variant="ghost" size="sm" fullWidth>
                <Printer size={14} />
                Open receipt
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => setConfirm({ type: 'delete' })}
            >
              <Trash2 size={14} />
              Delete payment
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === 'delete') return handleDelete();
          if (confirm?.type === 'stripe-refund') return handleStripeRefund();
          if (confirm?.type === 'mark-refund') return handleMarkRefunded();
        }}
        loading={busy}
        title={
          confirm?.type === 'delete'
            ? 'Delete payment?'
            : confirm?.type === 'stripe-refund'
              ? 'Refund via Stripe?'
              : 'Mark payment refunded?'
        }
        description={
          confirm?.type === 'delete'
            ? 'This permanently removes the payment and recalculates the rental balance.'
            : confirm?.type === 'stripe-refund'
              ? 'Issues a Stripe refund for this payment intent and updates status.'
              : 'Sets status to REFUNDED and recalculates the order payment status.'
        }
        confirmLabel={
          confirm?.type === 'delete' ? 'Delete' : 'Confirm refund'
        }
        tone="danger"
      />
    </MasterPage>
  );
}
