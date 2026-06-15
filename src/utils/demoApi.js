const DEMO_TOKEN = 'demo-session-token'

const now = new Date('2026-06-02T09:30:00+04:30')

function iso(daysOffset = 0, hoursOffset = 0) {
  const value = new Date(now)
  value.setDate(value.getDate() + daysOffset)
  value.setHours(value.getHours() + hoursOffset)
  return value.toISOString()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function collection(items, params = {}) {
  const page = Number(params.page || 1)
  const limit = Number(params.limit || params.pageSize || items.length || 15)
  const search = String(params.search || '').trim().toLowerCase()
  const filtered = search
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search))
    : items
  const start = Math.max(0, (page - 1) * limit)
  const data = filtered.slice(start, start + limit)

  return {
    items: data,
    data,
    count: filtered.length,
    meta: {
      total: filtered.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  }
}

function ok(data, config, status = 200) {
  return Promise.resolve({
    config,
    data: clone({ data }),
    headers: {},
    request: {},
    status,
    statusText: status === 201 ? 'Created' : 'OK',
  })
}

function notFound(config) {
  return Promise.resolve({
    config,
    data: { message: 'Demo record was not found.' },
    headers: {},
    request: {},
    status: 404,
    statusText: 'Not Found',
  })
}

let companyProfile = {
  name: 'Exchange Demo',
  companyName: 'Exchange Demo',
  legalName: 'Exchange Demo Ltd.',
  registrationNumber: 'DEMO-EX-2026',
  registrationNo: 'DEMO-EX-2026',
  taxId: 'DEMO-TAX-101',
  phone: '+93 700 123 456',
  email: 'demo@kabulexchange.example',
  logoPath: '',
  defaultCurrency: 'AFN',
  timezone: 'Asia/Kabul',
  address: 'Share-e-Naw, Kabul, Afghanistan',
  receiptFooter: 'Demo receipt. No real money movement.',
}

const systemConfig = {
  display: {
    themeColor: '#173049',
    fontColor: '#141c22',
    fontFamily: 'Inter',
    fontSize: 15,
    decimalPlaces: 2,
    thousandsSeparator: true,
    persianDigits: false,
    defaultLanguage: 'fa',
  },
  accountingPolicy: {
    allowNegativeChequeClearance: false,
    allowOverCreditLimit: false,
    allowOverDebitLimit: false,
    payWhenInsufficientBalance: false,
  },
  hawala: {
    trackingPrefix: 'HW',
    trackingPadding: 4,
    collectionDeadlineDays: 7,
  },
  security: {
    loginRequired: false,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordExpiryDays: 0,
    failedLoginLockThreshold: 5,
    failedLoginLockMinutes: 15,
    sessionTimeoutMinutes: {
      ADMIN: 60,
      MANAGER: 60,
      OPERATOR: 30,
      AUDITOR: 45,
      CUSTOM: 30,
    },
    twoFactorRequired: {
      ADMIN: false,
      MANAGER: false,
      OPERATOR: false,
      AUDITOR: false,
      CUSTOM: false,
    },
  },
  printer: {
    connectionType: 'USB',
    usbName: 'Demo Thermal 80mm',
    networkHost: '',
    networkPort: 9100,
    footerText: 'Demo receipt. No real money movement.',
  },
  notifications: {
    largeTransactionAmount: 10000,
    kycExpiryDays: 30,
    hawalaOverdueDays: 2,
    backupNoSuccessHours: 25,
  },
  backup: {
    schedule: 'DAILY',
    storageType: 'local',
    retentionCount: 30,
  },
}

const transactionConfig = {
  accounts: {
    numberPrefix: 'ACC',
    numberPadding: 5,
  },
  transactions: {
    referencePadding: 4,
    referencePrefix: {
      DEPOSIT: 'DP',
      WITHDRAWAL: 'WD',
      TRANSFER: 'TR',
      EXCHANGE: 'FX',
      REVERSAL: 'RV',
      ADJUSTMENT: 'ADJ',
      VAULT_IN: 'VIN',
      VAULT_OUT: 'VOUT',
      HAWALA_SEND: 'HS',
      HAWALA_PAY: 'HP',
      HAWALA_RETURN: 'HR',
      HAWALA_SETTLE: 'HST',
    },
  },
  printing: {
    autoQueue: {
      DEPOSIT: true,
      WITHDRAWAL: true,
      TRANSFER: true,
      EXCHANGE: true,
      REVERSAL: true,
      HAWALA_SEND: true,
      HAWALA_PAY: true,
      HAWALA_RETURN: true,
      DAILY_CASH_SUMMARY: false,
      ACCOUNT_STATEMENT: false,
    },
    defaultCopies: {
      DEPOSIT: 1,
      WITHDRAWAL: 1,
      TRANSFER: 1,
      EXCHANGE: 1,
      REVERSAL: 1,
      HAWALA_SEND: 2,
      HAWALA_PAY: 2,
      HAWALA_RETURN: 1,
      DAILY_CASH_SUMMARY: 1,
      ACCOUNT_STATEMENT: 1,
    },
  },
}

const demoPermissions = [
  'dashboard',
  'auditLog',
  'backup',
  'transactionsDemo',
  'accounts',
  'accountCreate',
  'accountClose',
  'cashFunds',
  'cashFundManage',
  'customers',
  'customerCreate',
  'customerKyc',
  'exchangeRates',
  'hawala',
  'hawalaCreate',
  'hawalaPay',
  'hawalaAgents',
  'journalLedger',
  'ledgerExport',
  'notifications',
  'reports',
  'reportExport',
  'roleManagement',
  'companySettings',
  'systemSettings',
  'userManagement',
].map((area) => ({ area, level: 'FULL' }))

const demoPermissionAreas = demoPermissions.map((permission) => ({
  key: permission.area,
  label: permission.area,
}))

const currentUser = {
  id: 'user-admin',
  username: 'demo.admin',
  fullName: 'Demo Administrator',
  email: 'admin@kabulexchange.example',
  phone: '+93 700 123 456',
  role: 'ADMIN',
  roleProfileId: 'role-admin',
  roleProfile: { id: 'role-admin', name: 'Administrator' },
  isActive: true,
  isHidden: false,
  permissions: demoPermissions,
  lastLoginAt: iso(0, -1),
}

const roles = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full access for the online demo workspace.',
    isActive: true,
    permissions: demoPermissions,
    createdAt: iso(-40),
  },
  {
    id: 'role-manager',
    name: 'Branch Manager',
    description: 'Demo user, customer, and reporting access.',
    isActive: true,
    permissions: demoPermissions.map((permission) => ({ ...permission, level: 'EDIT' })),
    createdAt: iso(-35),
  },
]

const users = [
  currentUser,
  {
    id: 'user-operator',
    username: 'sarah.operator',
    fullName: 'Sarah Miller',
    email: 'sarah@kabulexchange.example',
    phone: '+93 701 222 333',
    role: 'MANAGER',
    roleProfileId: 'role-manager',
    roleProfile: roles[1],
    isActive: true,
    isHidden: false,
    twoFactorEnabled: true,
    failedLoginCount: 0,
    lastLoginAt: iso(-1),
  },
]

const currencies = [
  { id: 'cur-afn', code: 'AFN', name: 'Afghan Afghani', symbol: 'AFN', decimalPlaces: 2, isActive: true },
  { id: 'cur-usd', code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
  { id: 'cur-aed', code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2, isActive: true },
  { id: 'cur-eur', code: 'EUR', name: 'Euro', symbol: 'EUR', decimalPlaces: 2, isActive: true },
  { id: 'cur-pkr', code: 'PKR', name: 'Pakistani Rupee', symbol: 'PKR', decimalPlaces: 2, isActive: true },
]

const customers = [
  {
    id: 'cust-001',
    customerCode: 'CUS-0001',
    type: 'INDIVIDUAL',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    riskLevel: 'LOW',
    firstName: 'Omar',
    lastName: 'Haddad',
    displayName: 'Omar Haddad',
    display: { name: 'Omar Haddad', phone: '+93 700 555 101' },
    phone: '+93 700 555 101',
    email: 'omar.haddad@example.com',
    address: 'Wazir Akbar Khan, Kabul',
    createdAt: iso(-22),
    updatedAt: iso(-1),
  },
  {
    id: 'cust-002',
    customerCode: 'CUS-0002',
    type: 'CORPORATE',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    riskLevel: 'MEDIUM',
    companyName: 'Nawbahar Trading Co.',
    displayName: 'Nawbahar Trading Co.',
    display: { name: 'Nawbahar Trading Co.', phone: '+93 799 444 202' },
    phone: '+93 799 444 202',
    email: 'finance@nawbahar.example',
    address: 'Mandawi Market, Kabul',
    createdAt: iso(-18),
    updatedAt: iso(-2),
  },
  {
    id: 'cust-003',
    customerCode: 'CUS-0003',
    type: 'VIP',
    baseProfileType: 'INDIVIDUAL',
    status: 'ACTIVE',
    kycStatus: 'PENDING',
    riskLevel: 'HIGH',
    firstName: 'Lina',
    lastName: 'Rahman',
    displayName: 'Lina Rahman',
    display: { name: 'Lina Rahman', phone: '+93 788 333 303' },
    phone: '+93 788 333 303',
    email: 'lina.rahman@example.com',
    vipTier: 'GOLD',
    createdAt: iso(-12),
    updatedAt: iso(-1),
  },
]

const accountCategories = [
  { id: 'cat-current', key: 'CURRENT', nameEn: 'Current Account', nameFa: 'Current Account', isActive: true },
  { id: 'cat-vip', key: 'VIP', nameEn: 'VIP Account', nameFa: 'VIP Account', isActive: true },
]

const accounts = [
  {
    id: 'acc-001',
    accountNo: 'ACC-10001',
    accountNumber: 'ACC-10001',
    accountName: 'Omar Haddad USD',
    customerId: 'cust-001',
    customer: customers[0],
    currencyId: 'cur-usd',
    currency: currencies[1],
    currencyCode: 'USD',
    categoryId: 'cat-current',
    category: accountCategories[0],
    accountCategoryId: 'cat-current',
    accountCategory: accountCategories[0],
    accountType: 'CASH',
    balance: 48500,
    currentBalance: 48500,
    availableBalance: 48200,
    onHoldAmount: 300,
    status: 'ACTIVE',
    isActive: true,
    createdAt: iso(-20),
  },
  {
    id: 'acc-002',
    accountNo: 'ACC-10002',
    accountNumber: 'ACC-10002',
    accountName: 'Nawbahar AFN',
    customerId: 'cust-002',
    customer: customers[1],
    currencyId: 'cur-afn',
    currency: currencies[0],
    currencyCode: 'AFN',
    categoryId: 'cat-current',
    category: accountCategories[0],
    accountCategoryId: 'cat-current',
    accountCategory: accountCategories[0],
    accountType: 'BUSINESS',
    balance: 3420000,
    currentBalance: 3420000,
    availableBalance: 3405000,
    onHoldAmount: 15000,
    status: 'ACTIVE',
    isActive: true,
    createdAt: iso(-16),
  },
  {
    id: 'acc-003',
    accountNo: 'ACC-10003',
    accountNumber: 'ACC-10003',
    accountName: 'Lina Rahman AED',
    customerId: 'cust-003',
    customer: customers[2],
    currencyId: 'cur-aed',
    currency: currencies[2],
    currencyCode: 'AED',
    categoryId: 'cat-vip',
    category: accountCategories[1],
    accountCategoryId: 'cat-vip',
    accountCategory: accountCategories[1],
    accountType: 'SAVINGS',
    balance: 128000,
    currentBalance: 128000,
    availableBalance: 128000,
    onHoldAmount: 0,
    status: 'ACTIVE',
    isActive: true,
    createdAt: iso(-10),
  },
]

const cashFunds = [
  {
    id: 'fund-usd',
    name: 'Main USD Vault',
    fundType: 'VAULT',
    currencyCode: 'USD',
    currentBalance: 260000,
    openingBalance: 240000,
    isVault: true,
    isActive: true,
    managerUserId: 'user-admin',
    createdAt: iso(-30),
  },
  {
    id: 'fund-afn',
    name: 'AFN Counter Cash',
    fundType: 'CASHIER',
    currencyCode: 'AFN',
    currentBalance: 12850000,
    openingBalance: 12000000,
    isVault: false,
    isActive: true,
    managerUserId: 'user-operator',
    createdAt: iso(-28),
  },
  {
    id: 'fund-aed',
    name: 'AED Vault',
    fundType: 'VAULT',
    currencyCode: 'AED',
    currentBalance: 390000,
    openingBalance: 360000,
    isVault: true,
    isActive: true,
    managerUserId: 'user-admin',
    createdAt: iso(-25),
  },
]

const transactions = [
  {
    id: 'txn-001',
    referenceNo: 'TX-2026-0001',
    type: 'DEPOSIT',
    status: 'COMPLETED',
    customerId: 'cust-001',
    customer: customers[0],
    creditAccountId: 'acc-001',
    amount: 12500,
    currencyCode: 'USD',
    fee: 20,
    paymentMethod: 'CASH',
    narration: 'Customer cash deposit for demo.',
    createdAt: iso(0, -5),
  },
  {
    id: 'txn-002',
    referenceNo: 'TX-2026-0002',
    type: 'EXCHANGE',
    status: 'COMPLETED',
    customerId: 'cust-002',
    customer: customers[1],
    debitAccountId: 'acc-001',
    creditAccountId: 'acc-002',
    amount: 8000,
    currencyCode: 'USD',
    exchangeRate: 71.2,
    fee: 35,
    paymentMethod: 'ACCOUNT',
    narration: 'USD to AFN exchange.',
    createdAt: iso(0, -4),
  },
  {
    id: 'txn-003',
    referenceNo: 'TX-2026-0003',
    type: 'TRANSFER',
    status: 'PENDING_APPROVAL',
    customerId: 'cust-003',
    customer: customers[2],
    debitAccountId: 'acc-003',
    creditAccountId: 'acc-001',
    amount: 25000,
    currencyCode: 'AED',
    fee: 45,
    paymentMethod: 'ACCOUNT',
    narration: 'Large transfer awaiting approval.',
    createdAt: iso(0, -2),
  },
]

const exchangeRates = [
  { id: 'rate-001', buyCurrencyId: 'cur-usd', buyCurrency: currencies[1], sellCurrencyId: 'cur-afn', sellCurrency: currencies[0], buyRate: 70.8, sellRate: 71.2, spread: 0.4, isActive: true, createdAt: iso(-1) },
  { id: 'rate-002', buyCurrencyId: 'cur-aed', buyCurrency: currencies[2], sellCurrencyId: 'cur-afn', sellCurrency: currencies[0], buyRate: 19.25, sellRate: 19.42, spread: 0.17, isActive: true, createdAt: iso(-1) },
]

const tradingCities = [
  {
    id: 'city-kabul',
    title: 'Kabul Main Branch',
    cityName: 'Kabul',
    branchName: 'Main Branch',
    country: 'Afghanistan',
    managerName: 'Demo Administrator',
    phone: '+93 700 123 456',
    officePhone: '+93 700 123 456',
    officeAddress: 'Share-e-Naw, Kabul',
    notes: 'Primary demo branch.',
    customerId: 'cust-001',
    customer: customers[0],
    isActive: true,
  },
  {
    id: 'city-dubai',
    title: 'Dubai Partner Desk',
    cityName: 'Dubai',
    branchName: 'Deira Desk',
    country: 'United Arab Emirates',
    managerName: 'Dubai Partner',
    phone: '+971 4 000 0000',
    officePhone: '+971 4 000 0000',
    officeAddress: 'Deira, Dubai',
    notes: 'Partner collection desk.',
    customerId: 'cust-002',
    customer: customers[1],
    isActive: true,
  },
  {
    id: 'city-herat',
    title: 'Herat Branch',
    cityName: 'Herat',
    branchName: 'Central Branch',
    country: 'Afghanistan',
    managerName: 'Herat Manager',
    phone: '+93 799 111 222',
    officePhone: '+93 799 111 222',
    officeAddress: 'Central Herat',
    notes: 'Domestic hawala branch.',
    customerId: 'cust-003',
    customer: customers[2],
    isActive: true,
  },
]

const agents = [
  { id: 'agent-001', name: 'Dubai Remit Partner', city: 'Dubai', country: 'United Arab Emirates', phone: '+971 50 000 0000', isActive: true },
  { id: 'agent-002', name: 'Herat Exchange Partner', city: 'Herat', country: 'Afghanistan', phone: '+93 799 111 222', isActive: true },
]

const hawalas = [
  {
    id: 'haw-001',
    trackingCode: 'HW-2026-0001',
    externalTrackingCode: 'DXB-77821',
    direction: 'OUTGOING',
    type: 'EXTERNAL',
    status: 'CREATED',
    senderName: 'Omar Haddad',
    senderPhone: '+93 700 555 101',
    receiverName: 'Mariam Haddad',
    receiverPhone: '+971 55 555 1010',
    sendCurrency: 'USD',
    receiveCurrency: 'AED',
    currencyCode: 'USD',
    sendAmount: 4000,
    receiveAmount: 14680,
    payableAmount: 14680,
    totalCommission: 18,
    executorCommission: 8,
    feeAmount: 18,
    feePaidBy: 'SENDER',
    secretCode: '4821',
    originTradingCityId: 'city-kabul',
    destinationTradingCityId: 'city-dubai',
    originTradingCity: tradingCities[0],
    destinationTradingCity: tradingCities[1],
    collectionDeadline: iso(5),
    createdAt: iso(0, -3),
  },
  {
    id: 'haw-002',
    trackingCode: 'HW-2026-0002',
    externalTrackingCode: 'HER-11204',
    direction: 'INCOMING',
    type: 'INTERNAL',
    status: 'PAID',
    senderName: 'Lina Rahman',
    senderPhone: '+93 788 333 303',
    receiverName: 'Farid Rahman',
    receiverPhone: '+93 799 300 404',
    sendCurrency: 'AFN',
    receiveCurrency: 'AFN',
    currencyCode: 'AFN',
    sendAmount: 185000,
    receiveAmount: 185000,
    payableAmount: 185000,
    totalCommission: 350,
    executorCommission: 150,
    feeAmount: 350,
    feePaidBy: 'SENDER',
    secretCode: '7109',
    originTradingCityId: 'city-herat',
    destinationTradingCityId: 'city-kabul',
    originTradingCity: tradingCities[2],
    destinationTradingCity: tradingCities[0],
    collectionDeadline: iso(2),
    createdAt: iso(-1),
  },
]

const notifications = [
  { id: 'note-001', subject: 'Large transaction needs approval', body: 'TX-2026-0003 is above the demo approval threshold.', channel: 'IN_APP', status: 'PENDING', userId: 'user-admin', user: currentUser, createdAt: iso(0, -2) },
  { id: 'note-002', subject: 'KYC review pending', body: 'Lina Rahman has a pending KYC review.', channel: 'IN_APP', status: 'SENT', userId: 'user-operator', user: users[1], createdAt: iso(-1) },
  { id: 'note-003', subject: 'Backup completed', body: 'Encrypted demo backup completed successfully.', channel: 'EMAIL', status: 'READ', userId: 'user-admin', user: currentUser, createdAt: iso(-2) },
]

const auditRows = [
  { id: 'audit-001', username: 'demo.admin', actor: currentUser, action: 'LOGIN', entityType: 'IDENTITY', entityId: 'user-admin', description: 'Demo administrator signed in.', beforeState: null, afterState: { user: 'demo.admin' }, createdAt: iso(0, -1) },
  { id: 'audit-002', username: 'sarah.operator', actor: users[1], action: 'CREATE', entityType: 'TRANSACTION', entityId: 'txn-002', description: 'Created exchange transaction TX-2026-0002.', beforeState: null, afterState: transactions[1], createdAt: iso(0, -4) },
  { id: 'audit-003', username: 'demo.admin', actor: currentUser, action: 'APPROVE', entityType: 'HAWALA', entityId: 'haw-002', description: 'Approved incoming hawala HER-11204.', beforeState: { status: 'CREATED' }, afterState: { status: 'PAID' }, createdAt: iso(-1) },
]

const reportHistory = [
  { id: 'rep-001', name: 'Daily Journal Demo', reportType: 'daily-journal', format: 'PDF', status: 'READY', createdAt: iso(-1), filePath: '/demo/reports/daily-journal.pdf' },
  { id: 'rep-002', name: 'Account Statement Demo', reportType: 'account-statement', format: 'PDF', status: 'READY', createdAt: iso(-2), filePath: '/demo/reports/account-statement.pdf' },
]

const backupHistory = [
  { id: 'backup-001', filePath: '/demo/backups/exchange-demo-2026-06-02.enc', type: 'FULL', status: 'SUCCESS', storageType: 'local', fileSizeBytes: 2485760, isEncrypted: true, isVerified: true, startedAt: iso(0, -6), completedAt: iso(0, -6) },
  { id: 'backup-002', filePath: '/demo/backups/exchange-demo-2026-06-01.enc', type: 'FULL', status: 'SUCCESS', storageType: 'local', fileSizeBytes: 2413080, isEncrypted: true, isVerified: true, startedAt: iso(-1), completedAt: iso(-1) },
]

const store = {
  '/api/accounts': accounts,
  '/api/accounts/categories': accountCategories,
  '/api/audit': auditRows,
  '/api/cash-funds': cashFunds,
  '/api/customers': customers,
  '/api/exchange-rates': exchangeRates,
  '/api/hawala': hawalas,
  '/api/hawala/agents': agents,
  '/api/identity': users,
  '/api/identity/roles': roles,
  '/api/notifications': notifications,
  '/api/reports/history': reportHistory,
  '/api/settings/currencies': currencies,
  '/api/settings/fee-structures': [
    { id: 'fee-001', transactionType: 'EXCHANGE', currencyCode: 'USD', feeType: 'flat', feeValue: 5, minFee: 2, maxFee: 50, isActive: true },
    { id: 'fee-002', transactionType: 'HAWALA_SEND', currencyCode: 'AFN', feeType: 'percent', feeValue: 0.2, minFee: 50, maxFee: 500, isActive: true },
  ],
  '/api/settings/print-jobs': [
    {
      id: 'print-001',
      documentType: 'HAWALA_SEND',
      status: 'printed',
      copies: 2,
      printerName: 'Demo Thermal 80mm',
      transaction: null,
      hawala: hawalas[0],
      createdAt: iso(0, -3),
    },
    {
      id: 'print-002',
      documentType: 'EXCHANGE',
      status: 'queued',
      copies: 1,
      printerName: 'Demo Thermal 80mm',
      transaction: transactions[1],
      hawala: null,
      createdAt: iso(0, -4),
    },
  ],
  '/api/settings/trading-cities': tradingCities,
  '/api/settings/transaction-limits': [
    { id: 'limit-001', customerType: 'INDIVIDUAL', transactionType: 'TRANSFER', currencyCode: 'USD', perTransactionLimit: 10000, dailyLimit: 25000, monthlyLimit: 150000, isActive: true },
  ],
}

function createItem(path, payload) {
  const items = store[path]
  const id = payload.id || `${path.split('/').filter(Boolean).pop()}-${Date.now()}`
  const item = { id, ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  items?.unshift(item)
  return item
}

function updateItem(path, id, payload) {
  const items = store[path] || []
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) {
    return null
  }

  items[index] = { ...items[index], ...payload, updatedAt: new Date().toISOString() }
  return items[index]
}

function deleteItem(path, id) {
  const items = store[path] || []
  const index = items.findIndex((item) => item.id === id)
  if (index >= 0) {
    items.splice(index, 1)
  }
}

function upsertMany(path, payload, keyFields) {
  const items = store[path] || []
  const rows = Array.isArray(payload) ? payload : [payload]

  rows.forEach((row) => {
    const index = items.findIndex((item) => keyFields.every((field) => item[field] === row[field]))
    const next = {
      ...row,
      id: row.id || (index >= 0 ? items[index].id : `${path.split('/').filter(Boolean).pop()}-${Date.now()}-${items.length}`),
      updatedAt: new Date().toISOString(),
    }

    if (index >= 0) {
      items[index] = { ...items[index], ...next }
    } else {
      items.unshift({ ...next, createdAt: new Date().toISOString() })
    }
  })

  return items
}

function dashboardPayload() {
  return {
    state: 'configured',
    database: { mode: 'configured' },
    backup: { status: 'READY', startedAt: backupHistory[0].startedAt },
    totals: {
      customers: customers.length,
      activeCustomers: customers.filter((item) => item.status === 'ACTIVE').length,
      accounts: accounts.length,
      activeAccounts: accounts.filter((item) => item.isActive).length,
      todayTransactions: transactions.length,
      pendingTransactions: transactions.filter((item) => item.status === 'PENDING_APPROVAL').length,
      unreadNotifications: notifications.filter((item) => item.status !== 'READ').length,
      failedNotifications: 0,
      reportExports: reportHistory.length,
    },
    risk: {
      kycPending: customers.filter((item) => item.kycStatus === 'PENDING').length,
      kycExpired: 0,
      highRiskCustomers: customers.filter((item) => item.riskLevel === 'HIGH').length,
      overdueHawalas: 0,
      openHolds: 1,
    },
    transactionBreakdown: [
      { type: 'DEPOSIT', count: 9, amount: 185000, fee: 160 },
      { type: 'EXCHANGE', count: 14, amount: 420000, fee: 580 },
      { type: 'TRANSFER', count: 6, amount: 92000, fee: 210 },
      { type: 'HAWALA_SEND', count: 4, amount: 38000, fee: 140 },
    ],
    cashPosition: cashFunds,
    currencyInventory: [
      { currencyCode: 'USD', name: 'US Dollar', totalCashBalance: 260000, availableBalance: 308200, accountCount: 1, cashFundCount: 1 },
      { currencyCode: 'AFN', name: 'Afghan Afghani', totalCashBalance: 12850000, availableBalance: 16255000, accountCount: 1, cashFundCount: 1 },
      { currencyCode: 'AED', name: 'UAE Dirham', totalCashBalance: 390000, availableBalance: 518000, accountCount: 1, cashFundCount: 1 },
    ],
    todayVolume: [
      { currencyCode: 'USD', amount: 124500, count: 12 },
      { currencyCode: 'AFN', amount: 4820000, count: 18 },
      { currencyCode: 'AED', amount: 76000, count: 7 },
    ],
    recentTransactions: transactions,
    recentNotifications: notifications,
    recentAudit: auditRows,
    reportHistory,
  }
}

function journalPayload() {
  const items = transactions.map((transaction) => ({
    ...transaction,
    completedAt: transaction.createdAt,
    debitAccount: accounts.find((account) => account.id === transaction.debitAccountId) || null,
    creditAccount: accounts.find((account) => account.id === transaction.creditAccountId) || null,
    operator: users[1],
    entryType: transaction.type,
  }))

  return {
    items,
    summary: {
      totalDebit: 45500,
      totalCredit: 45500,
      currencyCode: 'USD',
      transactionCount: items.length,
    },
    message: 'Demo journal is balanced.',
  }
}

function statementPayload(id) {
  const account = accounts.find((item) => item.id === id) || cashFunds.find((item) => item.id === id)
  const rows = transactions.map((transaction, index) => ({
    id: transaction.id,
    entryNumber: `JE-${String(index + 1).padStart(4, '0')}`,
    entryDate: transaction.createdAt,
    transaction,
    transactionReference: transaction.referenceNo,
    description: transaction.narration,
    narration: transaction.narration,
    direction: transaction.type === 'WITHDRAWAL' ? 'DEBIT' : 'CREDIT',
    debit: transaction.type === 'WITHDRAWAL' ? transaction.amount : 0,
    credit: transaction.type !== 'WITHDRAWAL' ? transaction.amount : 0,
    amount: transaction.amount,
    runningBalance: account?.availableBalance || account?.currentBalance || 0,
    balance: account?.availableBalance || account?.currentBalance || 0,
    currencyCode: transaction.currencyCode,
  }))

  return {
    account,
    statement: {
      openingBalance: 42000,
      closingBalance: account?.availableBalance || account?.currentBalance || 0,
      items: rows,
    },
  }
}

function reportPayload(reportType) {
  return {
    state: 'configured',
    canExport: true,
    generatedAt: now.toISOString(),
    message: 'Demo report is ready.',
    result: {
      title: reportType.replaceAll('-', ' '),
      totals: dashboardPayload().totals,
      rows: transactions,
    },
  }
}

function routeGet(path, params, config) {
  if (path === '/api/dashboard') return ok(dashboardPayload(), config)
  if (path === '/api/company') return ok({ profile: companyProfile }, config)
  if (path === '/api/identity/me') return ok({ item: currentUser, user: currentUser }, config)
  if (path === '/api/identity/options') {
    return ok({
      reference: {
        permissionAreas: demoPermissionAreas,
        permissionLevels: ['HIDDEN', 'NONE', 'VIEW', 'CREATE', 'EDIT', 'DELETE', 'FULL'],
      },
      roles,
      users,
    }, config)
  }
  if (path === '/api/settings/system-config') {
    return ok({ config: systemConfig }, config)
  }
  if (path === '/api/settings/transaction-config') {
    return ok({ config: transactionConfig }, config)
  }
  if (path === '/api/backup/config') {
    return ok({ config: { schedule: 'DAILY', retentionCount: 30, storageType: 'local', storageConfig: { directory: 'demo/backups' }, notifyEmails: ['admin@kabulexchange.example'], notifyOnSuccess: true, notifyOnFailure: true, isEnabled: true } }, config)
  }
  if (path === '/api/backup/status') {
    return ok({ state: 'READY', healthy: true, lastSuccess: backupHistory[0], alert: { code: 'READY', message: 'Demo backup is healthy.' } }, config)
  }
  if (path === '/api/backup/history') return ok(collection(backupHistory, params), config)
  if (path === '/api/ledger/daily-journal') return ok(journalPayload(), config)
  if (/^\/api\/ledger\/(accounts|cash-funds)\/[^/]+\/statement$/.test(path)) {
    return ok(statementPayload(path.split('/')[4]), config)
  }
  if (path === '/api/notifications/options') {
    return ok({ thresholds: { largeTransactionAmount: 10000, kycExpiryDays: 30, backupNoSuccessHours: 25 }, triggers: ['Large transactions', 'KYC pending', 'Backup health'] }, config)
  }
  if (path.startsWith('/api/reports/history/') && path.endsWith('/download')) {
    return ok({ message: 'Demo download is not a real file.' }, config)
  }
  if (path.startsWith('/api/reports/') && path !== '/api/reports/history') {
    return ok(reportPayload(path.split('/')[3]), config)
  }

  const detailMatch = path.match(/^(\/api\/(?:accounts|audit|cash-funds|customers|exchange-rates|hawala|identity|notifications|reports\/history|settings\/trading-cities|settings\/print-jobs))\/([^/]+)$/)
  if (detailMatch) {
    const [, basePath, id] = detailMatch
    const item = (store[basePath] || []).find((record) => record.id === id)
    return item ? ok({ item }, config) : notFound(config)
  }

  if (store[path]) return ok(collection(store[path], params), config)

  return ok({ message: 'Demo endpoint is available.', item: null }, config)
}

function routeWrite(method, path, payload, config) {
  if (path === '/api/identity/login') return ok({ token: DEMO_TOKEN, user: currentUser }, config)
  if (path === '/api/identity/logout') return ok({ message: 'Signed out of demo mode.' }, config)
  if (path === '/api/uploads') return ok({ relativePath: 'demo/uploads/sample-document.png', fileName: 'sample-document.png' }, config, 201)
  if (path === '/api/company') {
    companyProfile = { ...companyProfile, ...payload, updatedAt: new Date().toISOString() }
    return ok({ profile: companyProfile, message: 'Demo company profile saved.' }, config)
  }
  if (path === '/api/settings/system-config' && ['put', 'patch'].includes(method)) {
    Object.assign(systemConfig.display, payload.display || {})
    Object.assign(systemConfig.accountingPolicy, payload.accountingPolicy || {})
    Object.assign(systemConfig.hawala, payload.hawala || {})
    Object.assign(systemConfig.security, payload.security || {})
    Object.assign(systemConfig.printer, payload.printer || {})
    Object.assign(systemConfig.notifications, payload.notifications || {})
    Object.assign(systemConfig.backup, payload.backup || {})
    return ok({ config: systemConfig, message: 'Demo system configuration saved.' }, config)
  }
  if (path === '/api/settings/transaction-config' && ['put', 'patch'].includes(method)) {
    Object.assign(transactionConfig.accounts, payload.accounts || {})
    Object.assign(transactionConfig.transactions, payload.transactions || {})
    Object.assign(transactionConfig.printing, payload.printing || {})
    return ok({ config: transactionConfig, message: 'Demo transaction configuration saved.' }, config)
  }
  if (path === '/api/settings/currencies/seed-defaults' && method === 'post') {
    const defaults = [
      { code: 'AFN', name: 'Afghan Afghani', symbol: 'AFN', decimalPlaces: 2 },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
      { code: 'EUR', name: 'Euro', symbol: 'EUR', decimalPlaces: 2 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2 },
      { code: 'PKR', name: 'Pakistani Rupee', symbol: 'PKR', decimalPlaces: 2 },
    ]
    let count = 0
    defaults.forEach((currency) => {
      if (!currencies.some((item) => item.code === currency.code)) {
        currencies.push({ id: `cur-${currency.code.toLowerCase()}`, ...currency, isActive: true, createdAt: new Date().toISOString() })
        count += 1
      }
    })
    return ok({ count, items: currencies, message: 'Demo default currencies saved.' }, config, 201)
  }
  if (path === '/api/settings/fee-structures' && ['put', 'patch'].includes(method)) {
    return ok({ items: upsertMany(path, payload, ['currencyCode', 'transactionType']), message: 'Demo fee structure saved.' }, config)
  }
  if (path === '/api/settings/transaction-limits' && ['put', 'patch'].includes(method)) {
    return ok({ items: upsertMany(path, payload, ['customerType', 'transactionType', 'currencyCode']), message: 'Demo transaction limit saved.' }, config)
  }
  if (path.includes('/export')) {
    const report = { id: `rep-${Date.now()}`, name: 'Demo Export', reportType: path.split('/')[3], format: payload?.format || 'PDF', status: 'READY', createdAt: new Date().toISOString() }
    reportHistory.unshift(report)
    return ok({ report, result: reportPayload(report.reportType).result, message: 'Demo export created.' }, config, 201)
  }
  if (path === '/api/notifications/system-checks') return ok({ message: 'Demo checks completed.', createdCount: 1 }, config, 201)
  if (path === '/api/backup/run') {
    const item = { ...backupHistory[0], id: `backup-${Date.now()}`, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() }
    backupHistory.unshift(item)
    return ok({ item, message: 'Demo backup completed.' }, config, 201)
  }
  if (path.includes('/show-in-folder')) return ok({ message: 'Demo backup file path:', item: backupHistory[0] }, config)
  if (path.includes('/cancel')) {
    const id = path.split('/')[3]
    const item = updateItem('/api/hawala', id, { status: 'CANCELLED', cancelReason: payload?.reason })
    return item ? ok({ item, message: 'Demo hawala cancelled.' }, config) : notFound(config)
  }
  if (path.includes('/journal') || path.includes('/manual-entries') || path.includes('/statement/print')) {
    return ok({ item: payload, message: 'Demo accounting action completed.' }, config, method === 'post' ? 201 : 200)
  }
  if (/^\/api\/settings\/print-jobs\/[^/]+\/reprint$/.test(path)) {
    const id = path.split('/')[4]
    const item = updateItem('/api/settings/print-jobs', id, {
      status: 'queued',
      copies: payload?.copies || 1,
      printedById: payload?.printedById,
      errorMsg: null,
    })
    return item ? ok({ item, message: 'Demo reprint queued.' }, config) : notFound(config)
  }
  if (path.includes('/reprint')) return ok({ message: 'Demo print job queued.' }, config)

  const detailMatch = path.match(/^(\/api\/(?:accounts|cash-funds|customers|exchange-rates|hawala|identity|identity\/roles|notifications|settings\/trading-cities|settings\/print-jobs))\/([^/]+)$/)
  if (detailMatch && ['put', 'patch'].includes(method)) {
    const [, basePath, id] = detailMatch
    const item = updateItem(basePath, id, payload)
    return item ? ok({ item, message: 'Demo record updated.' }, config) : notFound(config)
  }

  if (detailMatch && method === 'delete') {
    const [, basePath, id] = detailMatch
    deleteItem(basePath, id)
    return ok({ message: 'Demo record deleted.', id }, config)
  }

  if (store[path] && method === 'post') {
    return ok({ item: createItem(path, payload), message: 'Demo record created.' }, config, 201)
  }

  return ok({ item: payload, message: 'Demo action completed.' }, config, method === 'post' ? 201 : 200)
}

export function demoApiAdapter(config) {
  const url = new URL(config.url || '/', 'http://demo.local')
  const path = url.pathname
  const method = String(config.method || 'get').toLowerCase()
  const params = { ...Object.fromEntries(url.searchParams.entries()), ...(config.params || {}) }
  const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data

  if (method === 'get') {
    return routeGet(path, params, config)
  }

  return routeWrite(method, path, payload || {}, config)
}

export function isDemoApiEnabled() {
  return import.meta.env.VITE_DEMO_MODE !== 'false'
}
