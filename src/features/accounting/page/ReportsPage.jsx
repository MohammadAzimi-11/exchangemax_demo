import { Download, Eye, FileBarChart, FileText, History, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUser } from '../../../utils/currentUser.js'
import { formatAmountInWordsFa, formatDate, formatMoney } from '../../../utils/utils.js'
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

const simpleReports = [
  {
    key: 'account-statement',
    targetKey: 'accountId',
    icon: FileText,
    label: { en: 'Account statement', fa: 'صورت‌حساب حساب' },
    targetLabel: { en: 'Account', fa: 'حساب' },
    description: {
      en: 'Entries, debit, credit, running balance, hawala, and operator details for one account.',
      fa: 'تمام سندها، بدهکار، بستانکار، بیلانس جاری، حواله و کاربر مربوط به یک حساب.',
    },
  },
  {
    key: 'customer-account-statement',
    targetKey: 'customerId',
    icon: FileBarChart,
    label: { en: 'Customer statement', fa: 'صورت‌حساب مشتری' },
    targetLabel: { en: 'Customer', fa: 'مشتری' },
    description: {
      en: 'All accounts and ledger movements for one customer in a clean statement format.',
      fa: 'تمام حساب‌ها و حرکت‌های لیجر یک مشتری در قالب منظم صورت‌حساب.',
    },
  },
  {
    key: 'cash-fund-statement',
    targetKey: 'cashFundId',
    icon: FileText,
    label: { en: 'Cash fund statement', fa: 'صورت‌حساب صندوق' },
    targetLabel: { en: 'Cash fund', fa: 'صندوق' },
    description: {
      en: 'Cash fund opening balance, movements, and running balance for the selected date range.',
      fa: 'بیلانس افتتاحیه، حرکت‌ها و بیلانس جاری صندوق در محدوده تاریخ انتخاب‌شده.',
    },
  },
]

const additionalReports = [
  ['daily-cash', 'Daily Cash Report', 'Opening, current, and shift cash position by vault or float currency.'],
  ['daily-journal', 'Daily Journal Report', 'Accounting-safe daily journal rows and currency totals.'],
  ['customer-portfolio', 'Customer Portfolio Summary', 'Customer accounts and balances grouped by currency.'],
  ['profit-loss', 'Profit & Loss', 'Fee income and recorded FX gain/loss.'],
  ['currency-position', 'Currency Position', 'Net account balances and cash fund positions by currency.'],
  ['fx-rate-history', 'FX Rate History', 'Exchange-rate changes for currency pairs.'],
  ['operator-activity', 'Operator Activity Report', 'Financial activity and audit actions by operator.'],
  ['kyc-expiry', 'KYC Expiry Report', 'Customer documents expiring inside the configured window.'],
  ['customer-risk', 'Customer Risk Report', 'High-risk, PEP, watchlisted, suspended, and blacklisted customers.'],
  ['active-hawalas', 'Active Hawalas', 'Created hawalas that are not paid, returned, or cancelled.'],
  ['daily-hawala-summary', 'Daily Hawala Summary', 'Hawala count, volumes, and fee income by currency.'],
  ['hawala-fee-income', 'Hawala Fee Income', 'Hawala fee income grouped by payer currency.'],
  ['overdue-returned-hawalas', 'Overdue / Returned Hawalas', 'Overdue active hawalas plus returned hawalas.'],
  ['audit-trail', 'Audit Trail Report', 'Immutable audit actions filtered by actor, entity, and date.'],
  ['login-activity', 'Login Activity Report', 'Login, logout, and failed login audit events.'],
  ['suspicious-activity', 'Suspicious Activity Log', 'Suspicious records, hawalas, and watchlisted customers.'],
].map(([key, title, description]) => ({
  key,
  targetKey: '',
  icon: FileBarChart,
  label: { en: title },
  targetLabel: { en: 'Optional filters' },
  description: { en: description },
}))

const availableReports = [...simpleReports, ...additionalReports]

const exportFormatOptions = [
  { value: 'PDF', label: { en: 'PDF', fa: 'PDF' } },
  { value: 'XLSX', label: { en: 'Excel', fa: 'اکسل' } },
  { value: 'CSV', label: { en: 'CSV', fa: 'CSV' } },
]

const statementColumns = [
  { key: 'entryNumber', label: { en: 'Entry no.', fa: 'نمبر سند' } },
  { key: 'entryDate', label: { en: 'Date', fa: 'تاریخ' }, type: 'date' },
  { key: 'direction', label: { en: 'Direction', fa: 'جهت' }, status: true },
  { key: 'movement', label: { en: 'Movement', fa: 'حرکت' }, status: true },
  { key: 'amount', label: { en: 'Amount', fa: 'مبلغ' }, align: 'right', money: true },
  { key: 'runningBalance', label: { en: 'Running balance', fa: 'بیلانس جاری' }, align: 'right', money: true },
  { key: 'transactionReference', label: { en: 'Transaction', fa: 'معامله' } },
  { key: 'hawalaTracking', label: { en: 'Hawala', fa: 'حواله' } },
  { key: 'operator', label: { en: 'Operator', fa: 'کاربر' } },
  { key: 'narration', label: { en: 'Narration', fa: 'شرح' } },
]

const dailyTransactionColumns = [
  { key: 'referenceNo', label: { en: 'Reference', fa: 'رفرنس' } },
  { key: 'type', label: { en: 'Type', fa: 'نوع' } },
  { key: 'status', label: { en: 'Status', fa: 'حالت' }, status: true },
  { key: 'customer.displayName', label: { en: 'Customer', fa: 'مشتری' } },
  { key: 'amount', label: { en: 'Amount', fa: 'مبلغ' }, align: 'right', money: true },
  { key: 'currencyCode', label: { en: 'Currency', fa: 'ارز' } },
  { key: 'fee', label: { en: 'Fee', fa: 'فیس' }, align: 'right', money: true },
  { key: 'operator.username', label: { en: 'Operator', fa: 'کاربر' } },
  { key: 'createdAt', label: { en: 'Date', fa: 'تاریخ' }, type: 'date' },
]

const genericReportColumns = [
  { key: 'section', label: { en: 'Section', fa: 'Ø¨Ø®Ø´' } },
  { key: 'referenceNo', label: { en: 'Reference', fa: 'Ø±ÙØ±Ù†Ø³' } },
  { key: 'trackingCode', label: { en: 'Tracking', fa: 'Ú©Ø¯' } },
  { key: 'type', label: { en: 'Type', fa: 'Ù†ÙˆØ¹' } },
  { key: 'status', label: { en: 'Status', fa: 'Ø­Ø§Ù„Øª' }, status: true },
  { key: 'displayName', label: { en: 'Name', fa: 'Ù†Ø§Ù…' } },
  { key: 'amount', label: { en: 'Amount', fa: 'Ù…Ø¨Ù„Øº' }, align: 'right', money: true },
  { key: 'currencyCode', label: { en: 'Currency', fa: 'Ø§Ø±Ø²' } },
  { key: 'createdAt', label: { en: 'Date', fa: 'ØªØ§Ø±ÛŒØ®' }, type: 'date' },
]

const historyColumns = [
  { key: 'createdAt', label: { en: 'Generated', fa: 'ساخته‌شده' }, type: 'date' },
  { key: 'name', label: { en: 'Name', fa: 'نام' } },
  { key: 'reportType', label: { en: 'Report', fa: 'گزارش' } },
  { key: 'format', label: { en: 'Format', fa: 'فرمت' }, render: (value) => <Badge tone="warning" value={value} /> },
  { key: 'generatedByUser.username', label: { en: 'Generated by', fa: 'ساخته توسط' } },
]

function monthStartInput() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

function getNestedValue(record, path) {
  return path.split('.').reduce((value, key) => (value === null || value === undefined ? undefined : value[key]), record)
}

function formatCompactValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    if (value.displayName) return value.displayName
    if (value.accountNumber) return value.accountNumber
    if (value.name) return value.name

    return Object.entries(value)
      .slice(0, 4)
      .map(([key, nextValue]) => `${key}: ${formatCompactValue(nextValue)}`)
      .join(', ')
  }

  return String(value)
}

function option(value, label) {
  return { value, label }
}

function accountLabel(account) {
  const customer = account.customer?.displayName || account.customer?.customerCode || 'Customer'
  const currency = account.currency?.code || account.currencyCode || ''
  return `${account.accountNumber} - ${customer}${currency ? ` (${currency})` : ''}`
}

function customerLabel(customer) {
  return `${customer.customerCode || customer.id} - ${customer.display?.name || customer.displayName || customer.customerCode || customer.id}`
}

function cashFundLabel(cashFund) {
  return `${cashFund.name} (${cashFund.currencyCode})`
}

function mapSelectOptions(items, labelBuilder, allLabel) {
  return [option('', allLabel), ...items.map((item) => option(item.id, labelBuilder(item)))]
}

function normalizeRows(reportType, result) {
  if (!result) return []

  if (reportType === 'customer-account-statement') {
    return result.items || result.accountStatements?.flatMap((statement) => statement.items || []) || []
  }

  if (Array.isArray(result.items)) return result.items
  if (reportType === 'daily-transactions' && Array.isArray(result.transactions)) return result.transactions
  if (Array.isArray(result.summary) && !Object.values(result).some((value) => Array.isArray(value) && value !== result.summary && value.length > 0)) return result.summary

  return Object.entries(result)
    .filter(([, value]) => Array.isArray(value))
    .flatMap(([section, value]) =>
      value.map((item) => ({
        section,
        ...normalizeGenericReportRow(item),
      })),
    )
}

function normalizeGenericReportRow(item) {
  if (!item || typeof item !== 'object') {
    return { displayName: formatCompactValue(item) }
  }

  return {
    ...item,
    referenceNo: item.referenceNo || item.transactionReference || item.entryNumber || item.id || '',
    trackingCode: item.trackingCode || item.externalTrackingCode || item.hawalaTracking || '',
    displayName:
      item.displayName ||
      item.customer?.displayName ||
      item.customerName ||
      item.senderName ||
      item.receiverName ||
      item.name ||
      item.customerCode ||
      '',
    amount: item.amount || item.volume || item.totalIncome || item.currentBalance || item.balance || '',
    currencyCode: item.currencyCode || item.currency?.code || item.sendCurrency || item.receiveCurrency || '',
    createdAt: item.createdAt || item.completedAt || item.entryDate || item.openedAt || '',
  }
}

function buildSummaryRows(result) {
  if (!result) return []

  const rows = []
  if (result.account) {
    rows.push({ id: 'account', metric: { en: 'Account', fa: 'حساب' }, value: result.account.accountNumber || result.account.name || '-' })
  }
  if (result.customer) {
    rows.push({ id: 'customer', metric: { en: 'Customer', fa: 'مشتری' }, value: result.customer.displayName || result.customer.customerCode || '-' })
  }
  if (result.cashFund) {
    rows.push({ id: 'cashFund', metric: { en: 'Cash fund', fa: 'صندوق' }, value: result.cashFund.name || '-' })
  }
  if (Array.isArray(result.accountStatements)) {
    result.accountStatements.forEach((statement, index) => {
      const accountNumber = statement.account?.accountNumber || `#${index + 1}`
      const summary = statement.summary || {}

      rows.push({
        id: `statement-${statement.account?.id || index}`,
        metric: { en: `Account ${accountNumber}`, fa: `حساب ${accountNumber}` },
        value: summary.closingBalance ?? summary.currentBalance ?? '-',
        currencyCode: summary.currencyCode || statement.account?.currencyCode || '',
      })
    })
  }
  if (result.openingBalance !== undefined) {
    rows.push({ id: 'opening', metric: { en: 'Opening balance', fa: 'بیلانس افتتاحیه' }, value: result.openingBalance, currencyCode: result.currencyCode })
  }
  if (result.closingBalance !== undefined) {
    rows.push({ id: 'closing', metric: { en: 'Closing balance', fa: 'بیلانس نهایی' }, value: result.closingBalance, currencyCode: result.currencyCode })
  }
  if (Array.isArray(result.summary)) {
    result.summary.slice(0, 8).forEach((item, index) => {
      rows.push({
        id: item.id || `summary-${index}`,
        metric: item.label || item.currencyCode || item.status || item.type || `#${index + 1}`,
        value: item.value ?? item.amount ?? item.count ?? '',
        currencyCode: item.currencyCode || '',
      })
    })
  }

  return rows
}

function resolveSelectedTarget(selectedReport, filters, references) {
  if (selectedReport.targetKey === 'accountId') {
    const account = references.accounts.find((item) => item.id === filters.accountId)

    return account
      ? {
          title: account.accountNumber,
          subtitle: accountLabel(account),
          meta: [account.status, account.accountType, account.currency?.code || account.currencyCode].filter(Boolean).join(' / '),
        }
      : null
  }

  if (selectedReport.targetKey === 'customerId') {
    const customer = references.customers.find((item) => item.id === filters.customerId)

    return customer
      ? {
          title: customer.display?.name || customer.displayName || customer.customerCode,
          subtitle: customer.customerCode,
          meta: [customer.type, customer.status, customer.kycStatus].filter(Boolean).join(' / '),
        }
      : null
  }

  if (selectedReport.targetKey === 'cashFundId') {
    const cashFund = references.cashFunds.find((item) => item.id === filters.cashFundId)

    return cashFund
      ? {
          title: cashFund.name,
          subtitle: cashFund.currencyCode,
          meta: [cashFund.isVault ? 'VAULT' : 'FLOAT', cashFund.isActive === false ? 'INACTIVE' : 'ACTIVE'].join(' / '),
        }
      : null
  }

  return null
}

function toRenderableColumns(columns) {
  return columns.map((column) => ({
    ...column,
    render: (value, row, language) => {
      const nextValue = value ?? getNestedValue(row, column.key)

      if (column.status) {
        return <Badge tone={statusTone(nextValue)} value={nextValue} />
      }

      if (column.money) {
        const amountWords = formatAmountInWordsFa(nextValue, row.currencyCode)

        return (
          <span className="money-with-words">
            <strong>{formatMoney(nextValue, row.currencyCode)}</strong>
            {amountWords && <small>{amountWords}</small>}
          </span>
        )
      }

      if (column.type === 'date') {
        return formatDate(nextValue)
      }

      if (typeof nextValue === 'boolean') {
        return <Badge tone={nextValue ? 'success' : 'muted'} value={text(nextValue ? { en: 'Yes', fa: 'بلی' } : { en: 'No', fa: 'نخیر' }, language)} />
      }

      return formatCompactValue(nextValue)
    },
  }))
}

function readDownloadFileName(response, fallbackName) {
  const disposition = response.headers?.['content-disposition'] || ''
  const match = disposition.match(/filename="?([^"]+)"?/i)

  return match?.[1] || fallbackName
}

async function downloadReportFile(reportId, fallbackName = 'report.pdf') {
  const response = await api.get(`/api/reports/history/${reportId}/download`, {
    responseType: 'blob',
    timeout: 60000,
  })
  const contentType = response.headers?.['content-type'] || 'application/octet-stream'
  const fileName = readDownloadFileName(response, fallbackName)
  const blob = new Blob([response.data], { type: contentType })
  const fileUrl = window.URL.createObjectURL(blob)

  if (contentType.includes('pdf')) {
    const opened = window.open(fileUrl, '_blank', 'noopener,noreferrer')

    if (opened) {
      window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000)
      return
    }
  }

  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000)
}

function requiredMessage(selectedReport, language) {
  return text(
    {
      en: `Please choose ${text(selectedReport.targetLabel, 'en')} before creating this report.`,
      fa: `لطفا اول ${text(selectedReport.targetLabel, 'fa')} را انتخاب کنید.`,
    },
    language,
  )
}

export default function ReportsPage() {
  const language = useUiStore((state) => state.language)
  const sourceModule = modules.find((item) => item.key === 'reports')
  const module = useMemo(
    () => ({
      ...sourceModule,
      title: { en: 'Reports', fa: 'گزارش‌ها' },
      description: {
        en: 'Create account statements and finance exports with a simple workflow.',
        fa: 'صورت‌حساب‌ها و خروجی‌های مالی را با روش ساده بسازید.',
      },
    }),
    [sourceModule],
  )

  const [selectedReportType, setSelectedReportType] = useState('account-statement')
  const [filters, setFilters] = useState({
    from: monthStartInput(),
    to: todayInput(),
    accountId: '',
    customerId: '',
    cashFundId: '',
    limit: '250',
  })
  const [format, setFormat] = useState('PDF')
  const [references, setReferences] = useState({ accounts: [], cashFunds: [], customers: [] })
  const [reportPayload, setReportPayload] = useState(null)
  const [historyItems, setHistoryItems] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const selectedReport = availableReports.find((item) => item.key === selectedReportType) || availableReports[0]
  const missingRequired = Boolean(selectedReport.targetKey && !filters[selectedReport.targetKey])
  const resultRows = normalizeRows(selectedReportType, reportPayload?.result)
  const summaryRows = buildSummaryRows(reportPayload?.result)
  const selectedTarget = resolveSelectedTarget(selectedReport, filters, references)
  const isStatementPreview = ['account-statement', 'customer-account-statement', 'cash-fund-statement'].includes(selectedReportType)
  const isTransactionPreview = ['daily-transactions', 'pending-transactions', 'reversed-transactions', 'large-transactions'].includes(selectedReportType)
  const resultColumns = toRenderableColumns(
    isStatementPreview ? statementColumns : isTransactionPreview ? dailyTransactionColumns : genericReportColumns,
  )
  const summaryColumns = toRenderableColumns([
    { key: 'metric', label: { en: 'Metric', fa: 'شاخص' }, render: (value, row, language) => text(row.metric, language) || row.metric },
    {
      key: 'value',
      label: { en: 'Value', fa: 'مقدار' },
      align: 'right',
      render: (value, row) => {
        if (!row.currencyCode) {
          return formatCompactValue(value)
        }

        const amountWords = formatAmountInWordsFa(value, row.currencyCode)

        return (
          <span className="money-with-words">
            <strong>{formatMoney(value, row.currencyCode)}</strong>
            {amountWords && <small>{amountWords}</small>}
          </span>
        )
      },
    },
  ])

  const accountOptions = useMemo(
    () => mapSelectOptions(references.accounts, accountLabel, { en: 'Choose account', fa: 'انتخاب حساب' }),
    [references.accounts],
  )
  const customerOptions = useMemo(
    () => mapSelectOptions(references.customers, customerLabel, { en: 'Choose customer', fa: 'انتخاب مشتری' }),
    [references.customers],
  )
  const cashFundOptions = useMemo(
    () => mapSelectOptions(references.cashFunds, cashFundLabel, { en: 'Choose cash fund', fa: 'انتخاب صندوق' }),
    [references.cashFunds],
  )

  const loadReferences = useCallback(async () => {
    const [accounts, cashFunds, customers] = await Promise.allSettled([
      api.get('/api/accounts', { params: { limit: 500 } }),
      api.get('/api/cash-funds', { params: { limit: 500 } }),
      api.get('/api/customers', { params: { limit: 500 } }),
    ])

    setReferences({
      accounts: accounts.status === 'fulfilled' ? getItems(extractApiData(accounts.value)) : [],
      cashFunds: cashFunds.status === 'fulfilled' ? getItems(extractApiData(cashFunds.value)) : [],
      customers: customers.status === 'fulfilled' ? getItems(extractApiData(customers.value)) : [],
    })
  }, [])

  const loadHistory = useCallback(async () => {
    const response = await api.get('/api/reports/history', {
      params: cleanParams({ reportType: selectedReportType, limit: 25 }),
    })
    setHistoryItems(getItems(extractApiData(response)))
  }, [selectedReportType])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      await Promise.all([loadReferences(), loadHistory()])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [loadHistory, loadReferences])

  useEffect(() => {
    const timer = window.setTimeout(refreshAll, 0)
    return () => window.clearTimeout(timer)
  }, [refreshAll])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function selectReport(reportType) {
    setSelectedReportType(reportType.key)
    setReportPayload(null)
    setMessage('')
    setError('')
    setFilters((current) => ({
      ...current,
      accountId: reportType.targetKey === 'accountId' ? current.accountId : '',
      customerId: reportType.targetKey === 'customerId' ? current.customerId : '',
      cashFundId: reportType.targetKey === 'cashFundId' ? current.cashFundId : '',
    }))
  }

  function buildReportFilters() {
    const baseFilters = {
      from: filters.from,
      to: filters.to,
      limit: filters.limit,
    }

    if (selectedReport.targetKey) {
      baseFilters[selectedReport.targetKey] = filters[selectedReport.targetKey]
    }

    return cleanParams(baseFilters)
  }

  async function runReport() {
    if (missingRequired) {
      setError(requiredMessage(selectedReport, language))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.get(`/api/reports/${selectedReportType}`, {
        params: buildReportFilters(),
        timeout: 60000,
      })
      const payload = extractApiData(response)
      setReportPayload(payload)
      setMessage(payload.message || text({ en: 'Report is ready.', fa: 'گزارش آماده شد.' }, language))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function exportReport() {
    if (missingRequired) {
      setError(requiredMessage(selectedReport, language))
      return
    }

    setExporting(true)
    setError('')

    try {
      const actor = await getCurrentUser()
      const response = await api.post(`/api/reports/${selectedReportType}/export`, {
        generatedBy: actor.id,
        format,
        filters: buildReportFilters(),
      }, {
        timeout: 60000,
      })
      const payload = extractApiData(response)
      setReportPayload({
        result: payload.result,
        report: payload.report,
        generatedAt: payload.report?.createdAt || new Date().toISOString(),
        state: 'configured',
        canExport: true,
      })
      setMessage(payload.message || text({ en: 'Report export created. The file is opening now.', fa: 'خروجی گزارش ساخته شد و فایل باز می‌شود.' }, language))
      await loadHistory()
      if (payload.report?.id) {
        await downloadReportFile(payload.report.id, `${selectedReportType}.${format.toLowerCase()}`)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setExporting(false)
    }
  }

  function targetField() {
    if (selectedReport.targetKey === 'accountId') {
      return <Field label={{ en: 'Account', fa: 'حساب' }} language={language} onChange={(value) => updateFilter('accountId', value)} options={accountOptions} type="select" value={filters.accountId} />
    }

    if (selectedReport.targetKey === 'customerId') {
      return <Field label={{ en: 'Customer', fa: 'مشتری' }} language={language} onChange={(value) => updateFilter('customerId', value)} options={customerOptions} type="select" value={filters.customerId} />
    }

    if (selectedReport.targetKey === 'cashFundId') {
      return <Field label={{ en: 'Cash fund', fa: 'صندوق' }} language={language} onChange={(value) => updateFilter('cashFundId', value)} options={cashFundOptions} type="select" value={filters.cashFundId} />
    }

    return null
  }

  return (
    <PageShell actions={<RefreshButton language={language} loading={loading} onClick={refreshAll} />} language={language} module={module} notes={[]}>
      <div className="report-workspace simple-report-workspace">
        <Panel
          description={{
            en: 'Choose one report, select the needed record, then preview or download the file. PDF is selected by default.',
            fa: 'یک گزارش را انتخاب کنید، حساب یا مورد لازم را تعیین کنید، سپس نمایش یا دانلود فایل را بزنید. PDF به صورت پیش‌فرض انتخاب است.',
          }}
          icon={FileBarChart}
          language={language}
          title={{ en: 'Simple report builder', fa: 'ساخت گزارش ساده' }}
        >
          <div className="simple-report-grid">
            {availableReports.map((reportType) => {
              const Icon = reportType.icon
              return (
                <button
                  className={selectedReportType === reportType.key ? 'simple-report-card active' : 'simple-report-card'}
                  key={reportType.key}
                  onClick={() => selectReport(reportType)}
                  type="button"
                >
                  <Icon size={18} />
                  <strong>{text(reportType.label, language)}</strong>
                  <span>{text(reportType.description, language)}</span>
                </button>
              )
            })}
          </div>

          <div className="simple-report-form">
            {targetField()}
            <Field label={{ en: 'From', fa: 'از تاریخ' }} language={language} onChange={(value) => updateFilter('from', value)} type="date" value={filters.from} />
            <Field label={{ en: 'To', fa: 'تا تاریخ' }} language={language} onChange={(value) => updateFilter('to', value)} type="date" value={filters.to} />
            <Field label={{ en: 'Rows', fa: 'تعداد ردیف' }} language={language} onChange={(value) => updateFilter('limit', value)} type="number" value={filters.limit} />
            <Field label={{ en: 'Output', fa: 'خروجی' }} language={language} onChange={setFormat} options={exportFormatOptions} type="select" value={format} />
          </div>

          <div className="simple-report-actions">
            <PrimaryButton disabled={loading} onClick={runReport}>
              <Eye size={16} />
              {text({ en: 'Preview', fa: 'نمایش' }, language)}
            </PrimaryButton>
            <PrimaryButton disabled={exporting} onClick={exportReport}>
              {exporting ? <RefreshCw className="spin" size={16} /> : <Download size={16} />}
              {text({ en: `Download ${format}`, fa: `دانلود ${format}` }, language)}
            </PrimaryButton>
          </div>

          <StateAlert error={error} message={message} state={reportPayload?.state} />
        </Panel>

        <div className="report-summary-grid simple-report-meta">
          <article>
            <span>{text({ en: 'Selected report', fa: 'گزارش انتخاب‌شده' }, language)}</span>
            <strong>{text(selectedReport.label, language)}</strong>
            <small>{selectedReportType}</small>
          </article>
          <article>
            <span>{text({ en: 'Rows', fa: 'ردیف‌ها' }, language)}</span>
            <strong>{resultRows.length}</strong>
            <small>{text({ en: 'Preview result', fa: 'نتیجه نمایش' }, language)}</small>
          </article>
          <article>
            <span>{text({ en: 'Format', fa: 'فرمت' }, language)}</span>
            <strong>{format}</strong>
            <small>{text({ en: 'PDF is recommended', fa: 'PDF پیشنهاد می‌شود' }, language)}</small>
          </article>
          <article>
            <span>{text({ en: 'Date range', fa: 'محدوده تاریخ' }, language)}</span>
            <strong>{filters.from || '-'}</strong>
            <small>{filters.to || '-'}</small>
          </article>
          {selectedReport.targetKey && (
            <article>
              <span>{text(selectedReport.targetLabel, language)}</span>
              <strong>{selectedTarget?.title || '-'}</strong>
              <small>
                {selectedTarget
                  ? `${selectedTarget.subtitle} ${selectedTarget.meta ? `- ${selectedTarget.meta}` : ''}`
                  : text({ en: 'No record selected', fa: 'Ù…ÙˆØ±Ø¯ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ù†Ø´Ø¯Ù‡' }, language)}
              </small>
            </article>
          )}
        </div>

        <Panel icon={FileText} language={language} title={{ en: 'Preview', fa: 'نمایش گزارش' }}>
          <DataTable
            columns={resultColumns}
            emptyText={{ en: 'Choose filters and click Preview, or click Download to create the file directly.', fa: 'فیلترها را انتخاب کنید و نمایش را بزنید، یا مستقیم دانلود را بزنید تا فایل ساخته شود.' }}
            language={language}
            rows={resultRows}
          />
        </Panel>

        <Panel icon={FileBarChart} language={language} title={{ en: 'Summary', fa: 'خلاصه' }}>
          <DataTable
            columns={summaryColumns}
            emptyText={{ en: 'No summary yet.', fa: 'هنوز خلاصه‌ای وجود ندارد.' }}
            language={language}
            rows={summaryRows}
          />
        </Panel>

        <Panel
          actions={<RefreshButton language={language} loading={loading} onClick={loadHistory} />}
          description={{
            en: 'Every created file remains here for downloading again.',
            fa: 'هر فایلی که ساخته شود اینجا می‌ماند تا دوباره دانلود شود.',
          }}
          icon={History}
          language={language}
          title={{ en: 'Recent exports', fa: 'خروجی‌های اخیر' }}
        >
          <DataTable
            columns={historyColumns}
            emptyText={{ en: 'No exports for this report yet.', fa: 'برای این گزارش هنوز خروجی ساخته نشده است.' }}
            language={language}
            rowActions={[
              {
                icon: Download,
                label: { en: 'Download', fa: 'دانلود' },
                onClick: (row) => {
                  void downloadReportFile(row.id, `${row.reportType || 'report'}.${String(row.format || 'pdf').toLowerCase()}`)
                },
              },
            ]}
            rows={historyItems}
          />
        </Panel>
      </div>
    </PageShell>
  )
}
