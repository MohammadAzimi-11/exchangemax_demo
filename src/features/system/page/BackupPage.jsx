import { DatabaseBackup, FolderOpen, Play, Save, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUser } from '../../../utils/currentUser.js'
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

const historyColumns = [
  {
    key: 'filePath',
    label: { en: 'File location', fa: 'محل فایل' },
    render: (value) => <span className="ops-backup-path" title={value || ''}>{value || '-'}</span>,
  },
  { key: 'type', label: { en: 'Type', fa: 'نوع' } },
  { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: (value) => <Badge tone={statusTone(value)} value={value} /> },
  { key: 'storageType', label: { en: 'Storage', fa: 'ذخیره‌گاه' } },
  { key: 'fileSizeBytes', label: { en: 'Size', fa: 'اندازه' } },
  { key: 'isEncrypted', label: { en: 'Encrypted', fa: 'رمزنگاری' } },
  { key: 'isVerified', label: { en: 'Verified', fa: 'تایید checksum' } },
  { key: 'startedAt', label: { en: 'Started', fa: 'شروع' }, type: 'date' },
  { key: 'completedAt', label: { en: 'Completed', fa: 'پایان' }, type: 'date' },
]

function emailsToArray(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function mapConfigToForm(config = {}) {
  return {
    schedule: config.schedule || 'DAILY',
    retentionCount: String(config.retentionCount || 30),
    storageType: config.storageType || 'local',
    directory: config.storageConfig?.directory || 'storage/backups',
    notifyEmails: Array.isArray(config.notifyEmails) ? config.notifyEmails.join(', ') : '',
    notifyOnSuccess: config.notifyOnSuccess ?? true,
    notifyOnFailure: config.notifyOnFailure ?? true,
    isEnabled: config.isEnabled ?? true,
  }
}

export default function BackupPage() {
  const language = useUiStore((state) => state.language)
  const module = modules.find((item) => item.key === 'backup')
  const [configForm, setConfigForm] = useState(mapConfigToForm())
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [runForm, setRunForm] = useState({ type: 'FULL' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const notes = useMemo(
    () => [
      {
        title: { en: 'Offline safe default', fa: 'پیش‌فرض امن آفلاین' },
        body: {
          en: 'Local encrypted storage is selected by default. Network or S3-compatible storage must be configured deliberately.',
          fa: 'ذخیره‌گاه محلی رمزنگاری‌شده پیش‌فرض است. Network یا S3-compatible باید آگاهانه تنظیم شود.',
        },
      },
      {
        title: { en: 'Checksum history', fa: 'تاریخچه checksum' },
        body: {
          en: 'Each backup record shows encryption and verification state so failures are visible.',
          fa: 'هر رکورد بکاپ وضعیت رمزنگاری و تایید را نشان می‌دهد تا خطاها واضح باشند.',
        },
      },
    ],
    [],
  )

  const loadBackup = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [configResponse, statusResponse, historyResponse] = await Promise.all([
        api.get('/api/backup/config'),
        api.get('/api/backup/status'),
        api.get('/api/backup/history', { params: { limit: 50 } }),
      ])
      const configPayload = extractApiData(configResponse)
      const statusPayload = extractApiData(statusResponse)
      const historyPayload = extractApiData(historyResponse)

      setConfigForm(mapConfigToForm(configPayload.config))
      setStatus(statusPayload)
      setHistory(getItems(historyPayload))
      setMessage(statusPayload.alert?.message || configPayload.message || historyPayload.message || '')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadBackup, 0)
    return () => window.clearTimeout(timer)
  }, [loadBackup])

  function updateConfig(key, value) {
    setConfigForm((current) => ({ ...current, [key]: value }))
  }

  async function saveConfig() {
    setSaving(true)
    setError('')

    try {
      const response = await api.put('/api/backup/config', {
        schedule: configForm.schedule,
        retentionCount: Number(configForm.retentionCount),
        storageType: configForm.storageType,
        storageConfig: { directory: configForm.directory },
        notifyEmails: emailsToArray(configForm.notifyEmails),
        notifyOnSuccess: configForm.notifyOnSuccess,
        notifyOnFailure: configForm.notifyOnFailure,
        isEnabled: configForm.isEnabled,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'تنظیمات بکاپ ذخیره شد.' : 'Backup configuration saved.'))
      loadBackup()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function runBackup() {
    setSaving(true)
    setError('')

    try {
      const actor = await getCurrentUser()
      const response = await api.post('/api/backup/run', {
        type: runForm.type,
        createdById: actor.id,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'بکاپ اجرا شد.' : 'Backup completed.'))
      loadBackup()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function showBackupFile(row) {
    if (!row?.id) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await api.post(`/api/backup/history/${row.id}/show-in-folder`)
      const payload = extractApiData(response)
      const filePath = payload.item?.filePath || row.filePath
      setMessage(filePath ? `${payload.message} ${filePath}` : payload.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell
      actions={<RefreshButton language={language} loading={loading} onClick={loadBackup} />}
      language={language}
      module={module}
      notes={notes}
    >
      <Panel icon={ShieldCheck} language={language} title={{ en: 'Backup health', fa: 'صحت بکاپ' }}>
        <div className="ops-health-strip">
          <article>
            <span>{language === 'fa' ? 'حالت' : 'State'}</span>
            <strong>{status?.state || '-'}</strong>
          </article>
          <article>
            <span>{language === 'fa' ? 'صحت' : 'Health'}</span>
            <strong>{status?.healthy ? (language === 'fa' ? 'سالم' : 'Healthy') : language === 'fa' ? 'نیاز به توجه' : 'Needs attention'}</strong>
          </article>
          <article>
            <span>{language === 'fa' ? 'آخرین موفق' : 'Last success'}</span>
            <strong>{status?.lastSuccess?.completedAt || '-'}</strong>
          </article>
        </div>
        <StateAlert error={error} language={language} message={message} state={status?.alert?.code} />
      </Panel>

      <Panel icon={DatabaseBackup} language={language} title={{ en: 'Backup configuration', fa: 'تنظیمات بکاپ' }}>
        <div className="ops-form-grid four">
          <Field
            label={{ en: 'Schedule', fa: 'زمان‌بندی' }}
            language={language}
            onChange={(value) => updateConfig('schedule', value)}
            options={['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'].map((value) => ({ value, label: { en: value, fa: value } }))}
            type="select"
            value={configForm.schedule}
          />
          <Field label={{ en: 'Retention count', fa: 'تعداد نگهداری' }} language={language} onChange={(value) => updateConfig('retentionCount', value)} type="number" value={configForm.retentionCount} />
          <Field
            label={{ en: 'Storage type', fa: 'نوع ذخیره‌گاه' }}
            language={language}
            onChange={(value) => updateConfig('storageType', value)}
            options={[
              { value: 'local', label: { en: 'Local', fa: 'محلی' } },
              { value: 'network', label: { en: 'Network share', fa: 'شبکه' } },
              { value: 's3-compatible', label: { en: 'S3-compatible', fa: 'سازگار با S3' } },
            ]}
            type="select"
            value={configForm.storageType}
          />
          <Field label={{ en: 'Directory', fa: 'مسیر پوشه' }} language={language} onChange={(value) => updateConfig('directory', value)} value={configForm.directory} />
          <Field full label={{ en: 'Notify emails', fa: 'ایمیل‌های اطلاع‌رسانی' }} language={language} onChange={(value) => updateConfig('notifyEmails', value)} value={configForm.notifyEmails} />
          <Field label={{ en: 'Enabled', fa: 'فعال' }} language={language} onChange={(value) => updateConfig('isEnabled', value)} type="toggle" value={configForm.isEnabled} />
          <Field label={{ en: 'Notify success', fa: 'اطلاع موفقیت' }} language={language} onChange={(value) => updateConfig('notifyOnSuccess', value)} type="toggle" value={configForm.notifyOnSuccess} />
          <Field label={{ en: 'Notify failure', fa: 'اطلاع خطا' }} language={language} onChange={(value) => updateConfig('notifyOnFailure', value)} type="toggle" value={configForm.notifyOnFailure} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={saveConfig}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره تنظیمات' : 'Save configuration'}
          </PrimaryButton>
        </div>
      </Panel>

      <Panel icon={Play} language={language} title={{ en: 'Run backup manually', fa: 'اجرای دستی بکاپ' }}>
        <div className="ops-form-grid three">
          <Field
            label={{ en: 'Backup type', fa: 'نوع بکاپ' }}
            language={language}
            onChange={(value) => setRunForm((current) => ({ ...current, type: value }))}
            options={[
              { value: 'FULL', label: { en: 'Full', fa: 'کامل' } },
              { value: 'INCREMENTAL', label: { en: 'Incremental', fa: 'افزایشی' } },
            ]}
            type="select"
            value={runForm.type}
          />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={runBackup}>
            <Play size={16} />
            {language === 'fa' ? 'اجرای بکاپ' : 'Run backup'}
          </PrimaryButton>
        </div>
      </Panel>

      <Panel icon={DatabaseBackup} language={language} title={{ en: 'Backup history', fa: 'تاریخچه بکاپ' }}>
        <DataTable
          columns={historyColumns}
          language={language}
          rowActions={[
            {
              icon: FolderOpen,
              label: { en: 'Show in folder', fa: 'نمایش در فایل' },
              disabled: (row) => !row.filePath || row.status !== 'SUCCESS',
              onClick: showBackupFile,
            },
          ]}
          rows={history}
        />
      </Panel>
    </PageShell>
  )
}
