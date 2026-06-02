export const COMMON_CURRENCY_CODES = Object.freeze(['AFG', 'USD', 'EUR', 'PKR', 'IRR', 'CNY', 'AED', 'SAR', 'INR', 'TRY'])

const commonCurrencySet = new Set(COMMON_CURRENCY_CODES)

export function isCommonCurrencyCode(code) {
  return commonCurrencySet.has(String(code || '').trim().toUpperCase())
}
