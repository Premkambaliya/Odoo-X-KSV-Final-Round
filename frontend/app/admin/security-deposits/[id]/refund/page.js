'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import RefundDepositForm from '@/components/finance/RefundDepositForm';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import securityDepositService from '@/services/securityDepositService';
import { APP_ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function RefundDepositPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await securityDepositService.getById(id);
      setDeposit(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(values) {
    setSaving(true);
    try {
      const payload = {
        amountToRefund: Number(values.amountToRefund),
      };
      if (values.damageCost !== '' && values.damageCost != null) {
        payload.damageCost = Number(values.damageCost);
      }
      if (values.reason) payload.reason = values.reason;

      const result = await securityDepositService.refund(id, payload);
      notify.success(result.message || 'Deposit refund processed');
      router.push(APP_ROUTES.ADMIN.SECURITY_DEPOSIT_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage
        title="Refund Deposit"
        backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      >
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !deposit) {
    return (
      <MasterPage
        title="Refund Deposit"
        backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSITS}
      >
        <div className="surface-card">
          <ErrorState description={error || 'Deposit not found'} onRetry={load} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Refund Security Deposit"
      description={`Collected ${formatCurrency(deposit.amountCollected)}`}
      backHref={APP_ROUTES.ADMIN.SECURITY_DEPOSIT_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Security Deposits', href: APP_ROUTES.ADMIN.SECURITY_DEPOSITS },
        { label: 'Refund' },
      ]}
    >
      <div className="mb-4">
        <PaymentStatusBadge status={deposit.refundStatus} />
      </div>
      <div className="mx-auto max-w-lg">
        <RefundDepositForm
          deposit={deposit}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </MasterPage>
  );
}
