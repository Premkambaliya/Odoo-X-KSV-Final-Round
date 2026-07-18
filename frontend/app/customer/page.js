'use client';

import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';

export default function CustomerHomePage() {
  return (
    <PageContainer>
      <Header
        title="Overview"
        description="Welcome to your rental workspace. Browse and bookings arrive in later phases."
        breadcrumbs={[{ label: 'Customer' }, { label: 'Overview' }]}
        showSearch={false}
      />

      <div className="surface-card p-8">
        <p className="text-sm leading-relaxed text-muted">
          You are signed in as a customer. Vehicle browsing, rental orders, and
          payments will be available in upcoming modules.
        </p>
      </div>
    </PageContainer>
  );
}
