'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import OperationsStatusBadge from '@/components/operations/OperationsStatusBadge';
import OperationsTimeline from '@/components/operations/OperationsTimeline';
import ImageGallery from '@/components/operations/ImageGallery';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import penaltyService from '@/services/penaltyService';
import rentalService from '@/services/rentalService';
import pickupService from '@/services/pickupService';
import returnService from '@/services/returnService';
import { APP_ROUTES } from '@/constants/routes';
import {
  customerName,
  formatCurrency,
  vehicleLabel,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PenaltyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [penalty, setPenalty] = useState(null);
  const [order, setOrder] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [returnRecord, setReturnRecord] = useState(null);
  const [relatedPenalties, setRelatedPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await penaltyService.getById(id);
      const data = result.data;
      setPenalty(data);

      if (data?.rentalOrderId) {
        const orderResult = await rentalService.getRentalOrderById(
          data.rentalOrderId
        );
        const orderData = orderResult.data;
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
          setRelatedPenalties(penaltyResult.data?.penalties || []);
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

  async function markPaid() {
    setBusy(true);
    try {
      await penaltyService.update(id, { status: 'PAID' });
      notify.success('Penalty marked as paid');
      setConfirm(null);
      load();
      if (penalty?.rentalOrderId) {
        try {
          await penaltyService.checkClosure(penalty.rentalOrderId);
        } catch {
          // closure check is best-effort
        }
      }
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await penaltyService.remove(id);
      notify.success('Penalty deleted');
      router.push(APP_ROUTES.ADMIN.PENALTIES);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Penalty Details" backHref={APP_ROUTES.ADMIN.PENALTIES}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !penalty) {
    return (
      <MasterPage title="Penalty Details" backHref={APP_ROUTES.ADMIN.PENALTIES}>
        <div className="surface-card">
          <ErrorState description={error || 'Penalty not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rental = order || penalty.rentalOrder;

  return (
    <MasterPage
      title="Penalty Details"
      description={formatCurrency(penalty.amount)}
      backHref={APP_ROUTES.ADMIN.PENALTIES}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Penalties', href: APP_ROUTES.ADMIN.PENALTIES },
        { label: 'Details' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          {penalty.status === 'UNPAID' ? (
            <Button
              size="sm"
              onClick={() => setConfirm({ type: 'paid' })}
            >
              <CheckCircle2 size={14} />
              Mark paid
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirm({ type: 'delete' })}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <OperationsStatusBadge status={penalty.type} kind="penalty" />
        <OperationsStatusBadge status={penalty.status} kind="penalty" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <InfoCard title="Penalty information">
            <dl>
              <InfoRow label="Amount" value={formatCurrency(penalty.amount)} />
              <InfoRow label="Reason" value={penalty.reason} />
              <InfoRow
                label="Type"
                value={
                  <OperationsStatusBadge status={penalty.type} kind="penalty" />
                }
              />
              <InfoRow
                label="Status"
                value={
                  <OperationsStatusBadge status={penalty.status} kind="penalty" />
                }
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
              <InfoRow
                label="Payment status"
                value={rental?.paymentStatus || '—'}
              />
            </dl>
          </InfoCard>

          <ImageGallery
            images={[]}
            title="Evidence images"
            emptyHint="Penalty evidence uploads are not exposed by the current API."
          />
        </div>

        <OperationsTimeline
          order={rental}
          pickup={pickup}
          returnRecord={returnRecord}
          penalties={relatedPenalties}
          hasPayment={rental?.paymentStatus !== 'PENDING'}
        />
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === 'delete') return handleDelete();
          if (confirm?.type === 'paid') return markPaid();
        }}
        loading={busy}
        title={
          confirm?.type === 'delete' ? 'Delete penalty?' : 'Mark penalty paid?'
        }
        description={
          confirm?.type === 'delete'
            ? 'This permanently removes the penalty record.'
            : 'Sets status to PAID and attempts rental closure check on the backend.'
        }
        confirmLabel={confirm?.type === 'delete' ? 'Delete' : 'Mark paid'}
        tone={confirm?.type === 'delete' ? 'danger' : 'default'}
      />
    </MasterPage>
  );
}
