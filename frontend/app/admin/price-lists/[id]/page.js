'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import priceListService from '@/services/priceListService';
import { APP_ROUTES } from '@/constants/routes';
import { formatCurrency, formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PriceListDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await priceListService.getById(id);
        setEntry(result.data);
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
      await priceListService.remove(id);
      notify.success('Price list deleted');
      router.push(APP_ROUTES.ADMIN.PRICE_LISTS);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Price List" backHref={APP_ROUTES.ADMIN.PRICE_LISTS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !entry) {
    return (
      <MasterPage title="Price List" backHref={APP_ROUTES.ADMIN.PRICE_LISTS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  const vehicle = entry.vehicle;

  return (
    <MasterPage
      title={`${entry.pricingType} Pricing`}
      backHref={APP_ROUTES.ADMIN.PRICE_LISTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Price Lists', href: APP_ROUTES.ADMIN.PRICE_LISTS },
        { label: entry.pricingType },
      ]}
      actions={
        <>
          <Link href={APP_ROUTES.ADMIN.PRICE_LIST_EDIT(id)}>
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card space-y-4 p-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Price</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-primary">
              {formatCurrency(entry.price)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Pricing Type
            </p>
            <p className="mt-2 text-sm font-medium text-secondary">{entry.pricingType}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Valid From
              </p>
              <p className="mt-2 text-sm text-secondary">{formatDate(entry.validFrom)}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Valid To
              </p>
              <p className="mt-2 text-sm text-secondary">{formatDate(entry.validTo)}</p>
            </div>
          </div>
        </div>

        <div className="surface-card space-y-3 p-6">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Vehicle</p>
          {vehicle ? (
            <>
              <p className="text-lg font-semibold text-primary">
                {vehicle.brand} {vehicle.model}
              </p>
              <p className="text-sm text-muted">{vehicle.registrationNumber}</p>
              <Link
                href={APP_ROUTES.ADMIN.VEHICLE_DETAIL(vehicle.id)}
                className="inline-block text-sm font-semibold text-accent"
              >
                View vehicle →
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted">Vehicle unavailable</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete price list?"
        description="Remove this pricing entry permanently?"
      />
    </MasterPage>
  );
}
