'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PickupForm from '@/components/operations/PickupForm';
import PageLoader from '@/components/common/PageLoader';
import pickupService from '@/services/pickupService';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function CreatePickupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const presetOrderId = searchParams.get('rentalOrderId') || '';
  const [loading, setLoading] = useState(false);

  const executiveName = useMemo(() => {
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || '';
  }, [user]);

  async function handleSubmit(payload) {
    setLoading(true);
    try {
      const result = await pickupService.create(payload);
      notify.success(result.message || 'Pickup completed — rental is now ACTIVE');
      const id = result.data?.id;
      if (id) router.push(APP_ROUTES.ADMIN.PICKUP_DETAIL(id));
      else router.push(APP_ROUTES.ADMIN.PICKUPS);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PickupForm
      defaultValues={presetOrderId ? { rentalOrderId: presetOrderId } : undefined}
      defaultExecutiveName={executiveName}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function CreatePickupPage() {
  return (
    <MasterPage
      title="Create Pickup"
      description="Inspect the vehicle and hand it over to the customer"
      backHref={APP_ROUTES.ADMIN.PICKUPS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Pickups', href: APP_ROUTES.ADMIN.PICKUPS },
        { label: 'Create' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <CreatePickupContent />
      </Suspense>
    </MasterPage>
  );
}
