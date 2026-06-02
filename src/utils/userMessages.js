const DEFAULT_TITLES = {
  error: { en: 'Action failed', fa: 'عملیات ناموفق بود' },
  info: { en: 'Notice', fa: 'اطلاعیه' },
  success: { en: 'Success', fa: 'موفق' },
  warning: { en: 'Attention', fa: 'توجه' },
}

const API_ERROR_MAP = {
  ACCOUNT_DELETE_HAS_BALANCE: {
    title: { en: 'Account cannot be deleted', fa: 'حساب حذف نمی‌شود' },
    message: {
      en: 'This account still has balance or held money. Clear the balance and holds before deleting it.',
      fa: 'این حساب هنوز بیلانس یا مبلغ هولد دارد. اول بیلانس و هولدها را صفر یا آزاد کنید، بعد حذف کنید.',
    },
    tone: 'warning',
  },
  ACCOUNT_DELETE_HAS_DEPENDENCIES: {
    title: { en: 'Account cannot be deleted', fa: 'حساب حذف نمی‌شود' },
    message: {
      en: 'This account is linked to other records. Remove the linked records first, then delete the account.',
      fa: 'این حساب به معلومات دیگر وصل است. اول موارد وابسته را حذف یا اصلاح کنید، بعد حساب را حذف کنید.',
    },
    tone: 'warning',
  },
  CASH_FUND_DELETE_HAS_BALANCE: {
    title: { en: 'Cash fund cannot be deleted', fa: 'صندوق حذف نمی‌شود' },
    message: {
      en: 'This cash fund still has balance. Clear the opening and current balance before deleting it.',
      fa: 'این صندوق هنوز بیلانس دارد. اول بیلانس افتتاحی و فعلی را صفر کنید، بعد حذف کنید.',
    },
    tone: 'warning',
  },
  CASH_FUND_DELETE_HAS_DEPENDENCIES: {
    title: { en: 'Cash fund cannot be deleted', fa: 'صندوق حذف نمی‌شود' },
    message: {
      en: 'This cash fund is linked to other records. Remove the linked records first, then delete it.',
      fa: 'این صندوق به معلومات دیگر وصل است. اول موارد وابسته را حذف یا اصلاح کنید، بعد صندوق را حذف کنید.',
    },
    tone: 'warning',
  },
  CUSTOMER_DELETE_HAS_DEPENDENCIES: {
    title: { en: 'Customer cannot be deleted', fa: 'مشتری حذف نمی‌شود' },
    message: {
      en: 'This customer is linked to other records. Remove the linked records first, then delete the customer.',
      fa: 'این مشتری به معلومات دیگر وصل است. اول موارد وابسته را حذف یا اصلاح کنید، بعد مشتری را حذف کنید.',
    },
    tone: 'warning',
  },
  IDENTITY_DELETE_HAS_DEPENDENCIES: {
    title: { en: 'Record cannot be deleted', fa: 'مورد حذف نمی‌شود' },
    message: {
      en: 'This identity record is linked to other records. Remove the linked records first, then delete it.',
      fa: 'این مورد به معلومات دیگر وصل است. اول موارد وابسته را حذف یا اصلاح کنید، بعد حذف کنید.',
    },
    tone: 'warning',
  },
  MODULE_ACCESS_DENIED: {
    title: { en: 'No permission', fa: 'اجازه نداری' },
    message: {
      en: 'You do not have permission to access this section.',
      fa: 'شما اجازه دسترسی به این بخش را ندارید.',
    },
    tone: 'warning',
    hideDetails: true,
    hideCode: true,
    hideSecondary: true,
  },
  PERMISSION_DENIED: {
    title: { en: 'No permission', fa: 'اجازه نداری' },
    message: {
      en: 'You do not have permission to perform this action.',
      fa: 'شما اجازه انجام این عمل را ندارید.',
    },
    tone: 'warning',
    hideDetails: true,
    hideCode: true,
    hideSecondary: true,
  },
  ROLE_PROFILE_DELETE_HAS_USERS: {
    title: { en: 'Role cannot be deleted', fa: 'نقش حذف نمی‌شود' },
    message: {
      en: 'This role is assigned to users. Move those users to another role first, then delete this role.',
      fa: 'این نقش به کاربرها وصل است. اول کاربران را به نقش دیگر انتقال دهید، بعد این نقش را حذف کنید.',
    },
    tone: 'warning',
  },
  USER_DELETE_HAS_DEPENDENCIES: {
    title: { en: 'User cannot be deleted', fa: 'کاربر حذف نمی‌شود' },
    message: {
      en: 'This user is linked to business records. Remove or reassign the linked records first, then delete the user.',
      fa: 'این کاربر به معلومات کاری وصل است. اول موارد وابسته را حذف یا به کاربر دیگر انتقال دهید، بعد کاربر را حذف کنید.',
    },
    tone: 'warning',
  },
  USER_DELETE_SELF_DENIED: {
    title: { en: 'User cannot be deleted', fa: 'کاربر حذف نمی‌شود' },
    message: {
      en: 'You cannot delete the same user account you are currently using.',
      fa: 'شما نمی‌توانید همان کاربری را حذف کنید که فعلاً با آن وارد سیستم شده‌اید.',
    },
    tone: 'warning',
    hideDetails: true,
  },
  ACCOUNT_CURRENCY_MISMATCH: {
    title: { en: 'Currency mismatch', fa: 'عدم تطابق ارز' },
    message: {
      en: 'The selected currency does not match the account currency.',
      fa: 'ارز انتخاب‌شده با ارز حساب مطابقت ندارد.',
    },
    tone: 'error',
  },
  ACCOUNT_CUSTOMER_MISMATCH: {
    title: { en: 'Account ownership mismatch', fa: 'عدم تطابق مالکیت حساب' },
    message: {
      en: 'The selected account does not belong to the chosen customer.',
      fa: 'حساب انتخاب‌شده مربوط به مشتری انتخاب‌شده نیست.',
    },
    tone: 'error',
  },
  ACCOUNT_NOT_ACTIVE: {
    title: { en: 'Account unavailable', fa: 'حساب در دسترس نیست' },
    message: {
      en: 'This account is not active and cannot be used for this operation.',
      fa: 'این حساب فعال نیست و برای این عملیات قابل استفاده نمی‌باشد.',
    },
    tone: 'error',
  },
  ACCOUNT_NOT_FOUND: {
    title: { en: 'Account not found', fa: 'حساب پیدا نشد' },
    message: {
      en: 'The selected account could not be found.',
      fa: 'حساب انتخاب‌شده پیدا نشد.',
    },
    tone: 'error',
  },
  CUSTOMER_NOT_FOUND: {
    title: { en: 'Customer not found', fa: 'مشتری پیدا نشد' },
    message: {
      en: 'The selected customer could not be found.',
      fa: 'مشتری انتخاب‌شده پیدا نشد.',
    },
    tone: 'error',
  },
  DATABASE_UNAVAILABLE: {
    title: { en: 'Database unavailable', fa: 'دیتابیس در دسترس نیست' },
    message: {
      en: 'The service is temporarily unavailable. Please try again shortly.',
      fa: 'سرویس موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.',
    },
    tone: 'error',
  },
  DEBIT_ACCOUNT_NOT_FOUND: {
    title: { en: 'Source account not found', fa: 'حساب مبدأ پیدا نشد' },
    message: {
      en: 'The source account could not be found.',
      fa: 'حساب مبدأ پیدا نشد.',
    },
    tone: 'error',
  },
  CREDIT_ACCOUNT_NOT_FOUND: {
    title: { en: 'Destination account not found', fa: 'حساب مقصد پیدا نشد' },
    message: {
      en: 'The destination account could not be found.',
      fa: 'حساب مقصد پیدا نشد.',
    },
    tone: 'error',
  },
  DUAL_APPROVAL_REQUIRED: {
    title: { en: 'Approval required', fa: 'تأییدی لازم است' },
    message: {
      en: 'This transaction exceeds the allowed threshold and needs dual approval.',
      fa: 'این معامله از حد مجاز بیشتر است و نیاز به تأیید دو مرحله‌ای دارد.',
    },
    tone: 'warning',
  },
  EXCHANGE_RATE_NOT_FOUND: {
    title: { en: 'Exchange rate unavailable', fa: 'نرخ ارز در دسترس نیست' },
    message: {
      en: 'No active exchange rate was found for the selected currencies.',
      fa: 'برای ارزهای انتخاب‌شده نرخ فعال پیدا نشد.',
    },
    tone: 'error',
  },
  EXCHANGE_SAME_CURRENCY_NOT_ALLOWED: {
    title: { en: 'Exchange not allowed', fa: 'تبادل مجاز نیست' },
    message: {
      en: 'FX exchange requires two different currencies.',
      fa: 'تبادله ارز باید بین دو ارز متفاوت انجام شود.',
    },
    tone: 'error',
  },
  INSUFFICIENT_AVAILABLE_BALANCE: {
    title: { en: 'Insufficient balance', fa: 'موجودی کافی نیست' },
    message: {
      en: 'The available account balance is not enough for this transaction.',
      fa: 'موجودی قابل برداشت حساب برای این معامله کافی نیست.',
    },
    tone: 'error',
  },
  INSUFFICIENT_VAULT_BALANCE: {
    title: { en: 'Insufficient vault balance', fa: 'موجودی صندوق کافی نیست' },
    message: {
      en: 'The branch vault does not have enough balance to complete this operation.',
      fa: 'صندوق شعبه برای تکمیل این عملیات موجودی کافی ندارد.',
    },
    tone: 'error',
  },
  MAIN_VAULT_NOT_FOUND: {
    title: { en: 'Main vault unavailable', fa: 'صندوق اصلی در دسترس نیست' },
    message: {
      en: 'The required main vault could not be found for this currency.',
      fa: 'صندوق اصلی لازم برای این ارز پیدا نشد.',
    },
    tone: 'error',
  },
  OPERATOR_CURRENCY_RESTRICTED: {
    title: { en: 'Operator restriction', fa: 'محدودیت اپراتور' },
    message: {
      en: 'The current operator is not allowed to process this currency.',
      fa: 'اپراتور فعلی اجازه‌ی پردازش این ارز را ندارد.',
    },
    tone: 'error',
  },
  ROUTE_NOT_FOUND: {
    title: { en: 'Section unavailable', fa: 'بخش در دسترس نیست' },
    message: {
      en: 'The requested section or API route is not available.',
      fa: 'بخش یا مسیر API درخواست‌شده در دسترس نیست.',
    },
    tone: 'error',
  },
  SUSPENSE_ACCOUNT_RESTRICTED: {
    title: { en: 'Restricted account', fa: 'حساب محدودشده' },
    message: {
      en: 'Suspense accounts are restricted and cannot be used here.',
      fa: 'حساب‌های معلق محدود هستند و در این بخش قابل استفاده نیستند.',
    },
    tone: 'error',
  },
  TRANSACTION_LIMIT_EXCEEDED: {
    title: { en: 'Transaction limit exceeded', fa: 'حد معامله عبور شده است' },
    message: {
      en: 'This transaction exceeds the configured limit.',
      fa: 'این معامله از حد تنظیم‌شده بیشتر است.',
    },
    tone: 'warning',
  },
  TRANSACTION_NOT_COMPLETED: {
    title: { en: 'Transaction not completed', fa: 'معامله تکمیل نشده است' },
    message: {
      en: 'This action is only allowed for completed transactions.',
      fa: 'این عملیات فقط برای معاملات تکمیل‌شده مجاز است.',
    },
    tone: 'error',
  },
  TRANSACTION_NOT_FOUND: {
    title: { en: 'Transaction not found', fa: 'معامله پیدا نشد' },
    message: {
      en: 'The selected transaction could not be found.',
      fa: 'معامله انتخاب‌شده پیدا نشد.',
    },
    tone: 'error',
  },
  TRANSACTION_NOT_PENDING: {
    title: { en: 'Transaction not pending', fa: 'معامله در انتظار نیست' },
    message: {
      en: 'Only pending transactions can be approved or rejected.',
      fa: 'فقط معاملات در انتظار قابل تأیید یا رد هستند.',
    },
    tone: 'error',
  },
  TRANSACTION_REVERSAL_NOT_REQUESTED: {
    title: { en: 'Reversal not requested', fa: 'درخواست برگشت ثبت نشده است' },
    message: {
      en: 'A reversal can only be completed after a reversal request.',
      fa: 'برگشت فقط بعد از ثبت درخواست برگشت قابل انجام است.',
    },
    tone: 'error',
  },
}

const DELETE_DEPENDENCY_LABELS = {
  accounts: { en: 'accounts', fa: 'حساب‌ها' },
  approvedTransactions: { en: 'approved transactions', fa: 'معاملات تاییدشده' },
  auditLogs: { en: 'audit logs', fa: 'لاگ‌های سیستم' },
  availableBalance: { en: 'available balance', fa: 'بیلانس قابل برداشت' },
  balance: { en: 'balance', fa: 'بیلانس' },
  createdRoleProfiles: { en: 'roles created by this user', fa: 'نقش‌های ساخته‌شده توسط این کاربر' },
  createdUsers: { en: 'users created by this user', fa: 'کاربران ساخته‌شده توسط این کاربر' },
  creditEntries: { en: 'credit journal entries', fa: 'سطرهای ژورنال کردیت' },
  creditTransactions: { en: 'credit transactions', fa: 'معاملات کردیت' },
  currentBalance: { en: 'current balance', fa: 'بیلانس فعلی' },
  debitEntries: { en: 'debit journal entries', fa: 'سطرهای ژورنال دبیت' },
  debitTransactions: { en: 'debit transactions', fa: 'معاملات دبیت' },
  hawalasCreated: { en: 'created hawalas', fa: 'حواله‌های ثبت‌شده' },
  hawalasPaid: { en: 'paid hawalas', fa: 'حواله‌های پرداخت‌شده' },
  holds: { en: 'account holds', fa: 'هولدهای حساب' },
  journalEntries: { en: 'journal entries', fa: 'سطرهای ژورنال' },
  notifications: { en: 'notifications', fa: 'اطلاعیه‌ها' },
  onHoldAmount: { en: 'held amount', fa: 'مبلغ هولد' },
  operatedTransactions: { en: 'transactions operated by this user', fa: 'معاملات اجراشده توسط این کاربر' },
  openingBalance: { en: 'opening balance', fa: 'بیلانس افتتاحی' },
  printJobs: { en: 'print jobs', fa: 'سوابق چاپ' },
  receivedHawalas: { en: 'received hawalas', fa: 'حواله‌های دریافتی' },
  reports: { en: 'reports', fa: 'گزارش‌ها' },
  reversedTransactions: { en: 'reversed transactions', fa: 'معاملات برگشت‌شده' },
  sentHawalas: { en: 'sent hawalas', fa: 'حواله‌های ارسالی' },
  shifts: { en: 'cash fund shifts', fa: 'شیفت‌های صندوق' },
  transactions: { en: 'transactions', fa: 'معاملات' },
  users: { en: 'assigned users', fa: 'کاربران وصل‌شده' },
}

function isDeleteDependencyCode(code) {
  return /(_DELETE_HAS_|DELETE_SELF_DENIED|ROLE_PROFILE_DELETE_HAS_USERS)/.test(code || '')
}

function toStringValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function normalizeBilingual(value) {
  if (!value) {
    return { en: '', fa: '' }
  }

  if (typeof value === 'string') {
    return { en: value, fa: value }
  }

  return {
    en: toStringValue(value.en || value.fa),
    fa: toStringValue(value.fa || value.en),
  }
}

function formatErrorDetails(details) {
  if (!details) {
    return ''
  }

  if (Array.isArray(details)) {
    return details
      .map((detail) => {
        if (typeof detail === 'string') {
          return detail
        }

        return [detail.field, detail.message].filter(Boolean).join(': ')
      })
      .filter(Boolean)
      .join(' | ')
  }

  if (typeof details === 'object') {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join(' | ')
  }

  return String(details)
}

function appendDetails(message, details) {
  const detailText = formatErrorDetails(details)

  if (!detailText) {
    return message
  }

  return {
    en: `${message.en} Details: ${detailText}`,
    fa: `${message.fa} جزئیات: ${detailText}`,
  }
}

function formatDeleteDependencyDetails(details) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return { en: '', fa: '' }
  }

  const items = Object.entries(details)
    .filter(([key, value]) => key !== 'total' && value !== null && value !== undefined && value !== '' && Number(value) !== 0)
    .map(([key, value]) => {
      const label = normalizeBilingual(DELETE_DEPENDENCY_LABELS[key] || { en: key, fa: key })
      return {
        en: `${label.en}: ${value}`,
        fa: `${label.fa}: ${value}`,
      }
    })

  if (items.length === 0) {
    return { en: '', fa: '' }
  }

  return {
    en: items.map((item) => item.en).join(', '),
    fa: items.map((item) => item.fa).join('، '),
  }
}

function appendDeleteGuidance(message, details) {
  const dependencyText = formatDeleteDependencyDetails(details)

  if (!dependencyText.en && !dependencyText.fa) {
    return message
  }

  return {
    en: `${message.en} Linked fields/sections: ${dependencyText.en}.`,
    fa: `${message.fa} موارد وابسته: ${dependencyText.fa}.`,
  }
}

function defaultHttpMessage(status) {
  if (status === 404) {
    return API_ERROR_MAP.ROUTE_NOT_FOUND
  }

  if (status === 409) {
    return {
      title: { en: 'Conflict detected', fa: 'تعارض تشخیص شد' },
      message: {
        en: 'The request conflicts with the current system state.',
        fa: 'درخواست با وضعیت فعلی سیستم در تعارض است.',
      },
      tone: 'warning',
    }
  }

  if (status === 503) {
    return API_ERROR_MAP.DATABASE_UNAVAILABLE
  }

  return {
    title: DEFAULT_TITLES.error,
    message: {
      en: 'The operation could not be completed.',
      fa: 'عملیات تکمیل نشد.',
    },
    tone: 'error',
  }
}

export function createUserMessage({ code = '', details, fallbackMessage = '', status, tone = 'error' }) {
  const mapped = API_ERROR_MAP[code] || defaultHttpMessage(status)
  const fallback = normalizeBilingual(fallbackMessage)
  const messageBase =
    fallback.en && !API_ERROR_MAP[code]
      ? fallback
      : normalizeBilingual(mapped.message)
  const message = isDeleteDependencyCode(code)
    ? appendDeleteGuidance(messageBase, details)
    : mapped.hideDetails
      ? messageBase
      : appendDetails(messageBase, details)

  return {
    code: mapped.hideCode ? '' : code,
    tone: mapped.tone || tone,
    title: normalizeBilingual(mapped.title || DEFAULT_TITLES[tone] || DEFAULT_TITLES.info),
    message,
    hideSecondary: Boolean(mapped.hideSecondary),
    status: status || 0,
  }
}

export function createSuccessMessage(message, title = DEFAULT_TITLES.success) {
  return {
    tone: 'success',
    title: normalizeBilingual(title),
    message: normalizeBilingual(message),
  }
}

export function createWarningMessage(message, title = DEFAULT_TITLES.warning) {
  return {
    tone: 'warning',
    title: normalizeBilingual(title),
    message: normalizeBilingual(message),
  }
}

export function formatUserMessage(message, language = 'en') {
  if (!message) {
    return ''
  }

  if (typeof message === 'string') {
    return message
  }

  const normalized = normalizeBilingual(message.message || message)
  const primary = language === 'fa' ? normalized.fa : normalized.en
  const secondary = language === 'fa' ? normalized.en : normalized.fa

  if (message.hideSecondary) {
    return primary
  }

  if (!secondary || secondary === primary) {
    return primary
  }

  return `${primary} / ${secondary}`
}

export function getNotificationCopy(entry, language = 'en') {
  const title = normalizeBilingual(entry.title)
  const message = normalizeBilingual(entry.message)
  const hideSecondary = Boolean(entry.hideSecondary)

  if (language === 'fa') {
    return {
      primaryTitle: title.fa,
      secondaryTitle: hideSecondary ? '' : title.en,
      primaryMessage: message.fa,
      secondaryMessage: hideSecondary ? '' : message.en,
    }
  }

  return {
    primaryTitle: title.en,
    secondaryTitle: hideSecondary ? '' : title.fa,
    primaryMessage: message.en,
    secondaryMessage: hideSecondary ? '' : message.fa,
  }
}

export function normalizeApiError(error) {
  const code = error.response?.data?.error?.code || ''
  const fallbackMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    'Request failed.'
  const details = error.response?.data?.error?.details
  const status = error.response?.status || 0
  const userMessage = createUserMessage({
    code,
    details,
    fallbackMessage,
    status,
  })

  const appError = new Error(fallbackMessage)
  appError.code = code
  appError.status = status
  appError.details = details
  appError.userMessage = userMessage

  return appError
}
