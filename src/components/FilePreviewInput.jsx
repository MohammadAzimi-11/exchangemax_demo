import { useEffect, useId, useMemo, useRef } from 'react'
import { FileText, X } from 'lucide-react'
import { resolveAssetUrl } from '../utils/assets.js'

function isPreviewableImage(file) {
  return file instanceof File && file.type.startsWith('image/')
}

function getFileLabel(value) {
  if (value instanceof File) {
    return value.name
  }

  if (typeof value === 'string') {
    return value.split(/[\\/]/).filter(Boolean).at(-1) || value
  }

  return ''
}

export default function FilePreviewInput({
  accept,
  ariaInvalid,
  disabled = false,
  language = 'en',
  name,
  onChange,
  onKeyDown,
  value,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const fileLabel = getFileLabel(value)
  const previewUrl = useMemo(() => {
    if (isPreviewableImage(value)) {
      return URL.createObjectURL(value)
    }

    if (typeof value === 'string' && /\.(apng|avif|gif|jpe?g|png|svg|webp)$/i.test(value)) {
      return resolveAssetUrl(value)
    }

    return ''
  }, [value])

  useEffect(() => () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function clearFile() {
    const currentInput = inputRef.current

    if (currentInput) {
      currentInput.value = ''
    }

    onChange('')
    currentInput?.focus()
  }

  return (
    <div className="grid gap-2">
      <input
        accept={accept}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={(event) => onChange(event.target.files?.[0] || '')}
        onKeyDown={onKeyDown}
        ref={inputRef}
        type="file"
      />
      {fileLabel && (
        <div className="relative flex w-fit items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-1.5 pr-8 text-xs text-[var(--text)]">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {previewUrl ? (
              <img alt="" className="h-full w-full object-cover" src={previewUrl} />
            ) : (
              <FileText aria-hidden="true" className="text-[var(--muted)]" size={24} />
            )}
          </div>
          <span className="max-w-44 truncate">{fileLabel}</span>
          <button
            aria-label={language === 'fa' ? 'پاک کردن فایل' : 'Clear selected file'}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            disabled={disabled}
            onClick={clearFile}
            type="button"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
