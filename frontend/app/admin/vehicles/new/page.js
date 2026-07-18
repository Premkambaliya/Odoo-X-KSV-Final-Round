'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import VehicleForm from '@/components/master/VehicleForm';
import PageLoader from '@/components/common/PageLoader';
import vehicleService from '@/services/vehicleService';
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CreateVehiclePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data.filter((c) => c.status !== false) : []))
      .catch((err) => notify.error(getErrorMessage(err)))
      .finally(() => setLoadingCats(false));
  }, []);

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
      const result = await vehicleService.create(payload);
      notify.success(result.message || 'Vehicle created');
      const id = result.data?.id;
      router.push(id ? APP_ROUTES.ADMIN.VEHICLE_DETAIL(id) : APP_ROUTES.ADMIN.VEHICLES);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <MasterPage
      title="Create Vehicle"
      description="Register a new unit in the fleet"
      backHref={APP_ROUTES.ADMIN.VEHICLES}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Vehicles', href: APP_ROUTES.ADMIN.VEHICLES },
        { label: 'Create' },
      ]}
    >
      {loadingCats ? (
        <PageLoader label="Loading categories…" />
      ) : (
        <div className="mx-auto max-w-4xl">
          <VehicleForm
            categories={categories}
            onSubmit={onSubmit}
            loading={saving}
            submitLabel="Create Vehicle"
          />
        </div>
      )}
    </MasterPage>
  );
}
