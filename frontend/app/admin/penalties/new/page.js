'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PenaltyForm from '@/components/operations/PenaltyForm';
import PageLoader from '@/components/common/PageLoader';
import penaltyService from '@/services/penaltyService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function CreatePenaltyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetOrderId = searchParams.get('rentalOrderId') || '';
  const [loading, setLoading] = useState(false);

  async function handleSubmit(payload) {
    setLoading(true);
    try {
      const result = await penaltyService.create(payload);
      notify.success(result.message || 'Penalty created');
      const id = result.data?.id;
      if (id) router.push(APP_ROUTES.ADMIN.PENALTY_DETAIL(id));
      else router.push(APP_ROUTES.ADMIN.PENALTIES);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PenaltyForm
      defaultValues={presetOrderId ? { rentalOrderId: presetOrderId } : undefined}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function CreatePenaltyPage() {
  return (
    <MasterPage
      title="Create Penalty"
      description="Apply a charge against a rental order"
      backHref={APP_ROUTES.ADMIN.PENALTIES}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Penalties', href: APP_ROUTES.ADMIN.PENALTIES },
        { label: 'Create' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <CreatePenaltyContent />
      </Suspense>
    </MasterPage>
  );
}
