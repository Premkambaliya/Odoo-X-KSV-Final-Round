'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MasterPage from '@/components/master/MasterPage';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import { APP_ROUTES } from '@/constants/routes';

function StripeCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card mx-auto max-w-lg px-6 py-10 text-center"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
        <XCircle size={28} aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-primary">
        Checkout cancelled
      </h2>
      <p className="mt-2 text-sm text-muted">
        No charge was completed. You can retry Stripe checkout or record a
        manual payment instead.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {orderId ? (
          <Link
            href={`${APP_ROUTES.ADMIN.PAYMENT_NEW}?rentalOrderId=${orderId}`}
          >
            <Button size="sm">Try again</Button>
          </Link>
        ) : null}
        <Link href={APP_ROUTES.ADMIN.PAYMENTS}>
          <Button variant="outline" size="sm">
            Back to payments
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function StripeCancelPage() {
  return (
    <MasterPage
      title="Stripe Cancelled"
      backHref={APP_ROUTES.ADMIN.PAYMENTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Payments', href: APP_ROUTES.ADMIN.PAYMENTS },
        { label: 'Cancelled' },
      ]}
    >
      <Suspense fallback={<PageLoader />}>
        <StripeCancelContent />
      </Suspense>
    </MasterPage>
  );
}
