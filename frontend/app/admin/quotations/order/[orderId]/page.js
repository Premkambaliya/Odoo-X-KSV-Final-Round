'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';
import MasterPage from '@/components/master/MasterPage';
import StatusBadge from '@/components/dashboard/StatusBadge';
import PricingCard from '@/components/rental/PricingCard';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/dashboard/ErrorState';
import quotationService from '@/services/quotationService';
import rentalService from '@/services/rentalService';
import { APP_ROUTES } from '@/constants/routes';
import { customerName, formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

function parseNotes(notes) {
  if (!notes) return {};
  try {
    return JSON.parse(notes);
  } catch {
    return { terms: notes };
  }
}

export default function QuotationByOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const orderRes = await rentalService.getRentalOrderById(orderId);
        setOrder(orderRes.data);
        try {
          const qRes = await quotationService.getByOrderId(orderId);
          setQuotation(qRes.data);
        } catch {
          setQuotation(null);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await quotationService.generate(orderId);
      notify.success(result.message || 'Quotation generated');
      const qid = result.data?.quotation?.id;
      if (qid) router.replace(APP_ROUTES.ADMIN.QUOTATION_DETAIL(qid));
      else {
        const qRes = await quotationService.getByOrderId(orderId);
        setQuotation(qRes.data);
      }
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <MasterPage title="Quotation" backHref={APP_ROUTES.ADMIN.QUOTATIONS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !order) {
    return (
      <MasterPage title="Quotation" backHref={APP_ROUTES.ADMIN.QUOTATIONS}>
        <div className="surface-card">
          <ErrorState description={error || 'Rental not found'} />
        </div>
      </MasterPage>
    );
  }

  if (!quotation) {
    return (
      <MasterPage
        title={`Quotation · ${order.bookingNumber}`}
        backHref={APP_ROUTES.ADMIN.QUOTATIONS}
        breadcrumbs={[
          { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
          { label: 'Quotations', href: APP_ROUTES.ADMIN.QUOTATIONS },
          { label: order.bookingNumber },
        ]}
        actions={
          <Button size="sm" loading={generating} onClick={handleGenerate}>
            Generate Quotation
          </Button>
        }
      >
        <div className="surface-card p-8 text-center">
          <p className="text-sm text-muted">
            No quotation exists for this rental yet. Generate one to create a printable
            document from the booking totals.
          </p>
          <Button className="mt-5" loading={generating} onClick={handleGenerate}>
            Generate Quotation
          </Button>
        </div>
      </MasterPage>
    );
  }

  const meta = parseNotes(quotation.notes);

  return (
    <MasterPage
      title={quotation.quotationNumber}
      backHref={APP_ROUTES.ADMIN.QUOTATIONS}
      breadcrumbs={[
        { label: 'Admin', href: APP_ROUTES.ADMIN.ROOT },
        { label: 'Quotations', href: APP_ROUTES.ADMIN.QUOTATIONS },
        { label: quotation.quotationNumber },
      ]}
      actions={
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer size={14} />
          Print
        </Button>
      }
    >
      <div className="surface-card mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Quotation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">
              {quotation.quotationNumber}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Booking {meta.bookingNumber || order.bookingNumber} · Expires{' '}
              {formatDate(quotation.expiryDate)}
            </p>
          </div>
          <StatusBadge status={quotation.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Customer
            </p>
            <p className="mt-1 font-medium text-primary">{customerName(order.customer)}</p>
            <p className="text-sm text-secondary">{order.customer?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Schedule
            </p>
            <p className="mt-1 text-sm text-secondary">
              {formatDateTime(order.pickupDate)} → {formatDateTime(order.expectedReturnDate)}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border rounded-2xl border border-border">
          {(order.rentalItems || []).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span>
                {item.vehicle?.brand} {item.vehicle?.model}
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(item.subtotal ?? item.unitPrice)}
              </span>
            </li>
          ))}
        </ul>

        <PricingCard
          subtotal={quotation.subtotal}
          tax={quotation.tax}
          discount={quotation.discount}
          deposit={0}
          grandTotal={quotation.grandTotal}
        />
      </div>
    </MasterPage>
  );
}
