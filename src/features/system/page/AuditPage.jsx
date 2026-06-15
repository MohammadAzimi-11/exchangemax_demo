import {
  CalendarClock,
  Database,
  Download,
  Eye,
  FileSearch,
  Fingerprint,
  Info,
  LockKeyhole,
  Search,
  UserRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUser } from '../../../utils/currentUser.js'
import { cn } from '../../../utils/utils.js'
import {
  Badge,
  DataTable,
  Field,
  PageShell,
  Panel,
  PrimaryButton,
  RefreshButton,
  StateAlert,
} from '../../shared/components/OperationsUI.jsx'
import { extractApiData, getItems, statusTone } from '../../shared/components/operations-data.js'

const actionOptions = [
  { value: '', label: { en: 'All actions', fa: 'همه عملیات' } },
  { value: 'CREATE', label: { en: 'Create', fa: 'ایجاد' } },
  { value: 'UPDATE', label: { en: 'Update', fa: 'ویرایش' } },
  { value: 'DELETE', label: { en: 'Delete', fa: 'حذف' } },
  { value: 'EXPORT', label: { en: 'Export', fa: 'خروجی' } },
  { value: 'APPROVE', label: { en: 'Approve', fa: 'تایید' } },
  { value: 'REVERSE', label: { en: 'Reverse', fa: 'برگشت' } },
  { value: 'PAY', label: { en: 'Pay', fa: 'پرداخت' } },
]

const exportFormatOptions = [
  { value: 'CSV', label: { en: 'CSV', fa: 'CSV' } },
  { value: 'PDF', label: { en: 'PDF', fa: 'PDF' } },
  { value: 'XLSX', label: { en: 'Excel', fa: 'اکسل' } },
]

const auditReadLevels = new Set(['VIEW', 'CREATE', 'EDIT', 'DELETE', 'FULL'])

const actionLabels = {
  APPROVE: { en: 'Approved', fa: 'تایید شد' },
  CREATE: { en: 'Created', fa: 'ایجاد شد' },
  DELETE: { en: 'Deleted', fa: 'حذف شد' },
  EXPORT: { en: 'Exported', fa: 'خروجی گرفته شد' },
  PAY: { en: 'Paid', fa: 'پرداخت شد' },
  REVERSE: { en: 'Reversed', fa: 'برگشت شد' },
  UPDATE: { en: 'Updated', fa: 'ویرایش شد' },
}

const entityLabels = {
  Account: { en: 'Account', fa: 'حساب' },
  AuditLog: { en: 'Audit log', fa: 'ادیت لاگ' },
  Backup: { en: 'Backup', fa: 'بکاپ' },
  CashFund: { en: 'Cash fund', fa: 'صندوق نقدی' },
  Company: { en: 'Company profile', fa: 'پروفایل شرکت' },
  Currency: { en: 'Currency', fa: 'ارز' },
  Customer: { en: 'Customer', fa: 'مشتری' },
  FeeStructure: { en: 'Fee structure', fa: 'ساختار فیس' },
  Hawala: { en: 'Hawala', fa: 'حواله' },
  Identity: { en: 'User account', fa: 'حساب کاربری' },
  PrintJob: { en: 'Print job', fa: 'وظیفه چاپ' },
  Report: { en: 'Report', fa: 'گزارش' },
  RoleProfile: { en: 'Role profile', fa: 'پروفایل نقش' },
  Settings: { en: 'System settings', fa: 'تنظیمات سیستم' },
  TradingCity: { en: 'Trading city', fa: 'شهر معامله' },
  Transaction: { en: 'Transaction', fa: 'معامله' },
  User: { en: 'User', fa: 'کاربر' },
}

const fieldLabels = {
  accountId: { en: 'Account ID', fa: 'آی‌دی حساب' },
  accountNumber: { en: 'Account number', fa: 'نمبر حساب' },
  action: { en: 'Action', fa: 'عملیات' },
  address: { en: 'Address', fa: 'آدرس' },
  afterState: { en: 'After state', fa: 'حالت بعد' },
  amount: { en: 'Amount', fa: 'مبلغ' },
  beforeState: { en: 'Before state', fa: 'حالت قبل' },
  balance: { en: 'Balance', fa: 'بیلانس' },
  branchName: { en: 'Branch', fa: 'شعبه' },
  cityName: { en: 'City', fa: 'شهر' },
  code: { en: 'Code', fa: 'کود' },
  createdAt: { en: 'Created at', fa: 'زمان ایجاد' },
  createdById: { en: 'Created by ID', fa: 'آی‌دی ایجادکننده' },
  currencyCode: { en: 'Currency', fa: 'ارز' },
  customerCode: { en: 'Customer code', fa: 'کود مشتری' },
  customerId: { en: 'Customer ID', fa: 'آی‌دی مشتری' },
  defaultCurrency: { en: 'Default currency', fa: 'ارز پیش‌فرض' },
  description: { en: 'Description', fa: 'شرح' },
  displayName: { en: 'Display name', fa: 'نام نمایشی' },
  email: { en: 'Email', fa: 'ایمیل' },
  entityId: { en: 'Record ID', fa: 'آی‌دی ثبت' },
  entityType: { en: 'Section', fa: 'بخش' },
  fee: { en: 'Fee', fa: 'فیس' },
  fullName: { en: 'Full name', fa: 'نام کامل' },
  id: { en: 'ID', fa: 'آی‌دی' },
  isActive: { en: 'Active', fa: 'فعال' },
  legalName: { en: 'Legal name', fa: 'نام رسمی' },
  logoPath: { en: 'Logo path', fa: 'مسیر لوگو' },
  name: { en: 'Name', fa: 'نام' },
  phone: { en: 'Phone', fa: 'شماره تماس' },
  reason: { en: 'Reason', fa: 'دلیل' },
  referenceNo: { en: 'Reference no.', fa: 'نمبر مرجع' },
  role: { en: 'Role', fa: 'نقش' },
  status: { en: 'Status', fa: 'حالت' },
  taxId: { en: 'Tax ID', fa: 'شناسه مالیاتی' },
  title: { en: 'Title', fa: 'عنوان' },
  timezone: { en: 'Timezone', fa: 'زون زمانی' },
  trackingCode: { en: 'Tracking code', fa: 'کود پیگیری' },
  updatedAt: { en: 'Updated at', fa: 'زمان ویرایش' },
  updatedById: { en: 'Updated by ID', fa: 'آی‌دی ویرایش‌کننده' },
  userId: { en: 'User ID', fa: 'آی‌دی کاربر' },
  username: { en: 'Username', fa: 'نام کاربری' },
}

function monthStartInput() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

function unwrapItem(response) {
  const payload = extractApiData(response)
  return payload?.item || payload
}

function formatDateTime(value, language) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-AF' : 'en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function displayFieldName(field, language) {
  const key = String(field || '').split('.').at(-1)
  return text(fieldLabels[key] || fieldLabels[field], language) || field || '-'
}

function translateAction(action, language) {
  return text(actionLabels[action], language) || action || '-'
}

function translateEntity(entityType, language) {
  return text(entityLabels[entityType], language) || entityType || '-'
}

function userLabel(user) {
  return `${user.username} - ${user.fullName || user.role || user.id}`
}

function mapUserOptions(users) {
  return [
    { value: '', label: { en: 'All users', fa: 'همه کاربران' } },
    ...users.map((user) => ({ value: user.id, label: userLabel(user) })),
  ]
}

function actorName(item) {
  return item?.actor?.fullName || item?.user?.fullName || item?.username || item?.user?.username || '-'
}

function actorMeta(item) {
  const actor = item?.actor || item?.user || {}
  return [actor.username, actor.role].filter(Boolean).join(' | ') || item?.userId || '-'
}

function canViewAuditLog(user) {
  if (!user?.id || user.isActive === false) {
    return false
  }

  if (['ADMIN', 'AUDITOR'].includes(user.role)) {
    return true
  }

  return auditReadLevels.has((user.permissions || []).find((permission) => permission.area === 'auditLog')?.level)
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isIdField(field) {
  const key = String(field || '').split('.').at(-1)
  return key === 'id' || /Id$/.test(key) || /_id$/i.test(key)
}

function shortId(value) {
  const normalized = String(value || '')
  if (normalized.length <= 18) return normalized
  return `${normalized.slice(0, 8)}...${normalized.slice(-6)}`
}

function compactValue(value, language, field = '') {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return text(value ? { en: 'Yes', fa: 'بلی' } : { en: 'No', fa: 'نخیر' }, language)
  }

  if (isIdField(field)) {
    return shortId(value)
  }

  if (isPlainObject(value) || Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

function buildAuditSummary(items, language) {
  const actionCounts = items.reduce((counts, item) => {
    const key = item.action || item.actionType || 'UNKNOWN'
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
  const changedRows = items.filter((item) => Number(item.changeCount || 0) > 0).length

  return [
    {
      icon: FileSearch,
      label: { en: 'Rows found', fa: 'ثبت‌های پیدا شده' },
      value: String(items.length),
      detail: { en: 'Visible audit rows', fa: 'ردیف‌های قابل نمایش' },
    },
    {
      icon: Database,
      label: { en: 'Rows with changes', fa: 'ثبت‌های دارای تغییر' },
      value: String(changedRows),
      detail: { en: 'Have before/after values', fa: 'دارای مقدار قبل و بعد' },
    },
    {
      icon: UserRound,
      label: { en: 'Most common action', fa: 'رایج‌ترین عملیات' },
      value: translateAction(Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0], language),
      detail: { en: 'Based on current filters', fa: 'بر اساس فیلتر فعلی' },
    },
  ]
}

function IdChip({ field = 'id', language = 'en', value }) {
  if (!value) {
    return <span className="ops-muted">-</span>
  }

  return (
    <span className="audit-id-chip" title={String(value)}>
      <span>{displayFieldName(field, language)}</span>
      <code>{shortId(value)}</code>
    </span>
  )
}

function ValueDisplay({ field, language, value }) {
  if (isIdField(field) && value) {
    return <IdChip field={field} language={language} value={value} />
  }

  if (value === null || value === undefined || value === '') {
    return <span className="ops-muted">-</span>
  }

  if (typeof value === 'boolean') {
    return <Badge tone={value ? 'success' : 'muted'} value={compactValue(value, language)} />
  }

  if (Array.isArray(value)) {
    return (
      <div className="audit-object-tree">
        {value.length ? value.map((item, index) => (
          <ObjectTree field={`${field}.${index}`} key={`${field}-${index}`} language={language} value={item} />
        )) : <span className="ops-muted">[]</span>}
      </div>
    )
  }

  if (isPlainObject(value)) {
    return <ObjectTree field={field} language={language} value={value} />
  }

  return <span className="audit-value-text">{String(value)}</span>
}

function ObjectTree({ field = '', language, value }) {
  if (!isPlainObject(value)) {
    return <ValueDisplay field={field} language={language} value={value} />
  }

  const entries = Object.entries(value)

  if (!entries.length) {
    return <span className="ops-muted">{'{}'}</span>
  }

  return (
    <div className="audit-object-tree">
      {entries.map(([key, item]) => {
        const path = field ? `${field}.${key}` : key
        return (
          <div className="audit-object-row" key={path}>
            <span>{displayFieldName(path, language)}</span>
            <ValueDisplay field={path} language={language} value={item} />
          </div>
        )
      })}
    </div>
  )
}

function ActorCell({ item }) {
  return (
    <div className="audit-table-person">
      <strong>{actorName(item)}</strong>
      <span>{actorMeta(item)}</span>
    </div>
  )
}

function EntityCell({ item, language }) {
  return (
    <div className="audit-table-entity">
      <strong>{translateEntity(item.entityType || item.targetTable, language)}</strong>
      <IdChip field="entityId" language={language} value={item.entityId || item.targetId} />
    </div>
  )
}

function DateCell({ language, value }) {
  return (
    <div className="audit-table-date">
      <CalendarClock size={15} />
      <span>{formatDateTime(value, language)}</span>
    </div>
  )
}

function metadataRows(item, language) {
  if (!item) return []

  return [
    { icon: Fingerprint, label: { en: 'Audit log ID', fa: 'آی‌دی ادیت لاگ' }, value: <IdChip field="id" language={language} value={item.id} /> },
    { icon: UserRound, label: { en: 'Performed by', fa: 'انجام‌دهنده' }, value: `${actorName(item)} (${actorMeta(item)})` },
    { icon: Database, label: { en: 'Section', fa: 'بخش' }, value: translateEntity(item.targetTable || item.entityType, language) },
    { icon: Fingerprint, label: { en: 'Record ID', fa: 'آی‌دی ثبت' }, value: <IdChip field="entityId" language={language} value={item.targetId || item.entityId} /> },
    { icon: CalendarClock, label: { en: 'Date and time', fa: 'تاریخ و ساعت' }, value: formatDateTime(item.timestamp || item.createdAt, language) },
    { icon: Fingerprint, label: { en: 'Customer ID', fa: 'آی‌دی مشتری' }, value: item.customerId ? <IdChip field="customerId" language={language} value={item.customerId} /> : '-' },
    { icon: Info, label: { en: 'IP address', fa: 'آدرس IP' }, value: item.ipAddress || '-' },
    { icon: Info, label: { en: 'Session ID', fa: 'آی‌دی نشست' }, value: item.sessionId ? <IdChip field="sessionId" language={language} value={item.sessionId} /> : '-' },
  ]
}

function AuditDiffGrid({ changes, language }) {
  if (!changes?.length) {
    return (
      <div className="audit-empty-detail">
        {text({ en: 'No field-level before/after changes were stored for this log.', fa: 'برای این لاگ تغییر فیلدی قبل و بعد ذخیره نشده است.' }, language)}
      </div>
    )
  }

  return (
    <div className="audit-diff-table">
      <div className="audit-diff-head">
        <div>{text({ en: 'Field', fa: 'فیلد' }, language)}</div>
        <div>{text({ en: 'Before', fa: 'قبل' }, language)}</div>
        <div>{text({ en: 'After', fa: 'بعد' }, language)}</div>
      </div>
      {changes.map((change, index) => (
        <div className="audit-diff-row" key={`${change.field}-${index}`}>
          <div className="audit-diff-field">
            <strong>{displayFieldName(change.field, language)}</strong>
            <code>{change.field}</code>
          </div>
          <div className="audit-diff-value before">
            <ValueDisplay field={change.field} language={language} value={change.before} />
          </div>
          <div className="audit-diff-value after">
            <ValueDisplay field={change.field} language={language} value={change.after} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SnapshotPanel({ label, language, tone, value }) {
  return (
    <article className={cn('audit-snapshot-panel', tone)}>
      <h4>{text(label, language)}</h4>
      <div>
        <ValueDisplay field="" language={language} value={value} />
      </div>
    </article>
  )
}

export default function AuditPage() {
  const language = useUiStore((state) => state.language)
  const sourceModule = modules.find((item) => item.key === 'audit')
  const module = useMemo(
    () => ({
      ...sourceModule,
      title: { en: 'Audit Log', fa: 'ادیت لاگ' },
      description: {
        en: 'Understand who changed what, when it happened, and exactly what changed before and after.',
        fa: 'ببینید چه کسی، چه چیزی را، در چه زمانی تغییر داده و مقدار قبل و بعد دقیقاً چه بوده است.',
      },
    }),
    [sourceModule],
  )

  const [filters, setFilters] = useState({
    from: monthStartInput(),
    to: todayInput(),
    action: '',
    entityType: '',
    entityId: '',
    userId: '',
    limit: '200',
  })
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [format, setFormat] = useState('CSV')

  const summaryCards = useMemo(() => buildAuditSummary(items, language), [items, language])

  const auditColumns = useMemo(
    () => [
      {
        key: 'createdAt',
        label: { en: 'Date and time', fa: 'تاریخ و ساعت' },
        render: (value) => <DateCell language={language} value={value} />,
      },
      {
        key: 'username',
        label: { en: 'User', fa: 'کاربر' },
        render: (_, row) => <ActorCell item={row} />,
      },
      {
        key: 'action',
        label: { en: 'Action', fa: 'عملیات' },
        render: (value) => <Badge tone={statusTone(value)} value={translateAction(value, language)} />,
      },
      {
        key: 'entityType',
        label: { en: 'Record', fa: 'ثبت' },
        render: (_, row) => <EntityCell item={row} language={language} />,
      },
      {
        key: 'changeCount',
        label: { en: 'Changes', fa: 'تغییرات' },
        render: (value) => (
          <span className="audit-change-count">
            {Number(value || 0)}
            <small>{text({ en: 'fields', fa: 'فیلد' }, language)}</small>
          </span>
        ),
      },
      {
        key: 'description',
        label: { en: 'Useful summary', fa: 'خلاصه قابل فهم' },
        render: (value, row) => (
          <span className="audit-readable-summary">
            {value || `${translateAction(row.action, language)} - ${translateEntity(row.entityType, language)}`}
          </span>
        ),
      },
    ],
    [language],
  )

  const loadUsers = useCallback(async () => {
    const response = await api.get('/api/identity', { params: { includeHidden: true, limit: 500 } })
    setUsers(getItems(extractApiData(response)))
  }, [])

  const loadAuditLogs = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const actor = await getCurrentUser({ predicate: canViewAuditLog })
      const response = await api.get('/api/audit', {
        params: cleanParams({
          ...filters,
          requesterId: actor.id,
        }),
      })
      const payload = extractApiData(response)
      setItems(getItems(payload))
      setMessage(payload.message || text({ en: 'Audit log is ready.', fa: 'ادیت لاگ آماده است.' }, language))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters, language])

  useEffect(() => {
    const timer = window.setTimeout(loadAuditLogs, 0)
    return () => window.clearTimeout(timer)
  }, [loadAuditLogs])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers().catch(() => undefined)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadUsers])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: key === 'action' ? value.toUpperCase() : value }))
  }

  async function openDetails(row) {
    setDetailLoading(true)
    setError('')
    setSelectedItem(row)

    try {
      const actor = await getCurrentUser({ predicate: canViewAuditLog })
      const response = await api.get(`/api/audit/${row.id}`, { params: { requesterId: actor.id } })
      setSelectedItem(unwrapItem(response))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function exportAudit() {
    setExporting(true)
    setError('')

    try {
      const actor = await getCurrentUser({ predicate: canViewAuditLog })
      const response = await api.post('/api/audit/export', {
        requesterId: actor.id,
        format,
        filters: cleanParams(filters),
      })
      const payload = extractApiData(response)
      setMessage(payload.message || text({ en: 'Audit log exported.', fa: 'ادیت لاگ خروجی شد.' }, language))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageShell actions={<RefreshButton language={language} loading={loading} onClick={loadAuditLogs} />} language={language} module={module} notes={[]}>
      <div className="audit-page">
        <Panel
          actions={
            <PrimaryButton disabled={exporting} onClick={exportAudit}>
              <Download size={16} />
              {text({ en: 'Export', fa: 'خروجی' }, language)}
            </PrimaryButton>
          }
          description={{
            en: 'Filter the audit trail, then click any row to see all before/after values and technical details.',
            fa: 'ادیت لاگ را فیلتر کنید، سپس روی هر ردیف کلیک کنید تا تمام مقدارهای قبل/بعد و جزئیات تخنیکی دیده شود.',
          }}
          icon={LockKeyhole}
          language={language}
          title={{ en: 'Audit trail', fa: 'ردیابی ادیت لاگ' }}
        >
          <div className="audit-summary-grid">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={text(card.label, 'en')}>
                  <Icon size={18} />
                  <span>{text(card.label, language)}</span>
                  <strong>{card.value || '-'}</strong>
                  <small>{text(card.detail, language)}</small>
                </article>
              )
            })}
          </div>

          <div className="audit-filter-grid">
            <Field label={{ en: 'From', fa: 'از تاریخ' }} language={language} onChange={(value) => updateFilter('from', value)} type="date" value={filters.from} />
            <Field label={{ en: 'To', fa: 'تا تاریخ' }} language={language} onChange={(value) => updateFilter('to', value)} type="date" value={filters.to} />
            <Field label={{ en: 'User', fa: 'کاربر' }} language={language} onChange={(value) => updateFilter('userId', value)} options={mapUserOptions(users)} type="select" value={filters.userId} />
            <Field label={{ en: 'Action', fa: 'عملیات' }} language={language} onChange={(value) => updateFilter('action', value)} options={actionOptions} type="select" value={filters.action} />
            <Field label={{ en: 'Section', fa: 'بخش' }} language={language} onChange={(value) => updateFilter('entityType', value)} value={filters.entityType} />
            <Field label={{ en: 'Record ID', fa: 'آی‌دی ثبت' }} language={language} onChange={(value) => updateFilter('entityId', value)} value={filters.entityId} />
            <Field label={{ en: 'Rows', fa: 'تعداد ردیف' }} language={language} onChange={(value) => updateFilter('limit', value)} type="number" value={filters.limit} />
            <Field label={{ en: 'Export format', fa: 'فرمت خروجی' }} language={language} onChange={setFormat} options={exportFormatOptions} type="select" value={format} />
          </div>

          <div className="audit-actions">
            <PrimaryButton disabled={loading} onClick={loadAuditLogs}>
              <Search size={16} />
              {text({ en: 'Search', fa: 'جست‌وجو' }, language)}
            </PrimaryButton>
          </div>

          <StateAlert error={error} message={message} state={items.length ? 'configured' : undefined} />
          <DataTable
            columns={auditColumns}
            emptyText={{ en: 'No audit rows found for these filters.', fa: 'برای این فیلترها ردیف ادیت لاگ پیدا نشد.' }}
            language={language}
            onRowClick={openDetails}
            rowActions={[
              {
                icon: Eye,
                label: { en: 'Details', fa: 'جزئیات' },
                onClick: openDetails,
              },
            ]}
            rows={items}
          />
        </Panel>

        <Modal
          className="audit-modal"
          description={{
            en: 'Complete audit entry with actor metadata, readable IDs, field changes, and full snapshots.',
            fa: 'ثبت کامل ادیت لاگ با مشخصات انجام‌دهنده، آی‌دی‌های خوانا، تغییرات فیلدها و snapshot کامل.',
          }}
          language={language}
          onClose={() => setSelectedItem(null)}
          open={Boolean(selectedItem)}
          title={{ en: 'Audit log details', fa: 'جزئیات ادیت لاگ' }}
        >
          {selectedItem && (
            <div className="audit-detail">
              <div className="audit-detail-title">
                <Badge tone={statusTone(selectedItem.actionType || selectedItem.action)} value={translateAction(selectedItem.actionType || selectedItem.action, language)} />
                <strong>{selectedItem.description || `${translateAction(selectedItem.action, language)} - ${translateEntity(selectedItem.entityType, language)}`}</strong>
                {detailLoading && <span>{text({ en: 'Loading full details...', fa: 'در حال بارگذاری جزئیات کامل...' }, language)}</span>}
              </div>

              <div className="audit-detail-cards">
                {metadataRows(selectedItem, language).map((row) => {
                  const Icon = row.icon
                  return (
                    <article key={text(row.label, 'en')}>
                      <Icon size={17} />
                      <span>{text(row.label, language)}</span>
                      <strong>{row.value || '-'}</strong>
                    </article>
                  )
                })}
              </div>

              <section>
                <div className="audit-section-heading">
                  <FileSearch size={17} />
                  <h3>{text({ en: 'Field-by-field changes', fa: 'تغییرات فیلد به فیلد' }, language)}</h3>
                </div>
                <AuditDiffGrid changes={selectedItem.changes || []} language={language} />
              </section>

              <section>
                <div className="audit-section-heading">
                  <Database size={17} />
                  <h3>{text({ en: 'Complete before and after snapshots', fa: 'جزئیات کامل قبل و بعد' }, language)}</h3>
                </div>
                <div className="audit-snapshot-grid">
                  <SnapshotPanel label={{ en: 'Before', fa: 'قبل' }} language={language} tone="before" value={selectedItem.oldValues || selectedItem.beforeState} />
                  <SnapshotPanel label={{ en: 'After', fa: 'بعد' }} language={language} tone="after" value={selectedItem.newValues || selectedItem.afterState} />
                </div>
              </section>

              <section>
                <div className="audit-section-heading">
                  <Info size={17} />
                  <h3>{text({ en: 'Technical details', fa: 'جزئیات تخنیکی' }, language)}</h3>
                </div>
                <div className="audit-technical-grid">
                  <article>
                    <span>{text({ en: 'User agent', fa: 'مرورگر / دستگاه' }, language)}</span>
                    <strong>{selectedItem.userAgent || '-'}</strong>
                  </article>
                  <article>
                    <span>{text({ en: 'Customer', fa: 'مشتری' }, language)}</span>
                    <strong>
                      {selectedItem.customer
                        ? `${selectedItem.customer.customerCode || selectedItem.customer.id} - ${selectedItem.customer.type || ''}`
                        : '-'}
                    </strong>
                  </article>
                </div>
              </section>
            </div>
          )}
        </Modal>
      </div>
    </PageShell>
  )
}
