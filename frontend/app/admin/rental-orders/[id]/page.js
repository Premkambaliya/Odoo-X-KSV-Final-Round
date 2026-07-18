'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Ban,
  CheckCircle2,
  CreditCard,
  FileText,
  PackageCheck,
  PackageOpen,
  AlertTriangle,
  Pencil,
  Play,
  Printer,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import StatusBadge from '@/components/dashboard/StatusBadge';
import RentalItemsList from '@/components/rental/RentalItemsList';
import PricingCard from '@/components/rental/PricingCard';
import OperationsTimeline from '@/components/operations/OperationsTimeline';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import SectionHeader from '@/components/dashboard/SectionHeader';
import rentalService from '@/services/rentalService';
import quotationService from '@/services/quotationService';
import pickupService from '@/services/pickupService';
import returnService from '@/services/returnService';
import penaltyService from '@/services/penaltyService';
import { APP_ROUTES } from '@/constants/routes';
import { itemLineTotal, computeGrandTotal } from '@/lib/rental';
import {
  customerName,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function RentalOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [returnRecord, setReturnRecord] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await rentalService.getRentalOrderById(id);
      const orderData = result.data;
      setOrder(orderData);

      if (orderData?.bookingNumber) {
        const [pickupResult, returnResult, penaltyResult] = await Promise.all([
          pickupService.getPickups({
            orderNumber: orderData.bookingNumber,
            limit: 1,
            page: 1,
          }),
          returnService.getReturns({
            orderNumber: orderData.bookingNumber,
            limit: 1,
            page: 1,
          }),
          penaltyService.getPenalties({
            orderNumber: orderData.bookingNumber,
            limit: 20,
            page: 1,
          }),
        ]);
        setPickup(pickupResult.data?.pickups?.[0] || null);
        setReturnRecord(returnResult.data?.returns?.[0] || null);
        setPenalties(penaltyResult.data?.penalties || []);
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

  async function runStatus(status) {
    setBusy(true);
    try {
      await rentalService.updateStatus(id, status);
      notify.success(`Status updated to ${status}`);
      setConfirm(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await rentalService.remove(id);
      notify.success('Rental deleted');
      router.push(APP_ROUTES.ADMIN.RENTAL_ORDERS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleRecalculate() {
    setBusy(true);
    try {
      const result = await rentalService.recalculate(id);
      notify.success(result.message || 'Totals recalculated');
      setConfirm(null);
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateQuotation() {
    setBusy(true);
    try {
      const result = await quotationService.generate(id);
      notify.success(result.message || 'Quotation generated');
      const qid = result.data?.quotation?.id;
      if (qid) router.push(APP_ROUTES.ADMIN.QUOTATION_DETAIL(qid));
      else router.push(APP_ROUTES.ADMIN.QUOTATION_BY_ORDER(id));
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes('already')) {
        notify.info('Quotation already exists — opening it');
        router.push(APP_ROUTES.ADMIN.QUOTATION_BY_ORDER(id));
      } else {
        notify.error(message);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Rental Details" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !order) {
    return (
      <MasterPage title="Rental Details" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const items = order.rentalItems || [];
  const displayDeposit =
    Number(order.securityDeposit || 0) ||
    items.reduce(
      (sum, item) => sum + Number(item.vehicle?.securityDeposit || 0),
      0
    );
  const displayGrandTotal = computeGrandTotal({
    subtotal: order.subtotal,
    tax: order.tax,
    discount: order.discount,
    securityDeposit: displayDeposit,
    lateFee: order.lateFee,
  });

  return (
    <MasterPage
      title={order.bookingNumber}
      description={`${customerName(order.customer)} · ${order.rentalPeriod?.name || 'Period'}`}
      backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Orders', href: APP_ROUTES.ADMIN.RENTAL_ORDERS },
        { label: order.bookingNumber },
      ]}
      actions={
        <>
          {order.status === 'PENDING' ? (
            <>
              <Link href={APP_ROUTES.ADMIN.RENTAL_ORDER_EDIT(id)}>
                <Button size="sm" variant="outline">
                  <Pencil size={14} />
                  Edit
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => setConfirm({ type: 'confirm' })}
                disabled={busy}
              >
                <CheckCircle2 size={14} />
                Confirm
              </Button>
            </>
          ) : null}
          {order.status === 'CONFIRMED' ? (
            <Button
              size="sm"
              onClick={() => setConfirm({ type: 'active' })}
              disabled={busy}
            >
              <Play size={14} />
              Mark Active
            </Button>
          ) : null}
          {order.status === 'ACTIVE' ? (
            <Button
              size="sm"
              onClick={() => setConfirm({ type: 'complete' })}
              disabled={busy}
            >
              <CheckCircle2 size={14} />
              Complete
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={handleGenerateQuotation} disabled={busy}>
            <FileText size={14} />
            Quotation
          </Button>
          {order.status !== 'CANCELLED' && order.paymentStatus !== 'PAID' ? (
            <Link
              href={`${APP_ROUTES.ADMIN.PAYMENT_NEW}?rentalOrderId=${order.id}`}
            >
              <Button size="sm" variant="outline">
                <CreditCard size={14} />
                Payment
              </Button>
            </Link>
          ) : null}
          {order.status !== 'CANCELLED' ? (
            <Link
              href={`${APP_ROUTES.ADMIN.SECURITY_DEPOSIT_NEW}?rentalOrderId=${order.id}`}
            >
              <Button size="sm" variant="outline">
                <Shield size={14} />
                Deposit
              </Button>
            </Link>
          ) : null}
          {order.status === 'CONFIRMED' && !pickup ? (
            <Link
              href={`${APP_ROUTES.ADMIN.PICKUP_NEW}?rentalOrderId=${order.id}`}
            >
              <Button size="sm" variant="outline">
                <PackageCheck size={14} />
                Pickup
              </Button>
            </Link>
          ) : null}
          {order.status === 'ACTIVE' && !returnRecord ? (
            <Link
              href={`${APP_ROUTES.ADMIN.RETURN_NEW}?rentalOrderId=${order.id}`}
            >
              <Button size="sm" variant="outline">
                <PackageOpen size={14} />
                Return
              </Button>
            </Link>
          ) : null}
          {order.status !== 'CANCELLED' ? (
            <Link
              href={`${APP_ROUTES.ADMIN.PENALTY_NEW}?rentalOrderId=${order.id}`}
            >
              <Button size="sm" variant="outline">
                <AlertTriangle size={14} />
                Penalty
              </Button>
            </Link>
          ) : null}
          {order.status !== 'CANCELLED' &&
          order.status !== 'COMPLETED' &&
          order.status !== 'LATE' ? (
            <Button
              size="sm"
              variant="outline"
              className="text-warning"
              onClick={() => setConfirm({ type: 'cancel' })}
            >
              <Ban size={14} />
              Cancel
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirm({ type: 'recalculate' })}
            disabled={busy}
          >
            <RefreshCw size={14} />
            Recalculate
          </Button>
          {order.status === 'PENDING' || order.status === 'CANCELLED' ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setConfirm({ type: 'delete' })}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <InfoCard title="Booking Overview">
            <dl>
              <InfoRow label="Status" value={<StatusBadge status={order.status} />} />
              <InfoRow
                label="Rental payment status"
                value={<StatusBadge status={order.paymentStatus} />}
              />
              <InfoRow label="Customer" value={customerName(order.customer)} />
              <InfoRow label="Email" value={order.customer?.email} />
              <InfoRow label="Phone" value={order.customer?.phone} />
              <InfoRow label="Period" value={order.rentalPeriod?.name} />
              <InfoRow label="Duration" value={`${order.rentalPeriod?.days || '—'} days`} />
              <InfoRow label="Pickup" value={formatDateTime(order.pickupDate)} />
              <InfoRow label="Expected return" value={formatDateTime(order.expectedReturnDate)} />
              <InfoRow label="Actual return" value={formatDateTime(order.actualReturnDate)} />
              <InfoRow label="Created" value={formatDateTime(order.createdAt)} />
            </dl>
          </InfoCard>

          <div className="surface-card p-5 sm:p-6">
            <SectionHeader title="Rental Items" description="Vehicles attached to this booking" />
            <RentalItemsList items={items} />
          </div>

          <InfoCard title="Notes & Locations">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">
              {order.remarks || 'No remarks provided.'}
            </p>
          </InfoCard>

          <InfoCard title="Pickup & Return">
            <p className="text-sm text-muted">
              Dedicated pickup/return modules arrive in a later phase. Current booking
              stores schedule and notes above.
            </p>
            <dl className="mt-3">
              <InfoRow label="Pickup date" value={formatDate(order.pickupDate)} />
              <InfoRow label="Return date" value={formatDate(order.expectedReturnDate)} />
            </dl>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <PricingCard
            subtotal={order.subtotal}
            tax={order.tax}
            discount={order.discount}
            deposit={displayDeposit}
            lateFee={order.lateFee}
            grandTotal={displayGrandTotal}
          />
          <OperationsTimeline
            order={order}
            pickup={pickup}
            returnRecord={returnRecord}
            penalties={penalties}
            hasPayment={order.paymentStatus !== 'PENDING'}
          />
          <InfoCard title="Activity">
            <ul className="space-y-3 text-sm">
              <li className="text-secondary">
                Order created · {formatDateTime(order.createdAt)}
              </li>
              <li className="text-secondary">
                Current status · <StatusBadge status={order.status} />
              </li>
              <li className="text-secondary">
                Items total · {formatCurrency(items.reduce((s, i) => s + itemLineTotal(i), 0))}
              </li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.print()}
            >
              <Printer size={14} />
              Print summary
            </Button>
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        loading={busy}
        title={
          confirm?.type === 'confirm'
            ? 'Confirm rental?'
            : confirm?.type === 'active'
              ? 'Mark as active?'
              : confirm?.type === 'complete'
                ? 'Complete rental?'
                : confirm?.type === 'cancel'
                  ? 'Cancel rental?'
                  : confirm?.type === 'recalculate'
                    ? 'Recalculate totals?'
                    : 'Delete rental?'
        }
        description={
          confirm?.type === 'confirm'
            ? 'Vehicles will be marked BOOKED.'
            : confirm?.type === 'cancel'
              ? 'Vehicles will be released back to AVAILABLE.'
              : confirm?.type === 'delete'
                ? 'This permanently removes the booking.'
                : confirm?.type === 'recalculate'
                  ? 'Rebuilds subtotal, security deposit, and grand total from rental items, then syncs payment status.'
                  : 'Update the rental lifecycle status.'
        }
        confirmLabel="Confirm"
        onConfirm={() => {
          if (confirm?.type === 'confirm') return runStatus('CONFIRMED');
          if (confirm?.type === 'active') return runStatus('ACTIVE');
          if (confirm?.type === 'complete') return runStatus('COMPLETED');
          if (confirm?.type === 'cancel') return runStatus('CANCELLED');
          if (confirm?.type === 'recalculate') return handleRecalculate();
          return handleDelete();
        }}
      />
    </MasterPage>
  );
}
