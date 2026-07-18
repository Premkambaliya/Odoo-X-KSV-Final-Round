'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import VehicleForm from '@/components/master/VehicleForm';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import vehicleService from '@/services/vehicleService';
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [vehicleRes, catsRes] = await Promise.all([
          vehicleService.getVehicleById(id),
          categoryService.getAll(),
        ]);
        setVehicle(vehicleRes.data);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        year: Number(values.year),
        seatCapacity: Number(values.seatCapacity),
        mileage: Number(values.mileage),
        basePrice: Number(values.basePrice),
        securityDeposit: Number(values.securityDeposit),
        variant: values.variant || undefined,
        description: values.description || undefined,
        currentStatus: values.currentStatus || undefined,
      };
      const result = await vehicleService.update(id, payload);
      notify.success(result.message || 'Vehicle updated');
      router.push(APP_ROUTES.ADMIN.VEHICLE_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Vehicle" backHref={APP_ROUTES.ADMIN.VEHICLES}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !vehicle) {
    return (
      <MasterPage title="Edit Vehicle" backHref={APP_ROUTES.ADMIN.VEHICLES}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Edit Vehicle"
      backHref={APP_ROUTES.ADMIN.VEHICLE_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Vehicles', href: APP_ROUTES.ADMIN.VEHICLES },
        { label: `${vehicle.brand} ${vehicle.model}` },
        { label: 'Edit' },
      ]}
    >
      <div className="mx-auto max-w-4xl">
        <VehicleForm
          categories={categories}
          defaultValues={{
            categoryId: vehicle.categoryId,
            brand: vehicle.brand,
            model: vehicle.model,
            variant: vehicle.variant || '',
            registrationNumber: vehicle.registrationNumber,
            vin: vehicle.vin,
            year: vehicle.year,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            color: vehicle.color,
            seatCapacity: vehicle.seatCapacity,
            mileage: Number(vehicle.mileage),
            description: vehicle.description || '',
            basePrice: Number(vehicle.basePrice),
            securityDeposit: Number(vehicle.securityDeposit),
            availabilityStatus: vehicle.availabilityStatus,
            currentStatus: vehicle.currentStatus || '',
          }}
          onSubmit={onSubmit}
          loading={saving}
          submitLabel="Update Vehicle"
        />
      </div>
    </MasterPage>
  );
}
