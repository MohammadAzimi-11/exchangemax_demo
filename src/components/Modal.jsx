import { X } from 'lucide-react'
import { useEffect } from 'react'
import { text } from '../lib/i18n.js'
import { cn } from '../utils/utils.js'

export default function Modal({
  actions,
  children,
  className = '',
  description,
  language = 'en',
  onClose,
  open,
  title,
}) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label={text({ en: 'Close modal', fa: 'بستن پنجره' }, language)}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        className={cn(
          'relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold leading-7">{text(title, language)}</h2>
            {description && <p className="mt-1 text-sm leading-6 text-slate-600">{text(description, language)}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              aria-label={text({ en: 'Close', fa: 'بستن' }, language)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              onClick={onClose}
              type="button"
            >
              <X size={17} />
            </button>
          </div>
        </header>
        <div className="max-h-[calc(90vh-82px)] overflow-y-auto px-5 py-4">{children}</div>
      </section>
    </div>
  )
}
