'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import DepositForm from '@/components/finance/DepositForm';
import PageLoader from '@/components/common/PageLoader';
import securityDepositService from '@/services/securityDepositService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function CreateDepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetOrderId = searchParams.get('rentalOrderId') || '';
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setLoading(true);
    try {
      const payload = {
        rentalOrderId: values.rentalOrderId,
        amountCollected: Number(values.amountCollected),
      };
      if (values.reason) payload.reason = values.reason;

      const result = await securityDepositService.create(payload);
      notify.success(result.message || 'Deposit collected');
      const id = result.data?.id;
      if (id) router.push(APP_ROUTES.ADMIN.SECURITY_DEPOSIT_DETAIL(id));
      else router.push(APP_ROUTES.ADMIN.SECURITY_DEPOSITS);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DepositForm
      defaultValues={presetOrderId ? { rentalOrderId: presetOrderId } : undefined}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function CreateDepositPage() {
  return (
    <MasterPage
      title="Collect Security Deposit"
      description="Record deposit collection against a rental order"
      backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Security Deposits', href: APP_ROUTES.ADMIN.SECURITY_DEPOSITS },
        { label: 'Collect' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <CreateDepositContent />
      </Suspense>
    </MasterPage>
  );
}
