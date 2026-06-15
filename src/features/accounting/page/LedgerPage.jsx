import { BookOpen, CalendarDays, ClipboardList, Download, Edit3, Landmark, Plus, Save, Trash2, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUser, isAdminOrManager } from '../../../utils/currentUser.js'
import { hasAreaAccess } from '../../../utils/accessControl.js'
import { formatAmountInWordsFa, formatMoney } from '../../../utils/utils.js'
import {
  Badge,
  DataTable,
  Field,
  PageShell,
  Panel,
  PrimaryButton,
  RefreshButton,
  StateAlert,
  Tabs,
} from '../../shared/components/OperationsUI.jsx'
import { extractApiData, getItems } from '../../shared/components/operations-data.js'

const blankOption = { value: '', label: { en: 'All', fa: 'همه' } }
const chooseOption = { value: '', label: { en: 'Choose...', fa: 'انتخاب کنید...' } }
const EDIT_LEVELS = new Set(['EDIT', 'DELETE', 'FULL'])
const DELETE_LEVELS = new Set(['DELETE', 'FULL'])

const manualSideTypes = [
  { value: 'accountId', label: { en: 'Customer account', fa: 'حساب مشتری' } },
  { value: 'cashFundId', label: { en: 'Cash fund / vault', fa: 'صندوق نقد / خزانه' } },
  { value: 'label', label: { en: 'Control label only', fa: 'فقط برچسب کنترلی' } },
]

function entryDirectionLabel(value) {
  return value === 'DEBIT'
    ? { en: 'Debit', fa: 'بدهکار' }
    : { en: 'Credit', fa: 'بستانکار' }
}

function MoneyWithWords({ currencyCode, value }) {
  const amountWords = formatAmountInWordsFa(value, currencyCode)

  return (
    <span className="money-with-words">
      <strong>{formatMoney(value, currencyCode)}</strong>
      {amountWords && <small>{amountWords}</small>}
    </span>
  )
}

const dailyJournalColumns = [
  { key: 'referenceNo', label: { en: 'Reference', fa: 'رفرنس' } },
  { key: 'completedAt', label: { en: 'Time', fa: 'زمان' }, type: 'date' },
  {
    key: 'type',
    label: { en: 'Type', fa: 'نوع' },
    render: (value) => <Badge tone="muted" value={value} />,
  },
  {
    key: 'status',
    label: { en: 'Status', fa: 'حالت' },
    render: (value) => <Badge tone={value === 'COMPLETED' ? 'success' : value === 'REVERSED' ? 'danger' : 'warning'} value={value} />,
  },
  { key: 'debitAccount.accountNumber', label: { en: 'Debit account', fa: 'حساب بدهکار' } },
  { key: 'creditAccount.accountNumber', label: { en: 'Credit account', fa: 'حساب بستانکار' } },
  { key: 'customer.displayName', label: { en: 'Customer', fa: 'مشتری' } },
  {
    key: 'amount',
    label: { en: 'Amount', fa: 'مبلغ' },
    align: 'right',
    render: (value, row) => <MoneyWithWords currencyCode={row.currencyCode} value={value} />,
  },
  { key: 'currencyCode', label: { en: 'Currency', fa: 'ارز' } },
  { key: 'exchangeRate', label: { en: 'Rate', fa: 'نرخ' } },
  { key: 'fee', label: { en: 'Fee', fa: 'فیس' }, align: 'right' },
  { key: 'operator.username', label: { en: 'Created by', fa: 'ثبت‌کننده' } },
  { key: 'narration', label: { en: 'Description', fa: 'شرح' } },
]

const statementColumns = [
  { key: 'entryNumber', label: { en: 'Entry no.', fa: 'نمبر سند' } },
  { key: 'entryDate', label: { en: 'Date', fa: 'تاریخ' }, type: 'date' },
  {
    key: 'direction',
    label: { en: 'Direction', fa: 'جهت' },
    render: (value, _row, language) => (
      <Badge tone={value === 'DEBIT' ? 'warning' : 'success'} value={text(entryDirectionLabel(value), language)} />
    ),
  },
  {
    key: 'amount',
    label: { en: 'Amount', fa: 'مبلغ' },
    align: 'right',
    render: (value, row) => <MoneyWithWords currencyCode={row.currencyCode} value={value} />,
  },
  {
    key: 'runningBalance',
    label: { en: 'Running balance', fa: 'بیلانس جاری' },
    align: 'right',
    render: (value, row) => <MoneyWithWords currencyCode={row.currencyCode} value={value} />,
  },
  { key: 'transaction.referenceNo', label: { en: 'Transaction', fa: 'معامله' } },
  { key: 'hawala.trackingCode', label: { en: 'Hawala', fa: 'حواله' } },
  { key: 'narration', label: { en: 'Narration', fa: 'شرح' } },
]

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

function monthStartInput() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

function buildManualSide(type, value) {
  return {
    accountId: type === 'accountId' ? value : null,
    cashFundId: type === 'cashFundId' ? value : null,
    label: type === 'label' ? value : null,
  }
}

function mapOptions(items, labelBuilder, includeBlank = true) {
  const options = items.map((item) => ({
    value: item.id,
    label: labelBuilder(item),
  }))

  return includeBlank ? [blankOption, ...options] : [chooseOption, ...options]
}

function accountLabel(account) {
  const customer = account.customer?.displayName || account.customer?.customerCode || 'Customer'
  const currency = account.currency?.code || ''
  return `${account.accountNumber} - ${customer}${currency ? ` (${currency})` : ''}`
}

function cashFundLabel(cashFund) {
  return `${cashFund.name} (${cashFund.currencyCode})`
}

function accountCurrency(account) {
  return account.currency?.code || account.currencyCode || ''
}

function filterAccountOptionsByCurrency(accounts, currencyCode, { excludeId, includeBlank = false } = {}) {
  const filteredAccounts = accounts.filter((account) => {
    if (excludeId && account.id === excludeId) {
      return false
    }

    return !currencyCode || accountCurrency(account) === currencyCode
  })

  return mapOptions(filteredAccounts, accountLabel, includeBlank)
}

function filterCashFundOptionsByCurrency(cashFunds, currencyCode) {
  const filteredCashFunds = cashFunds.filter((cashFund) => !currencyCode || cashFund.currencyCode === currencyCode)
  return mapOptions(filteredCashFunds, cashFundLabel, false)
}

function inferExchangeDestinationCashFundId(row) {
  if (row.type !== 'EXCHANGE') {
    return ''
  }

  const destinationEntry = (row.journalEntries || []).find(
    (entry) => entry.entryType === 'DEBIT' && entry.cashFund?.id && entry.currencyCode !== row.currencyCode,
  )

  return destinationEntry?.cashFund?.id || ''
}

function userLabel(user) {
  return `${user.username} - ${user.fullName || user.role}`
}

export default function LedgerPage() {
  const language = useUiStore((state) => state.language)
  const module = modules.find((item) => item.key === 'ledger')
  const [activeTab, setActiveTab] = useState('journal')
  const [references, setReferences] = useState({
    accounts: [],
    cashFunds: [],
    currencies: [],
    customers: [],
    users: [],
  })
  const [entries, setEntries] = useState([])
  const [dailySummary, setDailySummary] = useState(null)
  const [dailyMeta, setDailyMeta] = useState(null)
  const [journalDate, setJournalDate] = useState(todayInput())
  const [journalSearch, setJournalSearch] = useState('')
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [editForm, setEditForm] = useState({
    debitAccountId: '',
    creditAccountId: '',
    destinationKind: 'account',
    destinationCashFundId: '',
    amount: '',
    currencyCode: '',
    exchangeRate: '',
    fee: '',
    paymentMethod: '',
    narration: '',
    reason: '',
  })
  const [statement, setStatement] = useState(null)
  const [statementTarget, setStatementTarget] = useState({
    type: 'account',
    accountId: '',
    cashFundId: '',
    from: monthStartInput(),
    to: todayInput(),
  })
  const [statementPrint, setStatementPrint] = useState({
    copies: '1',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [manualEntry, setManualEntry] = useState({
    currencyCode: '',
    amount: '',
    entryDate: todayInput(),
    debitType: 'accountId',
    debitValue: '',
    creditType: 'cashFundId',
    creditValue: '',
    manualReason: '',
  })
  const [currentUser, setCurrentUser] = useState(null)

  const adminManagerUsers = references.users.filter((user) => user.isActive && ['ADMIN', 'MANAGER'].includes(user.role))
  const activeCurrencies = references.currencies.filter((currency) => currency.isActive)
  const accountOptions = mapOptions(references.accounts, accountLabel, false)
  const cashFundOptions = mapOptions(references.cashFunds, cashFundLabel, false)
  const currencyOptions = [
    chooseOption,
    ...activeCurrencies.map((currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
    })),
  ]
  const editSourceAccountOptions = filterAccountOptionsByCurrency(references.accounts, editForm.currencyCode)
  const editCreditAccountOptions =
    editingTransaction?.type === 'EXCHANGE'
      ? mapOptions(
          references.accounts.filter((account) => account.id !== editForm.debitAccountId),
          accountLabel,
          false,
        )
      : filterAccountOptionsByCurrency(references.accounts, editForm.currencyCode, {
          excludeId: editForm.debitAccountId,
        })
  const editDestinationCashFundOptions = filterCashFundOptionsByCurrency(
    references.cashFunds,
    editingTransaction?.type === 'EXCHANGE' ? '' : editForm.currencyCode,
  )
  const currentUserLabel = currentUser ? userLabel(currentUser) : language === 'fa' ? 'در حال تشخیص...' : 'Detecting...'
  const currentUserCanPostManual = isAdminOrManager(currentUser)
  const canEditJournal = hasAreaAccess(currentUser, 'transactionEdit', EDIT_LEVELS)
  const canDeleteJournal = hasAreaAccess(currentUser, 'transactionReverse', DELETE_LEVELS)
  const journalIsToday = journalDate === todayInput()
  const journalReadOnly = !journalIsToday

  const manualReady =
    currentUserCanPostManual &&
    manualEntry.currencyCode &&
    manualEntry.amount &&
    manualEntry.debitValue &&
    manualEntry.creditValue &&
    manualEntry.manualReason
  const manualBlockedMessage = getManualBlockedMessage({
    adminManagerUsers,
    activeCurrencies,
    accounts: references.accounts,
    cashFunds: references.cashFunds,
    currentUser,
    language,
  })

  const notes = useMemo(
    () => [
      {
        title: { en: 'Immutable journal', fa: 'ژورنال غیرقابل تغییر' },
        body: {
          en: 'Posted rows are read-only. Corrections must be posted as a new counter entry.',
          fa: 'سطرهای ثبت‌شده فقط خواندنی‌اند. اصلاح باید با سند جدید و معکوس ثبت شود.',
        },
      },
      {
        title: { en: 'Automatic first', fa: 'اول خودکار' },
        body: {
          en: 'Deposits, withdrawals, transfers, exchange, hawala, and vault movements already create journal rows.',
          fa: 'واریز، برداشت، انتقال، تبادله، حواله و حرکت صندوق خودکار سند ژورنال می‌سازند.',
        },
      },
      {
        title: { en: 'Manual is restricted', fa: 'سند دستی محدود است' },
        body: {
          en: 'Manual journal entries require an active Admin or Manager and a mandatory reason.',
          fa: 'سند دستی به کاربر فعال مدیر یا ادمین و دلیل الزامی نیاز دارد.',
        },
      },
    ],
    [],
  )

  const tabs = [
    { key: 'journal', label: { en: 'Journal', fa: 'ژورنال' }, icon: ClipboardList },
    { key: 'statement', label: { en: 'Statement', fa: 'صورت‌حساب' }, icon: WalletCards },
    { key: 'manual', label: { en: 'Manual entry', fa: 'سند دستی' }, icon: Plus },
  ]

  const loadReferences = useCallback(async () => {
    const [accountResponse, cashFundResponse, currencyResponse, customerResponse, userResponse, detectedUser] = await Promise.all([
      api.get('/api/accounts', { params: { limit: 200 } }),
      api.get('/api/cash-funds', { params: { fundType: 'ALL', limit: 200 } }),
      api.get('/api/settings/currencies'),
      api.get('/api/customers', { params: { limit: 200 } }),
      api.get('/api/identity', { params: { includeHidden: true, limit: 200 } }),
      getCurrentUser().catch(() => null),
    ])

    const nextReferences = {
      accounts: getItems(extractApiData(accountResponse)),
      cashFunds: getItems(extractApiData(cashFundResponse)),
      currencies: getItems(extractApiData(currencyResponse)),
      customers: getItems(extractApiData(customerResponse)),
      users: getItems(extractApiData(userResponse)),
    }

    setCurrentUser(detectedUser)
    setReferences(nextReferences)
    setManualEntry((current) => ({
      ...current,
      currencyCode: current.currencyCode || nextReferences.currencies.find((currency) => currency.isActive)?.code || '',
      debitValue: current.debitValue || nextReferences.accounts[0]?.id || '',
      creditValue: current.creditValue || nextReferences.cashFunds[0]?.id || '',
    }))
    setStatementTarget((current) => ({
      ...current,
      accountId: current.accountId || nextReferences.accounts[0]?.id || '',
      cashFundId: current.cashFundId || nextReferences.cashFunds[0]?.id || '',
    }))
    setStatementPrint((current) => ({
      ...current,
    }))
  }, [])

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/ledger/daily-journal', {
        params: cleanParams({
          date: journalDate,
          search: journalSearch,
          pageSize: 100,
        }),
      })
      const payload = extractApiData(response)

      setEntries(getItems(payload))
      setDailySummary(payload?.summary || null)
      setDailyMeta(payload || null)
      setMessage(payload?.message || '')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [journalDate, journalSearch])

  const loadStatement = useCallback(async () => {
    const selectedId = statementTarget.type === 'account' ? statementTarget.accountId : statementTarget.cashFundId

    if (!selectedId) {
      setStatement(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const basePath =
        statementTarget.type === 'account'
          ? `/api/ledger/accounts/${selectedId}/statement`
          : `/api/ledger/cash-funds/${selectedId}/statement`
      const response = await api.get(basePath, {
        params: cleanParams({
          from: statementTarget.from,
          to: statementTarget.to,
        }),
      })

      setStatement(extractApiData(response))
      setMessage('')
    } catch (requestError) {
      setStatement(null)
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [statementTarget])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReferences().catch((requestError) => setError(requestError.message))
      loadEntries()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadEntries, loadReferences])

  useEffect(() => {
    if (activeTab !== 'statement') {
      return undefined
    }

    const timer = window.setTimeout(loadStatement, 0)
    return () => window.clearTimeout(timer)
  }, [activeTab, loadStatement])

  function updateStatementTarget(key, value) {
    setStatementTarget((current) => ({ ...current, [key]: value }))
  }

  function updateStatementPrint(key, value) {
    setStatementPrint((current) => ({ ...current, [key]: value }))
  }

  function updateManualEntry(key, value) {
    setManualEntry((current) => ({ ...current, [key]: value }))
  }

  function updateManualSide(typeKey, valueKey, type) {
    const options = type === 'accountId' ? references.accounts : type === 'cashFundId' ? references.cashFunds : []

    setManualEntry((current) => ({
      ...current,
      [typeKey]: type,
      [valueKey]: options[0]?.id || '',
    }))
  }

  async function saveManualEntry() {
    if (!manualReady) {
      setError(language === 'fa' ? 'برای ثبت سند دستی، همه بخش‌های الزامی را تکمیل کنید.' : 'Complete the required manual entry fields first.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const actor = await getCurrentUser({ predicate: isAdminOrManager })
      await api.post('/api/ledger/manual-entries', {
        operatorId: actor.id,
        currencyCode: manualEntry.currencyCode,
        amount: manualEntry.amount,
        entryDate: manualEntry.entryDate,
        manualReason: manualEntry.manualReason,
        debit: buildManualSide(manualEntry.debitType, manualEntry.debitValue),
        credit: buildManualSide(manualEntry.creditType, manualEntry.creditValue),
      })

      setMessage(language === 'fa' ? 'سند دستی ثبت شد.' : 'Manual journal entry created.')
      setManualEntry((current) => ({ ...current, amount: '', manualReason: '' }))
      loadEntries()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function queueStatementPrint() {
    if (statementTarget.type !== 'account' || !statementTarget.accountId) {
      setError(language === 'fa' ? 'برای چاپ صورت‌حساب، حساب را انتخاب کنید.' : 'Choose an account first.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const actor = await getCurrentUser()
      const response = await api.post(
        `/api/ledger/accounts/${statementTarget.accountId}/statement/print`,
        {
          printedById: actor.id,
          copies: Number(statementPrint.copies || 1),
        },
        {
          params: cleanParams({
            from: statementTarget.from,
            to: statementTarget.to,
          }),
        },
      )
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'چاپ صورت‌حساب در صف قرار گرفت.' : 'Statement print job queued.'))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditTransaction(row) {
    const destinationCashFundId = inferExchangeDestinationCashFundId(row)

    setEditingTransaction(row)
    setEditForm({
      debitAccountId: row.debitAccountId || '',
      creditAccountId: row.creditAccountId || '',
      destinationKind: destinationCashFundId ? 'cashFund' : 'account',
      destinationCashFundId,
      amount: row.amount || '',
      currencyCode: row.currencyCode || '',
      exchangeRate: row.exchangeRate || '',
      fee: row.fee || '',
      paymentMethod: row.paymentMethod || '',
      narration: row.narration || '',
      reason: '',
    })
  }

  function updateEditForm(key, value) {
    setEditForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'currencyCode') {
        next.debitAccountId = ''
        next.creditAccountId = ''
        if (editingTransaction?.type !== 'EXCHANGE') {
          next.destinationCashFundId = ''
        }
      }

      if (key === 'debitAccountId' && current.creditAccountId === value) {
        next.creditAccountId = ''
      }

      if (key === 'destinationKind') {
        next.creditAccountId = ''
        next.destinationCashFundId = ''
      }

      return next
    })
  }

  async function saveEditedTransaction() {
    if (!editingTransaction) {
      return
    }

    const missingEditField =
      !editForm.amount ||
      !editForm.currencyCode ||
      (editingTransaction.type === 'DEPOSIT' && !editForm.creditAccountId) ||
      (editingTransaction.type === 'WITHDRAWAL' && !editForm.debitAccountId) ||
      (editingTransaction.type === 'TRANSFER' && (!editForm.debitAccountId || !editForm.creditAccountId)) ||
      (editingTransaction.type === 'EXCHANGE' &&
        (!editForm.debitAccountId ||
          (editForm.destinationKind === 'cashFund' ? !editForm.destinationCashFundId : !editForm.creditAccountId)))

    if (missingEditField) {
      setError(language === 'fa' ? 'برای اصلاح ژورنال، فیلدهای لازم همین نوع معامله را کامل کنید.' : 'Complete the required fields for this transaction type before saving.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        amount: editForm.amount,
        currencyCode: editForm.currencyCode,
        fee: editForm.fee || '0',
        paymentMethod: editForm.paymentMethod || undefined,
        narration: editForm.narration,
        reason: editForm.reason || 'Edited from daily journal.',
      }

      if (editingTransaction.type === 'DEPOSIT') {
        payload.creditAccountId = editForm.creditAccountId
      }

      if (editingTransaction.type === 'WITHDRAWAL') {
        payload.debitAccountId = editForm.debitAccountId
      }

      if (editingTransaction.type === 'TRANSFER') {
        payload.debitAccountId = editForm.debitAccountId
        payload.creditAccountId = editForm.creditAccountId
      }

      if (editingTransaction.type === 'EXCHANGE') {
        payload.debitAccountId = editForm.debitAccountId
        payload.overrideRate = editForm.exchangeRate || undefined

        if (editForm.destinationKind === 'cashFund') {
          payload.destinationCashFundId = editForm.destinationCashFundId
        } else {
          payload.creditAccountId = editForm.creditAccountId
        }
      }

      await api.patch(`/api/transactions/${editingTransaction.id}/journal`, payload)
      setMessage(language === 'fa' ? 'معامله با اثر حسابداری درست اصلاح شد.' : 'Transaction edited and reposted safely.')
      setEditingTransaction(null)
      await loadEntries()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteJournalTransaction(row) {
    const confirmed = window.confirm(
      language === 'fa'
        ? 'این عمل معامله را با سند معکوس حذف می‌کند و روی حساب‌ها، بیلانس‌ها و گزارش‌ها اثر دارد. ادامه می‌دهید؟'
        : 'This will delete the transaction by posting a reversal and will affect accounts, balances, ledgers, and reports. Continue?',
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.delete(`/api/transactions/${row.id}/journal`, {
        data: {
          reason: 'Deleted from daily journal.',
        },
      })
      setMessage(language === 'fa' ? 'معامله با سند معکوس حذف شد.' : 'Transaction deleted by reversal.')
      await loadEntries()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function exportDailyJournalPdf() {
    setSaving(true)
    setError('')

    try {
      const actor = await getCurrentUser()
      const response = await api.post('/api/reports/daily-journal/export', {
        generatedBy: actor.id,
        format: 'PDF',
        filters: {
          date: journalDate,
          limit: 500,
        },
      })
      const payload = extractApiData(response)

      if (payload.report?.id) {
        const download = await api.get(`/api/reports/history/${payload.report.id}/download`, {
          responseType: 'blob',
        })
        const fileUrl = window.URL.createObjectURL(new Blob([download.data], { type: 'application/pdf' }))
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
      }

      setMessage(language === 'fa' ? 'گزارش PDF ژورنال روزانه ساخته شد.' : 'Daily journal PDF generated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function renderManualValueField(sideType, valueKey, label) {
    if (sideType === 'label') {
      return (
        <Field
          label={label}
          language={language}
          onChange={(value) => updateManualEntry(valueKey, value)}
          value={manualEntry[valueKey]}
        />
      )
    }

    return (
      <Field
        label={label}
        language={language}
        onChange={(value) => updateManualEntry(valueKey, value)}
        options={sideType === 'accountId' ? accountOptions : cashFundOptions}
        type="select"
        value={manualEntry[valueKey]}
      />
    )
  }

  function renderEditAccountFields() {
    if (!editingTransaction) {
      return null
    }

    if (editingTransaction.type === 'DEPOSIT') {
      return (
        <Field label={{ en: 'Deposit account', fa: 'حساب واریز' }} language={language} onChange={(value) => updateEditForm('creditAccountId', value)} options={editSourceAccountOptions} type="select" value={editForm.creditAccountId} />
      )
    }

    if (editingTransaction.type === 'WITHDRAWAL') {
      return (
        <Field label={{ en: 'Withdrawal account', fa: 'حساب برداشت' }} language={language} onChange={(value) => updateEditForm('debitAccountId', value)} options={editSourceAccountOptions} type="select" value={editForm.debitAccountId} />
      )
    }

    if (editingTransaction.type === 'TRANSFER') {
      return (
        <>
          <Field label={{ en: 'From account', fa: 'از حساب' }} language={language} onChange={(value) => updateEditForm('debitAccountId', value)} options={editSourceAccountOptions} type="select" value={editForm.debitAccountId} />
          <Field label={{ en: 'To account', fa: 'به حساب' }} language={language} onChange={(value) => updateEditForm('creditAccountId', value)} options={editCreditAccountOptions} type="select" value={editForm.creditAccountId} />
        </>
      )
    }

    if (editingTransaction.type === 'EXCHANGE') {
      return (
        <>
          <Field label={{ en: 'Source account', fa: 'حساب مبدا' }} language={language} onChange={(value) => updateEditForm('debitAccountId', value)} options={editSourceAccountOptions} type="select" value={editForm.debitAccountId} />
          <Field
            label={{ en: 'Destination type', fa: 'نوع مقصد' }}
            language={language}
            onChange={(value) => updateEditForm('destinationKind', value)}
            options={[
              { value: 'account', label: { en: 'Customer account', fa: 'حساب مشتری' } },
              { value: 'cashFund', label: { en: 'Cash fund / vault', fa: 'صندوق / خزانه' } },
            ]}
            type="select"
            value={editForm.destinationKind}
          />
          {editForm.destinationKind === 'cashFund' ? (
            <Field label={{ en: 'Destination cash fund', fa: 'صندوق مقصد' }} language={language} onChange={(value) => updateEditForm('destinationCashFundId', value)} options={editDestinationCashFundOptions} type="select" value={editForm.destinationCashFundId} />
          ) : (
            <Field label={{ en: 'Destination account', fa: 'حساب مقصد' }} language={language} onChange={(value) => updateEditForm('creditAccountId', value)} options={editCreditAccountOptions} type="select" value={editForm.creditAccountId} />
          )}
        </>
      )
    }

    return null
  }

  function renderEditTransactionPanel() {
    if (!editingTransaction) {
      return null
    }

    return (
      <div className="ops-subpanel">
        <h3>{language === 'fa' ? 'اصلاح معامله' : 'Edit transaction'}</h3>
        <div className="ops-form-grid five">
          <Field disabled label={{ en: 'Reference', fa: 'رفرنس' }} language={language} onChange={() => {}} value={editingTransaction.referenceNo} />
          <Field disabled label={{ en: 'Transaction type', fa: 'نوع معامله' }} language={language} onChange={() => {}} value={editingTransaction.type} />
          <Field label={{ en: 'Currency', fa: 'ارز' }} language={language} onChange={(value) => updateEditForm('currencyCode', value)} options={currencyOptions} type="select" value={editForm.currencyCode} />
          {renderEditAccountFields()}
          <Field label={{ en: 'Amount', fa: 'مبلغ' }} language={language} onChange={(value) => updateEditForm('amount', value)} type="number" value={editForm.amount} />
          {editingTransaction.type === 'EXCHANGE' && (
            <Field label={{ en: 'Exchange rate', fa: 'نرخ تبادله' }} language={language} onChange={(value) => updateEditForm('exchangeRate', value)} type="number" value={editForm.exchangeRate} />
          )}
          <Field label={{ en: 'Fee', fa: 'فیس' }} language={language} onChange={(value) => updateEditForm('fee', value)} type="number" value={editForm.fee} />
          <Field label={{ en: 'Payment method', fa: 'روش پرداخت' }} language={language} onChange={(value) => updateEditForm('paymentMethod', value)} options={[blankOption, { value: 'CASH', label: 'CASH' }, { value: 'BANK_TRANSFER', label: 'BANK_TRANSFER' }, { value: 'CHEQUE', label: 'CHEQUE' }, { value: 'INTERNAL', label: 'INTERNAL' }]} type="select" value={editForm.paymentMethod} />
          <Field label={{ en: 'Edit reason', fa: 'دلیل اصلاح' }} language={language} onChange={(value) => updateEditForm('reason', value)} value={editForm.reason} />
          <Field full label={{ en: 'Description', fa: 'شرح' }} language={language} onChange={(value) => updateEditForm('narration', value)} type="textarea" value={editForm.narration} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={saveEditedTransaction}>
            <Save size={16} />
            {language === 'fa' ? 'ثبت اصلاح' : 'Save edit'}
          </PrimaryButton>
          <button className="ops-button" onClick={() => setEditingTransaction(null)} type="button">
            {language === 'fa' ? 'لغو' : 'Cancel'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <PageShell
      actions={<RefreshButton language={language} loading={loading} onClick={activeTab === 'statement' ? loadStatement : loadEntries} />}
      language={language}
      module={module}
      notes={notes}
    >
      <Tabs activeTab={activeTab} language={language} onChange={setActiveTab} tabs={tabs} />

      {activeTab === 'journal' && (
        <Panel
          actions={
            <PrimaryButton disabled={saving} onClick={exportDailyJournalPdf}>
              <Download size={16} />
              {language === 'fa' ? 'PDF روزانه' : 'Daily PDF'}
            </PrimaryButton>
          }
          icon={BookOpen}
          language={language}
          title={{ en: 'Daily journal', fa: 'ژورنال روزانه' }}
        >
          <div className="ops-form-grid five">
            <Field label={{ en: 'Selected date', fa: 'تاریخ انتخاب‌شده' }} language={language} onChange={setJournalDate} type="date" value={journalDate} />
            <Field label={{ en: 'Search', fa: 'جستجو' }} language={language} onChange={setJournalSearch} value={journalSearch} />
            <Field disabled label={{ en: 'Business timezone', fa: 'منطقه زمانی کاری' }} language={language} onChange={() => {}} value={dailyMeta?.timeZone || 'Asia/Kabul'} />
            <Field disabled label={{ en: 'Transactions', fa: 'معاملات' }} language={language} onChange={() => {}} value={String(dailySummary?.transactionCount ?? entries.length)} />
            <div className="ops-actions-row">
              <PrimaryButton disabled={loading} onClick={() => setJournalDate(todayInput())}>
                <CalendarDays size={16} />
                {language === 'fa' ? 'امروز' : 'Today'}
              </PrimaryButton>
            </div>
          </div>

          <DailyJournalSummary language={language} summary={dailySummary} />
          {journalReadOnly && (
            <StateAlert
              message={language === 'fa' ? 'روزهای قبلی فقط برای مشاهده هستند؛ اصلاح و حذف فقط برای معاملات امروز فعال است.' : 'Previous dates are read-only. Edit and delete actions are enabled only for today.'}
            />
          )}
          <StateAlert error={error} message={message} />
          {renderEditTransactionPanel()}
          <DataTable
            columns={dailyJournalColumns}
            emptyText={{ en: 'No transactions found for the selected date.', fa: 'برای این تاریخ معامله‌ای پیدا نشد.' }}
            language={language}
            rowActions={[
              {
                disabled: (row) => journalReadOnly || !canEditJournal || row.status !== 'COMPLETED' || row.type === 'REVERSAL',
                icon: Edit3,
                label: { en: 'Edit', fa: 'اصلاح' },
                onClick: startEditTransaction,
              },
              {
                disabled: (row) => journalReadOnly || !canDeleteJournal || row.status !== 'COMPLETED' || row.type === 'REVERSAL',
                icon: Trash2,
                label: { en: 'Delete', fa: 'حذف' },
                onClick: deleteJournalTransaction,
              },
            ]}
            rows={entries}
          />

        </Panel>
      )}

      {activeTab === 'statement' && (
        <Panel
          description={{
            en: 'Choose an account or vault to see opening, running, and closing balance for the selected period.',
            fa: 'یک حساب یا صندوق را انتخاب کنید تا بیلانس افتتاحیه، جریان و ختم دوره دیده شود.',
          }}
          icon={WalletCards}
          language={language}
          title={{ en: 'Ledger statement', fa: 'صورت‌حساب لیجر' }}
        >
          <div className="ops-form-grid five">
            <Field
              label={{ en: 'Statement type', fa: 'نوع صورت‌حساب' }}
              language={language}
              onChange={(value) => updateStatementTarget('type', value)}
              options={[
                { value: 'account', label: { en: 'Customer account', fa: 'حساب مشتری' } },
                { value: 'cashFund', label: { en: 'Cash fund', fa: 'صندوق نقد' } },
              ]}
              type="select"
              value={statementTarget.type}
            />
            <Field
              label={{ en: 'Account', fa: 'حساب' }}
              language={language}
              onChange={(value) => updateStatementTarget('accountId', value)}
              options={accountOptions}
              type="select"
              value={statementTarget.accountId}
              disabled={statementTarget.type !== 'account'}
            />
            <Field
              label={{ en: 'Cash fund', fa: 'صندوق' }}
              language={language}
              onChange={(value) => updateStatementTarget('cashFundId', value)}
              options={cashFundOptions}
              type="select"
              value={statementTarget.cashFundId}
              disabled={statementTarget.type !== 'cashFund'}
            />
            <Field label={{ en: 'From', fa: 'از تاریخ' }} language={language} onChange={(value) => updateStatementTarget('from', value)} type="date" value={statementTarget.from} />
            <Field label={{ en: 'To', fa: 'تا تاریخ' }} language={language} onChange={(value) => updateStatementTarget('to', value)} type="date" value={statementTarget.to} />
          </div>
          <div className="ops-actions-row">
            <PrimaryButton disabled={loading || (statementTarget.type === 'account' ? !statementTarget.accountId : !statementTarget.cashFundId)} onClick={loadStatement}>
              <Landmark size={16} />
              {language === 'fa' ? 'نمایش صورت‌حساب' : 'Load statement'}
            </PrimaryButton>
          </div>
          {statementTarget.type === 'account' && (
            <div className="ops-form-grid three">
              <Field disabled label={{ en: 'Print operator', fa: 'کاربر چاپ‌کننده' }} language={language} onChange={() => {}} value={currentUserLabel} />
              <Field label={{ en: 'Copies', fa: 'کاپی' }} language={language} onChange={(value) => updateStatementPrint('copies', value)} type="number" value={statementPrint.copies} />
              <div className="ops-actions-row">
                <PrimaryButton disabled={saving || !statementTarget.accountId} onClick={queueStatementPrint}>
                  <Save size={16} />
                  {language === 'fa' ? 'صف چاپ صورت‌حساب' : 'Queue statement print'}
                </PrimaryButton>
              </div>
            </div>
          )}
          <StatementSummary language={language} statement={statement} />
          <StateAlert error={error} message={!statement ? (language === 'fa' ? 'برای نمایش صورت‌حساب، یک حساب یا صندوق انتخاب کنید.' : 'Choose an account or cash fund to load a statement.') : ''} />
          <DataTable columns={statementColumns} language={language} rows={statement?.statement?.items || []} />
        </Panel>
      )}

      {activeTab === 'manual' && (
        <Panel
          description={{
            en: 'Use only for real accounting corrections. Normal operations already post journal rows automatically.',
            fa: 'فقط برای اصلاح حسابداری واقعی استفاده شود. عملیات عادی خودکار سند ژورنال می‌سازند.',
          }}
          icon={Plus}
          language={language}
          title={{ en: 'Manual journal entry', fa: 'سند دستی ژورنال' }}
        >
          <StateAlert error={manualBlockedMessage ? null : error} message={manualBlockedMessage} />
          <div className="ops-form-grid four">
            <Field disabled label={{ en: 'Admin / manager', fa: 'ادمین / مدیر' }} language={language} onChange={() => {}} value={currentUserLabel} />
            <Field label={{ en: 'Currency', fa: 'ارز' }} language={language} onChange={(value) => updateManualEntry('currencyCode', value)} options={currencyOptions} type="select" value={manualEntry.currencyCode} />
            <Field amountCurrencyCode={manualEntry.currencyCode} label={{ en: 'Amount', fa: 'مبلغ' }} language={language} onChange={(value) => updateManualEntry('amount', value)} showAmountInWords type="number" value={manualEntry.amount} />
            <Field label={{ en: 'Entry date', fa: 'تاریخ سند' }} language={language} onChange={(value) => updateManualEntry('entryDate', value)} type="date" value={manualEntry.entryDate} />
            <Field label={{ en: 'Debit target', fa: 'طرف بدهکار' }} language={language} onChange={(value) => updateManualSide('debitType', 'debitValue', value)} options={manualSideTypes} type="select" value={manualEntry.debitType} />
            {renderManualValueField(manualEntry.debitType, 'debitValue', { en: 'Debit value', fa: 'مقدار بدهکار' })}
            <Field label={{ en: 'Credit target', fa: 'طرف بستانکار' }} language={language} onChange={(value) => updateManualSide('creditType', 'creditValue', value)} options={manualSideTypes} type="select" value={manualEntry.creditType} />
            {renderManualValueField(manualEntry.creditType, 'creditValue', { en: 'Credit value', fa: 'مقدار بستانکار' })}
            <Field full label={{ en: 'Mandatory reason', fa: 'دلیل الزامی' }} language={language} onChange={(value) => updateManualEntry('manualReason', value)} type="textarea" value={manualEntry.manualReason} />
          </div>
          <div className="ops-actions-row">
            <PrimaryButton disabled={saving || Boolean(manualBlockedMessage) || !manualReady} onClick={saveManualEntry}>
              <Save size={16} />
              {saving ? (language === 'fa' ? 'در حال ثبت...' : 'Saving...') : language === 'fa' ? 'ثبت سند دستی' : 'Create manual entry'}
            </PrimaryButton>
          </div>
          <StateAlert error={manualBlockedMessage ? error : null} message={message} />
        </Panel>
      )}
    </PageShell>
  )
}

function DailyJournalSummary({ language, summary }) {
  if (!summary) {
    return null
  }

  return (
    <div className="ops-note-grid">
      <article>
        <strong>{language === 'fa' ? 'تعداد معاملات' : 'Transactions'}</strong>
        <span>{summary.transactionCount || 0}</span>
      </article>
      <article>
        <strong>{language === 'fa' ? 'سطرهای ژورنال' : 'Journal lines'}</strong>
        <span>{summary.entryCount || 0}</span>
      </article>
      {(summary.totalsByCurrency || []).map((item) => (
        <article key={item.currencyCode}>
          <strong>{item.currencyCode}</strong>
          <span>
            {language === 'fa' ? 'بدهکار' : 'Debit'} {formatMoney(item.totalDebit, item.currencyCode)}
          </span>
          <small>
            {language === 'fa' ? 'بستانکار' : 'Credit'} {formatMoney(item.totalCredit, item.currencyCode)}
          </small>
        </article>
      ))}
    </div>
  )
}

function StatementSummary({ language, statement }) {
  if (!statement) {
    return null
  }

  const target = statement.account || statement.cashFund
  const currencyCode = statement.account?.currency?.code || statement.cashFund?.currencyCode

  return (
    <div className="ops-note-grid">
      <article>
        <strong>{language === 'fa' ? 'هدف' : 'Target'}</strong>
        <span>{target?.accountNumber || target?.name || '-'}</span>
      </article>
      <article>
        <strong>{language === 'fa' ? 'بیلانس افتتاحیه' : 'Opening balance'}</strong>
        <span>{formatMoney(statement.statement?.openingBalance || 0, currencyCode)}</span>
        <small className="amount-in-words">{formatAmountInWordsFa(statement.statement?.openingBalance || 0, currencyCode)}</small>
      </article>
      <article>
        <strong>{language === 'fa' ? 'بیلانس ختم' : 'Closing balance'}</strong>
        <span>{formatMoney(statement.statement?.closingBalance || 0, currencyCode)}</span>
        <small className="amount-in-words">{formatAmountInWordsFa(statement.statement?.closingBalance || 0, currencyCode)}</small>
      </article>
    </div>
  )
}

function getManualBlockedMessage({ accounts, activeCurrencies, adminManagerUsers, cashFunds, currentUser, language }) {
  if (!currentUser) {
    return language === 'fa'
      ? 'کاربر فعال سیستم تشخیص نشد. اول یک کاربر فعال بسازید یا فعال کنید.'
      : 'No active system user was detected. Create or activate a staff user first.'
  }

  if (!isAdminOrManager(currentUser)) {
    return language === 'fa'
      ? 'ثبت سند دستی فقط با کاربر فعال ADMIN یا MANAGER مجاز است.'
      : 'Manual journal entries require the current user to be ADMIN or MANAGER.'
  }

  if (adminManagerUsers.length === 0) {
    return language === 'fa'
      ? 'برای سند دستی باید حداقل یک کاربر فعال با نقش ADMIN یا MANAGER ساخته شود.'
      : 'Create at least one active ADMIN or MANAGER user before posting manual journal entries.'
  }

  if (activeCurrencies.length === 0) {
    return language === 'fa'
      ? 'برای سند دستی باید حداقل یک ارز فعال در تنظیمات شرکت وجود داشته باشد.'
      : 'Create at least one active currency in settings before posting manual journal entries.'
  }

  if (accounts.length === 0 && cashFunds.length === 0) {
    return language === 'fa'
      ? 'برای سند دستی باید حداقل یک حساب مشتری یا صندوق نقد موجود باشد.'
      : 'Create at least one customer account or cash fund before posting manual journal entries.'
  }

  return ''
}
