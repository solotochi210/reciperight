import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import mediaApi from '../../api/media.api';
import { useToast } from '../ui/Toast';
import { cldUrl } from '../../utils/cloudinary';
import { cn } from '../../utils/cn';

/**
 * Drag-drop / click image uploader. Uploads immediately to /api/media/upload
 * and reports the resulting { url, publicId } via onChange.
 */
export default function ImageUpload({ value, onChange, kind = 'cover', className, compact = false }) {
  const { error } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error('Only JPEG, PNG or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Image must be 5MB or smaller');
      return;
    }
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, kind);
      onChange({ url: res.data.url, publicId: res.data.publicId });
    } catch (err) {
      error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange({ url: '', publicId: '' });
  };

  if (value?.url) {
    return (
      <div className={cn('group relative overflow-hidden rounded-2xl border border-[var(--border)]', compact ? 'h-32 w-32' : 'aspect-[4/3] w-full', className)}>
        <img src={cldUrl(value.url)} alt="Upload preview" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition',
        compact ? 'h-32 w-32 p-3' : 'aspect-[4/3] w-full p-6',
        dragOver ? 'border-accent bg-accent-soft' : 'border-[var(--border)] bg-bg-secondary/50 hover:border-accent',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploading ? (
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      ) : (
        <>
          <UploadCloud className={cn('text-text-tertiary', compact ? 'h-6 w-6' : 'h-9 w-9')} />
          {!compact && (
            <>
              <p className="text-sm font-medium">Drag &amp; drop or click to upload</p>
              <p className="text-xs text-text-tertiary">JPEG, PNG or WebP · max 5MB</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
