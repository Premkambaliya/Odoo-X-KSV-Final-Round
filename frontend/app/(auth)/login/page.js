'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import PageLoader from '@/components/common/PageLoader';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="surface-card flex min-h-[320px] items-center justify-center p-8">
          <PageLoader label="Loading…" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
