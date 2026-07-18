'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, Calculator, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import InspectionCard from '@/components/operations/InspectionCard';
import FuelIndicator from '@/components/operations/FuelIndicator';
import OdometerCard from '@/components/operations/OdometerCard';
import OperationsTimeline from '@/components/operations/OperationsTimeline';
import ConditionBadge from '@/components/operations/ConditionBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import returnService from '@/services/returnService';
import pickupService from '@/services/pickupService';
import rentalService from '@/services/rentalService';
import penaltyService from '@/services/penaltyService';
import vehicleService from '@/services/vehicleService';
import { APP_ROUTES } from '@/constants/routes';
import {
  customerName,
  formatCurrency,
  formatDateTime,
  vehicleLabel,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function ReturnDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [returnRecord, setReturnRecord] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [order, setOrder] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await returnService.getById(id);
      const data = result.data;
      setReturnRecord(data);

      if (data?.rentalOrderId) {
        const orderResult = await rentalService.getRentalOrderById(
          data.rentalOrderId
        );
        const orderData = orderResult.data;
        setOrder(orderData);

        if (orderData?.bookingNumber) {
          const [pickupResult, penaltyResult] = await Promise.all([
            pickupService.getPickups({
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
          setPenalties(penaltyResult.data?.penalties || []);
        }

        const vehicleId =
          orderData?.rentalItems?.[0]?.vehicleId ||
          orderData?.rentalItems?.[0]?.vehicle?.id;
        if (vehicleId) {
          try {
            const vehicleResult = await vehicleService.getVehicleById(vehicleId);
            setImages(vehicleResult.data?.images || []);
          } catch {
            setImages([]);
          }
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
      await returnService.remove(id);
      notify.success('Return deleted');
      router.push(APP_ROUTES.ADMIN.RETURNS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleCalculatePenalties() {
    if (!returnRecord?.rentalOrderId) return;
    setBusy(true);
    try {
      const result = await penaltyService.calculate(returnRecord.rentalOrderId);
      const count = result.data?.length || 0;
      notify.success(
        count
          ? `Generated ${count} automatic penalt${count === 1 ? 'y' : 'ies'}`
          : result.message || 'No automatic penalties required'
      );
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Return Details" backHref={APP_ROUTES.ADMIN.RETURNS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !returnRecord) {
    return (
      <MasterPage title="Return Details" backHref={APP_ROUTES.ADMIN.RETURNS}>
        <div className="surface-card">
          <ErrorState description={error || 'Return not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rental = order || returnRecord.rentalOrder;

  return (
    <MasterPage
      title="Return Details"
      description={rental?.bookingNumber}
      backHref={APP_ROUTES.ADMIN.RETURNS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Returns', href: APP_ROUTES.ADMIN.RETURNS },
        { label: 'Details' },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={busy}
            onClick={handleCalculatePenalties}
          >
            <Calculator size={14} />
            Auto penalties
          </Button>
          <Link
            href={`${APP_ROUTES.ADMIN.PENALTY_NEW}?rentalOrderId=${returnRecord.rentalOrderId}`}
          >
            <Button variant="outline" size="sm">
              <AlertTriangle size={14} />
              Add penalty
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <ConditionBadge condition={returnRecord.vehicleCondition} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <InfoCard title="Return summary">
            <dl>
              <InfoRow
                label="Return time"
                value={formatDateTime(returnRecord.returnTime)}
              />
              <InfoRow label="Handled by" value={returnRecord.executiveName} />
              <InfoRow
                label="Damage charge"
                value={formatCurrency(returnRecord.damageCharge)}
              />
              <InfoRow
                label="Late charge"
                value={formatCurrency(returnRecord.lateCharge)}
              />
              <InfoRow label="Notes" value={returnRecord.remarks || '—'} />
            </dl>
          </InfoCard>

          <InfoCard title="Rental & customer">
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
            </dl>
          </InfoCard>

          {pickup ? (
            <div className="surface-card p-5 sm:p-6">
              <h3 className="mb-4 text-base font-semibold text-primary">
                Pickup vs return
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FuelIndicator
                  fuelLevel={pickup.fuelLevel}
                  label="Pickup fuel"
                />
                <FuelIndicator
                  fuelLevel={returnRecord.fuelLevel}
                  label="Return fuel"
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <OdometerCard
                  reading={pickup.odometerReading}
                  label="Pickup odometer"
                />
                <OdometerCard
                  reading={returnRecord.odometerReading}
                  compareReading={pickup.odometerReading}
                  label="Return odometer"
                />
              </div>
            </div>
          ) : null}

          <InspectionCard
            title="Return inspection"
            fuelLevel={returnRecord.fuelLevel}
            odometerReading={returnRecord.odometerReading}
            condition={returnRecord.vehicleCondition}
            notes={returnRecord.remarks}
            images={images}
            compareOdometer={pickup?.odometerReading}
          />
        </div>

        <div className="space-y-4">
          <OperationsTimeline
            order={rental}
            pickup={pickup}
            returnRecord={returnRecord}
            penalties={penalties}
            hasPayment={rental?.paymentStatus !== 'PENDING'}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete return?"
        description="Rental status will roll back to ACTIVE."
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
