'use client';

import { memo, useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import PaymentStatusBadge from '@/components/finance/PaymentStatusBadge';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import {
  customerName,
  formatCurrency,
  formatDateTime,
  vehicleLabel,
} from '@/lib/format';

function ReceiptCard({ payment, order, onPrint, onDownload }) {
  const printRef = useRef(null);
  if (!payment) return null;

  const rental = order || payment.rentalOrder;
  const receiptNumber = `RCP-${(payment.id || '').slice(0, 8).toUpperCase()}`;
  const subtotal = Number(rental?.subtotal ?? payment.amount ?? 0);
  const tax = Number(rental?.taxAmount ?? 0);
  const grandTotal = Number(rental?.grandTotal ?? payment.amount ?? 0);

  function handlePrint() {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} />
          Print
        </Button>
        {onDownload ? (
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download size={14} />
            Download
          </Button>
        ) : null}
      </div>

      <article
        ref={printRef}
        className="surface-card mx-auto max-w-2xl overflow-hidden print:shadow-none"
        aria-label="Payment receipt"
      >
        <div className="border-b border-border bg-gradient-to-br from-primary to-secondary px-6 py-8 text-white sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Logo inverted className="mb-4" />
              <p className="text-sm text-white/70">Payment receipt</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {receiptNumber}
              </h1>
            </div>
            <PaymentStatusBadge status={payment.paymentStatus} />
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <section>
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
              Billed to
            </h2>
            <p className="mt-2 text-sm font-semibold text-primary">
              {customerName(rental?.customer)}
            </p>
            <p className="mt-1 text-xs text-muted">{rental?.customer?.email}</p>
            <p className="mt-1 text-xs text-muted">{rental?.customer?.phone}</p>
          </section>
          <section className="sm:text-right">
            <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
              Transaction
            </h2>
            <p className="mt-2 text-sm text-primary">
              {formatDateTime(payment.paidAt || payment.createdAt)}
            </p>
            <p className="mt-1 text-xs text-muted">
              TXN: {payment.transactionId || payment.id}
            </p>
            <p className="mt-1 text-xs text-muted">
              Method: {payment.paymentMethod}
              {payment.paymentGateway ? ` · ${payment.paymentGateway}` : ''}
            </p>
          </section>
        </div>

        <div className="border-y border-border px-6 py-5 sm:px-8">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            Rental
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-primary">
                {rental?.bookingNumber || '—'}
              </p>
              <p className="text-sm text-muted">
                {vehicleLabel(rental?.rentalItems)}
              </p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-primary">
              {formatCurrency(payment.amount)}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8">
          <dl className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums text-primary">
                {formatCurrency(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Taxes</dt>
              <dd className="tabular-nums text-primary">{formatCurrency(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt className="text-primary">Grand total</dt>
              <dd className="tabular-nums text-accent">
                {formatCurrency(grandTotal)}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">This payment</dt>
              <dd className="font-semibold tabular-nums text-primary">
                {formatCurrency(payment.amount)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-border bg-slate-50 px-6 py-4 text-center text-xs text-muted sm:px-8">
          Thank you for choosing DriveEase. This receipt was generated from
          verified payment records.
        </div>
      </article>
    </div>
  );
}

export default memo(ReceiptCard);
