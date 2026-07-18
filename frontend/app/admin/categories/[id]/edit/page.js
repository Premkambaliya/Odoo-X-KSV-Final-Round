'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import CategoryForm from '@/components/master/CategoryForm';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  async function onSubmit(values) {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        status: values.status,
      };
      const result = await categoryService.update(id, payload);
      notify.success(result.message || 'Category updated');
      router.push(APP_ROUTES.ADMIN.CATEGORY_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Category" backHref={APP_ROUTES.ADMIN.CATEGORIES}>
        <PageLoader label="Loading category…" />
      </MasterPage>
    );
  }

  if (error || !category) {
    return (
      <MasterPage title="Edit Category" backHref={APP_ROUTES.ADMIN.CATEGORIES}>
        <div className="surface-card">
          <ErrorState description={error || 'Category not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Edit Category"
      backHref={APP_ROUTES.ADMIN.CATEGORY_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Categories', href: APP_ROUTES.ADMIN.CATEGORIES },
        { label: category.name },
        { label: 'Edit' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <CategoryForm
          defaultValues={{
            name: category.name,
            description: category.description || '',
            status: Boolean(category.status),
          }}
          onSubmit={onSubmit}
          loading={saving}
          submitLabel="Update Category"
        />
      </div>
    </MasterPage>
  );
}
