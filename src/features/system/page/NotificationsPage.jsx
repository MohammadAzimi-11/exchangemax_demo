import { Bell, Plus, Radar, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
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

const notificationColumns = [
  { key: 'subject', label: { en: 'Subject', fa: 'عنوان' } },
  { key: 'user.username', label: { en: 'User', fa: 'کاربر' } },
  { key: 'channel', label: { en: 'Channel', fa: 'کانال' }, render: (value) => <Badge tone="muted" value={value} /> },
  { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: (value) => <Badge tone={statusTone(value)} value={value} /> },
  { key: 'body', label: { en: 'Body', fa: 'متن' }, render: (value) => <span className="ops-cell-compact">{value}</span> },
  { key: 'createdAt', label: { en: 'Created', fa: 'تاریخ' }, type: 'date' },
]

export default function NotificationsPage() {
  const language = useUiStore((state) => state.language)
  const module = modules.find((item) => item.key === 'notifications')
  const [filters, setFilters] = useState({ unreadOnly: 'true', status: '', channel: '', userId: '' })
  const [items, setItems] = useState([])
  const [options, setOptions] = useState({ thresholds: {} })
  const [draft, setDraft] = useState({ userId: '', channel: 'IN_APP', subject: '', body: '', status: 'PENDING' })
  const [checks, setChecks] = useState({ largeTransactionAmount: '10000', kycExpiryDays: '30', backupNoSuccessHours: '25' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const notes = useMemo(
    () => [
      {
        title: { en: 'Focused inbox', fa: 'صندوق متمرکز' },
        body: {
          en: 'Unread staff alerts are shown first by default, so approvals and failures are not buried.',
          fa: 'به صورت پیش‌فرض فقط هشدارهای خوانده‌نشده نشان داده می‌شود تا تاییدی‌ها و خطاها گم نشوند.',
        },
      },
      {
        title: { en: 'Automatic checks', fa: 'چک خودکار' },
        body: {
          en: 'System checks create alerts from backend rules for approvals, KYC expiry, hawala overdue, and backup health.',
          fa: 'چک سیستم طبق قوانین بک‌اند برای تاییدی، انقضای KYC، حواله معوق و صحت بکاپ اطلاعیه می‌سازد.',
        },
      },
    ],
    [],
  )

  const loadOptions = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications/options')
      const payload = extractApiData(response)
      setOptions(payload)
      setChecks({
        largeTransactionAmount: payload.thresholds?.largeTransactionAmount || '10000',
        kycExpiryDays: String(payload.thresholds?.kycExpiryDays || 30),
        backupNoSuccessHours: String(payload.thresholds?.backupNoSuccessHours || 25),
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = Object.fromEntries(Object.entries({ ...filters, limit: 100 }).filter(([, value]) => value !== ''))
      const response = await api.get('/api/notifications', { params })
      const payload = extractApiData(response)
      setItems(getItems(payload))
      setMessage(payload.message || '')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadOptions()
      loadNotifications()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadNotifications, loadOptions])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function createNotification() {
    setSaving(true)
    setError('')

    try {
      const response = await api.post('/api/notifications', {
        ...draft,
        userId: draft.userId || null,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'اطلاعیه ثبت شد.' : 'Notification created.'))
      setDraft((current) => ({ ...current, subject: '', body: '' }))
      loadNotifications()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function runSystemChecks() {
    setSaving(true)
    setError('')

    try {
      const response = await api.post('/api/notifications/system-checks', checks)
      const payload = extractApiData(response)
      setMessage(`${payload.message || 'Checks completed.'} ${payload.createdCount ?? 0} created.`)
      loadNotifications()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell
      actions={<RefreshButton language={language} loading={loading} onClick={loadNotifications} />}
      language={language}
      module={module}
      notes={notes}
    >
      <Panel icon={Bell} language={language} title={{ en: 'Notification inbox', fa: 'صندوق اطلاعیه‌ها' }}>
        <div className="ops-form-grid four">
          <Field
            label={{ en: 'Unread only', fa: 'فقط خوانده‌نشده' }}
            language={language}
            onChange={(value) => updateFilter('unreadOnly', value)}
            options={[
              { value: 'true', label: { en: 'Unread', fa: 'خوانده‌نشده' } },
              { value: '', label: { en: 'All', fa: 'همه' } },
            ]}
            type="select"
            value={filters.unreadOnly}
          />
          <Field
            label={{ en: 'Status', fa: 'وضعیت' }}
            language={language}
            onChange={(value) => updateFilter('status', value)}
            options={[
              { value: '', label: { en: 'All', fa: 'همه' } },
              { value: 'PENDING', label: { en: 'Pending', fa: 'در انتظار' } },
              { value: 'SENT', label: { en: 'Sent', fa: 'ارسال‌شده' } },
              { value: 'FAILED', label: { en: 'Failed', fa: 'ناکام' } },
              { value: 'READ', label: { en: 'Read', fa: 'خوانده‌شده' } },
            ]}
            type="select"
            value={filters.status}
          />
          <Field label={{ en: 'User ID', fa: 'آی‌دی کاربر' }} language={language} onChange={(value) => updateFilter('userId', value)} value={filters.userId} />
        </div>
        <StateAlert error={error} language={language} message={message} />
        <DataTable columns={notificationColumns} language={language} rows={items} />
      </Panel>

      <Panel icon={Radar} language={language} title={{ en: 'Automatic system checks', fa: 'چک‌های خودکار سیستم' }}>
        <div className="ops-form-grid three">
          <Field label={{ en: 'Large transaction amount', fa: 'مبلغ معامله بزرگ' }} language={language} onChange={(value) => setChecks((current) => ({ ...current, largeTransactionAmount: value }))} type="number" value={checks.largeTransactionAmount} />
          <Field label={{ en: 'KYC expiry days', fa: 'روزهای انقضای KYC' }} language={language} onChange={(value) => setChecks((current) => ({ ...current, kycExpiryDays: value }))} type="number" value={checks.kycExpiryDays} />
          <Field label={{ en: 'Backup alert hours', fa: 'ساعت هشدار بکاپ' }} language={language} onChange={(value) => setChecks((current) => ({ ...current, backupNoSuccessHours: value }))} type="number" value={checks.backupNoSuccessHours} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={runSystemChecks}>
            <Radar size={16} />
            {language === 'fa' ? 'اجرای چک سیستم' : 'Run system checks'}
          </PrimaryButton>
        </div>
      </Panel>

      <Panel icon={Plus} language={language} title={{ en: 'Create staff notification', fa: 'ثبت اطلاعیه کارمند' }}>
        <div className="ops-form-grid two">
          <Field label={{ en: 'Target user ID', fa: 'آی‌دی کاربر مقصد' }} language={language} onChange={(value) => setDraft((current) => ({ ...current, userId: value }))} value={draft.userId} />
          <Field
            label={{ en: 'Channel', fa: 'کانال' }}
            language={language}
            onChange={(value) => setDraft((current) => ({ ...current, channel: value }))}
            options={[
              { value: 'IN_APP', label: { en: 'In app', fa: 'داخل برنامه' } },
              { value: 'EMAIL', label: { en: 'Email', fa: 'ایمیل' } },
              { value: 'SMS', label: { en: 'SMS', fa: 'پیامک' } },
              { value: 'PUSH', label: { en: 'Push', fa: 'پوش' } },
            ]}
            type="select"
            value={draft.channel}
          />
          <Field label={{ en: 'Subject', fa: 'عنوان' }} language={language} onChange={(value) => setDraft((current) => ({ ...current, subject: value }))} value={draft.subject} />
          <Field full label={{ en: 'Body', fa: 'متن' }} language={language} onChange={(value) => setDraft((current) => ({ ...current, body: value }))} type="textarea" value={draft.body} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !draft.body} onClick={createNotification}>
            <Send size={16} />
            {language === 'fa' ? 'ثبت اطلاعیه' : 'Create notification'}
          </PrimaryButton>
        </div>
        {options.triggers?.length > 0 && <div className="ops-inline-note">{options.triggers.join(' / ')}</div>}
      </Panel>
    </PageShell>
  )
}
