'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PriceListForm from '@/components/master/PriceListForm';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import priceListService from '@/services/priceListService';
import vehicleService from '@/services/vehicleService';
import { APP_ROUTES } from '@/constants/routes';
import { toIsoDateTime } from '@/lib/listUtils';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditPriceListPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [entryRes, vehiclesRes] = await Promise.all([
          priceListService.getById(id),
          vehicleService.getVehicles({ limit: 100, sortBy: 'brand', order: 'asc' }),
        ]);
        setEntry(entryRes.data);
        setVehicles(vehiclesRes.data?.vehicles || []);
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
        vehicleId: values.vehicleId,
        pricingType: values.pricingType,
        price: Number(values.price),
        validFrom: values.validFrom ? toIsoDateTime(values.validFrom) : null,
        validTo: values.validTo ? toIsoDateTime(values.validTo) : null,
      };
      const result = await priceListService.update(id, payload);
      notify.success(result.message || 'Price list updated');
      router.push(APP_ROUTES.ADMIN.PRICE_LIST_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Price List" backHref={APP_ROUTES.ADMIN.PRICE_LISTS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !entry) {
    return (
      <MasterPage title="Edit Price List" backHref={APP_ROUTES.ADMIN.PRICE_LISTS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Edit Price List"
      backHref={APP_ROUTES.ADMIN.PRICE_LIST_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Price Lists', href: APP_ROUTES.ADMIN.PRICE_LISTS },
        { label: entry.pricingType },
        { label: 'Edit' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <PriceListForm
          vehicles={vehicles}
          defaultValues={{
            vehicleId: entry.vehicleId,
            pricingType: entry.pricingType,
            price: Number(entry.price),
            validFrom: entry.validFrom,
            validTo: entry.validTo,
          }}
          onSubmit={onSubmit}
          loading={saving}
          submitLabel="Update Price List"
        />
      </div>
    </MasterPage>
  );
}
