'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import MasterPage from '@/components/master/MasterPage';
import RentalStepper from '@/components/rental/RentalStepper';
import VehicleSelectionCard from '@/components/rental/VehicleSelectionCard';
import PricingCard from '@/components/rental/PricingCard';
import SummaryCard from '@/components/rental/SummaryCard';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import EmptyState from '@/components/dashboard/EmptyState';
import userService from '@/services/userService';
import rentalPeriodService from '@/services/rentalPeriodService';
import vehicleService from '@/services/vehicleService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { VEHICLE_AVAILABILITY } from '@/constants/masterData';
import { previewPricing } from '@/lib/rental';
import { customerName } from '@/lib/format';
import { toIsoDateTime } from '@/lib/listUtils';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

const STEPS = [
  { id: 'customer', label: 'Customer', description: 'Who is booking' },
  { id: 'details', label: 'Rental details', description: 'Dates & period' },
  { id: 'vehicles', label: 'Vehicles', description: 'Available fleet' },
  { id: 'pricing', label: 'Pricing', description: 'Totals & deposit' },
  { id: 'confirm', label: 'Confirm', description: 'Review & create' },
];

export default function CreateRentalPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bootLoading, setBootLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleSearch, setVehicleSearch] = useState('');

  const [form, setForm] = useState({
    customerId: '',
    rentalPeriodId: '',
    pickupDate: '',
    expectedReturnDate: '',
    pickupLocation: '',
    returnLocation: '',
    remarks: '',
    tax: 0,
    discount: 0,
    vehicleIds: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function boot() {
      setBootLoading(true);
      try {
        const [usersRes, periodsRes, vehiclesRes] = await Promise.all([
          userService.getUsers(),
          rentalPeriodService.getAll(),
          vehicleService.getVehicles({
            availability: VEHICLE_AVAILABILITY.AVAILABLE,
            limit: 100,
            sortBy: 'brand',
            order: 'asc',
          }),
        ]);

        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        setCustomers(allUsers.filter((u) => u.role === ROLES.CUSTOMER && u.status === 'ACTIVE'));
        setPeriods(
          (Array.isArray(periodsRes.data) ? periodsRes.data : []).filter((p) => p.status !== false)
        );
        setVehicles(vehiclesRes.data?.vehicles || []);
      } catch (err) {
        notify.error(getErrorMessage(err, 'Failed to load booking data'));
      } finally {
        setBootLoading(false);
      }
    }
    boot();
  }, []);

  const selectedPeriod = periods.find((p) => p.id === form.rentalPeriodId);
  const periodDays = selectedPeriod?.days || 1;
  const selectedVehicles = vehicles.filter((v) => form.vehicleIds.includes(v.id));
  const selectedCustomer = customers.find((c) => c.id === form.customerId);
  const pricing = previewPricing(selectedVehicles, periodDays, form.tax, form.discount);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.brand} ${v.model} ${v.registrationNumber}`.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleVehicle(vehicle) {
    if (vehicle.availabilityStatus !== VEHICLE_AVAILABILITY.AVAILABLE) return;
    setForm((prev) => {
      const exists = prev.vehicleIds.includes(vehicle.id);
      return {
        ...prev,
        vehicleIds: exists
          ? prev.vehicleIds.filter((id) => id !== vehicle.id)
          : [...prev.vehicleIds, vehicle.id],
      };
    });
  }

  function validateStep(index) {
    const nextErrors = {};
    if (index === 0 && !form.customerId) nextErrors.customerId = 'Select a customer';
    if (index === 1) {
      if (!form.rentalPeriodId) nextErrors.rentalPeriodId = 'Select a rental period';
      if (!form.pickupDate) nextErrors.pickupDate = 'Pickup date is required';
      if (!form.expectedReturnDate) nextErrors.expectedReturnDate = 'Return date is required';
      if (
        form.pickupDate &&
        form.expectedReturnDate &&
        new Date(form.expectedReturnDate) <= new Date(form.pickupDate)
      ) {
        nextErrors.expectedReturnDate = 'Return must be after pickup';
      }
    }
    if (index === 2 && form.vehicleIds.length < 1) {
      nextErrors.vehicleIds = 'Select at least one available vehicle';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    setSubmitting(true);
    try {
      const locationNotes = [
        form.pickupLocation ? `Pickup: ${form.pickupLocation}` : null,
        form.returnLocation ? `Return: ${form.returnLocation}` : null,
        form.remarks || null,
      ]
        .filter(Boolean)
        .join('\n');

      const created = await rentalService.create({
        customerId: form.customerId,
        rentalPeriodId: form.rentalPeriodId,
        pickupDate: toIsoDateTime(form.pickupDate),
        expectedReturnDate: toIsoDateTime(form.expectedReturnDate),
        remarks: locationNotes || undefined,
      });

      const orderId = created.data?.id;
      if (!orderId) throw new Error('Order created without id');

      for (const vehicleId of form.vehicleIds) {
        await rentalService.addItem(orderId, vehicleId);
      }

      if (Number(form.tax) > 0 || Number(form.discount) > 0) {
        await rentalService.update(orderId, {
          tax: Number(form.tax) || 0,
          discount: Number(form.discount) || 0,
        });
      }

      notify.success(created.message || 'Rental created successfully');
      router.push(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(orderId));
    } catch (err) {
      notify.error(getErrorMessage(err, 'Failed to create rental'));
    } finally {
      setSubmitting(false);
    }
  }

  if (bootLoading) {
    return (
      <MasterPage title="Create Rental" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <PageLoader label="Preparing booking workspace…" />
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Create Rental"
      description="Multi-step booking flow with live pricing"
      backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Orders', href: APP_ROUTES.ADMIN.RENTAL_ORDERS },
        { label: 'Create' },
      ]}
    >
      <div className="surface-card mb-6 p-5 sm:p-6">
        <RentalStepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 ? (
            <div className="surface-card mx-auto max-w-2xl space-y-4 p-6">
              <Select
                label="Customer"
                required
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${customerName(c)} · ${c.email}`,
                }))}
                value={form.customerId}
                onChange={(e) => updateField('customerId', e.target.value)}
                error={errors.customerId}
                placeholder="Select customer"
              />
              {!customers.length ? (
                <EmptyState
                  title="No customers found"
                  description="Customers appear after they register via the public signup flow."
                />
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="surface-card mx-auto max-w-2xl space-y-4 p-6">
              <Select
                label="Rental Period"
                required
                options={periods.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.days} day${p.days > 1 ? 's' : ''})`,
                }))}
                value={form.rentalPeriodId}
                onChange={(e) => updateField('rentalPeriodId', e.target.value)}
                error={errors.rentalPeriodId}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Pickup Date"
                  type="date"
                  required
                  value={form.pickupDate}
                  onChange={(e) => updateField('pickupDate', e.target.value)}
                  error={errors.pickupDate}
                />
                <Input
                  label="Return Date"
                  type="date"
                  required
                  value={form.expectedReturnDate}
                  onChange={(e) => updateField('expectedReturnDate', e.target.value)}
                  error={errors.expectedReturnDate}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Pickup Location"
                  placeholder="Branch / address note"
                  value={form.pickupLocation}
                  onChange={(e) => updateField('pickupLocation', e.target.value)}
                />
                <Input
                  label="Return Location"
                  placeholder="Branch / address note"
                  value={form.returnLocation}
                  onChange={(e) => updateField('returnLocation', e.target.value)}
                />
              </div>
              <Textarea
                label="Notes"
                value={form.remarks}
                onChange={(e) => updateField('remarks', e.target.value)}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="surface-card p-4">
                <Input
                  placeholder="Search brand, model, registration…"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                />
                {errors.vehicleIds ? (
                  <p className="mt-2 text-xs font-medium text-danger">{errors.vehicleIds}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted">
                    Showing available vehicles only. Availability is re-checked by the
                    backend when items are attached.
                  </p>
                )}
              </div>
              {!filteredVehicles.length ? (
                <div className="surface-card">
                  <EmptyState
                    title="No available vehicles"
                    description="Try another search or update fleet availability."
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleSelectionCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      periodDays={periodDays}
                      selected={form.vehicleIds.includes(vehicle.id)}
                      disabled={vehicle.availabilityStatus !== VEHICLE_AVAILABILITY.AVAILABLE}
                      onToggle={toggleVehicle}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1fr_320px]">
              <div className="surface-card space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Tax"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.tax}
                    onChange={(e) => updateField('tax', e.target.value)}
                  />
                  <Input
                    label="Discount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.discount}
                    onChange={(e) => updateField('discount', e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted">
                  Line pricing uses vehicle base price × rental period days (backend
                  formula). Security deposit is estimated from selected vehicles.
                </p>
              </div>
              <PricingCard {...pricing} />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <SummaryCard
                customer={customerName(selectedCustomer)}
                period={
                  selectedPeriod
                    ? `${selectedPeriod.name} (${selectedPeriod.days} days)`
                    : '—'
                }
                pickupDate={form.pickupDate}
                returnDate={form.expectedReturnDate}
                pickupLocation={form.pickupLocation}
                returnLocation={form.returnLocation}
                vehicles={selectedVehicles}
                remarks={form.remarks}
              />
              <PricingCard {...pricing} />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button loading={submitting} onClick={handleSubmit}>
            Confirm Rental
          </Button>
        )}
      </div>
    </MasterPage>
  );
}
