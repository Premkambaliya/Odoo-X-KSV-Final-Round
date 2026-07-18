'use client';

import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RecentRentals from '@/components/dashboard/RecentRentals';
import RecentPayments from '@/components/dashboard/RecentPayments';
import VehicleStatusChart from '@/components/dashboard/VehicleStatusChart';
import RevenueAnalytics from '@/components/dashboard/RevenueAnalytics';
import PaymentAnalytics from '@/components/dashboard/PaymentAnalytics';
import RentalTrend from '@/components/dashboard/RentalTrend';
import QuickActions from '@/components/dashboard/QuickActions';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import { useAuth } from '@/hooks/useAuth';
import useDashboardData from '@/hooks/useDashboardData';
import { APP_ROUTES } from '@/constants/routes';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { loading, refreshing, error, data, reload } = useDashboardData();

  if (error && !data) {
    return (
      <PageContainer>
        <Header
          title="Dashboard"
          breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Dashboard' }]}
        />
        <div className="surface-card">
          <ErrorState
            title="Dashboard unavailable"
            description={error}
            onRetry={reload}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Dashboard"
        description={
          refreshing
            ? 'Refreshing live operational data…'
            : 'Live operational intelligence for your rental fleet'
        }
        breadcrumbs={[{ label: 'Admin', href: APP_ROUTES.ADMIN.ROOT }, { label: 'Dashboard' }]}
      />

      {loading && !data ? (
        <div className="py-16">
          <PageLoader label="Loading dashboard…" />
        </div>
      ) : (
        <div className="space-y-6 pb-4">
          {data?.partialFailure ? (
            <div
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning"
              role="status"
            >
              Some dashboard widgets failed to load. Showing available data.{' '}
              <button
                type="button"
                onClick={reload}
                className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Retry
              </button>
            </div>
          ) : null}

          <WelcomeSection user={user} todayOps={data?.todayOps} />

          <StatsGrid
            overview={data?.overview}
            paymentsSummary={data?.paymentsSummary}
            depositCount={data?.depositCount}
            penaltyCount={data?.penaltyCount}
            loading={loading}
          />

          <QuickActions />

          <div className="grid gap-6 xl:grid-cols-2">
            <RevenueAnalytics
              periods={data?.revenuePeriods}
              trend={data?.revenueTrend}
              loading={loading}
            />
            <VehicleStatusChart
              vehicles={data?.overview?.vehicles}
              loading={loading}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <PaymentAnalytics
              methods={data?.paymentMethods}
              loading={loading}
            />
            <RentalTrend trend={data?.rentalTrend} loading={loading} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <RecentRentals rentals={data?.recentRentals} loading={loading} />
            <RecentPayments payments={data?.recentPayments} loading={loading} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ActivityTimeline
              recentRentals={data?.recentRentals}
              recentPayments={data?.recentPayments}
              loading={loading}
            />
            <NotificationsPanel />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
