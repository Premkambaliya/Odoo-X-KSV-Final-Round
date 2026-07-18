'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccessAdmin, canAccessCustomer, getHomeForRole } from '@/lib/auth';
import { ROLES } from '@/constants/roles';
import { APP_ROUTES } from '@/constants/routes';
import PageLoader from '@/components/common/PageLoader';

/**
 * Client-side role gate used inside admin/customer layouts.
 * Middleware handles cookie presence; this enforces role + auth restore.
 */
export default function RoleGuard({ children, allow }) {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(APP_ROUTES.LOGIN);
      return;
    }

    if (allow === ROLES.ADMIN && !canAccessAdmin(role)) {
      router.replace(getHomeForRole(role));
      return;
    }

    if (allow === ROLES.CUSTOMER && !canAccessCustomer(role)) {
      router.replace(getHomeForRole(role));
    }
  }, [loading, isAuthenticated, role, allow, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader label="Verifying session…" />
      </div>
    );
  }

  if (allow === ROLES.ADMIN && !canAccessAdmin(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader label="Redirecting…" />
      </div>
    );
  }

  if (allow === ROLES.CUSTOMER && !canAccessCustomer(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader label="Redirecting…" />
      </div>
    );
  }

  return children;
}
