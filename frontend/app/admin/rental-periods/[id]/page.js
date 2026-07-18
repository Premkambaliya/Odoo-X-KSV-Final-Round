'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import StatusBadge from '@/components/master/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalPeriodService from '@/services/rentalPeriodService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function RentalPeriodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await rentalPeriodService.getById(id);
        setPeriod(result.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await rentalPeriodService.remove(id);
      notify.success('Rental period deleted');
      router.push(APP_ROUTES.ADMIN.RENTAL_PERIODS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Rental Period" backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !period) {
    return (
      <MasterPage title="Rental Period" backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title={period.name}
      backHref={APP_ROUTES.ADMIN.RENTAL_PERIODS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Periods', href: APP_ROUTES.ADMIN.RENTAL_PERIODS },
        { label: period.name },
      ]}
      actions={
        <>
          <Link href={APP_ROUTES.ADMIN.RENTAL_PERIOD_EDIT(id)}>
            <Button size="sm" variant="outline">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </>
      }
    >
      <div className="surface-card grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Days</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-primary">{period.days}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Status</p>
          <div className="mt-2">
            <StatusBadge active={Boolean(period.status)} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Description</p>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            {period.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete rental period?"
        description={`Delete “${period.name}”?`}
      />
    </MasterPage>
  );
}
