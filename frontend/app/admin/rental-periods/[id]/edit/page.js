'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import RentalPeriodForm from '@/components/master/RentalPeriodForm';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalPeriodService from '@/services/rentalPeriodService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditRentalPeriodPage() {
  const { id } = useParams();
  const router = useRouter();
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await rentalPeriodService.getById(id);
        setPeriod(result.data);
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
      const result = await rentalPeriodService.update(id, {
        name: values.name,
        days: Number(values.days),
        description: values.description || undefined,
        status: values.status,
      });
      notify.success(result.message || 'Rental period updated');
      router.push(APP_ROUTES.ADMIN.RENTAL_PERIOD_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Rental Period" backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !period) {
    return (
      <MasterPage title="Edit Rental Period" backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Edit Rental Period"
      backHref={APP_ROUTES.ADMIN.RENTAL_PERIOD_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Periods', href: APP_ROUTES.ADMIN.RENTAL_PERIODS },
        { label: period.name },
        { label: 'Edit' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <RentalPeriodForm
          defaultValues={{
            name: period.name,
            days: period.days,
            description: period.description || '',
            status: Boolean(period.status),
          }}
          onSubmit={onSubmit}
          loading={saving}
          submitLabel="Update Period"
        />
      </div>
    </MasterPage>
  );
}
