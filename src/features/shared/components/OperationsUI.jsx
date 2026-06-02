import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import FilePreviewInput from '../../../components/FilePreviewInput.jsx'
import SearchableSelect from '../../../components/SearchableSelect.jsx'
import { text } from '../../../lib/i18n.js'
import { formatUserMessage } from '../../../utils/userMessages.js'
import { cn, formatAmountInWordsFa, formatDate, getNestedValue } from '../../../utils/utils.js'

export function PageShell({ actions, children, language, module }) {
  const Icon = module.icon

  return (
    <section className="ops-page">
      <header className="ops-heading">
        <div className={`ops-heading-icon accent-${module.accent}`}>
          <Icon size={23} strokeWidth={1.85} />
        </div>
        <div>
          <span>{text({ en: 'Operational workspace', fa: 'محیط کاری عملیاتی' }, language)}</span>
          <h1>{text(module.title, language)}</h1>
          <p>{text(module.description, language)}</p>
        </div>
        <div className="ops-heading-actions">{actions}</div>
      </header>

      {children}
    </section>
  )
}

export function Tabs({ activeTab, language, onChange, tabs }) {
  return (
    <div className="ops-tabs" role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon

        return (
          <button
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            role="tab"
            type="button"
          >
            {Icon && <Icon size={16} strokeWidth={1.9} />}
            <span>{text(tab.label, language)}</span>
            {tab.shortcut && <span className="ops-tab-shortcut">{tab.shortcut}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Panel({ actions, children, description, icon: Icon, language, title }) {
  return (
    <section className="ops-panel">
      <div className="ops-panel-heading">
        <div>
          <h2>{text(title, language)}</h2>
          {description && <p>{text(description, language)}</p>}
        </div>
        <div className="ops-panel-actions">
          {actions}
          {Icon && <Icon size={19} strokeWidth={1.8} />}
        </div>
      </div>
      {children}
    </section>
  )
}

export function StateAlert({ error, language = 'en', message, state }) {
  const alertText = formatAlertText(error || message, language)

  if (!alertText) {
    return null
  }

  return (
    <div className={cn('ops-alert', error ? 'error' : '')}>
      {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{alertText}</span>
      {state && <strong>{state}</strong>}
    </div>
  )
}

export function RefreshButton({ loading, onClick, language }) {
  return (
    <button className="ops-button" disabled={loading} onClick={onClick} type="button">
      {loading ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
      {text({ en: 'Refresh', fa: 'تازه‌سازی' }, language)}
    </button>
  )
}

export function PrimaryButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button className="ops-button primary" disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  )
}

export function Field({
  accept,
  amountCurrencyCode,
  disabled = false,
  full,
  hint,
  inputRef,
  label,
  language,
  name,
  onChange,
  onKeyDown,
  options,
  rows = 3,
  showAmountInWords = false,
  type = 'text',
  value,
}) {
  const normalizedOptions = (options || []).map((option) =>
    option && typeof option === 'object' && 'value' in option
      ? option
      : { value: option, label: option },
  )
  const amountWords = showAmountInWords ? formatAmountInWordsFa(value, amountCurrencyCode) : ''

  return (
    <label className={cn('ops-field', full ? 'full' : '')}>
      <span>{text(label, language)}</span>
      {type === 'select' ? (
        <SearchableSelect
          isClearable={normalizedOptions.some((option) => option.value === '')}
          isDisabled={disabled}
          language={language}
          name={name}
          onChange={onChange}
          onKeyDown={onKeyDown}
          options={normalizedOptions}
          placeholder={text({ en: 'Choose...', fa: 'انتخاب کنید...' }, language)}
          ref={inputRef}
          value={value ?? ''}
        />
      ) : type === 'textarea' ? (
        <textarea
          disabled={disabled}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          ref={inputRef}
          rows={rows}
          value={value ?? ''}
        />
      ) : type === 'toggle' ? (
        <button
          aria-checked={Boolean(value)}
          className={cn('master-toggle', value ? 'checked' : '')}
          disabled={disabled}
          onClick={() => onChange(!value)}
          role="switch"
          type="button"
        >
          <span />
        </button>
      ) : type === 'file' ? (
        <FilePreviewInput
          accept={accept}
          disabled={disabled}
          language={language}
          name={name}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={value}
        />
      ) : (
        <input
          disabled={disabled}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          ref={inputRef}
          type={type}
          value={value ?? ''}
        />
      )}
      {hint && <small>{text(hint, language)}</small>}
      {amountWords && <small className="amount-in-words">{amountWords}</small>}
      {type === 'file' && typeof value === 'string' && value && (
        <small>{text({ en: `Current file: ${value}`, fa: `فایل فعلی: ${value}` }, language)}</small>
      )}
    </label>
  )
}

export function DataTable({ columns, emptyText, language, onRowClick, rowActions, rows }) {
  const hasActions = Array.isArray(rowActions) && rowActions.length > 0

  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.align === 'right' ? 'align-right' : ''} key={column.key}>
                {text(column.label, language)}
              </th>
            ))}
            {hasActions && <th>{text({ en: 'Actions', fa: 'عملیات' }, language)}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="ops-empty" colSpan={columns.length + (hasActions ? 1 : 0)}>
                {text(emptyText || { en: 'No records to show.', fa: 'موردی برای نمایش نیست.' }, language)}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                className={onRowClick ? 'clickable' : ''}
                key={row.id || `${index}-${columns[0]?.key}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((column) => (
                  <td className={column.align === 'right' ? 'align-right' : ''} key={column.key}>
                    {renderCell(row, column, language)}
                  </td>
                ))}
                {hasActions && (
                  <td>
                    <div className="ops-actions-row">
                      {rowActions
                        .filter((action) => !(action.disabled && action.disabled(row)))
                        .map((action) => (
                          <button
                            className={cn('ops-button', action.variant === 'primary' ? 'primary' : '', action.className)}
                            key={`${text(action.label, 'en')}-${row.id || index}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              action.onClick(row)
                            }}
                            type="button"
                          >
                            {action.icon && <action.icon size={15} />}
                            {text(action.label, language)}
                          </button>
                        ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Badge({ tone = 'muted', value }) {
  return <span className={`ops-badge ${tone}`}>{value || '-'}</span>
}

function formatAlertText(value, language) {
  if (!value) {
    return ''
  }

  if (value instanceof Error) {
    return formatUserMessage(value.userMessage || value.message, language)
  }

  if (typeof value === 'object') {
    return formatUserMessage(value.userMessage || value, language)
  }

  return String(value)
}

function renderCell(row, column, language) {
  if (column.render) {
    return column.render(getNestedValue(row, column.key), row, language)
  }

  const value = getNestedValue(row, column.key)

  if (value === null || value === undefined || value === '') {
    return <span className="ops-muted">-</span>
  }

  if (column.type === 'date') {
    return formatDate(value)
  }

  if (typeof value === 'boolean') {
    return (
      <Badge
        tone={value ? 'success' : 'muted'}
        value={text(value ? { en: 'Yes', fa: 'بلی' } : { en: 'No', fa: 'نخیر' }, language)}
      />
    )
  }

  return <span>{String(value)}</span>
}
