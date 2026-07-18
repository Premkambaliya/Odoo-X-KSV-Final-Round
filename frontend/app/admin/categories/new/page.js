'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import CategoryForm from '@/components/master/CategoryForm';
import categoryService from '@/services/categoryService';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values) {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        status: values.status,
      };
      const result = await categoryService.create(payload);
      notify.success(result.message || 'Category created');
      router.push(APP_ROUTES.ADMIN.CATEGORIES);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MasterPage
      title="Create Category"
      description="Add a new vehicle category"
      backHref={APP_ROUTES.ADMIN.CATEGORIES}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Categories', href: APP_ROUTES.ADMIN.CATEGORIES },
        { label: 'Create' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <CategoryForm onSubmit={onSubmit} loading={loading} submitLabel="Create Category" />
      </div>
    </MasterPage>
  );
}
