'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import stripeService from '@/services/stripeService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function StripeButton({
  rentalOrderId,
  mode = 'checkout',
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onIntentCreated,
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!rentalOrderId) {
      notify.error('Select a rental order first');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'intent') {
        const result = await stripeService.createPaymentIntent(rentalOrderId);
        const clientSecret = result.data?.clientSecret;
        const paymentIntentId = result.data?.paymentIntentId;
        if (!clientSecret) {
          throw new Error('Stripe did not return a client secret');
        }
        if (onIntentCreated) {
          onIntentCreated({ clientSecret, paymentIntentId, rentalOrderId });
        } else {
          try {
            sessionStorage.setItem(
              'stripe_pi_session',
              JSON.stringify({ clientSecret, rentalOrderId, paymentIntentId })
            );
          } catch {
            // sessionStorage may be unavailable; fall through with query is avoided
          }
          window.location.href = `${APP_ROUTES.ADMIN.PAYMENT_STRIPE_INTENT}?orderId=${rentalOrderId}`;
        }
        return;
      }

      const origin = window.location.origin;
      const successUrl = `${origin}${APP_ROUTES.ADMIN.PAYMENT_STRIPE_SUCCESS}?orderId=${rentalOrderId}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}${APP_ROUTES.ADMIN.PAYMENT_STRIPE_CANCEL}?orderId=${rentalOrderId}`;

      const result = await stripeService.createCheckoutSession(rentalOrderId, {
        successUrl,
        cancelUrl,
      });

      const url = result.data?.url;
      if (!url) throw new Error('Stripe did not return a checkout URL');
      window.location.href = url;
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || !rentalOrderId}
      className={className}
      onClick={handleClick}
      aria-label={label || 'Pay with Stripe'}
    >
      <CreditCard size={16} />
      {label || (mode === 'intent' ? 'Pay with Card' : 'Stripe Checkout')}
    </Button>
  );
}
