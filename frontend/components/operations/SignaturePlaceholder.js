'use client';

import { memo } from 'react';
import { PenLine } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';

/** UI-only signature / verification placeholder — backend stores customerVerified boolean. */
function SignaturePlaceholder({ checked, onChange, label = 'Customer verified / signed' }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
        <PenLine size={16} className="text-muted" aria-hidden />
        Customer signature
      </div>
      <div className="mb-3 flex h-20 items-center justify-center rounded-xl border border-border bg-white text-xs text-muted">
        Signature capture is not provided by the API — confirm verification below.
      </div>
      <Checkbox
        label={label}
        checked={Boolean(checked)}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </div>
  );
}

export default memo(SignaturePlaceholder);
