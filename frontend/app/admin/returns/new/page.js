'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import ReturnForm from '@/components/operations/ReturnForm';
import PageLoader from '@/components/common/PageLoader';
import returnService from '@/services/returnService';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function CreateReturnContent() {
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
      const result = await returnService.create(payload);
      notify.success(result.message || 'Return completed — rental is COMPLETED');
      const id = result.data?.id;
      if (id) router.push(APP_ROUTES.ADMIN.RETURN_DETAIL(id));
      else router.push(APP_ROUTES.ADMIN.RETURNS);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ReturnForm
      defaultValues={presetOrderId ? { rentalOrderId: presetOrderId } : undefined}
      defaultExecutiveName={executiveName}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function CreateReturnPage() {
  return (
    <MasterPage
      title="Create Return"
      description="Inspect the vehicle on return and close the rental"
      backHref={APP_ROUTES.ADMIN.RETURNS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Returns', href: APP_ROUTES.ADMIN.RETURNS },
        { label: 'Create' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <CreateReturnContent />
      </Suspense>
    </MasterPage>
  );
}
