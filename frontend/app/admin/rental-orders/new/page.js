'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import userService from '@/services/userService';
import vehicleService from '@/services/vehicleService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { customerName } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CreateRentalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [form, setForm] = useState({
    customerId: '',
    vehicleId: '',
    pickupType: 'Store_Pickup',
    pickupDate: '',
    expectedReturnDate: '',
    rentalUnit: 'Day',
    rentalDuration: '1',
    remarks: '',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [usersRes, vehiclesRes] = await Promise.all([
          userService.getUsers({
            role: ROLES.CUSTOMER,
            limit: 100,
            page: 1,
          }),
          vehicleService.getVehicles({
            limit: 100,
            sortBy: 'brand',
            order: 'asc',
          }),
        ]);

        const usersList = usersRes.data?.users || usersRes.data || [];
        setCustomers(usersList.filter(u => u.accountStatus === 'Active' || u.status === 'ACTIVE'));
        
        const vehiclesList = vehiclesRes.data?.vehicles || [];
        setVehicles(vehiclesList.filter(v => v.status === 'Available'));
      } catch (err) {
        notify.error(getErrorMessage(err, 'Failed to load list options'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customerId || !form.vehicleId || !form.pickupDate || !form.expectedReturnDate) {
      notify.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        pickupType: form.pickupType,
        pickupDate: new Date(form.pickupDate).toISOString(),
        expectedReturnDate: new Date(form.expectedReturnDate).toISOString(),
        rentalUnit: form.rentalUnit,
        rentalDuration: Number(form.rentalDuration) || 1,
        remarks: form.remarks || null,
      };

      const res = await rentalService.create(payload);
      notify.success('Rental order created successfully!');
      router.push(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(res.data.id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Create Rental Order" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <PageLoader label="Loading operational parameters…" />
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Create Rental Order"
      description="Register a new vehicle lease booking"
      backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Orders', href: APP_ROUTES.ADMIN.RENTAL_ORDERS },
        { label: 'Create' },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Select Customer"
              required
              value={form.customerId}
              onChange={(e) => handleChange('customerId', e.target.value)}
              options={[
                { value: '', label: 'Select a customer' },
                ...customers.map(c => ({ value: c.id, label: `${customerName(c)} (${c.email})` }))
              ]}
            />

            <Select
              label="Select Vehicle"
              required
              value={form.vehicleId}
              onChange={(e) => handleChange('vehicleId', e.target.value)}
              options={[
                { value: '', label: 'Select an available vehicle' },
                ...vehicles.map(v => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))
              ]}
            />

            <Select
              label="Pickup Handover Type"
              required
              value={form.pickupType}
              onChange={(e) => handleChange('pickupType', e.target.value)}
              options={[
                { value: 'Store_Pickup', label: 'Store Pickup' },
                { value: 'Home_Delivery', label: 'Home Delivery' }
              ]}
            />

            <Select
              label="Rental Unit"
              required
              value={form.rentalUnit}
              onChange={(e) => handleChange('rentalUnit', e.target.value)}
              options={[
                { value: 'Hour', label: 'Hours' },
                { value: 'Day', label: 'Days' },
                { value: 'Week', label: 'Weeks' },
                { value: 'Month', label: 'Months' }
              ]}
            />

            <Input
              label="Rental Duration"
              required
              type="number"
              min="1"
              value={form.rentalDuration}
              onChange={(e) => handleChange('rentalDuration', e.target.value)}
            />

            <div className="hidden sm:block"></div>

            <Input
              label="Pickup Date & Time"
              required
              type="datetime-local"
              value={form.pickupDate}
              onChange={(e) => handleChange('pickupDate', e.target.value)}
            />

            <Input
              label="Expected Return Date & Time"
              required
              type="datetime-local"
              value={form.expectedReturnDate}
              onChange={(e) => handleChange('expectedReturnDate', e.target.value)}
            />
          </div>

          <Textarea
            label="Booking Remarks & Notes"
            placeholder="Enter any customer request details"
            value={form.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" loading={submitting}>Create Booking</Button>
          </div>
        </form>
      </div>
    </MasterPage>
  );
}
