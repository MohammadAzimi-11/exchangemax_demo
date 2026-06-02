import { Printer } from 'lucide-react'
import { formatDate, formatMoney } from '../../../../utils/utils.js'
import { isCommonCurrencyCode } from '../../../../utils/currencyCatalog.js'
import AccountCategoryManager from './AccountCategoryManager.jsx'

const yesNoOptions = [
  { value: 'true', label: { en: 'Yes', fa: 'بلی' } },
  { value: 'false', label: { en: 'No', fa: 'نخیر' } },
]

const customerTypeOptions = [
  { value: 'INDIVIDUAL', label: { en: 'Individual', fa: 'شخصی' } },
  { value: 'CORPORATE', label: { en: 'Corporate', fa: 'شرکتی' } },
  { value: 'VIP', label: { en: 'VIP', fa: 'VIP' } },
  { value: 'AGENT', label: { en: 'Agent / Broker', fa: 'نماینده / بروکر' } },
  { value: 'INSTITUTIONAL', label: { en: 'Institutional', fa: 'نهادی' } },
]

const userRoleOptions = [
  { value: 'ADMIN', label: { en: 'Admin', fa: 'ادمین' } },
  { value: 'MANAGER', label: { en: 'Manager', fa: 'مدیر' } },
  { value: 'OPERATOR', label: { en: 'Operator', fa: 'اپراتور' } },
  { value: 'AUDITOR', label: { en: 'Auditor', fa: 'بازرس' } },
  { value: 'CUSTOM', label: { en: 'Custom', fa: 'اختصاصی' } },
]

const permissionLevelOptions = [
  { value: 'HIDDEN', label: { en: 'Hidden - do not show', fa: 'پنهان - اصلاً نمایش داده نشود' } },
  { value: 'NONE', label: { en: 'None', fa: 'هیچ' } },
  { value: 'VIEW', label: { en: 'View', fa: 'مشاهده' } },
  { value: 'CREATE', label: { en: 'Create', fa: 'ثبت' } },
  { value: 'EDIT', label: { en: 'Edit', fa: 'ویرایش' } },
  { value: 'DELETE', label: { en: 'Delete', fa: 'حذف' } },
  { value: 'FULL', label: { en: 'Full', fa: 'کامل' } },
]

const legacyPermissionAreas = [
  { key: 'customers', label: { en: 'Customers & guarantors', fa: 'مشتریان و ضامن‌ها' } },
  { key: 'accounts', label: { en: 'Accounts', fa: 'حساب‌ها' } },
  { key: 'deposits', label: { en: 'Deposits', fa: 'واریزی‌ها' } },
  { key: 'withdrawals', label: { en: 'Withdrawals', fa: 'برداشت‌ها' } },
  { key: 'transfers', label: { en: 'Transfers', fa: 'انتقال‌ها' } },
  { key: 'fxExchange', label: { en: 'FX Exchange', fa: 'تبادله اسعار' } },
  { key: 'transactionEdit', label: { en: 'Edit transactions', fa: 'ویرایش تراکنش' } },
  { key: 'hawala', label: { en: 'Hawala', fa: 'حواله' } },
  { key: 'journalLedger', label: { en: 'Journal & ledger', fa: 'جورنال و دفترکل' } },
  { key: 'cashFunds', label: { en: 'Cash fund / vault', fa: 'صندوق و خزانه' } },
  { key: 'exchangeRates', label: { en: 'Exchange rates', fa: 'نرخ ارز' } },
  { key: 'reports', label: { en: 'Reports', fa: 'گزارشات' } },
  { key: 'systemSettings', label: { en: 'System settings', fa: 'تنظیمات سیستم' } },
  { key: 'userManagement', label: { en: 'User management', fa: 'مدیریت کاربران' } },
  { key: 'auditLog', label: { en: 'Audit log', fa: 'لاگ بررسی' } },
  { key: 'backup', label: { en: 'Backup', fa: 'بکاپ' } },
]

const permissionFieldKey = (areaKey) => `permission__${areaKey}`

const permissionAreas = [...legacyPermissionAreas.filter(() => false), ...[
  { key: 'customers', label: { en: 'Customers list and profile view', fa: 'Customers' } },
  { key: 'customerCreate', label: { en: 'Create customers', fa: 'Create customers' } },
  { key: 'customerKyc', label: { en: 'KYC status and risk fields', fa: 'KYC' } },
  { key: 'accounts', label: { en: 'Accounts list and balances', fa: 'Accounts' } },
  { key: 'accountCreate', label: { en: 'Open customer accounts', fa: 'Open accounts' } },
  { key: 'accountClose', label: { en: 'Freeze or close accounts', fa: 'Close accounts' } },
  { key: 'cashFunds', label: { en: 'Cash fund / vault view', fa: 'Cash funds' } },
  { key: 'cashFundManage', label: { en: 'Create and manage cash funds', fa: 'Manage cash funds' } },
  { key: 'deposits', label: { en: 'Deposits', fa: 'Deposits' } },
  { key: 'withdrawals', label: { en: 'Withdrawals', fa: 'Withdrawals' } },
  { key: 'transfers', label: { en: 'Internal transfers', fa: 'Transfers' } },
  { key: 'fxExchange', label: { en: 'FX exchange transactions', fa: 'FX exchange' } },
  { key: 'transactionApproval', label: { en: 'Approve or reject transactions', fa: 'Transaction approval' } },
  { key: 'transactionEdit', label: { en: 'Edit transactions', fa: 'Edit transactions' } },
  { key: 'transactionReverse', label: { en: 'Reverse transactions', fa: 'Reverse transactions' } },
  { key: 'hawala', label: { en: 'Hawala list and receipt view', fa: 'Hawala' } },
  { key: 'hawalaCreate', label: { en: 'Create hawala', fa: 'Create hawala' } },
  { key: 'hawalaPay', label: { en: 'Pay, return, or cancel hawala', fa: 'Pay hawala' } },
  { key: 'hawalaAgents', label: { en: 'Correspondent agents', fa: 'Hawala agents' } },
  { key: 'journalLedger', label: { en: 'Journal & ledger', fa: 'Journal & ledger' } },
  { key: 'ledgerExport', label: { en: 'Ledger export and statements', fa: 'Ledger export' } },
  { key: 'exchangeRates', label: { en: 'Exchange rates', fa: 'Exchange rates' } },
  { key: 'reports', label: { en: 'Reports view', fa: 'Reports' } },
  { key: 'reportExport', label: { en: 'Export reports', fa: 'Report export' } },
  { key: 'notifications', label: { en: 'Notifications', fa: 'Notifications' } },
  { key: 'companySettings', label: { en: 'Company profile settings', fa: 'Company settings' } },
  { key: 'systemSettings', label: { en: 'System and printer settings', fa: 'System settings' } },
  { key: 'userManagement', label: { en: 'User registration and staff management', fa: 'User management' } },
  { key: 'roleManagement', label: { en: 'Role and permission management', fa: 'Role management' } },
  { key: 'auditLog', label: { en: 'Audit log', fa: 'Audit log' } },
  { key: 'backup', label: { en: 'Backup and restore', fa: 'Backup' } },
]]

const customerStatusOptions = [
  { value: 'ACTIVE', label: { en: 'Active', fa: 'فعال' } },
  { value: 'SUSPENDED', label: { en: 'Suspended', fa: 'تعلیق' } },
  { value: 'CLOSED', label: { en: 'Closed', fa: 'بسته' } },
  { value: 'BLACKLISTED', label: { en: 'Blacklisted', fa: 'لیست سیاه' } },
]

const kycStatusOptions = [
  { value: 'PENDING', label: { en: 'Pending', fa: 'در انتظار' } },
  { value: 'APPROVED', label: { en: 'Approved', fa: 'تایید شده' } },
  { value: 'REJECTED', label: { en: 'Rejected', fa: 'رد شده' } },
  { value: 'EXPIRED', label: { en: 'Expired', fa: 'منقضی' } },
]

const riskLevelOptions = [
  { value: 'LOW', label: { en: 'Low', fa: 'پایین' } },
  { value: 'MEDIUM', label: { en: 'Medium', fa: 'متوسط' } },
  { value: 'HIGH', label: { en: 'High', fa: 'بلند' } },
]

const accountTypeOptions = [
  { value: 'CASH', label: { en: 'Cash', fa: 'نقدی' } },
  { value: 'SAVINGS', label: { en: 'Savings', fa: 'پس‌انداز' } },
  { value: 'BUSINESS', label: { en: 'Business', fa: 'تجاری' } },
  { value: 'SETTLEMENT', label: { en: 'Settlement', fa: 'تسویه' } },
]

const accountStatusOptions = [
  { value: 'ACTIVE', label: { en: 'Active', fa: 'فعال' } },
  { value: 'FROZEN', label: { en: 'Frozen', fa: 'فریز' } },
  { value: 'CLOSED', label: { en: 'Closed', fa: 'بسته' } },
]

const accountOwnerOptions = [
  { value: 'CUSTOMER', label: { en: 'Customer account', fa: 'حساب مشتری' } },
  { value: 'INTERNAL', label: { en: 'Non-customer account', fa: 'حساب غیرمشتری' } },
]

function isCustomerAccount(values) {
  return (values.ownerKind || 'CUSTOMER') === 'CUSTOMER'
}

function isInternalAccount(values) {
  return values.ownerKind === 'INTERNAL'
}

const transactionTypeOptions = [
  { value: 'DEPOSIT', label: { en: 'Deposit', fa: 'واریز' } },
  { value: 'WITHDRAWAL', label: { en: 'Withdrawal', fa: 'برداشت' } },
  { value: 'TRANSFER', label: { en: 'Transfer', fa: 'انتقال' } },
  { value: 'EXCHANGE', label: { en: 'Exchange', fa: 'تبادله' } },
  { value: 'REVERSAL', label: { en: 'Reversal', fa: 'برگشت' } },
  { value: 'HAWALA_SEND', label: { en: 'Hawala Send', fa: 'ارسال حواله' } },
  { value: 'HAWALA_PAY', label: { en: 'Hawala Pay', fa: 'پرداخت حواله' } },
]

const transactionStatusOptions = [
  { value: 'DRAFT', label: { en: 'Draft', fa: 'مسوده' } },
  { value: 'PENDING_APPROVAL', label: { en: 'Pending approval', fa: 'در انتظار تاییدی' } },
  { value: 'APPROVED', label: { en: 'Approved', fa: 'تایید شده' } },
  { value: 'COMPLETED', label: { en: 'Completed', fa: 'تکمیل شده' } },
  { value: 'REJECTED', label: { en: 'Rejected', fa: 'رد شده' } },
  { value: 'REVERSAL_REQUESTED', label: { en: 'Reversal requested', fa: 'درخواست برگشت' } },
  { value: 'REVERSED', label: { en: 'Reversed', fa: 'برگشت شده' } },
]

const paymentMethodOptions = [
  { value: 'CASH', label: { en: 'Cash', fa: 'نقد' } },
  { value: 'BANK_TRANSFER', label: { en: 'Bank transfer', fa: 'انتقال بانکی' } },
  { value: 'CHEQUE', label: { en: 'Cheque', fa: 'چک' } },
  { value: 'INTERNAL', label: { en: 'Internal', fa: 'داخلی' } },
]

const hawalaTypeOptions = [
  { value: 'INTERNAL', label: { en: 'Internal', fa: 'داخلی' } },
  { value: 'EXTERNAL', label: { en: 'External', fa: 'خارجی' } },
]

const hawalaDirectionOptions = [
  { value: 'OUTGOING', label: { en: 'Outgoing hawala', fa: 'حواله ارسالی' } },
  { value: 'INCOMING', label: { en: 'Incoming hawala', fa: 'حواله دریافتی' } },
]

const hawalaStatusOptions = [
  { value: 'CREATED', label: { en: 'Created', fa: 'ثبت شده' } },
  { value: 'PAID', label: { en: 'Paid', fa: 'پرداخت شده' } },
  { value: 'RETURNED', label: { en: 'Returned', fa: 'برگشت شده' } },
  { value: 'CANCELLED', label: { en: 'Cancelled', fa: 'لغو شده' } },
]

function badgeElement(value, tone = 'muted') {
  if (!value) {
    return <span className="master-muted">-</span>
  }

  return <span className={`master-badge ${tone}`}>{value}</span>
}

function enumBadge(value) {
  const toneByValue = {
    ACTIVE: 'success',
    APPROVED: 'success',
    COMPLETED: 'success',
    PAID: 'success',
    PENDING: 'warning',
    PENDING_APPROVAL: 'warning',
    CREATED: 'warning',
    FROZEN: 'warning',
    SUSPENDED: 'warning',
    REJECTED: 'danger',
    REVERSED: 'danger',
    BLACKLISTED: 'danger',
    CANCELLED: 'danger',
    CLOSED: 'muted',
  }

  return badgeElement(value, toneByValue[value] || 'muted')
}

function splitTags(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== ''),
  )
}

function visibleInEdit(_, mode) {
  return mode === 'edit'
}

function isVipOrAgent(values) {
  return values.type === 'VIP' || values.type === 'AGENT'
}

function usesIndividualProfile(values) {
  if (values.type === 'INDIVIDUAL') {
    return true
  }

  return isVipOrAgent(values) && (values.baseProfileType || 'INDIVIDUAL') === 'INDIVIDUAL'
}

function usesCorporateProfile(values) {
  if (values.type === 'CORPORATE') {
    return true
  }

  return isVipOrAgent(values) && values.baseProfileType === 'CORPORATE'
}

function usesInstitutionalProfile(values) {
  return values.type === 'INSTITUTIONAL'
}

function usesContactProfile(values) {
  return usesIndividualProfile(values) || usesCorporateProfile(values)
}

function buildCustomerPayload(payload) {
  const baseProfileType = payload.baseProfileType || 'INDIVIDUAL'
  const customerPayload = {
    type: payload.type,
    status: payload.status || 'ACTIVE',
    kycStatus: payload.kycStatus || 'PENDING',
    riskLevel: payload.riskLevel || 'LOW',
    isPep: Boolean(payload.isPep),
    isWatchlisted: Boolean(payload.isWatchlisted),
    portalEnabled: Boolean(payload.portalEnabled),
    notes: payload.notes,
    tags: splitTags(payload.tags),
  }

  const individualProfile = compactObject({
    firstName: payload.firstName,
    lastName: payload.lastName,
    nationalId: payload.nationalId,
    passportNo: payload.passportNo,
    nationality: payload.nationality,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
  })

  const corporateProfile = compactObject({
    companyName: payload.companyName,
    registrationNo: payload.registrationNo,
    taxId: payload.taxId,
    industryType: payload.industryType,
    repName: payload.repName,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
  })

  if (payload.type === 'INDIVIDUAL') {
    customerPayload.individualProfile = individualProfile
  }

  if (payload.type === 'CORPORATE') {
    customerPayload.corporateProfile = corporateProfile
  }

  if (payload.type === 'VIP') {
    customerPayload.vipProfile = {
      tier: payload.vipTier || 'SILVER',
      creditLimit: payload.vipCreditLimit || 0,
      specialRateAccess: Boolean(payload.specialRateAccess),
      priorityService: Boolean(payload.priorityService),
    }
    customerPayload[baseProfileType === 'CORPORATE' ? 'corporateProfile' : 'individualProfile'] =
      baseProfileType === 'CORPORATE' ? corporateProfile : individualProfile
  }

  if (payload.type === 'AGENT') {
    customerPayload.agentProfile = {
      licenseNo: payload.licenseNo,
      commissionRate: payload.commissionRate || 0,
      subCustomerIds: [],
    }
    customerPayload[baseProfileType === 'CORPORATE' ? 'corporateProfile' : 'individualProfile'] =
      baseProfileType === 'CORPORATE' ? corporateProfile : individualProfile
  }

  if (payload.type === 'INSTITUTIONAL') {
    customerPayload.institutionalProfile = compactObject({
      institutionName: payload.institutionName,
      institutionType: payload.institutionType,
      regulatoryRef: payload.regulatoryRef,
      authorizedSignatory: payload.authorizedSignatory,
      dailyLimit: payload.dailyLimit || 0,
      monthlyLimit: payload.monthlyLimit || 0,
    })
  }

  if (payload.createdById) {
    customerPayload.createdById = payload.createdById
  }

  if (payload.updatedById) {
    customerPayload.updatedById = payload.updatedById
  }

  return customerPayload
}

function splitCodes(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return String(value)
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
}

function normalizePermissionLevel(value) {
  const normalizedValue = typeof value === 'string' ? value.trim().toUpperCase() : ''
  const allowedLevels = new Set(permissionLevelOptions.map((option) => option.value))

  return allowedLevels.has(normalizedValue) ? normalizedValue : 'NONE'
}

function buildCustomPermissions(payload) {
  return permissionAreas.map((area) => ({
    area: area.key,
    level: normalizePermissionLevel(payload[permissionFieldKey(area.key)]),
  }))
}

function getPermissionFormValues(record) {
  const permissionMap = new Map((record.permissions || []).map((permission) => [permission.area, permission.level]))

  return Object.fromEntries(
    permissionAreas.map((area) => [permissionFieldKey(area.key), normalizePermissionLevel(permissionMap.get(area.key))]),
  )
}

function transformCustomerRecord(record) {
  return {
    ...record,
    baseProfileType: record.profile?.corporate ? 'CORPORATE' : 'INDIVIDUAL',
    firstName: record.profile?.individual?.firstName || '',
    lastName: record.profile?.individual?.lastName || '',
    nationalId: record.profile?.individual?.nationalId || '',
    passportNo: record.profile?.individual?.passportNo || '',
    nationality: record.profile?.individual?.nationality || '',
    companyName: record.profile?.corporate?.companyName || '',
    registrationNo: record.profile?.corporate?.registrationNo || '',
    taxId: record.profile?.corporate?.taxId || '',
    industryType: record.profile?.corporate?.industryType || '',
    repName: record.profile?.corporate?.repName || '',
    institutionName: record.profile?.institutional?.institutionName || '',
    institutionType: record.profile?.institutional?.institutionType || '',
    regulatoryRef: record.profile?.institutional?.regulatoryRef || '',
    authorizedSignatory: record.profile?.institutional?.authorizedSignatory || '',
    dailyLimit: record.profile?.institutional?.dailyLimit || 0,
    monthlyLimit: record.profile?.institutional?.monthlyLimit || 0,
    vipTier: record.profile?.vip?.tier || 'SILVER',
    vipCreditLimit: record.profile?.vip?.creditLimit || 0,
    specialRateAccess: record.profile?.vip?.specialRateAccess ?? true,
    priorityService: record.profile?.vip?.priorityService ?? true,
    licenseNo: record.profile?.agent?.licenseNo || '',
    commissionRate: record.profile?.agent?.commissionRate || 0,
    phone: record.display?.phone || '',
    email: record.display?.email || '',
    address: record.profile?.individual?.address || record.profile?.corporate?.address || '',
    tags: Array.isArray(record.tags) ? record.tags.join(', ') : '',
  }
}

function buildUserPayload(payload, mode) {
  const roleProfileId = payload.roleProfileId || null
  const userPayload = {
    username: payload.username,
    email: payload.email,
    fullName: payload.fullName,
    phone: payload.phone,
    role: roleProfileId ? 'CUSTOM' : payload.role || 'CUSTOM',
    roleProfileId,
    isActive: Boolean(payload.isActive),
    notes: payload.notes,
    updatedById: payload.updatedById,
    access: {
      currencyRestrictions: payload.restrictCurrencies ? splitCodes(payload.currencyRestrictions) : [],
      customerTypeAccess: payload.limitCustomerTypes ? splitCodes(payload.customerTypeAccess) : [],
    },
  }

  if (!roleProfileId) {
    userPayload.access.permissions = buildCustomPermissions(payload)
  }

  if (mode === 'new' || payload.twoFactorEnabled === false || payload.twoFactorSecret) {
    userPayload.security = {
      twoFactorEnabled: Boolean(payload.twoFactorEnabled),
      twoFactorSecret: payload.twoFactorSecret || null,
    }
  }

  if (payload.createdById) {
    userPayload.createdById = payload.createdById
  }

  if (mode === 'new') {
    userPayload.password = payload.password
  }

  return userPayload
}

function buildCommonCurrencyOptionsSource({ valueKey } = {}) {
  return {
    path: '/api/settings/currencies',
    ...(valueKey ? { valueKey } : {}),
    label: (item) => `${item.code} - ${item.name}`,
    filter: (item) => item.isActive && isCommonCurrencyCode(item.code),
  }
}

function openHawalaPrintWindow(record, { autoprint = false } = {}) {
  if (!record?.id || typeof window === 'undefined') {
    return
  }

  const query = autoprint ? '?autoprint=1' : ''
  window.open(`/print/hawala/${record.id}${query}`, '_blank', 'noopener,noreferrer')
}

function buildHawalaPayload(payload) {
  const currencyCode = payload.currencyCode || payload.sendCurrency || payload.receiveCurrency
  const payableAmount = payload.payableAmount || payload.sendAmount || payload.receiveAmount
  const totalCommission = payload.totalCommission ?? payload.feeAmount ?? 0

  return {
    direction: payload.direction || 'OUTGOING',
    type: payload.type || 'INTERNAL',
    externalTrackingCode: payload.externalTrackingCode,
    selectedCashFundId: payload.selectedCashFundId,
    agentId: payload.agentId,
    originTradingCityId: payload.originTradingCityId || null,
    destinationTradingCityId: payload.destinationTradingCityId || null,
    hawalaCity: payload.hawalaCity || payload.originTradingCity?.cityName || null,
    senderName: payload.senderName,
    senderPhone: payload.senderPhone,
    senderId: payload.senderId,
    senderIdImagePath: payload.senderIdImagePath,
    receiverName: payload.receiverName,
    receiverPhone: payload.receiverPhone,
    receiverCity: payload.receiverCity || payload.destinationTradingCity?.cityName || null,
    receiverCountry: payload.receiverCountry,
    receiverIdImagePath: payload.receiverIdImagePath,
    sendCurrency: currencyCode,
    receiveCurrency: currencyCode,
    sendAmount: payableAmount,
    receiveAmount: payableAmount,
    payableAmount,
    feeAmount: totalCommission,
    totalCommission,
    executorCommission: payload.executorCommission || 0,
    feePaidBy: payload.feePaidBy || 'SENDER',
    feePaymentMethod: payload.feePaymentMethod || 'CASH',
    exchangeSideTracking: Boolean(payload.exchangeSideTracking),
    documentPath: payload.documentPath,
    secretCode: payload.secretCode,
    collectionDeadline: payload.collectionDeadline,
    createdById: payload.createdById,
    updatedById: payload.updatedById,
    narration: payload.narration,
  }
}

function accountCategoryLabel(item) {
  return `${item.nameFa || item.nameEn} - ${item.nameEn || item.key}`
}

function transformExchangeRateRecord(record) {
  return {
    ...record,
    buyCurrencyId: record.buyCurrencyId || record.buyCurrency?.id || '',
    sellCurrencyId: record.sellCurrencyId || record.sellCurrency?.id || '',
  }
}

function transformHawalaTransferRecord(record) {
  return {
    ...record,
    currencyCode: record.sendCurrency || record.receiveCurrency || '',
    payableAmount: record.payableAmount || record.sendAmount || record.receiveAmount || '',
    totalCommission: record.totalCommission ?? record.feeAmount ?? 0,
    originTradingCityId: record.originTradingCityId || record.originTradingCity?.id || '',
    destinationTradingCityId: record.destinationTradingCityId || record.destinationTradingCity?.id || '',
  }
}

function buildCancelHawalaPayload(record, values, currentUserId) {
  return {
    cancelledById: currentUserId,
    reason:
      values?.narration?.trim() ||
      `Cancelled from admin panel for hawala ${record.externalTrackingCode || record.trackingCode || record.id}.`,
  }
}

export const identityConfig = {
  apiPath: '/api/identity',
  entityName: { en: 'Staff User', fa: 'کارمند' },
  entityNamePlural: { en: 'Staff Users', fa: 'کارمندان' },
  searchPlaceholder: { en: 'Search by username, name, email, phone...', fa: 'جستجو با یوزرنیم، نام، ایمیل یا تماس...' },
  defaultParams: { includeHidden: true },
  pageSize: 15,
  allowDelete: true,
  deleteLabel: { en: 'Delete user', fa: 'حذف کاربر' },
  confirmDeleteLabel: { en: 'Confirm delete', fa: 'تایید حذف' },
  updateMethod: 'put',
  actorFields: ({ mode }) => (mode === 'edit' ? ['updatedById'] : ['createdById']),
  columns: [
    { key: 'username', label: { en: 'Username', fa: 'یوزرنیم' }, sortable: true, width: '150px' },
    { key: 'fullName', label: { en: 'Full name', fa: 'نام کامل' }, sortable: true },
    { key: 'email', label: { en: 'Email', fa: 'ایمیل' } },
    { key: 'roleProfile.name', label: { en: 'Role', fa: 'نقش' } },
    { key: 'role', label: { en: 'System type', fa: 'نوع سیستمی' }, render: enumBadge },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
    { key: 'isHidden', label: { en: 'Hidden', fa: 'مخفی' } },
    { key: 'twoFactorEnabled', label: { en: '2FA', fa: '۲ مرحله‌ای' } },
    { key: 'failedLoginCount', label: { en: 'Failed logins', fa: 'ورود ناکام' }, align: 'right' },
    { key: 'lastLoginAt', label: { en: 'Last login', fa: 'آخرین ورود' }, render: formatDate },
  ],
  filters: [
    { key: 'role', label: { en: 'Role', fa: 'نقش' }, options: userRoleOptions },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' }, options: yesNoOptions },
    { key: 'includeHidden', label: { en: 'Include hidden admins', fa: 'نمایش ادمین‌های مخفی' }, options: yesNoOptions },
  ],
  formSections: [
    { title: { en: 'Account', fa: 'حساب کاربری' }, keys: ['username', 'email', 'password', 'fullName', 'phone', 'roleProfileId', 'isActive'], columns: 3 },
    { title: { en: 'Security', fa: 'امنیت' }, keys: ['twoFactorEnabled', 'twoFactorSecret'], columns: 2 },
    { title: { en: 'Restrictions', fa: 'محدودیت‌ها' }, keys: ['restrictCurrencies', 'currencyRestrictions', 'limitCustomerTypes', 'customerTypeAccess'], columns: 4 },
    { title: { en: 'Direct custom permissions', fa: 'دسترسی مستقیم' }, keys: permissionAreas.map((area) => permissionFieldKey(area.key)), columns: 3, visibleWhen: (values) => !values.roleProfileId },
    { title: { en: 'Notes', fa: 'یادداشت' }, keys: ['notes'], columns: 1 },
  ],
  fields: [
    { key: 'username', label: { en: 'Username', fa: 'یوزرنیم' }, type: 'text', required: true },
    { key: 'email', label: { en: 'Email', fa: 'ایمیل' }, type: 'email', required: true },
    {
      key: 'password',
      label: { en: 'Initial password', fa: 'پسورد ابتدایی' },
      type: 'password',
      required: true,
      createOnly: true,
      validate: (value) =>
        value && value.length < 8
          ? { en: 'Password must be at least 8 characters.', fa: 'پسورد باید حداقل ۸ حرف باشد.' }
          : null,
    },
    { key: 'fullName', label: { en: 'Full name', fa: 'نام کامل' }, type: 'text', required: true },
    { key: 'phone', label: { en: 'Phone', fa: 'شماره تماس' }, type: 'tel' },
    { key: 'role', label: { en: 'System role type', fa: 'نوع سیستمی' }, type: 'select', options: userRoleOptions, defaultValue: 'CUSTOM', hidden: true },
    {
      key: 'roleProfileId',
      label: { en: 'Role', fa: 'نقش' },
      type: 'select',
      required: true,
      optionsSource: {
        path: '/api/identity/roles',
        labelKey: 'name',
        filter: (item) => item.isActive,
      },
    },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' }, type: 'toggle', defaultValue: true },
    { key: 'twoFactorEnabled', label: { en: '2FA enabled', fa: 'ورود دو مرحله‌ای' }, type: 'toggle' },
    {
      key: 'twoFactorSecret',
      label: { en: '2FA secret', fa: 'سیکرت دو مرحله‌ای' },
      type: 'text',
      visibleWhen: (values) => Boolean(values.twoFactorEnabled),
    },
    {
      key: 'restrictCurrencies',
      label: { en: 'Limit currencies', fa: 'محدود کردن ارزها' },
      type: 'toggle',
      defaultValue: false,
    },
    {
      key: 'currencyRestrictions',
      label: { en: 'Currency restrictions', fa: 'محدودیت ارزها' },
      type: 'text',
      visibleWhen: (values) => Boolean(values.restrictCurrencies),
    },
    {
      key: 'limitCustomerTypes',
      label: { en: 'Limit customer types', fa: 'محدود کردن نوع مشتری' },
      type: 'toggle',
      defaultValue: false,
    },
    {
      key: 'customerTypeAccess',
      label: { en: 'Customer type access', fa: 'دسترسی نوع مشتری' },
      type: 'text',
      visibleWhen: (values) => Boolean(values.limitCustomerTypes),
    },
    ...permissionAreas.map((area) => ({
      key: permissionFieldKey(area.key),
      label: area.label,
      type: 'select',
      options: permissionLevelOptions,
      defaultValue: 'NONE',
      visibleWhen: (values) => !values.roleProfileId,
    })),
    { key: 'notes', label: { en: 'Internal notes', fa: 'یادداشت داخلی' }, type: 'textarea', fullWidth: true },
  ],
  transformRecord: (record) => ({
    ...record,
    ...getPermissionFormValues(record),
    currencyRestrictions: Array.isArray(record.currencyRestrictions) ? record.currencyRestrictions.join(', ') : '',
    customerTypeAccess: Array.isArray(record.customerTypeAccess) ? record.customerTypeAccess.join(', ') : '',
    restrictCurrencies: Array.isArray(record.currencyRestrictions) && record.currencyRestrictions.length > 0,
    limitCustomerTypes: Array.isArray(record.customerTypeAccess) && record.customerTypeAccess.length > 0,
  }),
  transformPayload: buildUserPayload,
  getRecordLabel: (record) => `${record.username} - ${record.fullName}`,
}

export const customersConfig = {
  apiPath: '/api/customers',
  shellClassName: 'customer-master-shell',
  entityName: { en: 'Customer', fa: 'مشتری' },
  entityNamePlural: { en: 'Customers', fa: 'مشتری' },
  searchPlaceholder: { en: 'Search by code, name, phone, email...', fa: 'جستجو با کود، نام، تماس یا ایمیل...' },
  defaultOrderBy: 'updatedAt:desc',
  pageSize: 15,
  emptyMessage: { en: 'No customers found.', fa: 'هیچ مشتری پیدا نشد.' },
  allowDelete: true,
  deleteLabel: { en: 'Delete customer', fa: 'حذف مشتری' },
  confirmDeleteLabel: { en: 'Confirm delete', fa: 'تایید حذف' },
  updateMethod: 'put',
  actorFields: ({ mode }) => (mode === 'edit' ? ['updatedById'] : ['createdById']),
  automationNotes: [
    {
      title: { en: 'System generated code', fa: 'کد خودکار سیستم' },
      body: {
        en: 'Do not enter a customer code. The backend creates the next customer code from the configured sequence.',
        fa: 'کد مشتری وارد نمی‌شود. بک‌اند کد بعدی مشتری را از تنظیمات شماره‌گذاری می‌سازد.',
      },
    },
    {
      title: { en: 'Fast entry defaults', fa: 'پیش‌فرض ورود سریع' },
      body: {
        en: 'New customers start as ACTIVE, KYC PENDING, and LOW risk. Those fields only appear during edit.',
        fa: 'مشتری جدید با وضعیت فعال، KYC در انتظار و ریسک پایین ثبت می‌شود. این فیلدها هنگام ویرایش باز می‌شوند.',
      },
    },
    {
      title: { en: 'Adaptive profile', fa: 'پروفایل هوشمند' },
      body: {
        en: 'The form only shows the fields needed for the selected customer type and base profile.',
        fa: 'فرم فقط فیلدهای لازم برای نوع مشتری و پروفایل پایه انتخاب‌شده را نشان می‌دهد.',
      },
    },
  ],
  columns: [
    { key: 'customerCode', label: { en: 'Code', fa: 'کود' }, sortable: true, width: '130px' },
    { key: 'display.name', label: { en: 'Name', fa: 'نام' }, sortable: true },
    { key: 'type', label: { en: 'Type', fa: 'نوع' }, render: enumBadge },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: enumBadge },
    { key: 'kycStatus', label: { en: 'KYC', fa: 'KYC' }, render: enumBadge },
    { key: 'riskLevel', label: { en: 'Risk', fa: 'ریسک' }, render: enumBadge },
    { key: 'display.phone', label: { en: 'Phone', fa: 'تماس' } },
    { key: 'createdAt', label: { en: 'Created', fa: 'تاریخ ثبت' }, render: formatDate },
  ],
  filters: [
    { key: 'type', label: { en: 'Customer type', fa: 'نوع مشتری' }, options: customerTypeOptions },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, options: customerStatusOptions },
    { key: 'kycStatus', label: { en: 'KYC status', fa: 'وضعیت KYC' }, options: kycStatusOptions },
    { key: 'riskLevel', label: { en: 'Risk level', fa: 'درجه ریسک' }, options: riskLevelOptions },
  ],
  formSections: [
    {
      title: { en: 'Quick setup', fa: 'ثبت سریع' },
      keys: ['type', 'baseProfileType', 'status', 'kycStatus', 'riskLevel'],
      columns: 3,
    },
    {
      title: { en: 'Identity', fa: 'هویت' },
      keys: [
        'firstName',
        'lastName',
        'companyName',
        'institutionName',
        'nationalId',
        'passportNo',
        'nationality',
        'registrationNo',
        'taxId',
        'industryType',
        'repName',
        'institutionType',
        'regulatoryRef',
        'authorizedSignatory',
      ],
      columns: 3,
    },
    {
      title: { en: 'Contact', fa: 'تماس' },
      keys: ['phone', 'email', 'address'],
      columns: 2,
    },
    {
      title: { en: 'Special profile', fa: 'پروفایل خاص' },
      keys: ['vipTier', 'vipCreditLimit', 'specialRateAccess', 'priorityService', 'licenseNo', 'commissionRate', 'dailyLimit', 'monthlyLimit'],
      columns: 3,
    },
    {
      title: { en: 'Risk and notes', fa: 'ریسک و یادداشت' },
      keys: ['isPep', 'isWatchlisted', 'portalEnabled', 'tags', 'notes'],
      columns: 3,
    },
  ],
  fields: [
    { key: 'type', label: { en: 'Customer type', fa: 'نوع مشتری' }, type: 'select', required: true, options: customerTypeOptions, defaultValue: 'INDIVIDUAL' },
    {
      key: 'baseProfileType',
      label: { en: 'Base profile', fa: 'پروفایل پایه' },
      type: 'select',
      options: [
        { value: 'INDIVIDUAL', label: { en: 'Individual', fa: 'شخصی' } },
        { value: 'CORPORATE', label: { en: 'Corporate', fa: 'شرکتی' } },
      ],
      defaultValue: 'INDIVIDUAL',
      visibleWhen: isVipOrAgent,
      hint: {
        en: 'VIP and agent customers must still be based on one person or one company.',
        fa: 'مشتری VIP یا نماینده باید روی یک شخص یا یک شرکت پایه‌گذاری شود.',
      },
    },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, type: 'select', options: customerStatusOptions, defaultValue: 'ACTIVE', visibleWhen: visibleInEdit },
    { key: 'kycStatus', label: { en: 'KYC status', fa: 'وضعیت KYC' }, type: 'select', options: kycStatusOptions, defaultValue: 'PENDING', visibleWhen: visibleInEdit },
    { key: 'riskLevel', label: { en: 'Risk level', fa: 'درجه ریسک' }, type: 'select', options: riskLevelOptions, defaultValue: 'LOW', visibleWhen: visibleInEdit },
    { key: 'firstName', label: { en: 'First name', fa: 'نام' }, type: 'text', required: true, visibleWhen: usesIndividualProfile },
    { key: 'lastName', label: { en: 'Last name', fa: 'تخلص' }, type: 'text', required: true, visibleWhen: usesIndividualProfile },
    { key: 'companyName', label: { en: 'Company name', fa: 'نام شرکت' }, type: 'text', required: true, visibleWhen: usesCorporateProfile },
    { key: 'institutionName', label: { en: 'Institution name', fa: 'نام نهاد' }, type: 'text', required: true, visibleWhen: usesInstitutionalProfile },
    { key: 'nationalId', label: { en: 'National ID', fa: 'تذکره' }, type: 'text', visibleWhen: usesIndividualProfile },
    { key: 'passportNo', label: { en: 'Passport no.', fa: 'نمبر پاسپورت' }, type: 'text', visibleWhen: usesIndividualProfile },
    { key: 'nationality', label: { en: 'Nationality', fa: 'تابعیت' }, type: 'text', visibleWhen: usesIndividualProfile },
    { key: 'registrationNo', label: { en: 'Registration no.', fa: 'نمبر ثبت' }, type: 'text', visibleWhen: usesCorporateProfile },
    { key: 'taxId', label: { en: 'Tax ID', fa: 'شناسه مالیاتی' }, type: 'text', visibleWhen: usesCorporateProfile },
    { key: 'industryType', label: { en: 'Industry', fa: 'صنعت' }, type: 'text', visibleWhen: usesCorporateProfile },
    { key: 'repName', label: { en: 'Authorized representative', fa: 'نماینده مجاز' }, type: 'text', visibleWhen: usesCorporateProfile },
    { key: 'institutionType', label: { en: 'Institution type', fa: 'نوع نهاد' }, type: 'text', visibleWhen: usesInstitutionalProfile },
    { key: 'regulatoryRef', label: { en: 'Regulatory reference', fa: 'مرجع قانونی' }, type: 'text', visibleWhen: usesInstitutionalProfile },
    { key: 'authorizedSignatory', label: { en: 'Authorized signatory', fa: 'امضاکننده مجاز' }, type: 'text', visibleWhen: usesInstitutionalProfile },
    { key: 'phone', label: { en: 'Phone', fa: 'شماره تماس' }, type: 'tel', visibleWhen: usesContactProfile },
    { key: 'email', label: { en: 'Email', fa: 'ایمیل' }, type: 'email', visibleWhen: usesContactProfile },
    { key: 'address', label: { en: 'Address', fa: 'آدرس' }, type: 'textarea', fullWidth: true, visibleWhen: usesContactProfile },
    { key: 'vipTier', label: { en: 'VIP tier', fa: 'درجه VIP' }, type: 'select', options: ['SILVER', 'GOLD', 'PLATINUM'].map((value) => ({ value, label: value })), defaultValue: 'SILVER', visibleWhen: (values) => values.type === 'VIP' },
    { key: 'vipCreditLimit', label: { en: 'VIP credit limit', fa: 'حد اعتبار VIP' }, type: 'number', min: 0, step: 0.01, defaultValue: 0, visibleWhen: (values) => values.type === 'VIP' },
    { key: 'specialRateAccess', label: { en: 'Special rate access', fa: 'دسترسی نرخ ویژه' }, type: 'toggle', defaultValue: true, visibleWhen: (values) => values.type === 'VIP' },
    { key: 'priorityService', label: { en: 'Priority service', fa: 'خدمات اولویت‌دار' }, type: 'toggle', defaultValue: true, visibleWhen: (values) => values.type === 'VIP' },
    { key: 'licenseNo', label: { en: 'Agent license no.', fa: 'نمبر جواز نماینده' }, type: 'text', visibleWhen: (values) => values.type === 'AGENT' },
    { key: 'commissionRate', label: { en: 'Commission rate', fa: 'نرخ کمیشن' }, type: 'number', min: 0, step: 0.0001, defaultValue: 0, visibleWhen: (values) => values.type === 'AGENT' },
    { key: 'dailyLimit', label: { en: 'Daily limit', fa: 'حد روزانه' }, type: 'number', min: 0, step: 0.01, defaultValue: 0, visibleWhen: usesInstitutionalProfile },
    { key: 'monthlyLimit', label: { en: 'Monthly limit', fa: 'حد ماهانه' }, type: 'number', min: 0, step: 0.01, defaultValue: 0, visibleWhen: usesInstitutionalProfile },
    { key: 'isPep', label: { en: 'PEP flag', fa: 'علامت PEP' }, type: 'toggle' },
    { key: 'isWatchlisted', label: { en: 'Watchlist flag', fa: 'در لیست نظارت' }, type: 'toggle' },
    { key: 'portalEnabled', label: { en: 'Portal enabled', fa: 'فعال برای پورتال' }, type: 'toggle' },
    { key: 'tags', label: { en: 'Tags', fa: 'تگ‌ها' }, type: 'text', hint: { en: 'Comma-separated tags.', fa: 'تگ‌ها را با کامه جدا کنید.' } },
    { key: 'notes', label: { en: 'Internal notes', fa: 'یادداشت داخلی' }, type: 'textarea', fullWidth: true },
  ],
  transformRecord: transformCustomerRecord,
  transformPayload: buildCustomerPayload,
  getRecordLabel: (record) => `${record.customerCode} - ${record.display?.name || record.id}`,
}

export const accountsConfig = {
  apiPath: '/api/accounts',
  entityName: { en: 'Account', fa: 'حساب' },
  entityNamePlural: { en: 'Accounts', fa: 'حساب‌ها' },
  searchPlaceholder: { en: 'Search by account number or customer...', fa: 'جستجو با نمبر حساب یا مشتری...' },
  pageSize: 15,
  allowDelete: true,
  deleteLabel: { en: 'Delete account', fa: 'حذف حساب' },
  confirmDeleteLabel: { en: 'Confirm delete', fa: 'تایید حذف' },
  updateMethod: 'put',
  actorFields: ({ mode }) => (mode === 'edit' ? ['updatedById'] : ['createdById']),
  formHeader: ({ api, language, refreshOptions }) => (
    <AccountCategoryManager api={api} language={language} refreshOptions={refreshOptions} />
  ),
  columns: [
    { key: 'accountNumber', label: { en: 'Account no.', fa: 'نمبر حساب' }, sortable: true, width: '150px' },
    { key: 'customer.customerCode', label: { en: 'Customer', fa: 'مشتری' }, render: (value) => value || '-' },
    { key: 'accountCategory.nameFa', label: { en: 'Category', fa: 'نوع حساب' }, render: (value, row) => value || row.accountCategory?.nameEn || '-' },
    { key: 'currency.code', label: { en: 'Currency', fa: 'ارز' }, width: '90px' },
    { key: 'accountType', label: { en: 'Type', fa: 'نوع' }, render: enumBadge },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: enumBadge },
    { key: 'balance', label: { en: 'Balance', fa: 'بیلانس' }, align: 'right', render: (value, row) => formatMoney(value, row.currency?.code) },
    { key: 'availableBalance', label: { en: 'Available', fa: 'قابل برداشت' }, align: 'right', render: (value, row) => formatMoney(value, row.currency?.code) },
    { key: 'onHoldAmount', label: { en: 'On hold', fa: 'هولد' }, align: 'right', render: (value, row) => formatMoney(value, row.currency?.code) },
  ],
  filters: [
    { key: 'accountType', label: { en: 'Account type', fa: 'نوع حساب' }, options: accountTypeOptions },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, options: accountStatusOptions },
    { key: 'portalVisible', label: { en: 'Portal visible', fa: 'نمایش در پورتال' }, options: yesNoOptions },
  ],
  formSections: [
    { title: { en: 'Opening information', fa: 'معلومات افتتاح حساب' }, keys: ['ownerKind', 'customerId', 'accountCategoryId', 'currencyId', 'accountType'], columns: 3 },
    { title: { en: 'Policy', fa: 'پالیسی حساب' }, keys: ['status', 'creditLimit', 'minimumBalance', 'portalVisible', 'notes'], columns: 2 },
  ],
  fields: [
    { key: 'ownerKind', label: { en: 'Account owner', fa: 'مالک حساب' }, type: 'select', required: true, options: accountOwnerOptions, defaultValue: 'CUSTOMER', createOnly: true },
    {
      key: 'customerId',
      label: { en: 'Customer', fa: 'مشتری' },
      type: 'select',
      required: true,
      createOnly: true,
      visibleWhen: isCustomerAccount,
      optionsSource: {
        path: '/api/customers',
        label: (item) => `${item.customerCode} - ${item.display?.name || item.customerCode}`,
      },
    },
    {
      key: 'accountCategoryId',
      label: { en: 'Non-customer category', fa: 'نوع حساب غیرمشتری' },
      type: 'select',
      required: true,
      createOnly: true,
      visibleWhen: isInternalAccount,
      optionsSource: {
        path: '/api/accounts/categories',
        label: accountCategoryLabel,
      },
    },
    {
      key: 'currencyId',
      label: { en: 'Currency', fa: 'ارز' },
      type: 'select',
      required: true,
      createOnly: true,
      autoSelectFirst: true,
      optionsSource: buildCommonCurrencyOptionsSource(),
    },
    { key: 'accountType', label: { en: 'Account type', fa: 'نوع حساب' }, type: 'select', required: true, options: accountTypeOptions, defaultValue: 'CASH', createOnly: true },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, type: 'select', options: accountStatusOptions, defaultValue: 'ACTIVE', visibleWhen: visibleInEdit },
    { key: 'creditLimit', label: { en: 'Credit limit', fa: 'حد اعتبار' }, type: 'number', min: 0, step: 0.01, defaultValue: 0 },
    { key: 'minimumBalance', label: { en: 'Minimum balance', fa: 'حداقل بیلانس' }, type: 'number', min: 0, step: 0.01, defaultValue: 0 },
    { key: 'portalVisible', label: { en: 'Visible in portal', fa: 'نمایش در پورتال' }, type: 'toggle' },
    { key: 'notes', label: { en: 'Internal notes', fa: 'یادداشت داخلی' }, type: 'textarea', fullWidth: true },
  ],
  transformRecord: (record) => ({
    ...record,
    ownerKind: record.customer?.id || record.customerId ? 'CUSTOMER' : 'INTERNAL',
    customerId: record.customerId || record.customer?.id || '',
    accountCategoryId: record.accountCategoryId || record.accountCategory?.id || '',
    currencyId: record.currencyId || record.currency?.id || '',
  }),
  transformPayload: (payload) => {
    const ownerKind = payload.ownerKind || 'CUSTOMER'
    const nextPayload = {
      ...payload,
      customerId: ownerKind === 'CUSTOMER' ? payload.customerId : null,
      accountCategoryId: ownerKind === 'INTERNAL' ? payload.accountCategoryId : null,
    }

    delete nextPayload.ownerKind
    return nextPayload
  },
  getRecordLabel: (record) => record.accountNumber,
}

export const cashFundsConfig = {
  apiPath: '/api/cash-funds',
  entityName: { en: 'Cash Fund', fa: 'صندوق نقد' },
  entityNamePlural: { en: 'Cash Funds', fa: 'صندوق‌ها' },
  searchPlaceholder: { en: 'Search vaults...', fa: 'جستجوی صندوق‌ها...' },
  pageSize: 15,
  allowDelete: true,
  deleteLabel: { en: 'Delete fund', fa: 'حذف صندوق' },
  confirmDeleteLabel: { en: 'Confirm delete', fa: 'تایید حذف' },
  updateMethod: 'patch',
  columns: [
    { key: 'name', label: { en: 'Name', fa: 'نام' }, sortable: true },
    { key: 'currencyCode', label: { en: 'Currency', fa: 'ارز' }, width: '90px' },
    { key: 'isVault', label: { en: 'Vault', fa: 'خزانه' } },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
    { key: 'openingBalance', label: { en: 'Opening', fa: 'افتتاحی' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
    { key: 'currentBalance', label: { en: 'Current', fa: 'فعلی' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
  ],
  filters: [
    { key: 'fundType', label: { en: 'Fund type', fa: 'نوع صندوق' }, options: [{ value: 'VAULT', label: { en: 'Vault', fa: 'خزانه' } }, { value: 'FLOAT', label: { en: 'Float', fa: 'صندوق کارمند' } }, { value: 'ALL', label: { en: 'All', fa: 'همه' } }] },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' }, options: yesNoOptions },
  ],
  formSections: [
    { title: { en: 'Main vault setup', fa: 'تنظیم خزانه اصلی' }, keys: ['currencyId', 'name', 'openingBalance', 'isActive'], columns: 2 },
  ],
  fields: [
    {
      key: 'currencyId',
      label: { en: 'Currency', fa: 'ارز' },
      type: 'select',
      required: true,
      createOnly: true,
      autoSelectFirst: true,
      optionsSource: buildCommonCurrencyOptionsSource(),
    },
    { key: 'name', label: { en: 'Vault name', fa: 'نام خزانه' }, type: 'text', required: true },
    { key: 'openingBalance', label: { en: 'Opening balance', fa: 'بیلانس افتتاحی' }, type: 'number', min: 0, step: 0.01, createOnly: true, defaultValue: 0 },
    { key: 'isActive', label: { en: 'Active', fa: 'فعال' }, type: 'toggle', defaultValue: true },
  ],
  getRecordLabel: (record) => `${record.name} (${record.currencyCode || ''})`,
}

export const transactionsConfig = {
  apiPath: '/api/transactions',
  entityName: { en: 'Transaction', fa: 'معامله' },
  entityNamePlural: { en: 'Transactions', fa: 'معاملات' },
  searchPlaceholder: { en: 'Search reference number...', fa: 'جستجو با نمبر مرجع...' },
  pageSize: 20,
  allowCreate: false,
  allowDelete: false,
  permissions: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  columns: [
    { key: 'referenceNo', label: { en: 'Reference', fa: 'مرجع' }, sortable: true, width: '150px' },
    { key: 'type', label: { en: 'Type', fa: 'نوع' }, render: enumBadge },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: enumBadge },
    { key: 'customer.customerCode', label: { en: 'Customer', fa: 'مشتری' } },
    { key: 'amount', label: { en: 'Amount', fa: 'مبلغ' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
    { key: 'fee', label: { en: 'Fee', fa: 'فیس' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
    { key: 'createdAt', label: { en: 'Created', fa: 'تاریخ' }, render: formatDate },
  ],
  filters: [
    { key: 'type', label: { en: 'Transaction type', fa: 'نوع معامله' }, options: transactionTypeOptions },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, options: transactionStatusOptions },
  ],
  fields: [],
  emptyMessage: { en: 'No transactions found.', fa: 'هیچ معامله پیدا نشد.' },
  getRecordLabel: (record) => record.referenceNo,
}

export const exchangeRatesConfig = {
  apiPath: '/api/exchange-rates',
  entityName: { en: 'Exchange Rate', fa: 'نرخ اسعار' },
  entityNamePlural: { en: 'Exchange Rates', fa: 'نرخ‌ها' },
  searchPlaceholder: { en: 'Search currency pair...', fa: 'جستجوی جفت ارز...' },
  pageSize: 15,
  allowDelete: true,
  deleteLabel: { en: 'Delete rate', fa: 'حذف نرخ' },
  confirmDeleteLabel: { en: 'Confirm delete', fa: 'تایید حذف' },
  permissions: {
    update: (record) => !record?.validTo,
    delete: () => true,
  },
  actorFields: {
    all: ['setByUserId'],
  },
  columns: [
    { key: 'buyCurrency.code', label: { en: 'Buy', fa: 'خرید' }, width: '90px' },
    { key: 'sellCurrency.code', label: { en: 'Sell', fa: 'فروش' }, width: '90px' },
    { key: 'buyRate', label: { en: 'Buy rate', fa: 'نرخ خرید' }, align: 'right' },
    { key: 'sellRate', label: { en: 'Sell rate', fa: 'نرخ فروش' }, align: 'right' },
    { key: 'midRate', label: { en: 'Mid rate', fa: 'نرخ متوسط' }, align: 'right' },
    { key: 'spread', label: { en: 'Spread', fa: 'اسپرد' }, align: 'right' },
    { key: 'source', label: { en: 'Source', fa: 'منبع' } },
    { key: 'validFrom', label: { en: 'Valid from', fa: 'اعتبار از' }, render: formatDate },
  ],
  fields: [
    {
      key: 'buyCurrencyId',
      label: { en: 'Buy currency', fa: 'ارز خرید' },
      type: 'select',
      required: true,
      optionsSource: buildCommonCurrencyOptionsSource(),
    },
    {
      key: 'sellCurrencyId',
      label: { en: 'Sell currency', fa: 'ارز فروش' },
      type: 'select',
      required: true,
      optionsSource: buildCommonCurrencyOptionsSource(),
    },
    { key: 'buyRate', label: { en: 'Buy rate', fa: 'نرخ خرید' }, type: 'number', required: true, min: 0, step: 0.00000001 },
    { key: 'sellRate', label: { en: 'Sell rate', fa: 'نرخ فروش' }, type: 'number', required: true, min: 0, step: 0.00000001 },
    { key: 'midRate', label: { en: 'Mid rate', fa: 'نرخ متوسط' }, type: 'number', min: 0, step: 0.00000001 },
    { key: 'spread', label: { en: 'Spread', fa: 'اسپرد' }, type: 'number', min: 0, step: 0.000001 },
    { key: 'source', label: { en: 'Source', fa: 'منبع' }, type: 'text', defaultValue: 'manual' },
    {
      key: 'setByUserId',
      label: { en: 'Set by user', fa: 'کاربر ثبت‌کننده' },
      type: 'select',
      hidden: true,
      optionsSource: {
        path: '/api/identity',
        label: (item) => `${item.username} - ${item.fullName}`,
      },
    },
  ],
  formSections: [
    { title: { en: 'Currency pair', fa: 'جفت ارز' }, keys: ['buyCurrencyId', 'sellCurrencyId'], columns: 2 },
    { title: { en: 'Rate values', fa: 'مقادیر نرخ' }, keys: ['buyRate', 'sellRate', 'midRate', 'spread', 'source'], columns: 3 },
  ],
  transformRecord: transformExchangeRateRecord,
  getRecordLabel: (record) => `${record.buyCurrency?.code || '?'} / ${record.sellCurrency?.code || '?'}`,
}

export const hawalaConfig = {
  apiPath: '/api/hawala',
  entityName: { en: 'Hawala', fa: 'حواله' },
  entityNamePlural: { en: 'Hawalas', fa: 'حواله‌ها' },
  searchPlaceholder: { en: 'Search tracking code, sender, receiver...', fa: 'جستجو با کود، فرستنده یا گیرنده...' },
  pageSize: 15,
  allowDelete: false,
  permissions: {
    update: () => false,
    delete: () => false,
  },
  actorFields: {
    new: ['createdById'],
  },
  columns: [
    { key: 'trackingCode', label: { en: 'Tracking', fa: 'کود پیگیری' }, sortable: true, width: '150px' },
    { key: 'type', label: { en: 'Type', fa: 'نوع' }, render: enumBadge },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: enumBadge },
    { key: 'senderName', label: { en: 'Sender', fa: 'فرستنده' } },
    { key: 'senderIdImagePath', label: { en: 'Sender ID image', fa: 'عکس تذکره فرستنده' } },
    { key: 'receiverName', label: { en: 'Receiver', fa: 'گیرنده' } },
    { key: 'sendAmount', label: { en: 'Send amount', fa: 'مبلغ ارسال' }, align: 'right', render: (value, row) => formatMoney(value, row.sendCurrency) },
    { key: 'receiveAmount', label: { en: 'Receive amount', fa: 'مبلغ دریافت' }, align: 'right', render: (value, row) => formatMoney(value, row.receiveCurrency) },
    { key: 'collectionDeadline', label: { en: 'Deadline', fa: 'مهلت' }, render: formatDate },
  ],
  filters: [
    { key: 'type', label: { en: 'Hawala type', fa: 'نوع حواله' }, options: hawalaTypeOptions },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, options: hawalaStatusOptions },
  ],
  formSections: [
    { title: { en: 'Sender and receiver', fa: 'فرستنده و گیرنده' }, keys: ['type', 'senderName', 'senderPhone', 'senderId', 'senderIdImagePath', 'receiverName', 'receiverPhone', 'receiverCity', 'receiverCountry', 'receiverIdImagePath'], columns: 2 },
    { title: { en: 'Money movement', fa: 'حرکت پول' }, keys: ['sendCurrency', 'sendAmount', 'receiveCurrency', 'receiveAmount', 'exchangeRate', 'feeAmount', 'feePaidBy', 'feePaymentMethod'], columns: 3 },
    { title: { en: 'Control', fa: 'کنترول' }, keys: ['secretCode', 'collectionDeadline', 'narration'], columns: 2 },
  ],
  fields: [
    { key: 'type', label: { en: 'Hawala type', fa: 'نوع حواله' }, type: 'select', required: true, options: hawalaTypeOptions, defaultValue: 'INTERNAL' },
    { key: 'senderName', label: { en: 'Sender name', fa: 'نام فرستنده' }, type: 'text', required: true },
    { key: 'senderPhone', label: { en: 'Sender phone', fa: 'تماس فرستنده' }, type: 'tel' },
    { key: 'senderId', label: { en: 'Sender ID', fa: 'شناسه فرستنده' }, type: 'text' },
    {
      key: 'senderIdImagePath',
      label: { en: 'Sender tazkira image', fa: 'عکس تذکره فرستنده' },
      type: 'file',
      accept: 'image/*',
      hint: {
        en: 'Store a local file path only; file upload can be added later.',
        fa: 'فعلا فقط آدرس فایل محلی ذخیره می‌شود؛ آپلود فایل بعدا اضافه می‌شود.',
      },
    },
    { key: 'receiverName', label: { en: 'Receiver name', fa: 'نام گیرنده' }, type: 'text', required: true },
    { key: 'receiverPhone', label: { en: 'Receiver phone', fa: 'تماس گیرنده' }, type: 'tel' },
    { key: 'receiverCity', label: { en: 'Receiver city', fa: 'شهر گیرنده' }, type: 'text' },
    { key: 'receiverCountry', label: { en: 'Receiver country', fa: 'کشور گیرنده' }, type: 'text' },
    {
      key: 'receiverIdImagePath',
      label: { en: 'Receiver tazkira image', fa: 'عکس تذکره گیرنده' },
      type: 'file',
      accept: 'image/*',
      hint: {
        en: 'Optional local path for receiver ID evidence.',
        fa: 'آدرس محلی اختیاری برای سند هویت گیرنده.',
      },
    },
    {
      key: 'sendCurrency',
      label: { en: 'Send currency', fa: 'ارز ارسال' },
      type: 'select',
      required: true,
      optionsSource: buildCommonCurrencyOptionsSource({ valueKey: 'code' }),
    },
    { key: 'sendAmount', label: { en: 'Send amount', fa: 'مبلغ ارسال' }, type: 'number', required: true, min: 0.0001, step: 0.01 },
    {
      key: 'receiveCurrency',
      label: { en: 'Receive currency', fa: 'ارز دریافت' },
      type: 'select',
      required: true,
      optionsSource: buildCommonCurrencyOptionsSource({ valueKey: 'code' }),
    },
    { key: 'receiveAmount', label: { en: 'Receive amount', fa: 'مبلغ دریافت' }, type: 'number', min: 0.0001, step: 0.01 },
    { key: 'exchangeRate', label: { en: 'Exchange rate', fa: 'نرخ تبادله' }, type: 'number', min: 0, step: 0.00000001 },
    { key: 'feeAmount', label: { en: 'Fee amount', fa: 'مبلغ فیس' }, type: 'number', min: 0, step: 0.01, defaultValue: 0 },
    { key: 'feePaidBy', label: { en: 'Fee paid by', fa: 'پرداخت‌کننده فیس' }, type: 'select', options: ['SENDER', 'RECEIVER', 'NONE'].map((value) => ({ value, label: value })), defaultValue: 'SENDER' },
    { key: 'feePaymentMethod', label: { en: 'Fee payment method', fa: 'روش پرداخت فیس' }, type: 'select', options: paymentMethodOptions, defaultValue: 'CASH' },
    { key: 'secretCode', label: { en: 'Secret code', fa: 'کود مخفی' }, type: 'text' },
    { key: 'collectionDeadline', label: { en: 'Collection deadline', fa: 'مهلت دریافت' }, type: 'date' },
    {
      key: 'createdById',
      label: { en: 'Created by user', fa: 'کاربر ثبت‌کننده' },
      type: 'select',
      required: true,
      createOnly: true,
      hidden: true,
      optionsSource: {
        path: '/api/identity',
        label: (item) => `${item.username} - ${item.fullName}`,
      },
    },
    { key: 'narration', label: { en: 'Narration', fa: 'شرح' }, type: 'textarea', fullWidth: true },
  ],
  getRecordLabel: (record) => record.trackingCode,
}

export const hawalaTransferConfig = {
  apiPath: '/api/hawala',
  entityName: { en: 'Hawala Transfer', fa: 'حواله پول' },
  entityNamePlural: { en: 'Hawala Transfers', fa: 'حوالات پول' },
  searchPlaceholder: { en: 'Search by hawala number, tracking, city, sender, receiver...', fa: 'جستجو با نمبر حواله، کد، شهر، فرستنده یا گیرنده...' },
  pageSize: 15,
  allowDelete: (record) => record.status === 'CREATED',
  deleteLabel: { en: 'Cancel hawala', fa: 'لغو حواله' },
  confirmDeleteLabel: { en: 'Confirm cancel', fa: 'تایید لغو' },
  deleteAction: async ({ api, currentUserId, record, values }) => {
    await api.post(`/api/hawala/${record.id}/cancel`, buildCancelHawalaPayload(record, values, currentUserId))
  },
  permissions: {

    update: (record) => record?.status === 'CREATED',
    delete: (record) => record?.status === 'CREATED',
  },
  rowActions: [
    {
      key: 'print',
      icon: Printer,
      label: { en: 'Print slip', fa: 'چاپ برگه' },
      onClick: (record) => openHawalaPrintWindow(record),
    },
  ],
  actorFields: ({ mode }) => (mode === 'edit' ? ['updatedById'] : ['createdById']),
  onCreated: (record) => openHawalaPrintWindow(record, { autoprint: true }),
  automationNotes: [
    {
      title: { en: 'Outgoing and incoming', fa: 'ارسالی و دریافتی' },
      body: {
        en: 'Choose the direction first. The form keeps the same accounting-safe fields for both screens shown in the reference.',
        fa: 'اول نوع حواله را انتخاب کنید. فرم برای ارسالی و دریافتی همان فیلدهای امن حسابداری عکس مرجع را نگه می‌دارد.',
      },
    },
    {
      title: { en: 'System tracking', fa: 'پیگیری سیستم' },
      body: {
        en: 'The backend still creates the internal tracking code. The hawala number field stores the number written by the exchange office.',
        fa: 'بک‌اند کد پیگیری داخلی را خودکار می‌سازد. فیلد نمبر حواله، نمبر واردشده از طرف صرافی را ذخیره می‌کند.',
      },
    },
  ],
  columns: [
    { key: 'trackingCode', label: { en: 'System tracking', fa: 'کد سیستم' }, sortable: true, width: '150px' },
    { key: 'externalTrackingCode', label: { en: 'Hawala no.', fa: 'نمبر حواله' } },
    { key: 'direction', label: { en: 'Direction', fa: 'نوع حواله' }, render: enumBadge },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, render: enumBadge },
    { key: 'originTradingCity.title', label: { en: 'From city', fa: 'شهر مبدأ' } },
    { key: 'destinationTradingCity.title', label: { en: 'To city', fa: 'شهر مقصد' } },
    { key: 'senderName', label: { en: 'Sender', fa: 'فرستنده' } },
    { key: 'receiverName', label: { en: 'Receiver', fa: 'گیرنده' } },
    { key: 'payableAmount', label: { en: 'Payable', fa: 'مبلغ قابل پرداخت' }, align: 'right', render: (value, row) => formatMoney(value || row.receiveAmount, row.receiveCurrency) },
    { key: 'totalCommission', label: { en: 'Total commission', fa: 'مبلغ کل کمیشن' }, align: 'right', render: (value, row) => formatMoney(value, row.sendCurrency) },
    { key: 'executorCommission', label: { en: 'Executor commission', fa: 'کمیشن اجرا کننده' }, align: 'right', render: (value, row) => formatMoney(value, row.sendCurrency) },
    { key: 'documentPath', label: { en: 'Document', fa: 'سند حواله' } },
    { key: 'createdAt', label: { en: 'Created', fa: 'تاریخ' }, render: formatDate },
  ],
  filters: [
    { key: 'direction', label: { en: 'Direction', fa: 'نوع حواله' }, options: hawalaDirectionOptions },
    { key: 'status', label: { en: 'Status', fa: 'وضعیت' }, options: hawalaStatusOptions },
    { key: 'type', label: { en: 'Hawala type', fa: 'نوع مسیر' }, options: hawalaTypeOptions },
  ],
  formSections: [
    { title: { en: 'Transfer rule', fa: 'قاعده حواله' }, keys: ['direction', 'type', 'agentId', 'selectedCashFundId', 'originTradingCityId', 'destinationTradingCityId', 'externalTrackingCode', 'exchangeSideTracking'], columns: 3 },
    { title: { en: 'Money and commission', fa: 'پول و کمیشن' }, keys: ['currencyCode', 'payableAmount', 'totalCommission', 'executorCommission', 'feePaidBy', 'feePaymentMethod'], columns: 3 },
    { title: { en: 'Sender and receiver', fa: 'فرستنده و گیرنده' }, keys: ['senderName', 'senderPhone', 'senderId', 'senderIdImagePath', 'receiverName', 'receiverPhone', 'receiverIdImagePath'], columns: 2 },
    { title: { en: 'Document and control', fa: 'سند و کنترل' }, keys: ['documentPath', 'secretCode', 'collectionDeadline', 'narration'], columns: 2 },
  ],
  fields: [
    { key: 'direction', label: { en: 'Hawala direction', fa: 'نوع حواله' }, type: 'select', required: true, options: hawalaDirectionOptions, defaultValue: 'OUTGOING' },
    { key: 'type', label: { en: 'Route type', fa: 'نوع مسیر' }, type: 'select', required: true, options: hawalaTypeOptions, defaultValue: 'INTERNAL' },
    {
      key: 'agentId',
      label: { en: 'Correspondent agent', fa: 'نماینده / همکار حواله' },
      type: 'select',
      required: true,
      visibleWhen: (values) => values.type === 'EXTERNAL',
      optionsSource: {
        path: '/api/hawala/agents',
        params: { isActive: true },
        label: (item) => [item.name, item.city, item.country].filter(Boolean).join(' - '),
        filter: (item) => item.isActive !== false,
      },
      hint: {
        en: 'External hawalas must be linked to an active correspondent agent.',
        fa: 'حواله خارجی باید به یک نماینده فعال وصل باشد.',
      },
    },
    {
      key: 'selectedCashFundId',
      label: { en: 'Account / cash fund', fa: 'انتخاب حساب / صندوق' },
      type: 'select',
      optionsSource: {
        path: '/api/cash-funds',
        params: { fundType: 'ALL' },
        label: (item) => `${item.name} - ${item.currencyCode}`,
        filter: (item) => item.isActive,
      },
      hint: {
        en: 'If empty, the backend uses the active main vault for the selected currency.',
        fa: 'اگر خالی بماند، بک‌اند خزانه اصلی همان ارز را استفاده می‌کند.',
      },
    },
    {
      key: 'originTradingCityId',
      label: { en: 'From city / branch', fa: 'شهر / شعبه مبدأ' },
      type: 'select',
      optionsSource: {
        path: '/api/settings/trading-cities',
        params: { isActive: true },
        label: (item) => [item.title, item.cityName, item.branchName].filter(Boolean).join(' - '),
        filter: (item) => item.isActive,
      },
    },
    {
      key: 'destinationTradingCityId',
      label: { en: 'To city / branch', fa: 'شهر / شعبه مقصد' },
      type: 'select',
      optionsSource: {
        path: '/api/settings/trading-cities',
        params: { isActive: true },
        label: (item) => [item.title, item.cityName, item.branchName].filter(Boolean).join(' - '),
        filter: (item) => item.isActive,
      },
    },
    { key: 'externalTrackingCode', label: { en: 'Hawala number', fa: 'نمبر حواله' }, type: 'text' },
    { key: 'exchangeSideTracking', label: { en: 'Tracking from exchange side', fa: 'نمبر اوکی از طرف صراف' }, type: 'toggle' },
    {
      key: 'currencyCode',
      label: { en: 'Currency', fa: 'نوعیت پول' },
      type: 'select',
      required: true,
      autoSelectFirst: true,
      optionsSource: buildCommonCurrencyOptionsSource({ valueKey: 'code' }),
    },
    { key: 'payableAmount', label: { en: 'Payable amount', fa: 'مبلغ قابل پرداخت' }, type: 'number', required: true, min: 0.0001, step: 0.01 },
    { key: 'totalCommission', label: { en: 'Total commission', fa: 'مبلغ کل کمیشن' }, type: 'number', min: 0, step: 0.01, defaultValue: 0 },
    { key: 'executorCommission', label: { en: 'Executor commission', fa: 'کمیشن اجرا کننده' }, type: 'number', min: 0, step: 0.01, defaultValue: 0 },
    { key: 'feePaidBy', label: { en: 'Commission paid by', fa: 'پرداخت‌کننده کمیشن' }, type: 'select', options: ['SENDER', 'RECEIVER', 'NONE'].map((value) => ({ value, label: value })), defaultValue: 'SENDER' },
    { key: 'feePaymentMethod', label: { en: 'Commission payment method', fa: 'روش پرداخت کمیشن' }, type: 'select', options: paymentMethodOptions, defaultValue: 'CASH' },
    { key: 'senderName', label: { en: 'Sender name', fa: 'نام فرستنده' }, type: 'text', required: true },
    { key: 'senderPhone', label: { en: 'Sender phone', fa: 'تماس فرستنده' }, type: 'tel' },
    { key: 'senderId', label: { en: 'Sender ID', fa: 'نمبر تذکره فرستنده' }, type: 'text' },
    { key: 'senderIdImagePath', label: { en: 'Sender tazkira image', fa: 'عکس تذکره فرستنده' }, type: 'file', accept: 'image/*' },
    { key: 'receiverName', label: { en: 'Receiver name', fa: 'نام گیرنده' }, type: 'text', required: true },
    { key: 'receiverPhone', label: { en: 'Receiver phone', fa: 'تماس گیرنده' }, type: 'tel' },
    { key: 'receiverIdImagePath', label: { en: 'Receiver tazkira image', fa: 'عکس تذکره گیرنده' }, type: 'file', accept: 'image/*' },
    { key: 'documentPath', label: { en: 'Hawala document', fa: 'سند حواله' }, type: 'file', accept: 'image/*,.pdf' },
    { key: 'secretCode', label: { en: 'Secret code', fa: 'کد مخفی' }, type: 'text' },
    { key: 'collectionDeadline', label: { en: 'Collection deadline', fa: 'مهلت دریافت' }, type: 'date' },
    {
      key: 'createdById',
      label: { en: 'Created by user', fa: 'کاربر ثبت‌کننده' },
      type: 'select',
      required: true,
      createOnly: true,
      hidden: true,
      optionsSource: {
        path: '/api/identity',
        label: (item) => `${item.username} - ${item.fullName}`,
      },
    },
    {
      key: 'updatedById',
      label: { en: 'Updated by user', fa: 'کاربر ویرایش‌کننده' },
      type: 'select',
      required: true,
      hidden: true,
      visibleWhen: (values, mode) => mode === 'edit',
      optionsSource: {
        path: '/api/identity',
        label: (item) => `${item.username} - ${item.fullName}`,
      },
    },
    { key: 'narration', label: { en: 'Details', fa: 'تفصیل حواله' }, type: 'textarea', fullWidth: true },
  ],
  transformRecord: transformHawalaTransferRecord,
  transformPayload: buildHawalaPayload,
  getRecordLabel: (record) => record.externalTrackingCode || record.trackingCode,
}

hawalaTransferConfig.formSections = [
  {
    title: { en: 'Transfer rule', fa: 'قاعده حواله' },
    keys: [
      'direction',
      'type',
      'agentId',
      'originTradingCityId',
      'destinationTradingCityId',
      'selectedCashFundId',
      'externalTrackingCode',
      'exchangeSideTracking',
    ],
    columns: 3,
  },
  {
    title: { en: 'Money and commission', fa: 'پول و کمیشن' },
    keys: [
      'currencyCode',
      'payableAmount',
      'totalCommission',
      'executorCommission',
      'feePaidBy',
      'feePaymentMethod',
    ],
    columns: 3,
  },
  {
    title: { en: 'Sender and receiver', fa: 'فرستنده و گیرنده' },
    keys: [
      'senderName',
      'senderPhone',
      'senderId',
      'senderIdImagePath',
      'receiverName',
      'receiverPhone',
      'receiverIdImagePath',
      'secretCode',
      'collectionDeadline',
    ],
    columns: 3,
  },
  {
    title: { en: 'Document and details', fa: 'سند و تفصیل' },
    keys: ['documentPath', 'narration'],
    columns: 2,
  },
]

export const masterConfigByModuleKey = {
  identity: identityConfig,
  customers: customersConfig,
  accounts: accountsConfig,
  'cash-funds': cashFundsConfig,
  transactions: transactionsConfig,
  'exchange-rates': exchangeRatesConfig,
  hawala: hawalaTransferConfig,
}
