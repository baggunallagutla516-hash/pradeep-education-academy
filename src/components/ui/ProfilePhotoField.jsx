import { useEffect, useId, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ProfileAvatar } from './ProfileAvatar';
import { Button } from './Button';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Upload / take-photo control for student profile images.
 * Pass `required` on registration; existing users can update anytime.
 */
export function ProfilePhotoField({
  value,
  onChange,
  existingUrl = '',
  name = '',
  required = false,
  error = '',
  label = 'Upload recent photo / Take photo',
  hint = 'JPEG, PNG, WebP, or GIF · max 5 MB',
  className,
}) {
  const inputId = useId();
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!value) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function applyFile(file) {
    setLocalError('');
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) {
      setLocalError('Only JPEG, PNG, WebP, or GIF images are allowed.');
      onChange?.(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('Photo must be 5 MB or smaller.');
      onChange?.(null);
      return;
    }
    onChange?.(file);
  }

  function handleInputChange(event) {
    applyFile(event.target.files?.[0] || null);
    event.target.value = '';
  }

  function clearPhoto() {
    setLocalError('');
    onChange?.(null);
  }

  const displaySrc = previewUrl || existingUrl || '';
  const showError = error || localError;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-semibold text-ink-900">
        {label}
        {required ? <span className="text-ember-600"> *</span> : null}
      </p>

      <div className="flex flex-col gap-4 rounded-2xl border border-ink-900/10 bg-sand-50/70 p-4 sm:flex-row sm:items-center">
        <ProfileAvatar src={displaySrc} name={name} size="lg" />

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-ink-900/55">{hint}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => galleryRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Upload photo
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              Take photo
            </Button>
            {value ? (
              <Button type="button" variant="danger" size="sm" onClick={clearPhoto}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
          {value ? (
            <p className="truncate text-xs font-medium text-ink-900/65">{value.name}</p>
          ) : existingUrl && !required ? (
            <p className="text-xs text-ink-900/50">Current photo is saved. Choose a new one to replace it.</p>
          ) : null}
        </div>
      </div>

      <input
        id={inputId}
        ref={galleryRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={handleInputChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={handleInputChange}
      />

      {showError ? <p className="text-sm font-medium text-red-600">{showError}</p> : null}
    </div>
  );
}
