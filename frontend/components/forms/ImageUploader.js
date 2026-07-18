'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ImageUploader({
  onUpload,
  multiple = true,
  accept = 'image/*',
  maxSizeMb = 5,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const prepareFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      const valid = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          continue;
        }
        if (file.size > maxSizeMb * 1024 * 1024) {
          setError(`Each image must be under ${maxSizeMb}MB`);
          continue;
        }
        valid.push(file);
      }
      if (!valid.length) return;

      setError('');
      setPreviews(
        valid.map((file) => ({
          file,
          url: URL.createObjectURL(file),
          name: file.name,
        }))
      );
    },
    [maxSizeMb]
  );

  async function handleUpload() {
    if (!previews.length || !onUpload) return;
    setUploading(true);
    setProgress(0);
    try {
      for (let i = 0; i < previews.length; i += 1) {
        await onUpload(previews[i].file, {
          isPrimary: i === 0,
          onUploadProgress: (event) => {
            if (!event.total) return;
            const base = (i / previews.length) * 100;
            const chunk = (event.loaded / event.total) * (100 / previews.length);
            setProgress(Math.round(base + chunk));
          },
        });
      }
      setPreviews([]);
      setProgress(100);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  function clearPreviews() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          prepareFiles(e.dataTransfer.files);
        }}
        className={`
          rounded-[1.25rem] border-2 border-dashed px-6 py-10 text-center transition
          ${dragOver ? 'border-accent bg-blue-50/50' : 'border-border bg-slate-50/60'}
          ${disabled ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
          <ImagePlus size={22} />
        </div>
        <p className="text-sm font-medium text-primary">Drag & drop vehicle images</p>
        <p className="mt-1 text-xs text-muted">PNG, JPG up to {maxSizeMb}MB each</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={14} />
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => prepareFiles(e.target.files)}
        />
      </div>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

      {previews.length ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((item) => (
              <div key={item.url} className="relative overflow-hidden rounded-2xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} className="h-28 w-full object-cover" />
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button loading={uploading} onClick={handleUpload}>
              Upload {previews.length} image{previews.length > 1 ? 's' : ''}
            </Button>
            <Button variant="outline" disabled={uploading} onClick={clearPreviews}>
              <X size={14} />
              Clear
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
