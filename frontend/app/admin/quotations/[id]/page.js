'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

function parseNotes(notes) {
  if (!notes) return {};
  try {
    return JSON.parse(notes);
  } catch {
    return { terms: notes };
  }
}

export default function QuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await quotationService.getById(id);
        const q = result.data;
        setQuotation(q);
        const meta = parseNotes(q.notes);
        if (meta.rentalOrderId) {
          try {
            const orderRes = await rentalService.getRentalOrderById(meta.rentalOrderId);
            setOrder(orderRes.data);
          } catch {
            setOrder(null);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <MasterPage title="Quotation" backHref={APP_ROUTES.ADMIN.QUOTATIONS}>
        <PageLoader />
      </MasterPage>
    );
  }

  if (error || !quotation) {
    return (
      <MasterPage title="Quotation" backHref={APP_ROUTES.ADMIN.QUOTATIONS}>
        <div className="surface-card">
          <ErrorState description={error || 'Not found'} />
        </div>
      </MasterPage>
    );
  }

  const meta = parseNotes(quotation.notes);

  return (
    <MasterPage
      title={quotation.quotationNumber}
      description="Printable quotation document"
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
      <div className="surface-card print:shadow-none mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Quotation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">
              {quotation.quotationNumber}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Expires {formatDate(quotation.expiryDate)}
            </p>
          </div>
          <StatusBadge status={quotation.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Customer
            </p>
            <p className="mt-1 font-medium text-primary">
              {customerName(quotation.customer)}
            </p>
            <p className="text-sm text-secondary">{quotation.customer?.email}</p>
            <p className="text-sm text-secondary">{quotation.customer?.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Booking reference
            </p>
            <p className="mt-1 font-medium text-primary">
              {meta.bookingNumber || order?.bookingNumber || '—'}
            </p>
            <p className="text-sm text-secondary">
              Issued {formatDateTime(quotation.createdAt)}
            </p>
          </div>
        </div>

        {order?.rentalItems?.length ? (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Vehicles
            </p>
            <ul className="mt-2 divide-y divide-border rounded-2xl border border-border">
              {order.rentalItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span>
                    {item.vehicle?.brand} {item.vehicle?.model}
                    <span className="ml-2 text-muted">
                      {item.vehicle?.registrationNumber}
                    </span>
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(item.subtotal ?? item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <PricingCard
          subtotal={quotation.subtotal}
          tax={quotation.tax}
          discount={quotation.discount}
          deposit={0}
          grandTotal={quotation.grandTotal}
        />

        {meta.terms ? (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Terms</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-secondary">
              {meta.terms}
            </p>
          </div>
        ) : null}
      </div>
    </MasterPage>
  );
}
