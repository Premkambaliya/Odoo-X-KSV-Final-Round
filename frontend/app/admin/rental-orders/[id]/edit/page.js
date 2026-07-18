'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import RentalItemsList from '@/components/rental/RentalItemsList';
import VehicleSelectionCard from '@/components/rental/VehicleSelectionCard';
import PricingCard from '@/components/rental/PricingCard';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import SectionHeader from '@/components/dashboard/SectionHeader';
import rentalService from '@/services/rentalService';
import vehicleService from '@/services/vehicleService';
import { APP_ROUTES } from '@/constants/routes';
import { VEHICLE_AVAILABILITY } from '@/constants/masterData';
import { toIsoDateTime, toDateInputValue } from '@/lib/listUtils';
import { computeGrandTotal } from '@/lib/rental';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditRentalOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pickupDate: '',
    expectedReturnDate: '',
    remarks: '',
    tax: 0,
    discount: 0,
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [orderRes, vehiclesRes] = await Promise.all([
        rentalService.getRentalOrderById(id),
        vehicleService.getVehicles({
          availability: VEHICLE_AVAILABILITY.AVAILABLE,
          limit: 100,
        }),
      ]);
      const data = orderRes.data;
      if (data.status !== 'PENDING') {
        notify.warning('Only pending rentals can be edited');
        router.replace(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id));
        return;
      }
      setOrder(data);
      setForm({
        pickupDate: toDateInputValue(data.pickupDate),
        expectedReturnDate: toDateInputValue(data.expectedReturnDate),
        remarks: data.remarks || '',
        tax: Number(data.tax) || 0,
        discount: Number(data.discount) || 0,
      });
      setAvailableVehicles(vehiclesRes.data?.vehicles || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const periodDays = order?.rentalPeriod?.days || 1;
  const attachedIds = useMemo(
    () => new Set((order?.rentalItems || []).map((i) => i.vehicleId)),
    [order]
  );

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await rentalService.update(id, {
        pickupDate: toIsoDateTime(form.pickupDate),
        expectedReturnDate: toIsoDateTime(form.expectedReturnDate),
        remarks: form.remarks || undefined,
        tax: Number(form.tax) || 0,
        discount: Number(form.discount) || 0,
      });
      notify.success('Rental updated');
      router.push(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVehicle(vehicle) {
    try {
      await rentalService.addItem(id, vehicle.id);
      notify.success('Vehicle added');
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  }

  async function handleRemoveItem(item) {
    try {
      await rentalService.removeItem(item.id);
      notify.success('Vehicle removed');
      load();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Rental" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !order) {
    return (
      <MasterPage title="Edit Rental" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title={`Edit ${order.bookingNumber}`}
      backHref={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Orders', href: APP_ROUTES.ADMIN.RENTAL_ORDERS },
        { label: order.bookingNumber, href: APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id) },
        { label: 'Edit' },
      ]}
    >
      <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="surface-card space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Pickup Date"
                type="date"
                value={form.pickupDate}
                onChange={(e) => setForm((p) => ({ ...p, pickupDate: e.target.value }))}
              />
              <Input
                label="Return Date"
                type="date"
                value={form.expectedReturnDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expectedReturnDate: e.target.value }))
                }
              />
              <Input
                label="Tax"
                type="number"
                min={0}
                step="0.01"
                value={form.tax}
                onChange={(e) => setForm((p) => ({ ...p, tax: e.target.value }))}
              />
              <Input
                label="Discount"
                type="number"
                min={0}
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
              />
            </div>
            <Textarea
              label="Remarks"
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="surface-card p-6">
            <SectionHeader
              title="Attached Vehicles"
              description="Remove or add vehicles while status is PENDING"
            />
            <RentalItemsList
              items={order.rentalItems || []}
              canRemove
              onRemove={handleRemoveItem}
            />
          </div>
        </div>

        <div className="space-y-6">
          <PricingCard
            subtotal={order.subtotal}
            tax={form.tax}
            discount={form.discount}
            deposit={(order.rentalItems || []).reduce(
              (s, i) => s + Number(i.vehicle?.securityDeposit || 0),
              0
            )}
            lateFee={order.lateFee}
            grandTotal={computeGrandTotal({
              subtotal: order.subtotal,
              tax: form.tax,
              discount: form.discount,
              securityDeposit: (order.rentalItems || []).reduce(
                (s, i) => s + Number(i.vehicle?.securityDeposit || 0),
                0
              ),
              lateFee: order.lateFee,
            })}
          />

          <div className="surface-card p-6">
            <SectionHeader
              title="Add Available Vehicle"
              description="Backend enforces date overlap checks on add"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {availableVehicles
                .filter((v) => !attachedIds.has(v.id))
                .slice(0, 6)
                .map((vehicle) => (
                  <VehicleSelectionCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    periodDays={periodDays}
                    onToggle={handleAddVehicle}
                  />
                ))}
            </div>
          </div>
        </div>
      </form>
    </MasterPage>
  );
}
