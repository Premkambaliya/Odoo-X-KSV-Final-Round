'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import PriceListForm from '@/components/master/PriceListForm';
import PageLoader from '@/components/common/PageLoader';
import priceListService from '@/services/priceListService';
import vehicleService from '@/services/vehicleService';
import { APP_ROUTES } from '@/constants/routes';
import { toIsoDateTime } from '@/lib/listUtils';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function CreatePriceListPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vehicleService
      .getVehicles({ limit: 100, sortBy: 'brand', order: 'asc' })
      .then((res) => setVehicles(res.data?.vehicles || []))
      .catch((err) => notify.error(getErrorMessage(err)))
      .finally(() => setLoadingVehicles(false));
  }, []);

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
      const result = await priceListService.create(payload);
      notify.success(result.message || 'Price list created');
      router.push(APP_ROUTES.ADMIN.PRICE_LISTS);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <MasterPage
      title="Create Price List"
      backHref={APP_ROUTES.ADMIN.PRICE_LISTS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Price Lists', href: APP_ROUTES.ADMIN.PRICE_LISTS },
        { label: 'Create' },
      ]}
    >
      {loadingVehicles ? (
        <PageLoader label="Loading vehicles…" />
      ) : (
        <div className="mx-auto max-w-2xl">
          <PriceListForm
            vehicles={vehicles}
            onSubmit={onSubmit}
            loading={saving}
            submitLabel="Create Price List"
          />
        </div>
      )}
    </MasterPage>
  );
}
