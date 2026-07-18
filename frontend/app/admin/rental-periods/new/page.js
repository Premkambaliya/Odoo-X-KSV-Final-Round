'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import RentalPeriodForm from '@/components/master/RentalPeriodForm';
import rentalPeriodService from '@/services/rentalPeriodService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CreateRentalPeriodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setLoading(true);
    try {
      const result = await rentalPeriodService.create({
        name: values.name,
        days: Number(values.days),
        description: values.description || undefined,
        status: values.status,
      });
      notify.success(result.message || 'Rental period created');
      router.push(APP_ROUTES.ADMIN.RENTAL_PERIODS);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MasterPage
      title="Create Rental Period"
      backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Periods', href: APP_ROUTES.ADMIN.RENTAL_PERIODS },
        { label: 'Create' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <RentalPeriodForm onSubmit={onSubmit} loading={loading} submitLabel="Create Period" />
      </div>
    </MasterPage>
  );
}
