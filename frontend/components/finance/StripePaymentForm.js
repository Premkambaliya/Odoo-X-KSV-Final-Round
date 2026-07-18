'use client';

import { useEffect, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/dashboard/ErrorState';
import PageLoader from '@/components/common/PageLoader';
import { getStripe } from '@/lib/stripe';
import { APP_ROUTES } from '@/constants/routes';
import notify from '@/lib/toast';

function IntentCheckoutForm({ rentalOrderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const returnUrl = `${window.location.origin}${APP_ROUTES.ADMIN.PAYMENT_STRIPE_SUCCESS}?orderId=${rentalOrderId}`;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      notify.error(confirmError.message || 'Payment failed');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <PaymentElement
        options={{ layout: 'tabs' }}
        onChange={() => setError('')}
      />
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting} disabled={!stripe || !elements} fullWidth>
        Confirm payment
      </Button>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, rentalOrderId }) {
  const [stripe, setStripe] = useState(null);
  const [readyError, setReadyError] = useState('');

  useEffect(() => {
    let active = true;
    getStripe().then((instance) => {
      if (!active) return;
      if (!instance) {
        setReadyError(
          'Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.'
        );
        return;
      }
      setStripe(instance);
    });
    return () => {
      active = false;
    };
  }, []);

  if (readyError) {
    return (
      <div className="surface-card p-6">
        <ErrorState title="Stripe unavailable" description={readyError} />
      </div>
    );
  }

  if (!stripe || !clientSecret) {
    return (
      <div className="surface-card p-6">
        <PageLoader label="Loading Stripe…" />
      </div>
    );
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <h2 className="text-base font-semibold text-primary">Secure card payment</h2>
      <p className="mt-1 text-sm text-muted">
        Amount is calculated by the backend for this rental&apos;s remaining balance.
      </p>
      <div className="mt-6">
        <Elements
          stripe={stripe}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#2563EB',
                borderRadius: '12px',
              },
            },
          }}
        >
          <IntentCheckoutForm rentalOrderId={rentalOrderId} />
        </Elements>
      </div>
    </div>
  );
}
