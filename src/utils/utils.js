export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getNestedValue(record, path) {
  if (!record || !path) {
    return undefined
  }

  return path.split('.').reduce((value, key) => {
    if (value === null || value === undefined) {
      return undefined
    }

    return value[key]
  }, record)
}

export function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatMoney(value, currencyCode) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return String(value)
  }

  return `${amount.toLocaleString('en', {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })}${currencyCode ? ` ${currencyCode}` : ''}`
}

const faOnes = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه']
const faTeens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده']
const faTens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
const faHundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']
const faScales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون']

const faCurrencyNames = {
  AFG: 'افغانی',
  AFN: 'افغانی',
  USD: 'دالر',
  EUR: 'یورو',
  GBP: 'پوند',
  PKR: 'کلدار',
  IRR: 'ریال',
  INR: 'روپیه',
  AED: 'درهم',
  SAR: 'ریال سعودی',
  TRY: 'لیره',
  CNY: 'یوان',
}

function normalizeNumericText(value) {
  return String(value ?? '')
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/,/g, '')
}

function threeDigitsToFaWords(value) {
  const number = Number(value)
  const parts = []
  const hundreds = Math.floor(number / 100)
  const remainder = number % 100

  if (hundreds) {
    parts.push(faHundreds[hundreds])
  }

  if (remainder >= 10 && remainder < 20) {
    parts.push(faTeens[remainder - 10])
  } else {
    const tens = Math.floor(remainder / 10)
    const ones = remainder % 10

    if (tens) {
      parts.push(faTens[tens])
    }

    if (ones) {
      parts.push(faOnes[ones])
    }
  }

  return parts.join(' و ')
}

export function numberToPersianWords(value) {
  const normalized = normalizeNumericText(value)

  if (!normalized || !/^-?\d+(\.\d+)?$/.test(normalized)) {
    return ''
  }

  const [integerPartRaw, decimalPartRaw = ''] = normalized.replace(/^-/, '').split('.')
  const integerValue = BigInt(integerPartRaw || '0')
  const isNegative = normalized.startsWith('-') && integerValue !== 0n

  if (integerValue === 0n && !decimalPartRaw.replace(/0/g, '')) {
    return 'صفر'
  }

  const groups = []
  let remaining = integerValue

  while (remaining > 0n) {
    groups.push(Number(remaining % 1000n))
    remaining /= 1000n
  }

  const integerWords = groups
    .map((group, index) => {
      if (!group) {
        return ''
      }

      return [threeDigitsToFaWords(group), faScales[index]].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .reverse()
    .join(' و ')

  const decimalDigits = decimalPartRaw.replace(/0+$/, '').slice(0, 4)
  const decimalWords = decimalDigits ? numberToPersianWords(decimalDigits) : ''

  return [
    isNegative ? 'منفی' : '',
    integerWords || 'صفر',
    decimalWords ? `ممیز ${decimalWords}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function getPersianCurrencyName(currencyCode) {
  const normalized = String(currencyCode || '').trim().toUpperCase()
  return faCurrencyNames[normalized] || normalized
}

export function formatAmountInWordsFa(value, currencyCode) {
  const words = numberToPersianWords(value)

  if (!words) {
    return ''
  }

  const currencyName = getPersianCurrencyName(currencyCode)
  return [words, currencyName].filter(Boolean).join(' ')
}
