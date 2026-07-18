'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PaymentForm from '@/components/finance/PaymentForm';
import PageLoader from '@/components/common/PageLoader';
import paymentService from '@/services/paymentService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function CreatePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetOrderId = searchParams.get('rentalOrderId') || '';
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setLoading(true);
    try {
      const payload = {
        rentalOrderId: values.rentalOrderId,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
      };
      if (values.transactionId) payload.transactionId = values.transactionId;
      if (values.paymentGateway) payload.paymentGateway = values.paymentGateway;

      const result = await paymentService.create(payload);
      notify.success(result.message || 'Payment recorded');
      const paymentId = result.data?.payment?.id;
      if (paymentId) {
        router.push(APP_ROUTES.ADMIN.PAYMENT_DETAIL(paymentId));
      } else {
        router.push(APP_ROUTES.ADMIN.PAYMENTS);
      }
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaymentForm
      defaultValues={presetOrderId ? { rentalOrderId: presetOrderId } : undefined}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default function CreatePaymentPage() {
  return (
    <MasterPage
      title="Create Payment"
      description="Record a manual payment or launch Stripe checkout"
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Create' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <CreatePaymentContent />
      </Suspense>
    </MasterPage>
  );
}
