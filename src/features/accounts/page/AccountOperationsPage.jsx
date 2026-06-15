import { ArrowLeft, ClipboardList, Download, Loader2, ReceiptText } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { formatDate, formatMoney } from '../../../utils/utils.js'
import {
  Badge,
  DataTable,
  PageShell,
  Panel,
  PrimaryButton,
  RefreshButton,
  StateAlert,
} from '../../shared/components/OperationsUI.jsx'
import { extractApiData, statusTone } from '../../shared/components/operations-data.js'

const accountModule =
  modules.find((module) => module.key === 'accounts') || {
    title: { en: 'Account operations', fa: 'عملیات حساب' },
    description: { en: 'All operations for one account.', fa: 'همه عملیات یک حساب.' },
    accent: 'blue',
    icon: ClipboardList,
  }

const operationColumns = [
  { key: 'sequence', label: { en: '#', fa: '#' } },
  { key: 'entryDate', label: { en: 'Date / time', fa: 'تاریخ / زمان' }, render: (value) => formatDateTime(value) },
  { key: 'entryNumber', label: { en: 'Entry no.', fa: 'نمبر سند' } },
  {
    key: 'transaction.type',
    label: { en: 'Operation', fa: 'عملیات' },
    render: (_value, row) => row.transaction?.type || (row.hawala ? 'HAWALA' : row.isManual ? 'MANUAL' : row.entryType),
  },
  {
    key: 'operationDirection',
    label: { en: 'Direction', fa: 'جهت' },
    render: (value) => <Badge tone={value === 'IN' ? 'success' : 'warning'} value={value === 'IN' ? 'IN' : 'OUT'} />,
  },
  { key: 'transaction.referenceNo', label: { en: 'Transaction', fa: 'معامله' }, render: (value, row) => value || row.hawala?.trackingCode || row.hawala?.externalTrackingCode || '-' },
  { key: 'debitAccount.accountNumber', label: { en: 'Debit', fa: 'بدهکار' } },
  { key: 'creditAccount.accountNumber', label: { en: 'Credit', fa: 'بستانکار' } },
  { key: 'deposit', label: { en: 'Deposit', fa: 'واریز' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) || '-' },
  { key: 'withdrawal', label: { en: 'Withdrawal', fa: 'برداشت' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) || '-' },
  { key: 'runningBalance', label: { en: 'Running balance', fa: 'بیلانس جاری' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
  { key: 'transaction.status', label: { en: 'Status', fa: 'وضعیت' }, render: (value, row) => <Badge tone={statusTone(value || row.hawala?.status)} value={value || row.hawala?.status || '-'} /> },
  { key: 'operator.username', label: { en: 'Operator', fa: 'کاربر' }, render: (value, row) => row.operator?.fullName || value || '-' },
]

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return `${formatDate(value)} ${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`
}

function accountOwner(account) {
  return account?.customer?.displayName || account?.customer?.customerCode || account?.accountCategory?.nameFa || account?.accountCategory?.nameEn || 'Internal account'
}

function operationDetailPairs(row) {
  if (!row) {
    return []
  }

  return [
    ['Entry number', row.entryNumber],
    ['Entry date', formatDateTime(row.entryDate)],
    ['Direction', row.operationDirection],
    ['Journal side', row.side],
    ['Amount', formatMoney(row.amount, row.currencyCode)],
    ['Deposit', formatMoney(row.deposit, row.currencyCode) || '-'],
    ['Withdrawal', formatMoney(row.withdrawal, row.currencyCode) || '-'],
    ['Running balance', formatMoney(row.runningBalance, row.currencyCode)],
    ['Transaction ref', row.transaction?.referenceNo],
    ['Transaction type', row.transaction?.type],
    ['Transaction status', row.transaction?.status],
    ['Payment method', row.transaction?.paymentMethod],
    ['Fee', formatMoney(row.transaction?.fee, row.transaction?.currencyCode || row.currencyCode) || '-'],
    ['Exchange rate', row.exchangeRate],
    ['Converted amount', formatMoney(row.transaction?.convertedAmount, row.transaction?.convertedCurrency) || '-'],
    ['Customer', row.transaction?.customer?.displayName || row.transaction?.customer?.customerCode],
    ['Debit account', row.debitAccount?.accountNumber],
    ['Credit account', row.creditAccount?.accountNumber],
    ['Cash fund', row.cashFund?.name],
    ['Ledger account', row.ledgerAccount ? `${row.ledgerAccount.code} - ${row.ledgerAccount.name}` : ''],
    ['Hawala', row.hawala?.externalTrackingCode || row.hawala?.trackingCode],
    ['Hawala status', row.hawala?.status],
    ['Manual', row.isManual ? 'Yes' : 'No'],
    ['Manual reason', row.manualReason],
    ['Reversed', row.isReversed ? 'Yes' : 'No'],
    ['Narration', row.narration],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '')
}

function countDirection(rows, direction) {
  return rows.filter((row) => row.operationDirection === direction).length
}

function lastRunningBalance(rows) {
  return rows[rows.length - 1]?.runningBalance || '0'
}

function readDownloadFileName(response, fallbackName) {
  const disposition = response.headers?.['content-disposition'] || ''
  const match = disposition.match(/filename="?([^"]+)"?/i)

  return match?.[1] || fallbackName
}

function openDownloadedFile(response, fallbackName) {
  const contentType = response.headers?.['content-type'] || 'application/pdf'
  const fileName = readDownloadFileName(response, fallbackName)
  const blob = new Blob([response.data], { type: contentType })
  const fileUrl = window.URL.createObjectURL(blob)
  const opened = window.open(fileUrl, '_blank', 'noopener,noreferrer')

  if (!opened) {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000)
}

export default function AccountOperationsPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const language = useUiStore((state) => state.language)
  const [account, setAccount] = useState(null)
  const [rows, setRows] = useState([])
  const [selectedRowId, setSelectedRowId] = useState('')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) || rows[0] || null,
    [rows, selectedRowId],
  )
  const detailPairs = useMemo(() => operationDetailPairs(selectedRow), [selectedRow])

  const loadOperations = useCallback(async () => {
    if (!accountId) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.get(`/api/accounts/${accountId}/operations`, { timeout: 60000 })
      const payload = extractApiData(response)
      const nextRows = payload.items || []

      setAccount(payload.account || null)
      setRows(nextRows)
      setSelectedRowId((current) => (nextRows.some((row) => row.id === current) ? current : nextRows[0]?.id || ''))
      setMessage(payload.message || text({ en: 'Account operations are ready.', fa: 'عملیات حساب آماده است.' }, language))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [accountId, language])

  const exportPdf = useCallback(async () => {
    if (!accountId) {
      return
    }

    setExporting(true)
    setError('')

    try {
      const response = await api.get(`/api/accounts/${accountId}/operations/export/pdf`, {
        responseType: 'blob',
        timeout: 60000,
      })

      openDownloadedFile(response, `account-operations-${account?.accountNumber || accountId}.pdf`)
      setMessage(text({ en: 'Account operations PDF is ready.', fa: 'PDF عملیات حساب آماده شد.' }, language))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setExporting(false)
    }
  }, [account, accountId, language])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadOperations()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadOperations])

  return (
    <PageShell
      actions={
        <>
          <PrimaryButton onClick={() => navigate('/accounts')}>
            <ArrowLeft size={16} />
            {text({ en: 'Back to accounts', fa: 'بازگشت به حساب‌ها' }, language)}
          </PrimaryButton>
          <PrimaryButton disabled={exporting || !accountId} onClick={exportPdf}>
            {exporting ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
            {text({ en: 'PDF', fa: 'PDF' }, language)}
          </PrimaryButton>
          <RefreshButton language={language} loading={loading} onClick={loadOperations} />
        </>
      }
      language={language}
      module={{
        ...accountModule,
        title: { en: 'Account operations', fa: 'عملیات حساب' },
        description: {
          en: 'All posted operations connected to this account, including deposits, withdrawals, transfers, FX exchanges, hawalas, and manual journal rows.',
          fa: 'تمام عملیات ثبت‌شده این حساب شامل واریز، برداشت، انتقال، تبدیل ارز، حواله و سندهای دستی.',
        },
      }}
    >
      <StateAlert error={error} language={language} message={message} />

      <div className="report-summary-grid account-operations-summary">
        <article>
          <span>{text({ en: 'Account', fa: 'حساب' }, language)}</span>
          <strong>{account?.accountNumber || '-'}</strong>
          <small>{accountOwner(account)}</small>
        </article>
        <article>
          <span>{text({ en: 'Currency', fa: 'ارز' }, language)}</span>
          <strong>{account?.currency?.code || '-'}</strong>
          <small>{account?.accountType || '-'}</small>
        </article>
        <article>
          <span>{text({ en: 'Operations', fa: 'عملیات' }, language)}</span>
          <strong>{rows.length}</strong>
          <small>{text({ en: 'All posted rows', fa: 'همه ردیف‌های ثبت‌شده' }, language)}</small>
        </article>
        <article>
          <span>{text({ en: 'Money in / out', fa: 'ورود / خروج' }, language)}</span>
          <strong>{countDirection(rows, 'IN')} / {countDirection(rows, 'OUT')}</strong>
          <small>{formatMoney(lastRunningBalance(rows), account?.currency?.code)}</small>
        </article>
      </div>

      <Panel
        description={{ en: 'Click any row to inspect the full operation details below.', fa: 'برای دیدن جزئیات کامل، روی ردیف کلیک کنید.' }}
        icon={ClipboardList}
        language={language}
        title={{ en: 'All account operations', fa: 'تمام عملیات حساب' }}
      >
        <DataTable
          columns={operationColumns}
          emptyText={{ en: 'No operations were posted for this account.', fa: 'برای این حساب هنوز عملیاتی ثبت نشده است.' }}
          language={language}
          onRowClick={(row) => setSelectedRowId(row.id)}
          rows={rows}
        />
      </Panel>

      <Panel
        description={{ en: 'Journal, transaction, FX, hawala, operator, and reversal details for the selected row.', fa: 'جزئیات جورنال، معامله، تبدیل ارز، حواله، کاربر و برگشت برای ردیف انتخاب‌شده.' }}
        icon={ReceiptText}
        language={language}
        title={{ en: 'Selected operation details', fa: 'جزئیات عملیات انتخاب‌شده' }}
      >
        <div className="account-operation-detail-grid">
          {detailPairs.length === 0 ? (
            <p className="ops-empty">{text({ en: 'Select an operation to see details.', fa: 'یک عملیات را انتخاب کنید.' }, language)}</p>
          ) : (
            detailPairs.map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value || '-'}</strong>
              </article>
            ))
          )}
        </div>
      </Panel>
    </PageShell>
  )
}
