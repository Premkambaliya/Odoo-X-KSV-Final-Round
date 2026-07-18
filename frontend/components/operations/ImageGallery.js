'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';

function ImageGallery({ images = [], title = 'Inspection images', emptyHint }) {
  const [active, setActive] = useState(0);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];

  if (!list.length) {
    return (
      <div className="surface-card p-5">
        <h3 className="mb-2 text-base font-semibold text-primary">{title}</h3>
        <EmptyState
          title="No images available"
          description={
            emptyHint ||
            'Pickup and return image uploads are not exposed by the current API. Vehicle gallery images appear here when available.'
          }
          icon={ImageIcon}
        />
      </div>
    );
  }

  const current = list[Math.min(active, list.length - 1)];
  const src = current.url || current.imageUrl || current;

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-base font-semibold text-primary">{title}</h3>
      </div>
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image
          src={src}
          alt={current.alt || `Inspection image ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
          unoptimized
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto p-3">
          {list.map((img, index) => {
            const thumb = img.url || img.imageUrl || img;
            return (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setActive(index)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                  index === active ? 'border-accent' : 'border-transparent'
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default memo(ImageGallery);
