'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import PaymentSummary from '@/components/finance/PaymentSummary';
import StripeButton from '@/components/finance/StripeButton';
import rentalService from '@/services/rentalService';
import paymentService from '@/services/paymentService';
import { createPaymentSchema } from '@/lib/validations/finance';
import { PAYMENT_METHODS, computeBalanceFromOrder } from '@/lib/finance';
import { customerName, formatCurrency, vehicleLabel } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function PaymentForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = 'Record payment',
  showStripe = true,
}) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPayments, setOrderPayments] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      rentalOrderId: '',
      amount: '',
      paymentMethod: 'CASH',
      transactionId: '',
      paymentGateway: '',
      notes: '',
      ...defaultValues,
    },
  });

  const rentalOrderId = watch('rentalOrderId');

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const result = await rentalService.getRentalOrders({
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          order: 'desc',
        });
        if (!active) return;
        setOrders(result.data?.orders || []);
      } catch (err) {
        notify.error(getErrorMessage(err));
      } finally {
        if (active) setLoadingOrders(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!rentalOrderId) {
      setSelectedOrder(null);
      setOrderPayments([]);
      return;
    }

    let active = true;
    async function loadOrder() {
      try {
        const result = await rentalService.getRentalOrderById(rentalOrderId);
        if (!active) return;
        const order = result.data;
        setSelectedOrder(order);

        let payments = [];
        if (order?.bookingNumber) {
          const payResult = await paymentService.getPayments({
            orderNumber: order.bookingNumber,
            limit: 100,
            page: 1,
          });
          payments = payResult.data?.payments || [];
        }
        if (!active) return;
        setOrderPayments(payments);

        const balance = computeBalanceFromOrder(order, payments);
        if (balance > 0) {
          setValue('amount', balance);
        }
      } catch (err) {
        notify.error(getErrorMessage(err));
      }
    }
    loadOrder();
    return () => {
      active = false;
    };
  }, [rentalOrderId, setValue]);

  const balance = selectedOrder
    ? computeBalanceFromOrder(selectedOrder, orderPayments)
    : 0;
  const paid = selectedOrder
    ? Number(selectedOrder.grandTotal || 0) - balance
    : 0;

  const orderOptions = orders.map((order) => ({
    value: order.id,
    label: `${order.bookingNumber} · ${customerName(order.customer)} · ${formatCurrency(order.grandTotal)}`,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-card space-y-5 p-6 sm:p-8"
        noValidate
      >
        <Controller
          name="rentalOrderId"
          control={control}
          render={({ field }) => (
            <Select
              label="Rental order"
              required
              options={orderOptions}
              placeholder={loadingOrders ? 'Loading rentals…' : 'Select rental'}
              error={errors.rentalOrderId?.message}
              disabled={loadingOrders || Boolean(defaultValues?.rentalOrderId)}
              {...field}
            />
          )}
        />

        {selectedOrder ? (
          <div className="rounded-2xl border border-border bg-slate-50/80 px-4 py-3 text-sm">
            <p className="font-medium text-primary">
              {customerName(selectedOrder.customer)}
            </p>
            <p className="mt-1 text-muted">
              {vehicleLabel(selectedOrder.rentalItems)}
            </p>
            <p className="mt-1 text-xs text-muted">
              Payment status: {selectedOrder.paymentStatus || 'PENDING'}
            </p>
          </div>
        ) : null}

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select
              label="Payment method"
              required
              options={PAYMENT_METHODS}
              error={errors.paymentMethod?.message}
              {...field}
            />
          )}
        />

        <Input
          label="Reference / transaction ID"
          placeholder="Optional reference number"
          error={errors.transactionId?.message}
          {...register('transactionId')}
        />

        <Input
          label="Payment gateway"
          placeholder="e.g. MANUAL, RAZORPAY"
          error={errors.paymentGateway?.message}
          {...register('paymentGateway')}
        />

        <Textarea
          label="Notes"
          placeholder="Internal notes (not sent to backend)"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="submit" loading={loading} disabled={balance <= 0 && Boolean(selectedOrder)}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <aside className="space-y-4">
        <PaymentSummary
          orderTotal={selectedOrder?.grandTotal}
          amountPaid={paid}
          balance={balance}
          paymentStatus={selectedOrder?.paymentStatus}
        />

        {showStripe && selectedOrder && balance > 0 ? (
          <div className="surface-card space-y-3 p-5">
            <h3 className="text-sm font-semibold text-primary">
              Collect with Stripe
            </h3>
            <p className="text-xs text-muted">
              Backend calculates the remaining balance. No amounts are computed
              for Stripe on the client.
            </p>
            <div className="flex flex-col gap-2">
              <StripeButton
                rentalOrderId={selectedOrder.id}
                mode="checkout"
                label="Stripe Checkout"
              />
              <StripeButton
                rentalOrderId={selectedOrder.id}
                mode="intent"
                variant="outline"
                label="Payment Intent"
              />
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
