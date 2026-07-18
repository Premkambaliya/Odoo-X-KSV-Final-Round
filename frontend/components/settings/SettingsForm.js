'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import {
  CURRENCY_OPTIONS,
  SETTINGS_DEFAULTS,
  settingsSchema,
} from '@/lib/validations/settings';

function Section({ title, description, children }) {
  return (
    <section className="surface-card space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SettingsForm({
  defaultValues,
  onSubmit,
  loading = false,
  onReset,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...SETTINGS_DEFAULTS, ...defaultValues },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({ ...SETTINGS_DEFAULTS, ...defaultValues });
    }
  }, [defaultValues, reset]);

  function handleResetClick() {
    reset({ ...SETTINGS_DEFAULTS, ...defaultValues });
    onReset?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Section
        title="Business information"
        description="Company identity shown on quotations and invoices"
      >
        <Input
          label="Company name"
          required
          error={errors.companyName?.message}
          {...register('companyName')}
        />
        <Input
          label="Company email"
          type="email"
          required
          error={errors.companyEmail?.message}
          {...register('companyEmail')}
        />
        <Input
          label="Phone"
          error={errors.companyPhone?.message}
          {...register('companyPhone')}
        />
        <Input
          label="GST number"
          error={errors.gstNumber?.message}
          {...register('gstNumber')}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Address"
            rows={3}
            error={errors.companyAddress?.message}
            {...register('companyAddress')}
          />
        </div>
      </Section>

      <Section
        title="Tax, currency & invoice"
        description="Financial defaults for billing and receipts"
      >
        <Select
          label="Currency"
          required
          options={CURRENCY_OPTIONS}
          error={errors.currency?.message}
          {...register('currency')}
        />
        <Input
          label="Tax percentage"
          type="number"
          step="0.01"
          min="0"
          max="100"
          required
          error={errors.taxPercentage?.message}
          {...register('taxPercentage')}
        />
        <Input
          label="Invoice prefix"
          error={errors.invoicePrefix?.message}
          {...register('invoicePrefix')}
        />
      </Section>

      <Section
        title="Rental policies"
        description="Deposit rules and late-fee configuration"
      >
        <div className="sm:col-span-2">
          <Textarea
            label="Deposit rule"
            rows={3}
            error={errors.depositRule?.message}
            {...register('depositRule')}
          />
        </div>
        <Input
          label="Grace hours"
          type="number"
          min="0"
          error={errors.graceHours?.message}
          {...register('graceHours')}
        />
        <Input
          label="Late fee / hour"
          type="number"
          min="0"
          step="0.01"
          error={errors.lateFeePerHour?.message}
          {...register('lateFeePerHour')}
        />
        <Input
          label="Late fee / day"
          type="number"
          min="0"
          step="0.01"
          error={errors.lateFeePerDay?.message}
          {...register('lateFeePerDay')}
        />
        <Input
          label="Maximum late fee"
          type="number"
          min="0"
          step="0.01"
          error={errors.maximumLateFee?.message}
          {...register('maximumLateFee')}
        />
      </Section>

      <Section
        title="Quotation terms"
        description="Header and footer copy saved on the organization settings record"
      >
        <div className="sm:col-span-2">
          <Textarea
            label="Quotation header"
            rows={3}
            error={errors.quotationHeader?.message}
            {...register('quotationHeader')}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Terms & conditions"
            rows={5}
            hint="Saved as quotation footer"
            error={errors.quotationFooter?.message}
            {...register('quotationFooter')}
          />
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetClick}
          disabled={loading || !isDirty}
        >
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          <Save size={14} />
          Save settings
        </Button>
      </div>
    </form>
  );
}
