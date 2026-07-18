'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import vehicleImageService from '@/services/vehicleImageService';
import { getErrorMessage } from '@/lib/apiResponse';
import notify from '@/lib/toast';

export default function VehicleImageGallery({ vehicleId, images = [], onChanged }) {
  const [lightbox, setLightbox] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handlePrimary(imageId) {
    setBusy(true);
    try {
      await vehicleImageService.setPrimary(imageId);
      notify.success('Primary image updated');
      onChanged?.();
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await vehicleImageService.remove(deleting.id);
      notify.success('Image deleted');
      setDeleting(null);
      onChanged?.();
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!images.length) {
    return (
      <EmptyState
        title="No images yet"
        description="Upload photos to showcase this vehicle in the fleet gallery."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <motion.div
            key={image.id}
            layout
            className="group relative overflow-hidden rounded-2xl border border-border bg-slate-50"
          >
            <button
              type="button"
              className="block w-full"
              onClick={() => setLightbox(image)}
              aria-label="Open image lightbox"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt="Vehicle"
                className="h-36 w-full object-cover transition group-hover:scale-[1.03]"
              />
            </button>
            {image.isPrimary ? (
              <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                Primary
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
              {!image.isPrimary ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 flex-1 px-2 text-xs"
                  disabled={busy}
                  onClick={() => handlePrimary(image.id)}
                >
                  <Star size={12} />
                  Primary
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="danger"
                className="h-8 px-2"
                disabled={busy}
                onClick={() => setDeleting(image)}
                aria-label="Delete image"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-primary/80 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt="Vehicle large preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete image?"
        description="This will remove the image from Cloudinary and the vehicle gallery."
      />
    </>
  );
}
