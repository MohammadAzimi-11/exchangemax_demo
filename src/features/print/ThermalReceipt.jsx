import { ArrowLeft, Printer, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import { text } from '../../lib/i18n.js'
import api from '../../utils/api.js'

function buildAssetUrl(pathname) {
  if (!pathname) {
    return ''
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname
  }

  const baseUrl = api.defaults.baseURL || ''
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  return `${baseUrl}${normalizedPath}`
}

function buildCodeMatrix(value, size = 21) {
  const normalizedValue = String(value || 'RECEIPT')
  const matrix = Array.from({ length: size }, () => Array(size).fill(false))

  const drawFinder = (offsetX, offsetY) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6
        const isCore = x >= 2 && x <= 4 && y >= 2 && y <= 4
        matrix[offsetY + y][offsetX + x] = isBorder || isCore
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(size - 7, 0)
  drawFinder(0, size - 7)

  let seed = 0
  for (const char of normalizedValue) {
    seed = (seed * 131 + char.charCodeAt(0)) % 2147483647
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inTopLeft = x < 7 && y < 7
      const inTopRight = x >= size - 7 && y < 7
      const inBottomLeft = x < 7 && y >= size - 7

      if (inTopLeft || inTopRight || inBottomLeft) {
        continue
      }

      seed = (seed * 1103515245 + 12345 + x + y) % 2147483647
      matrix[y][x] = seed % 3 !== 0
    }
  }

  return matrix
}

function SlipCodeBadge({ value }) {
  const matrix = useMemo(() => buildCodeMatrix(value), [value])
  const cellSize = 4
  const size = matrix.length * cellSize

  return (
    <svg aria-label={String(value || 'receipt-code')} role="img" viewBox={`0 0 ${size} ${size}`}>
      <rect fill="#ffffff" height={size} width={size} x="0" y="0" />
      {matrix.flatMap((row, rowIndex) =>
        row.map((filled, columnIndex) =>
          filled ? (
            <rect
              fill="#111111"
              height={cellSize}
              key={`${rowIndex}-${columnIndex}`}
              width={cellSize}
              x={columnIndex * cellSize}
              y={rowIndex * cellSize}
            />
          ) : null,
        ),
      )}
    </svg>
  )
}

export function PrintState({ error, language, loading }) {
  const fallbackText = text(
    { en: loading ? 'Loading print view...' : 'Record was not found.', fa: loading ? 'در حال بارگذاری صفحه چاپ...' : 'رکورد پیدا نشد.' },
    language,
  )

  return (
    <div className={`thermal-print-state${error ? ' error' : ''}`}>
      <p>{error || fallbackText}</p>
      {error ? (
        <button onClick={() => window.location.reload()} type="button">
          <RefreshCcw size={16} />
          {text({ en: 'Retry', fa: 'تلاش دوباره' }, language)}
        </button>
      ) : null}
    </div>
  )
}

export function ThermalReceipt({ badge, children, code, companyProfile, footerText, language, meta, status, title }) {
  const logoUrl = buildAssetUrl(companyProfile?.logoPath)
  const companyName = companyProfile?.name || companyProfile?.companyName || companyProfile?.legalName || 'Exchange Office'
  const showBadge = badge && badge !== title

  return (
    <div className="thermal-print-page" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="thermal-print-toolbar no-print">
        <button onClick={() => window.history.back()} type="button">
          <ArrowLeft size={16} />
          {text({ en: 'Back', fa: 'بازگشت' }, language)}
        </button>
        <button onClick={() => window.print()} type="button">
          <Printer size={16} />
          {text({ en: 'Print', fa: 'چاپ' }, language)}
        </button>
      </div>

      <article className="thermal-receipt">
        <header className="thermal-receipt-header">
          {logoUrl ? <img alt={companyName} src={logoUrl} /> : null}
          <h1>{companyName}</h1>
          {companyProfile?.phone ? <p>{companyProfile.phone}</p> : null}
          {companyProfile?.address ? <p>{companyProfile.address}</p> : null}
        </header>

        <section className="thermal-receipt-title">
          <strong>{title}</strong>
          {showBadge ? <span>{badge}</span> : null}
        </section>

        <section className="thermal-receipt-code">
          <SlipCodeBadge value={code} />
          <strong>{code}</strong>
          {status ? <span>{status}</span> : null}
        </section>

        {Array.isArray(meta) && meta.length > 0 ? (
          <section className="thermal-receipt-meta">
            {meta.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <span>{item.label}</span>
                <strong>{item.value || '-'}</strong>
              </div>
            ))}
          </section>
        ) : null}

        {children}

        <footer className="thermal-receipt-footer">
          <div>
            <span>{text({ en: 'Customer signature', fa: 'امضای مشتری' }, language)}</span>
          </div>
          {footerText ? <p>{footerText}</p> : null}
        </footer>
      </article>
    </div>
  )
}

export function ThermalSection({ rows, title }) {
  const visibleRows = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')

  if (visibleRows.length === 0) {
    return null
  }

  return (
    <section className="thermal-section">
      <h2>{title}</h2>
      <dl>
        {visibleRows.map((row, index) => (
          <div key={`${row.label}-${index}`}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
