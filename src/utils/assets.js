import api from './api.js'

export function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') {
    return ''
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(path)) {
    return path
  }

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')

  return `${baseUrl}/${normalizedPath}`
}
