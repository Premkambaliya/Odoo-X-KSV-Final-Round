'use client';

import { RotateCcw } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function FilterPanel({
  filters = [],
  values = {},
  onChange,
  onReset,
  className = '',
}) {
  return (
    <div className={`surface-card p-4 ${className}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filters.map((filter) => {
          if (filter.type === 'select') {
            return (
              <Select
                key={filter.key}
                label={filter.label}
                options={filter.options || []}
                value={values[filter.key] ?? ''}
                onChange={(e) => onChange?.(filter.key, e.target.value)}
                placeholder={filter.placeholder || 'All'}
              />
            );
          }

          return (
            <Input
              key={filter.key}
              label={filter.label}
              type={filter.type || 'text'}
              value={values[filter.key] ?? ''}
              onChange={(e) => onChange?.(filter.key, e.target.value)}
              placeholder={filter.placeholder}
            />
          );
        })}
      </div>

      {onReset ? (
        <div className="mt-3 flex justify-end border-t border-border/70 pt-3">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw size={14} />
            Reset Filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
