'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import { APP_ROUTES } from '@/constants/routes';

const StripePaymentForm = dynamic(
  () => import('@/components/finance/StripePaymentForm'),
  {
    ssr: false,
    loading: () => <PageLoader label="Loading Stripe…" />,
  }
);

function IntentContent() {
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get('orderId');
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('stripe_pi_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSession(parsed);
      }
    } catch {
      setSession(null);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return <PageLoader label="Loading Stripe…" />;
  }

  const clientSecret = session?.clientSecret;
  const orderId = session?.rentalOrderId || orderIdFromQuery;

  if (!clientSecret || !orderId) {
    return (
      <div className="surface-card">
        <ErrorState
          title="Missing Stripe session"
          description="Create a Payment Intent from the payment form to continue."
        />
      </div>
    );
  }

  return (
    <StripePaymentForm clientSecret={clientSecret} rentalOrderId={orderId} />
  );
}

export default function StripeIntentPage() {
  return (
    <MasterPage
      title="Stripe Payment Intent"
      description="Secure card collection via backend-issued client secret"
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Payment Intent' },
      ]}
    >
      <Suspense fallback={<PageLoader label="Loading Stripe…" />}>
        <IntentContent />
      </Suspense>
    </MasterPage>
  );
}
