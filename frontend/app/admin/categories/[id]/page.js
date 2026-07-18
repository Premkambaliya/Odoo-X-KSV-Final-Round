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
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await categoryService.getById(id);
        setCategory(result.data);
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
      await categoryService.remove(id);
      notify.success('Category deleted');
      router.push(APP_ROUTES.ADMIN.CATEGORIES);
    } catch (err) {
      notify.error(getErrorMessage(err));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Category Details" backHref={APP_ROUTES.ADMIN.CATEGORIES}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !category) {
    return (
      <MasterPage title="Category Details" backHref={APP_ROUTES.ADMIN.CATEGORIES}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title={category.categoryName}
      description="Category details and linked fleet count"
      backHref={APP_ROUTES.ADMIN.CATEGORIES}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Categories', href: APP_ROUTES.ADMIN.CATEGORIES },
        { label: category.categoryName },
      ]}
      actions={
        <>
          <Link href={APP_ROUTES.ADMIN.CATEGORY_EDIT(id)}>
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
          <div className="grid gap-4 grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Status</p>
              <div className="mt-2">
                <StatusBadge active={Boolean(category.status)} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Vehicle Type</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {category.vehicleType === 'Four_Wheeler' ? 'Four Wheeler' : 'Two Wheeler'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Description</p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {category.description || 'No description provided.'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Created</p>
            <p className="mt-2 text-sm text-secondary">{formatDateTime(category.createdAt)}</p>
          </div>
        </div>
        <div className="surface-card p-6">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Linked Vehicles</p>
          <p className="mt-3 text-4xl font-semibold tabular-nums text-primary">
            {category._count?.vehicles ?? 0}
          </p>
          <p className="mt-2 text-sm text-muted">
            Categories with linked vehicles cannot be deleted — disable them instead.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete category?"
        description={`Delete “${category.categoryName}”? This fails if vehicles are linked.`}
      />
    </MasterPage>
  );
}
