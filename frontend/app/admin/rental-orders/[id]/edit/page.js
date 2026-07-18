'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MasterPage from '@/components/master/MasterPage';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { toDateInputValue, toIsoDateTime } from '@/lib/listUtils';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function EditRentalOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pickupDate: '',
    expectedReturnDate: '',
    remarks: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const orderRes = await rentalService.getRentalOrderById(id);
      const data = orderRes.data;
      if (data.orderStatus !== 'Pending') {
        notify.warning('Only pending rentals can be edited');
        router.replace(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id));
        return;
      }
      setOrder(data);
      setForm({
        pickupDate: toDateInputValue(data.pickupDate),
        expectedReturnDate: toDateInputValue(data.expectedReturnDate),
        remarks: data.remarks || '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await rentalService.update(id, {
        pickupDate: toIsoDateTime(form.pickupDate),
        expectedReturnDate: toIsoDateTime(form.expectedReturnDate),
        remarks: form.remarks || undefined,
      });
      notify.success('Rental updated');
      router.push(APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id));
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Edit Rental Order" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !order) {
    return (
      <MasterPage title="Edit Rental Order" backHref={APP_ROUTES.ADMIN.RENTAL_ORDERS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  return (
    <MasterPage
      title="Edit Rental Order"
      backHref={APP_ROUTES.ADMIN.RENTAL_ORDER_DETAIL(id)}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Rental Orders', href: APP_ROUTES.ADMIN.RENTAL_ORDERS },
        { label: order.orderNumber },
        { label: 'Edit' },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSave} className="surface-card p-6 sm:p-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Pickup Date & Time"
              required
              type="datetime-local"
              value={form.pickupDate}
              onChange={(e) => setForm((p) => ({ ...p, pickupDate: e.target.value }))}
            />

            <Input
              label="Expected Return Date & Time"
              required
              type="datetime-local"
              value={form.expectedReturnDate}
              onChange={(e) => setForm((p) => ({ ...p, expectedReturnDate: e.target.value }))}
            />
          </div>

          <Textarea
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </MasterPage>
  );
}
