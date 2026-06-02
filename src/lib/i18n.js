export function text(value, language) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  return value[language] || value.en || ''
}

export function isRtl(language) {
  return language === 'fa'
}
