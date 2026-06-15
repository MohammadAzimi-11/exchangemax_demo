import { Building2, Check, Coins, FileText, MapPin, Pencil, Plus, Printer, RotateCcw, Save, Settings, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUserId } from '../../../utils/currentUser.js'
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
import { extractApiData, getItems, statusTone } from '../../shared/components/operations-data.js'

const transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'EXCHANGE', 'REVERSAL', 'ADJUSTMENT', 'VAULT_IN', 'VAULT_OUT', 'HAWALA_SEND', 'HAWALA_PAY', 'HAWALA_RETURN', 'HAWALA_SETTLE']
const feeTransactionTypes = [...transactionTypes, 'FEE']
const printDocumentTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'EXCHANGE', 'REVERSAL', 'HAWALA_SEND', 'HAWALA_PAY', 'HAWALA_RETURN', 'DAILY_CASH_SUMMARY', 'ACCOUNT_STATEMENT']
const customerTypes = ['INDIVIDUAL', 'CORPORATE', 'VIP', 'AGENT', 'INSTITUTIONAL']
const userRoles = ['ADMIN', 'MANAGER', 'OPERATOR', 'AUDITOR', 'CUSTOM']

const settingsTabs = [
  { key: 'tradingCities', label: { en: 'Trading cities', fa: 'شهرها و شعبات معامله' }, icon: MapPin },
  { key: 'company', label: { en: 'System identity', fa: 'نام و لوگوی سیستم' }, icon: Building2 },
  { key: 'system', label: { en: 'System settings', fa: 'تنظیمات سیستم' }, icon: Settings },
  { key: 'numbering', label: { en: 'Account types', fa: 'نوعیت حساب' }, icon: SlidersHorizontal },
  { key: 'currencies', label: { en: 'Currencies', fa: 'مدیریت ارزها' }, icon: Coins },
  { key: 'printer', label: { en: 'Printing', fa: 'چاپ و رسید' }, icon: Printer },
  { key: 'fees', label: { en: 'Fees', fa: 'فیس‌ها' }, icon: FileText },
]

const currencyColumns = [
  { key: 'code', label: { en: 'Code', fa: 'کود' } },
  { key: 'name', label: { en: 'Name', fa: 'نام' } },
  { key: 'symbol', label: { en: 'Symbol', fa: 'نشانه' } },
  { key: 'decimalPlaces', label: { en: 'Decimals', fa: 'اعشار' } },
  { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
]

const printJobColumns = [
  { key: 'documentType', label: { en: 'Document', fa: 'سند' } },
  { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: (value) => <Badge tone={statusTone(value)} value={value} /> },
  { key: 'copies', label: { en: 'Copies', fa: 'کاپی' } },
  { key: 'printerName', label: { en: 'Printer', fa: 'پرنتر' } },
  { key: 'transaction.referenceNo', label: { en: 'Transaction', fa: 'معامله' } },
  { key: 'hawala.trackingCode', label: { en: 'Hawala', fa: 'حواله' } },
  { key: 'createdAt', label: { en: 'Queued', fa: 'صف' }, type: 'date' },
]

const feeColumns = [
  { key: 'currencyCode', label: { en: 'Currency', fa: 'ارز' } },
  { key: 'transactionType', label: { en: 'Type', fa: 'نوع' } },
  { key: 'feeType', label: { en: 'Fee type', fa: 'نوع فیس' } },
  { key: 'feeValue', label: { en: 'Value', fa: 'مقدار' } },
  { key: 'minFee', label: { en: 'Min', fa: 'حداقل' } },
  { key: 'maxFee', label: { en: 'Max', fa: 'حداکثر' } },
  { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
]

const transactionLimitColumns = [
  { key: 'customerType', label: { en: 'Customer type', fa: 'نوع مشتری' } },
  { key: 'transactionType', label: { en: 'Transaction', fa: 'معامله' } },
  { key: 'currencyCode', label: { en: 'Currency', fa: 'ارز' } },
  { key: 'perTransactionLimit', label: { en: 'Per transaction', fa: 'حد هر معامله' } },
  { key: 'dailyLimit', label: { en: 'Daily', fa: 'حد روزانه' } },
  { key: 'monthlyLimit', label: { en: 'Monthly', fa: 'حد ماهانه' } },
  { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
]

const tradingCityColumns = [
  { key: 'title', label: { en: 'Title', fa: 'عنوان' } },
  { key: 'cityName', label: { en: 'City', fa: 'شهر' } },
  { key: 'branchName', label: { en: 'Branch / agency', fa: 'نمایندگی / شعبه' } },
  { key: 'managerName', label: { en: 'Branch manager', fa: 'مسئول شعبه' } },
  { key: 'phone', label: { en: 'Phone', fa: 'شماره تماس' } },
  { key: 'customer.displayName', label: { en: 'Linked customer', fa: 'مشتری مرتبط' } },
  { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
]

function mapCompanyProfile(profile = {}) {
  return {
    name: profile.name || '',
    legalName: profile.legalName || '',
    registrationNo: profile.registrationNo || '',
    taxId: profile.taxId || '',
    address: profile.address || '',
    phone: profile.phone || '',
    email: profile.email || '',
    logoPath: profile.logoPath || '',
    defaultCurrency: profile.defaultCurrency || 'AFG',
    timezone: profile.timezone || 'Asia/Kabul',
    workingHoursFrom: profile.workingHours?.from || '',
    workingHoursTo: profile.workingHours?.to || '',
  }
}

function mapCurrencyForm(defaultCode = 'AFG') {
  const code = defaultCode || 'AFG'

  return {
    code,
    name: code === 'AFG' || code === 'AFN' ? 'Afghani' : code,
    symbol: code,
    symbolPosition: 'before',
    decimalPlaces: '2',
    isActive: true,
  }
}

function mapFeeForm(item = {}, defaultCurrency = 'AFG') {
  return {
    currencyCode: item.currencyCode || defaultCurrency || 'AFG',
    transactionType: item.transactionType || 'DEPOSIT',
    feeType: item.feeType || 'flat',
    feeValue: item.feeValue || '0',
    minFee: item.minFee || '',
    maxFee: item.maxFee || '',
    isActive: item.isActive ?? true,
  }
}

function mapTransactionLimitForm(item = {}, defaultCurrency = 'AFG') {
  return {
    customerType: item.customerType || 'INDIVIDUAL',
    transactionType: item.transactionType || 'DEPOSIT',
    currencyCode: item.currencyCode || defaultCurrency || 'AFG',
    perTransactionLimit: item.perTransactionLimit || '0',
    dailyLimit: item.dailyLimit || '0',
    monthlyLimit: item.monthlyLimit || '0',
    isActive: item.isActive ?? true,
  }
}

function mapSystemConfig(config = {}) {
  const sessionTimeoutMinutes = config.security?.sessionTimeoutMinutes || {}
  const twoFactorRequired = config.security?.twoFactorRequired || {}

  return {
    themeColor: config.display?.themeColor || '#2faabc',
    fontColor: config.display?.fontColor || '#000000',
    fontFamily: config.display?.fontFamily || 'Yekan',
    fontSize: String(config.display?.fontSize || 14),
    decimalPlaces: String(config.display?.decimalPlaces || 2),
    thousandsSeparator: config.display?.thousandsSeparator ?? true,
    persianDigits: config.display?.persianDigits ?? false,
    defaultLanguage: config.display?.defaultLanguage || 'fa',
    allowNegativeChequeClearance: config.accountingPolicy?.allowNegativeChequeClearance ?? false,
    allowOverCreditLimit: config.accountingPolicy?.allowOverCreditLimit ?? false,
    allowOverDebitLimit: config.accountingPolicy?.allowOverDebitLimit ?? false,
    payWhenInsufficientBalance: config.accountingPolicy?.payWhenInsufficientBalance ?? false,
    hawalaTrackingPrefix: config.hawala?.trackingPrefix || 'HW',
    hawalaTrackingPadding: String(config.hawala?.trackingPadding || 4),
    hawalaDeadlineDays: String(config.hawala?.collectionDeadlineDays || 7),
    loginRequired: config.security?.loginRequired ?? false,
    passwordMinLength: String(config.security?.passwordMinLength || 8),
    passwordRequireUppercase: config.security?.passwordRequireUppercase ?? true,
    passwordRequireNumber: config.security?.passwordRequireNumber ?? true,
    passwordExpiryDays: String(config.security?.passwordExpiryDays || 0),
    failedLoginLockThreshold: String(config.security?.failedLoginLockThreshold || 5),
    failedLoginLockMinutes: String(config.security?.failedLoginLockMinutes || 15),
    sessionTimeoutMinutes: Object.fromEntries(userRoles.map((role) => [role, String(sessionTimeoutMinutes[role] || (role === 'OPERATOR' || role === 'CUSTOM' ? 30 : 60))])),
    twoFactorRequired: Object.fromEntries(userRoles.map((role) => [role, twoFactorRequired[role] ?? false])),
    printerConnectionType: config.printer?.connectionType || 'USB',
    printerUsbName: config.printer?.usbName || '',
    printerNetworkHost: config.printer?.networkHost || '',
    printerNetworkPort: String(config.printer?.networkPort || 9100),
    printerFooterText: config.printer?.footerText || '',
    largeTransactionAmount: config.notifications?.largeTransactionAmount || '10000',
    kycExpiryDays: String(config.notifications?.kycExpiryDays || 30),
    hawalaOverdueDays: String(config.notifications?.hawalaOverdueDays || 0),
    backupNoSuccessHours: String(config.notifications?.backupNoSuccessHours || 25),
    backupSchedule: config.backup?.schedule || 'DAILY',
    backupStorageType: config.backup?.storageType || 'local',
    backupRetentionCount: String(config.backup?.retentionCount || 30),
  }
}

function mapTransactionConfig(config = {}) {
  const referencePrefix = config.transactions?.referencePrefix || {}

  return {
    accountPrefix: config.accounts?.numberPrefix || 'ACC',
    accountPadding: String(config.accounts?.numberPadding || 6),
    referencePadding: String(config.transactions?.referencePadding || 8),
    referencePrefix: Object.fromEntries(transactionTypes.map((type) => [type, referencePrefix[type] || type.slice(0, 3)])),
    autoQueue: config.printing?.autoQueue || {},
    defaultCopies: config.printing?.defaultCopies || {},
  }
}

function mapTradingCityForm(item = {}) {
  return {
    title: item.title || '',
    cityName: item.cityName || '',
    branchName: item.branchName || '',
    managerName: item.managerName || '',
    phone: item.phone || '',
    customerId: item.customerId || '',
    officeAddress: item.officeAddress || '',
    notes: item.notes || '',
    isActive: item.isActive ?? true,
  }
}

export default function SettingsPage() {
  const language = useUiStore((state) => state.language)
  const setCompanyProfile = useUiStore((state) => state.setCompanyProfile)
  const setSystemDisplay = useUiStore((state) => state.setSystemDisplay)
  const module = modules.find((item) => item.key === 'settings')
  const [companyForm, setCompanyForm] = useState(mapCompanyProfile())
  const [companyState, setCompanyState] = useState(null)
  const [systemForm, setSystemForm] = useState(mapSystemConfig())
  const [transactionForm, setTransactionForm] = useState(mapTransactionConfig())
  const [currencyForm, setCurrencyForm] = useState(mapCurrencyForm())
  const [tradingCityForm, setTradingCityForm] = useState(mapTradingCityForm())
  const [feeForm, setFeeForm] = useState(mapFeeForm())
  const [transactionLimitForm, setTransactionLimitForm] = useState(mapTransactionLimitForm())
  const [editingTradingCityId, setEditingTradingCityId] = useState(null)
  const [currencies, setCurrencies] = useState([])
  const [tradingCities, setTradingCities] = useState([])
  const [transactionLimits, setTransactionLimits] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [printJobs, setPrintJobs] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('company')

  const notes = useMemo(
    () => [
      {
        title: { en: 'System defaults first', fa: 'اول پیش‌فرض سیستم' },
        body: {
          en: 'The form is filled from backend defaults, so only changed policies need attention.',
          fa: 'فرم از پیش‌فرض‌های بک‌اند پر می‌شود؛ فقط پالیسی‌های تغییرکرده نیاز به توجه دارند.',
        },
      },
      {
        title: { en: 'Accounting-safe numbering', fa: 'شماره‌گذاری امن حسابداری' },
        body: {
          en: 'Account and transaction reference formats are centralized here so users do not type codes manually.',
          fa: 'فرمت حساب و مرجع معامله اینجا مرکزی است تا کاربر کدها را دستی وارد نکند.',
        },
      },
      {
        title: { en: 'Print queue visibility', fa: 'نمایش صف چاپ' },
        body: {
          en: 'Receipts are queued by backend posting services; hardware integration can be added later.',
          fa: 'رسیدها توسط سرویس‌های ثبت مالی در صف چاپ می‌روند؛ اتصال سخت‌افزار بعدا اضافه می‌شود.',
        },
      },
    ],
    [],
  )

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [companyResponse, currencyResponse, tradingCityResponse, customerResponse, systemResponse, transactionResponse, transactionLimitResponse, feeResponse, printResponse] = await Promise.all([
        api.get('/api/company'),
        api.get('/api/settings/currencies'),
        api.get('/api/settings/trading-cities'),
        api.get('/api/customers', { params: { status: 'ACTIVE' } }),
        api.get('/api/settings/system-config'),
        api.get('/api/settings/transaction-config'),
        api.get('/api/settings/transaction-limits'),
        api.get('/api/settings/fee-structures'),
        api.get('/api/settings/print-jobs', { params: { limit: 50 } }),
      ])
      const companyPayload = extractApiData(companyResponse)
      const currencyPayload = extractApiData(currencyResponse)
      const tradingCityPayload = extractApiData(tradingCityResponse)
      const customerPayload = extractApiData(customerResponse)
      const systemPayload = extractApiData(systemResponse)
      const transactionPayload = extractApiData(transactionResponse)
      const transactionLimitPayload = extractApiData(transactionLimitResponse)
      const feePayload = extractApiData(feeResponse)
      const printPayload = extractApiData(printResponse)

      setCompanyForm(mapCompanyProfile(companyPayload.profile))
      setCompanyProfile(companyPayload.profile)
      setCompanyState(companyPayload)
      setCurrencies(getItems(currencyPayload))
      setTradingCities(getItems(tradingCityPayload))
      setCustomerOptions(
        getItems(customerPayload).map((item) => ({
          value: item.id,
          label: `${item.customerCode} - ${item.display?.name || item.customerCode}`,
        })),
      )
      setCurrencyForm(mapCurrencyForm(companyPayload.profile?.defaultCurrency || 'AFG'))
      setSystemForm(mapSystemConfig(systemPayload.config))
      setSystemDisplay(systemPayload.config?.display)
      setTransactionForm(mapTransactionConfig(transactionPayload.config))
      setTransactionLimits(getItems(transactionLimitPayload))
      setFeeStructures(getItems(feePayload))
      setPrintJobs(getItems(printPayload))
      setMessage(systemPayload.message || transactionPayload.message || '')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [setCompanyProfile, setSystemDisplay])

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0)
    return () => window.clearTimeout(timer)
  }, [loadSettings])

  function updateCompany(key, value) {
    setCompanyForm((current) => ({
      ...current,
      [key]: key === 'defaultCurrency' ? value.toUpperCase() : value,
    }))
  }

  function updateCurrency(key, value) {
    setCurrencyForm((current) => ({
      ...current,
      [key]: key === 'code' || key === 'symbol' ? value.toUpperCase() : value,
    }))
  }

  function updateSystem(key, value) {
    setSystemForm((current) => ({ ...current, [key]: value }))
  }

  function updateRoleSystem(groupKey, role, value) {
    setSystemForm((current) => ({
      ...current,
      [groupKey]: {
        ...current[groupKey],
        [role]: value,
      },
    }))
  }

  function updateTransaction(key, value) {
    setTransactionForm((current) => ({ ...current, [key]: value }))
  }

  function updatePrintDefault(groupKey, type, value) {
    setTransactionForm((current) => ({
      ...current,
      [groupKey]: {
        ...current[groupKey],
        [type]: value,
      },
    }))
  }

  function updateTradingCity(key, value) {
    setTradingCityForm((current) => ({ ...current, [key]: value }))
  }

  function updateFee(key, value) {
    setFeeForm((current) => ({
      ...current,
      [key]: key === 'currencyCode' ? value.toUpperCase() : value,
    }))
  }

  function updateTransactionLimit(key, value) {
    setTransactionLimitForm((current) => ({
      ...current,
      [key]: key === 'currencyCode' ? value.toUpperCase() : value,
    }))
  }

  function resetTradingCityForm() {
    setTradingCityForm(mapTradingCityForm())
    setEditingTradingCityId(null)
  }

  function startEditingTradingCity(item) {
    setTradingCityForm(mapTradingCityForm(item))
    setEditingTradingCityId(item.id)
    setActiveSettingsTab('tradingCities')
  }

  function startEditingFee(item) {
    setFeeForm(mapFeeForm(item, companyForm.defaultCurrency))
  }

  function startEditingCurrency(item) {
    setCurrencyForm({
      code: item.code || '',
      name: item.name || '',
      symbol: item.symbol || item.code || '',
      symbolPosition: item.symbolPosition || 'before',
      decimalPlaces: String(item.decimalPlaces ?? 2),
      isActive: item.isActive ?? true,
    })
  }

  function startEditingTransactionLimit(item) {
    setTransactionLimitForm(mapTransactionLimitForm(item, companyForm.defaultCurrency))
  }

  async function uploadLocalFile(file) {
    if (!(file instanceof File)) {
      return file || ''
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const uploadedFile = response.data?.data || response.data

    return uploadedFile.relativePath || uploadedFile.url || uploadedFile.fileName
  }

  function updateReferencePrefix(type, value) {
    setTransactionForm((current) => ({
      ...current,
      referencePrefix: {
        ...current.referencePrefix,
        [type]: value.toUpperCase(),
      },
    }))
  }

  async function saveTradingCity() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const response = editingTradingCityId
        ? await api.put(`/api/settings/trading-cities/${editingTradingCityId}`, {
            ...tradingCityForm,
            customerId: tradingCityForm.customerId || null,
            updatedById: currentUserId,
          })
        : await api.post('/api/settings/trading-cities', {
            ...tradingCityForm,
            customerId: tradingCityForm.customerId || null,
            createdById: currentUserId,
          })
      const payload = extractApiData(response)
      setMessage(
        payload.message ||
          (language === 'fa'
            ? editingTradingCityId
              ? 'شهر معامله‌ای ویرایش شد.'
              : 'شهر معامله‌ای ثبت شد.'
            : editingTradingCityId
              ? 'Trading city updated.'
              : 'Trading city saved.'),
      )
      resetTradingCityForm()
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveCompanyProfile() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const logoPath = await uploadLocalFile(companyForm.logoPath)
      const workingHours =
        companyForm.workingHoursFrom && companyForm.workingHoursTo
          ? { from: companyForm.workingHoursFrom, to: companyForm.workingHoursTo }
          : null
      const response = await api.put('/api/company', {
        name: companyForm.name,
        legalName: companyForm.legalName,
        registrationNo: companyForm.registrationNo,
        taxId: companyForm.taxId,
        address: companyForm.address,
        phone: companyForm.phone,
        email: companyForm.email,
        logoPath,
        defaultCurrency: companyForm.defaultCurrency,
        timezone: companyForm.timezone,
        workingHours,
        updatedById: currentUserId,
      })
      const payload = extractApiData(response)
      setCompanyProfile(payload.profile)
      setMessage(payload.message || (language === 'fa' ? 'اطلاعات شرکت ذخیره شد.' : 'Company profile saved.'))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveCurrency() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const response = await api.post('/api/settings/currencies', {
        code: currencyForm.code,
        name: currencyForm.name,
        symbol: currencyForm.symbol,
        symbolPosition: currencyForm.symbolPosition,
        decimalPlaces: Number(currencyForm.decimalPlaces),
        isActive: currencyForm.isActive,
        createdById: currentUserId,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'ارز ذخیره شد.' : 'Currency saved.'))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function seedDefaultCurrencies() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const response = await api.post('/api/settings/currencies/seed-defaults', {
        operatorId: currentUserId,
      })
      const payload = extractApiData(response)
      setMessage(
        payload.message ||
          (language === 'fa'
            ? `${payload.count || 0} ارز سیستم ذخیره شد.`
            : `${payload.count || 0} common currencies saved.`),
      )
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveSystemConfig() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const response = await api.put('/api/settings/system-config', {
        display: {
          themeColor: systemForm.themeColor,
          fontColor: systemForm.fontColor,
          fontFamily: systemForm.fontFamily,
          fontSize: Number(systemForm.fontSize),
          decimalPlaces: Number(systemForm.decimalPlaces),
          thousandsSeparator: systemForm.thousandsSeparator,
          persianDigits: systemForm.persianDigits,
          defaultLanguage: systemForm.defaultLanguage,
        },
        accountingPolicy: {
          allowNegativeChequeClearance: systemForm.allowNegativeChequeClearance,
          allowOverCreditLimit: systemForm.allowOverCreditLimit,
          allowOverDebitLimit: systemForm.allowOverDebitLimit,
          payWhenInsufficientBalance: systemForm.payWhenInsufficientBalance,
        },
        hawala: {
          trackingPrefix: systemForm.hawalaTrackingPrefix,
          trackingPadding: Number(systemForm.hawalaTrackingPadding),
          collectionDeadlineDays: Number(systemForm.hawalaDeadlineDays),
        },
        security: {
          loginRequired: systemForm.loginRequired,
          passwordMinLength: Number(systemForm.passwordMinLength),
          passwordRequireUppercase: systemForm.passwordRequireUppercase,
          passwordRequireNumber: systemForm.passwordRequireNumber,
          passwordExpiryDays: Number(systemForm.passwordExpiryDays),
          failedLoginLockThreshold: Number(systemForm.failedLoginLockThreshold),
          failedLoginLockMinutes: Number(systemForm.failedLoginLockMinutes),
          sessionTimeoutMinutes: Object.fromEntries(userRoles.map((role) => [role, Number(systemForm.sessionTimeoutMinutes[role])])),
          twoFactorRequired: systemForm.twoFactorRequired,
        },
        printer: {
          connectionType: systemForm.printerConnectionType,
          usbName: systemForm.printerUsbName,
          networkHost: systemForm.printerNetworkHost,
          networkPort: Number(systemForm.printerNetworkPort),
          footerText: systemForm.printerFooterText,
        },
        notifications: {
          largeTransactionAmount: systemForm.largeTransactionAmount,
          kycExpiryDays: Number(systemForm.kycExpiryDays),
          hawalaOverdueDays: Number(systemForm.hawalaOverdueDays),
          backupNoSuccessHours: Number(systemForm.backupNoSuccessHours),
        },
        backup: {
          schedule: systemForm.backupSchedule,
          storageType: systemForm.backupStorageType,
          retentionCount: Number(systemForm.backupRetentionCount),
        },
        updatedById: currentUserId,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'تنظیمات سیستم ذخیره شد.' : 'System configuration saved.'))
      setSystemDisplay(payload.data?.config?.display || payload.config?.display || {
        themeColor: systemForm.themeColor,
        fontColor: systemForm.fontColor,
        fontFamily: systemForm.fontFamily,
        fontSize: Number(systemForm.fontSize),
      })
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveTransactionConfig() {
    setSaving(true)
    setError('')

    try {
      const currentUserId = await getCurrentUserId()
      const response = await api.put('/api/settings/transaction-config', {
        accounts: {
          numberPrefix: transactionForm.accountPrefix,
          numberPadding: Number(transactionForm.accountPadding),
        },
        transactions: {
          referencePadding: Number(transactionForm.referencePadding),
          referencePrefix: transactionForm.referencePrefix,
        },
        printing: {
          autoQueue: transactionForm.autoQueue,
          defaultCopies: transactionForm.defaultCopies,
        },
        updatedById: currentUserId,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'تنظیمات معامله ذخیره شد.' : 'Transaction configuration saved.'))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveFeeStructure() {
    setSaving(true)
    setError('')

    try {
      const response = await api.put('/api/settings/fee-structures', [
        {
          currencyCode: feeForm.currencyCode,
          transactionType: feeForm.transactionType,
          feeType: feeForm.feeType,
          feeValue: feeForm.feeValue,
          minFee: feeForm.minFee || null,
          maxFee: feeForm.maxFee || null,
          isActive: feeForm.isActive,
        },
      ])
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'ساختار فیس ذخیره شد.' : 'Fee structure saved.'))
      setFeeForm(mapFeeForm({}, companyForm.defaultCurrency))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveTransactionLimit() {
    setSaving(true)
    setError('')

    try {
      const response = await api.put('/api/settings/transaction-limits', [
        {
          customerType: transactionLimitForm.customerType,
          transactionType: transactionLimitForm.transactionType,
          currencyCode: transactionLimitForm.currencyCode,
          perTransactionLimit: transactionLimitForm.perTransactionLimit,
          dailyLimit: transactionLimitForm.dailyLimit,
          monthlyLimit: transactionLimitForm.monthlyLimit,
          isActive: transactionLimitForm.isActive,
        },
      ])
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'حدود معامله ذخیره شد.' : 'Transaction limit saved.'))
      setTransactionLimitForm(mapTransactionLimitForm({}, companyForm.defaultCurrency))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function reprintJob(row) {
    setSaving(true)
    setError('')

    try {
      const printedById = await getCurrentUserId()
      const response = await api.post(`/api/settings/print-jobs/${row.id}/reprint`, {
        printedById,
        copies: row.copies || 1,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'چاپ دوباره در صف قرار گرفت.' : 'Reprint queued.'))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function updatePrintJobStatus(row, status) {
    setSaving(true)
    setError('')

    try {
      const response = await api.patch(`/api/settings/print-jobs/${row.id}`, {
        status,
        printerName: row.printerName,
        errorMsg: status === 'failed' ? row.errorMsg || 'Marked failed from settings.' : null,
      })
      const payload = extractApiData(response)
      setMessage(payload.message || (language === 'fa' ? 'وضعیت چاپ ذخیره شد.' : 'Print job status saved.'))
      loadSettings()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell
      actions={<RefreshButton language={language} loading={loading} onClick={loadSettings} />}
      language={language}
      module={module}
      notes={notes}
    >
      <Tabs activeTab={activeSettingsTab} language={language} onChange={setActiveSettingsTab} tabs={settingsTabs} />

      {activeSettingsTab === 'company' && (
      <Panel
        description={{ en: 'This profile is required before system settings, currencies, fees, and receipts can be stored.', fa: 'قبل از ذخیره تنظیمات سیستم، ارزها، فیس‌ها و رسیدها باید این پروفایل ساخته شود.' }}
        icon={Building2}
        language={language}
        title={{ en: 'System identity', fa: 'نام و لوگوی سیستم' }}
      >
        <div className="ops-form-grid four">
          <Field label={{ en: 'System name', fa: 'نام سیستم' }} language={language} onChange={(value) => updateCompany('name', value)} value={companyForm.name} />
          <Field label={{ en: 'Legal name', fa: 'نام رسمی' }} language={language} onChange={(value) => updateCompany('legalName', value)} value={companyForm.legalName} />
          <Field label={{ en: 'Registration no.', fa: 'نمبر ثبت' }} language={language} onChange={(value) => updateCompany('registrationNo', value)} value={companyForm.registrationNo} />
          <Field label={{ en: 'Tax ID', fa: 'شناسه مالیاتی' }} language={language} onChange={(value) => updateCompany('taxId', value)} value={companyForm.taxId} />
          <Field label={{ en: 'Phone', fa: 'تماس' }} language={language} onChange={(value) => updateCompany('phone', value)} value={companyForm.phone} />
          <Field label={{ en: 'Email', fa: 'ایمیل' }} language={language} onChange={(value) => updateCompany('email', value)} type="email" value={companyForm.email} />
          <Field accept="image/*" label={{ en: 'System logo', fa: 'لوگوی سیستم' }} language={language} onChange={(value) => updateCompany('logoPath', value)} type="file" value={companyForm.logoPath} />
          <Field label={{ en: 'Default currency', fa: 'ارز پیش‌فرض' }} language={language} onChange={(value) => updateCompany('defaultCurrency', value)} value={companyForm.defaultCurrency} />
          <Field label={{ en: 'Timezone', fa: 'زون زمانی' }} language={language} onChange={(value) => updateCompany('timezone', value)} value={companyForm.timezone} />
          <Field label={{ en: 'Open time', fa: 'زمان باز شدن' }} language={language} onChange={(value) => updateCompany('workingHoursFrom', value)} type="time" value={companyForm.workingHoursFrom} />
          <Field label={{ en: 'Close time', fa: 'زمان بسته شدن' }} language={language} onChange={(value) => updateCompany('workingHoursTo', value)} type="time" value={companyForm.workingHoursTo} />
          <Field full label={{ en: 'Address', fa: 'آدرس' }} language={language} onChange={(value) => updateCompany('address', value)} type="textarea" value={companyForm.address} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !companyForm.name || !companyForm.defaultCurrency || !companyForm.timezone} onClick={saveCompanyProfile}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره اطلاعات شرکت' : 'Save company profile'}
          </PrimaryButton>
        </div>
        <StateAlert error={error} message={companyState?.message} state={companyState?.state} />
      </Panel>
      )}

      {activeSettingsTab === 'currencies' && (
      <Panel
        description={{ en: 'The default currency is created automatically when the company profile is saved. Add other active currencies here before opening accounts.', fa: 'بعد از ذخیره شرکت، ارز پیش‌فرض خودکار ساخته می‌شود. ارزهای دیگر را قبل از افتتاح حساب اینجا اضافه کنید.' }}
        icon={Coins}
        language={language}
        title={{ en: 'Currencies', fa: 'ارزها' }}
      >
        <div className="ops-form-grid four">
          <Field label={{ en: 'Code', fa: 'کود' }} language={language} onChange={(value) => updateCurrency('code', value)} value={currencyForm.code} />
          <Field label={{ en: 'Name', fa: 'نام' }} language={language} onChange={(value) => updateCurrency('name', value)} value={currencyForm.name} />
          <Field label={{ en: 'Symbol', fa: 'نشانه' }} language={language} onChange={(value) => updateCurrency('symbol', value)} value={currencyForm.symbol} />
          <Field label={{ en: 'Decimals', fa: 'اعشار' }} language={language} onChange={(value) => updateCurrency('decimalPlaces', value)} type="number" value={currencyForm.decimalPlaces} />
          <Field
            label={{ en: 'Symbol position', fa: 'جایگاه نشانه' }}
            language={language}
            onChange={(value) => updateCurrency('symbolPosition', value)}
            options={[
              { value: 'before', label: { en: 'Before amount', fa: 'قبل از مبلغ' } },
              { value: 'after', label: { en: 'After amount', fa: 'بعد از مبلغ' } },
            ]}
            type="select"
            value={currencyForm.symbolPosition}
          />
          <Field label={{ en: 'Active', fa: 'فعال' }} language={language} onChange={(value) => updateCurrency('isActive', value)} type="toggle" value={currencyForm.isActive} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !companyState?.persisted || !currencyForm.code || !currencyForm.name} onClick={saveCurrency}>
            <Plus size={16} />
            {language === 'fa' ? 'ذخیره ارز' : 'Save currency'}
          </PrimaryButton>
          <PrimaryButton disabled={saving || !companyState?.persisted} onClick={seedDefaultCurrencies}>
            <Coins size={16} />
            {language === 'fa' ? 'افزودن ارزهای پرکاربرد' : 'Seed common currencies'}
          </PrimaryButton>
        </div>
        <DataTable
          columns={currencyColumns}
          language={language}
          rowActions={[
            {
              icon: Pencil,
              label: { en: 'Edit', fa: 'ویرایش' },
              onClick: startEditingCurrency,
            },
          ]}
          rows={currencies}
        />
      </Panel>
      )}

      {activeSettingsTab === 'system' && (
      <Panel icon={Settings} language={language} title={{ en: 'System policy', fa: 'پالیسی سیستم' }}>
        <div className="ops-form-grid four">
          <Field label={{ en: 'Theme color', fa: 'رنگ تم' }} language={language} onChange={(value) => updateSystem('themeColor', value)} type="color" value={systemForm.themeColor} />
          <Field label={{ en: 'Font color', fa: 'رنگ فونت' }} language={language} onChange={(value) => updateSystem('fontColor', value)} type="color" value={systemForm.fontColor} />
          <Field
            label={{ en: 'Font family', fa: 'انتخاب فونت' }}
            language={language}
            onChange={(value) => updateSystem('fontFamily', value)}
            options={[
              { value: 'Yekan', label: { en: 'Yekan', fa: 'Yekan' } },
              { value: 'Tahoma', label: { en: 'Tahoma', fa: 'Tahoma' } },
              { value: 'Arial', label: { en: 'Arial', fa: 'Arial' } },
            ]}
            type="select"
            value={systemForm.fontFamily}
          />
          <Field label={{ en: 'Font size', fa: 'اندازه فونت' }} language={language} onChange={(value) => updateSystem('fontSize', value)} type="number" value={systemForm.fontSize} />
          <Field label={{ en: 'Decimal places', fa: 'خانه‌های اعشاری' }} language={language} onChange={(value) => updateSystem('decimalPlaces', value)} type="number" value={systemForm.decimalPlaces} />
          <Field label={{ en: 'Thousands separator', fa: 'جداکننده اعداد' }} language={language} onChange={(value) => updateSystem('thousandsSeparator', value)} type="toggle" value={systemForm.thousandsSeparator} />
          <Field label={{ en: 'Persian digits', fa: 'نمبر فارسی' }} language={language} onChange={(value) => updateSystem('persianDigits', value)} type="toggle" value={systemForm.persianDigits} />
          <Field
            label={{ en: 'Default language', fa: 'زبان پیشفرض سیستم' }}
            language={language}
            onChange={(value) => updateSystem('defaultLanguage', value)}
            options={[
              { value: 'fa', label: { en: 'Persian', fa: 'فارسی' } },
              { value: 'en', label: { en: 'English', fa: 'انگلیسی' } },
            ]}
            type="select"
            value={systemForm.defaultLanguage}
          />
          <Field label={{ en: 'Pass cheque before date', fa: 'پاس شدن چک قبل از تاریخ' }} language={language} onChange={(value) => updateSystem('allowNegativeChequeClearance', value)} type="toggle" value={systemForm.allowNegativeChequeClearance} />
          <Field label={{ en: 'Allow over credit limit', fa: 'اجازه بیش از حد قرض' }} language={language} onChange={(value) => updateSystem('allowOverCreditLimit', value)} type="toggle" value={systemForm.allowOverCreditLimit} />
          <Field label={{ en: 'Allow over debit limit', fa: 'اجازه بیش از حد طلب' }} language={language} onChange={(value) => updateSystem('allowOverDebitLimit', value)} type="toggle" value={systemForm.allowOverDebitLimit} />
          <Field label={{ en: 'Pay when no balance', fa: 'پرداخت در صورت عدم موجودی' }} language={language} onChange={(value) => updateSystem('payWhenInsufficientBalance', value)} type="toggle" value={systemForm.payWhenInsufficientBalance} />
          <Field label={{ en: 'Hawala prefix', fa: 'پیشوند حواله' }} language={language} onChange={(value) => updateSystem('hawalaTrackingPrefix', value.toUpperCase())} value={systemForm.hawalaTrackingPrefix} />
          <Field label={{ en: 'Hawala padding', fa: 'طول شماره حواله' }} language={language} onChange={(value) => updateSystem('hawalaTrackingPadding', value)} type="number" value={systemForm.hawalaTrackingPadding} />
          <Field label={{ en: 'Collection deadline days', fa: 'مهلت دریافت حواله' }} language={language} onChange={(value) => updateSystem('hawalaDeadlineDays', value)} type="number" value={systemForm.hawalaDeadlineDays} />
          <Field label={{ en: 'Require login', fa: 'ورود الزامی' }} language={language} onChange={(value) => updateSystem('loginRequired', value)} type="toggle" value={systemForm.loginRequired} />
          <Field label={{ en: 'Password min length', fa: 'حداقل طول پسورد' }} language={language} onChange={(value) => updateSystem('passwordMinLength', value)} type="number" value={systemForm.passwordMinLength} />
          <Field label={{ en: 'Require uppercase', fa: 'حرف بزرگ الزامی' }} language={language} onChange={(value) => updateSystem('passwordRequireUppercase', value)} type="toggle" value={systemForm.passwordRequireUppercase} />
          <Field label={{ en: 'Require number', fa: 'عدد الزامی' }} language={language} onChange={(value) => updateSystem('passwordRequireNumber', value)} type="toggle" value={systemForm.passwordRequireNumber} />
          <Field label={{ en: 'Password expiry days', fa: 'روزهای انقضای پسورد' }} language={language} onChange={(value) => updateSystem('passwordExpiryDays', value)} type="number" value={systemForm.passwordExpiryDays} />
          <Field label={{ en: 'Failed-login lock threshold', fa: 'حد قفل ورود ناموفق' }} language={language} onChange={(value) => updateSystem('failedLoginLockThreshold', value)} type="number" value={systemForm.failedLoginLockThreshold} />
          <Field label={{ en: 'Lock minutes', fa: 'دقیقه قفل' }} language={language} onChange={(value) => updateSystem('failedLoginLockMinutes', value)} type="number" value={systemForm.failedLoginLockMinutes} />
          {userRoles.map((role) => (
            <Field key={`timeout-${role}`} label={{ en: `${role} timeout`, fa: `${role} مهلت نشست` }} language={language} onChange={(value) => updateRoleSystem('sessionTimeoutMinutes', role, value)} type="number" value={systemForm.sessionTimeoutMinutes[role]} />
          ))}
          {userRoles.map((role) => (
            <Field key={`2fa-${role}`} label={{ en: `${role} 2FA`, fa: `${role} تایید دومرحله‌ای` }} language={language} onChange={(value) => updateRoleSystem('twoFactorRequired', role, value)} type="toggle" value={systemForm.twoFactorRequired[role]} />
          ))}
          <Field amountCurrencyCode={companyForm.defaultCurrency} label={{ en: 'Large transaction amount', fa: 'مبلغ معامله بزرگ' }} language={language} onChange={(value) => updateSystem('largeTransactionAmount', value)} showAmountInWords type="number" value={systemForm.largeTransactionAmount} />
          <Field label={{ en: 'KYC expiry days', fa: 'روزهای انقضای KYC' }} language={language} onChange={(value) => updateSystem('kycExpiryDays', value)} type="number" value={systemForm.kycExpiryDays} />
          <Field label={{ en: 'Hawala overdue days', fa: 'روزهای حواله معوق' }} language={language} onChange={(value) => updateSystem('hawalaOverdueDays', value)} type="number" value={systemForm.hawalaOverdueDays} />
          <Field label={{ en: 'Backup alert hours', fa: 'ساعت هشدار بکاپ' }} language={language} onChange={(value) => updateSystem('backupNoSuccessHours', value)} type="number" value={systemForm.backupNoSuccessHours} />
          <Field
            label={{ en: 'Backup schedule', fa: 'زمان‌بندی بکاپ' }}
            language={language}
            onChange={(value) => updateSystem('backupSchedule', value)}
            options={['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'].map((value) => ({ value, label: { en: value, fa: value } }))}
            type="select"
            value={systemForm.backupSchedule}
          />
          <Field
            label={{ en: 'Backup storage', fa: 'محل ذخیره بکاپ' }}
            language={language}
            onChange={(value) => updateSystem('backupStorageType', value)}
            options={[
              { value: 'local', label: { en: 'Local', fa: 'محلی' } },
              { value: 'network', label: { en: 'Network', fa: 'شبکه' } },
              { value: 's3-compatible', label: { en: 'S3-compatible', fa: 'S3' } },
            ]}
            type="select"
            value={systemForm.backupStorageType}
          />
          <Field label={{ en: 'Backup retention', fa: 'تعداد نگهداری بکاپ' }} language={language} onChange={(value) => updateSystem('backupRetentionCount', value)} type="number" value={systemForm.backupRetentionCount} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={saveSystemConfig}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره پالیسی سیستم' : 'Save system policy'}
          </PrimaryButton>
        </div>
        <StateAlert error={error} language={language} message={message} />
      </Panel>
      )}

      {activeSettingsTab === 'tradingCities' && (
      <Panel
        description={{
          en: 'Register the cities and branches your office deals with so hawala origin and destination are selected from a clean shared list.',
          fa: 'شهرها و شعباتی را که با آن‌ها معامله دارید ثبت کنید تا مبدأ و مقصد حواله از یک لیست مشترک و منظم انتخاب شود.',
        }}
        icon={MapPin}
        language={language}
        title={{ en: 'Trading cities and branches', fa: 'شهرها و شعبات معامله' }}
      >
        <div className="ops-form-grid four">
          <Field label={{ en: 'Title', fa: 'عنوان' }} language={language} onChange={(value) => updateTradingCity('title', value)} value={tradingCityForm.title} />
          <Field label={{ en: 'City', fa: 'شهر' }} language={language} onChange={(value) => updateTradingCity('cityName', value)} value={tradingCityForm.cityName} />
          <Field label={{ en: 'Branch / agency', fa: 'نمایندگی / شعبه' }} language={language} onChange={(value) => updateTradingCity('branchName', value)} value={tradingCityForm.branchName} />
          <Field label={{ en: 'Branch manager', fa: 'مسئول شعبه' }} language={language} onChange={(value) => updateTradingCity('managerName', value)} value={tradingCityForm.managerName} />
          <Field label={{ en: 'Phone', fa: 'شماره تماس' }} language={language} onChange={(value) => updateTradingCity('phone', value)} type="tel" value={tradingCityForm.phone} />
          <Field
            label={{ en: 'Linked customer', fa: 'مشتری مرتبط' }}
            language={language}
            onChange={(value) => updateTradingCity('customerId', value)}
            options={[
              { value: '', label: { en: 'No linked customer', fa: 'بدون مشتری مرتبط' } },
              ...customerOptions,
            ]}
            type="select"
            value={tradingCityForm.customerId}
          />
          <Field label={{ en: 'Active', fa: 'فعال' }} language={language} onChange={(value) => updateTradingCity('isActive', value)} type="toggle" value={tradingCityForm.isActive} />
          <Field full label={{ en: 'Office address', fa: 'آدرس دفتر' }} language={language} onChange={(value) => updateTradingCity('officeAddress', value)} type="textarea" value={tradingCityForm.officeAddress} />
          <Field full label={{ en: 'Notes', fa: 'یادداشت' }} language={language} onChange={(value) => updateTradingCity('notes', value)} type="textarea" value={tradingCityForm.notes} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !companyState?.persisted || !tradingCityForm.title || !tradingCityForm.cityName} onClick={saveTradingCity}>
            {editingTradingCityId ? <Save size={16} /> : <Plus size={16} />}
            {language === 'fa'
              ? editingTradingCityId
                ? 'ذخیره ویرایش شهر'
                : 'ثبت شهر معامله‌ای'
              : editingTradingCityId
                ? 'Save city changes'
                : 'Add trading city'}
          </PrimaryButton>
          {editingTradingCityId && (
            <PrimaryButton disabled={saving} onClick={resetTradingCityForm}>
              <Settings size={16} />
              {language === 'fa' ? 'لغو ویرایش' : 'Cancel editing'}
            </PrimaryButton>
          )}
        </div>
        <DataTable
          columns={tradingCityColumns}
          language={language}
          rowActions={[
            {
              icon: Pencil,
              label: { en: 'Edit', fa: 'ویرایش' },
              onClick: startEditingTradingCity,
            },
          ]}
          rows={tradingCities}
        />
      </Panel>
      )}

      {activeSettingsTab === 'numbering' && (
      <Panel icon={SlidersHorizontal} language={language} title={{ en: 'Numbering and transaction defaults', fa: 'شماره‌گذاری و پیش‌فرض معامله' }}>
        <div className="shortcut-help">
          <strong>{language === 'fa' ? 'میانبرهای سریع معاملات' : 'Transaction shortcuts'}</strong>
          <span>{language === 'fa' ? 'در صفحه معاملات از این کلیدها برای باز شدن سریع بخش‌ها استفاده کنید.' : 'Use these keys on the transactions page to open each section quickly.'}</span>
          <div>
            <kbd>Ctrl+D</kbd><span>{language === 'fa' ? 'واریز' : 'Deposit'}</span>
            <kbd>Ctrl+W</kbd><span>{language === 'fa' ? 'برداشت' : 'Withdrawal'}</span>
            <kbd>Ctrl+T</kbd><span>{language === 'fa' ? 'انتقال حساب' : 'Transfer'}</span>
            <kbd>Ctrl+E</kbd><span>{language === 'fa' ? 'تبادله ارز' : 'FX exchange'}</span>
            <kbd>Ctrl+R</kbd><span>{language === 'fa' ? 'لیست معاملات' : 'Register'}</span>
            <kbd>Ctrl+L</kbd><span>{language === 'fa' ? 'تاییدی / برگشت' : 'Approval / reversal'}</span>
          </div>
        </div>
        <div className="ops-form-grid four">
          <Field label={{ en: 'Account prefix', fa: 'پیشوند حساب' }} language={language} onChange={(value) => updateTransaction('accountPrefix', value.toUpperCase())} value={transactionForm.accountPrefix} />
          <Field label={{ en: 'Account padding', fa: 'طول نمبر حساب' }} language={language} onChange={(value) => updateTransaction('accountPadding', value)} type="number" value={transactionForm.accountPadding} />
          <Field label={{ en: 'Reference padding', fa: 'طول مرجع معامله' }} language={language} onChange={(value) => updateTransaction('referencePadding', value)} type="number" value={transactionForm.referencePadding} />
          {transactionTypes.map((type) => (
            <Field key={type} label={{ en: `${type} prefix`, fa: `${type} prefix` }} language={language} onChange={(value) => updateReferencePrefix(type, value)} value={transactionForm.referencePrefix[type]} />
          ))}
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={saveTransactionConfig}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره شماره‌گذاری' : 'Save numbering'}
          </PrimaryButton>
        </div>
      </Panel>
      )}

      {activeSettingsTab === 'numbering' && (
      <Panel icon={SlidersHorizontal} language={language} title={{ en: 'Transaction limits', fa: 'حدود معاملات' }}>
        <div className="ops-form-grid four">
          <Field
            label={{ en: 'Customer type', fa: 'نوع مشتری' }}
            language={language}
            onChange={(value) => updateTransactionLimit('customerType', value)}
            options={customerTypes.map((type) => ({ value: type, label: { en: type, fa: type } }))}
            type="select"
            value={transactionLimitForm.customerType}
          />
          <Field
            label={{ en: 'Transaction type', fa: 'نوع معامله' }}
            language={language}
            onChange={(value) => updateTransactionLimit('transactionType', value)}
            options={transactionTypes.map((type) => ({ value: type, label: { en: type, fa: type } }))}
            type="select"
            value={transactionLimitForm.transactionType}
          />
          <Field
            label={{ en: 'Currency', fa: 'ارز' }}
            language={language}
            onChange={(value) => updateTransactionLimit('currencyCode', value)}
            options={currencies.map((currency) => ({ value: currency.code, label: { en: currency.code, fa: currency.code } }))}
            type="select"
            value={transactionLimitForm.currencyCode}
          />
          <Field amountCurrencyCode={transactionLimitForm.currencyCode} label={{ en: 'Per transaction', fa: 'حد هر معامله' }} language={language} onChange={(value) => updateTransactionLimit('perTransactionLimit', value)} showAmountInWords type="number" value={transactionLimitForm.perTransactionLimit} />
          <Field amountCurrencyCode={transactionLimitForm.currencyCode} label={{ en: 'Daily limit', fa: 'حد روزانه' }} language={language} onChange={(value) => updateTransactionLimit('dailyLimit', value)} showAmountInWords type="number" value={transactionLimitForm.dailyLimit} />
          <Field amountCurrencyCode={transactionLimitForm.currencyCode} label={{ en: 'Monthly limit', fa: 'حد ماهانه' }} language={language} onChange={(value) => updateTransactionLimit('monthlyLimit', value)} showAmountInWords type="number" value={transactionLimitForm.monthlyLimit} />
          <Field label={{ en: 'Active', fa: 'فعال' }} language={language} onChange={(value) => updateTransactionLimit('isActive', value)} type="toggle" value={transactionLimitForm.isActive} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !companyState?.persisted || !transactionLimitForm.currencyCode} onClick={saveTransactionLimit}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره حد معامله' : 'Save transaction limit'}
          </PrimaryButton>
        </div>
        <DataTable
          columns={transactionLimitColumns}
          language={language}
          rowActions={[
            {
              icon: Pencil,
              label: { en: 'Edit', fa: 'ویرایش' },
              onClick: startEditingTransactionLimit,
            },
          ]}
          rows={transactionLimits}
        />
      </Panel>
      )}

      {activeSettingsTab === 'printer' && (
      <Panel icon={Printer} language={language} title={{ en: 'Printer defaults', fa: 'پیش‌فرض پرنتر' }}>
        <div className="ops-form-grid four">
          <Field
            label={{ en: 'Connection type', fa: 'نوع اتصال' }}
            language={language}
            onChange={(value) => updateSystem('printerConnectionType', value)}
            options={[
              { value: 'USB', label: { en: 'USB', fa: 'USB' } },
              { value: 'NETWORK', label: { en: 'Network', fa: 'شبکه' } },
            ]}
            type="select"
            value={systemForm.printerConnectionType}
          />
          <Field label={{ en: 'USB name', fa: 'نام USB' }} language={language} onChange={(value) => updateSystem('printerUsbName', value)} value={systemForm.printerUsbName} />
          <Field label={{ en: 'Network host', fa: 'هاست شبکه' }} language={language} onChange={(value) => updateSystem('printerNetworkHost', value)} value={systemForm.printerNetworkHost} />
          <Field label={{ en: 'Network port', fa: 'پورت شبکه' }} language={language} onChange={(value) => updateSystem('printerNetworkPort', value)} type="number" value={systemForm.printerNetworkPort} />
          <Field full label={{ en: 'Receipt footer', fa: 'متن پایین رسید' }} language={language} onChange={(value) => updateSystem('printerFooterText', value)} type="textarea" value={systemForm.printerFooterText} />
          {printDocumentTypes.map((type) => (
            <Field key={`auto-${type}`} label={{ en: `${type} auto print`, fa: `${type} چاپ خودکار` }} language={language} onChange={(value) => updatePrintDefault('autoQueue', type, value)} type="toggle" value={transactionForm.autoQueue[type] ?? false} />
          ))}
          {printDocumentTypes.map((type) => (
            <Field key={`copies-${type}`} label={{ en: `${type} copies`, fa: `${type} تعداد کاپی` }} language={language} onChange={(value) => updatePrintDefault('defaultCopies', type, value)} type="number" value={transactionForm.defaultCopies[type] ?? 1} />
          ))}
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving} onClick={saveSystemConfig}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره تنظیمات چاپ' : 'Save printing settings'}
          </PrimaryButton>
          <PrimaryButton disabled={saving} onClick={saveTransactionConfig}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره چاپ خودکار' : 'Save print defaults'}
          </PrimaryButton>
        </div>
      </Panel>
      )}

      {activeSettingsTab === 'fees' && (
      <Panel icon={SlidersHorizontal} language={language} title={{ en: 'Fee structures', fa: 'ساختار فیس' }}>
        <div className="ops-form-grid four">
          <Field
            label={{ en: 'Currency', fa: 'ارز' }}
            language={language}
            onChange={(value) => updateFee('currencyCode', value)}
            options={currencies.map((currency) => ({ value: currency.code, label: { en: currency.code, fa: currency.code } }))}
            type="select"
            value={feeForm.currencyCode}
          />
          <Field
            label={{ en: 'Transaction type', fa: 'نوع معامله' }}
            language={language}
            onChange={(value) => updateFee('transactionType', value)}
            options={feeTransactionTypes.map((type) => ({ value: type, label: { en: type, fa: type } }))}
            type="select"
            value={feeForm.transactionType}
          />
          <Field
            label={{ en: 'Fee type', fa: 'نوع فیس' }}
            language={language}
            onChange={(value) => updateFee('feeType', value)}
            options={[
              { value: 'flat', label: { en: 'Flat', fa: 'ثابت' } },
              { value: 'percent', label: { en: 'Percent', fa: 'درصدی' } },
            ]}
            type="select"
            value={feeForm.feeType}
          />
          <Field amountCurrencyCode={feeForm.currencyCode} label={{ en: 'Fee value', fa: 'مقدار فیس' }} language={language} onChange={(value) => updateFee('feeValue', value)} showAmountInWords={feeForm.feeType !== 'percent'} type="number" value={feeForm.feeValue} />
          <Field amountCurrencyCode={feeForm.currencyCode} label={{ en: 'Minimum fee', fa: 'حداقل فیس' }} language={language} onChange={(value) => updateFee('minFee', value)} showAmountInWords type="number" value={feeForm.minFee} />
          <Field amountCurrencyCode={feeForm.currencyCode} label={{ en: 'Maximum fee', fa: 'حداکثر فیس' }} language={language} onChange={(value) => updateFee('maxFee', value)} showAmountInWords type="number" value={feeForm.maxFee} />
          <Field label={{ en: 'Active', fa: 'فعال' }} language={language} onChange={(value) => updateFee('isActive', value)} type="toggle" value={feeForm.isActive} />
        </div>
        <div className="ops-actions-row">
          <PrimaryButton disabled={saving || !companyState?.persisted || !feeForm.currencyCode || !feeForm.transactionType} onClick={saveFeeStructure}>
            <Save size={16} />
            {language === 'fa' ? 'ذخیره فیس' : 'Save fee'}
          </PrimaryButton>
        </div>
        <DataTable
          columns={feeColumns}
          language={language}
          rowActions={[
            {
              icon: Pencil,
              label: { en: 'Edit', fa: 'ویرایش' },
              onClick: startEditingFee,
            },
          ]}
          rows={feeStructures}
        />
      </Panel>
      )}

      {activeSettingsTab === 'printer' && (
      <Panel icon={Printer} language={language} title={{ en: 'Print queue', fa: 'صف چاپ' }}>
        <DataTable
          columns={printJobColumns}
          language={language}
          rowActions={[
            {
              icon: RotateCcw,
              label: { en: 'Reprint', fa: 'چاپ دوباره' },
              onClick: reprintJob,
            },
            {
              icon: Check,
              label: { en: 'Printed', fa: 'چاپ شد' },
              disabled: (row) => row.status === 'printed',
              onClick: (row) => updatePrintJobStatus(row, 'printed'),
            },
            {
              icon: X,
              label: { en: 'Cancel', fa: 'لغو' },
              disabled: (row) => row.status === 'cancelled',
              onClick: (row) => updatePrintJobStatus(row, 'cancelled'),
            },
          ]}
          rows={printJobs}
        />
      </Panel>
      )}
    </PageShell>
  )
}
