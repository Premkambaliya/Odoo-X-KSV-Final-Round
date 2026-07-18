'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import InfoCard, { InfoRow } from '@/components/rental/InfoCard';
import InspectionCard from '@/components/operations/InspectionCard';
import OperationsTimeline from '@/components/operations/OperationsTimeline';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import pickupService from '@/services/pickupService';
import rentalService from '@/services/rentalService';
import vehicleService from '@/services/vehicleService';
import { APP_ROUTES } from '@/constants/routes';
import {
  customerName,
  formatDateTime,
  vehicleLabel,
} from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PickupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pickup, setPickup] = useState(null);
  const [order, setOrder] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await pickupService.getById(id);
      const data = result.data;
      setPickup(data);

      if (data?.rentalOrderId) {
        const orderResult = await rentalService.getRentalOrderById(
          data.rentalOrderId
        );
        setOrder(orderResult.data);

        const vehicleId = orderResult.data?.rentalItems?.[0]?.vehicleId
          || orderResult.data?.rentalItems?.[0]?.vehicle?.id;
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
      await pickupService.remove(id);
      notify.success('Pickup deleted');
      router.push(APP_ROUTES.ADMIN.PICKUPS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Pickup Details" backHref={APP_ROUTES.ADMIN.PICKUPS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !pickup) {
    return (
      <MasterPage title="Pickup Details" backHref={APP_ROUTES.ADMIN.PICKUPS}>
        <div className="surface-card">
          <ErrorState description={error || 'Pickup not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  const rental = order || pickup.rentalOrder;

  return (
    <MasterPage
      title="Pickup Details"
      description={rental?.bookingNumber}
      backHref={APP_ROUTES.ADMIN.PICKUPS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Pickups', href: APP_ROUTES.ADMIN.PICKUPS },
        { label: 'Details' },
      ]}
      actions={
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={14} />
          Delete
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <InfoCard title="Pickup summary">
            <dl>
              <InfoRow
                label="Pickup time"
                value={formatDateTime(pickup.pickupTime)}
              />
              <InfoRow label="Handled by" value={pickup.executiveName} />
              <InfoRow
                label="Customer verified"
                value={pickup.customerVerified ? 'Yes' : 'No'}
              />
              <InfoRow label="Notes" value={pickup.remarks || '—'} />
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
              <InfoRow label="Email" value={rental?.customer?.email || '—'} />
              <InfoRow label="Phone" value={rental?.customer?.phone || '—'} />
            </dl>
          </InfoCard>

          <InspectionCard
            title="Vehicle condition at pickup"
            fuelLevel={pickup.fuelLevel}
            odometerReading={pickup.odometerReading}
            notes={pickup.remarks}
            images={images}
          />
        </div>

        <OperationsTimeline order={rental} pickup={pickup} hasPayment={rental?.paymentStatus !== 'PENDING'} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete pickup?"
        description="Rental status will roll back to CONFIRMED."
        confirmLabel="Delete"
        tone="danger"
      />
    </MasterPage>
  );
}
