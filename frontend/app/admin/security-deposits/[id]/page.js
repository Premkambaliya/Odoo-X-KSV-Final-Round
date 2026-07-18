'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Undo2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import DepositCard from '@/components/finance/DepositCard';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import TransactionCard from '@/components/finance/TransactionCard';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import securityDepositService from '@/services/securityDepositService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { remainingDeposit } from '@/lib/finance';
import {
  customerName,
  formatCurrency,
  formatDateTime,
  vehicleLabel,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';

export default function DepositDetailPage() {
  const { id } = useParams();
  const [deposit, setDeposit] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await securityDepositService.getById(id);
      const data = result.data;
      setDeposit(data);
      if (data?.rentalOrderId) {
        const orderResult = await rentalService.getRentalOrderById(
          data.rentalOrderId
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
      <MasterPage
        title="Deposit Details"
        backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      >
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !deposit) {
    return (
      <MasterPage
        title="Deposit Details"
        backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      >
        <div className="surface-card">
          <ErrorState description={error || 'Deposit not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rental = order || deposit.rentalOrder;
  const remaining = remainingDeposit(deposit);
  const canRefund =
    deposit.refundStatus !== 'REFUNDED' && rental?.status === 'COMPLETED';

  return (
    <MasterPage
      title="Deposit Details"
      description={formatCurrency(deposit.amountCollected)}
      backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Security Deposits', href: APP_ROUTES.ADMIN.SECURITY_DEPOSITS },
        { label: 'Details' },
      ]}
      actions={
        canRefund ? (
          <Link href={APP_ROUTES.ADMIN.SECURITY_DEPOSIT_REFUND(deposit.id)}>
            <Button size="sm">
              <Undo2 size={14} />
              Refund
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="mb-4">
        <PaymentStatusBadge status={deposit.refundStatus} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <InfoCard title="Deposit summary">
            <dl>
              <InfoRow
                label="Collected"
                value={formatCurrency(deposit.amountCollected)}
              />
              <InfoRow
                label="Refunded"
                value={formatCurrency(deposit.amountRefunded)}
              />
              <InfoRow
                label="Damage cost"
                value={formatCurrency(deposit.damageCost)}
              />
              <InfoRow
                label="Remaining"
                value={formatCurrency(remaining)}
              />
              <InfoRow label="Reason" value={deposit.reason || '—'} />
              <InfoRow
                label="Collected at"
                value={formatDateTime(deposit.createdAt)}
              />
              <InfoRow
                label="Last refund"
                value={formatDateTime(deposit.refundedAt)}
              />
            </dl>
          </InfoCard>

          <InfoCard title="Associated rental">
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
              <InfoRow label="Customer" value={customerName(rental?.customer)} />
              <InfoRow
                label="Vehicle"
                value={vehicleLabel(rental?.rentalItems)}
              />
              <InfoRow label="Rental status" value={rental?.status || '—'} />
              <InfoRow
                label="Required deposit"
                value={formatCurrency(rental?.securityDeposit)}
              />
            </dl>
          </InfoCard>

          {Number(deposit.amountRefunded) > 0 ? (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-primary">
                Refund history
              </h3>
              <TransactionCard
                title="Refund processed"
                amount={deposit.amountRefunded}
                status={deposit.refundStatus}
                date={deposit.refundedAt || deposit.updatedAt}
                type="refund"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <DepositCard deposit={{ ...deposit, rentalOrder: rental }} />
          {!canRefund && deposit.refundStatus !== 'REFUNDED' ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
              Refunds are only allowed after the rental order status is
              COMPLETED.
            </p>
          ) : null}
        </div>
      </div>
    </MasterPage>
  );
}
