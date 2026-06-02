import axios from 'axios'
import { useNotificationStore } from '../store/useNotificationStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { normalizeApiError } from './userMessages.js'
import { demoApiAdapter, isDemoApiEnabled } from './demoApi.js'

const CURRENT_USER_STORAGE_KEY = 'projectonline-current-user-id'
const CURRENT_USER_CACHE_KEY = 'projectonline-current-user'
const SESSION_TOKEN_STORAGE_KEY = 'projectonline-session-token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:7000',
  timeout: 12000,
})

if (isDemoApiEnabled()) {
  api.defaults.adapter = demoApiAdapter
}

api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem('projectonline-session-token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // localStorage is optional in embedded/webview runtimes.
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
        window.localStorage.removeItem(CURRENT_USER_CACHE_KEY)
      } catch {
        // Storage may be unavailable in some runtimes.
      }

      useAuthStore.getState().clearUser()
    }

    const appError = normalizeApiError(error)
    useNotificationStore.getState().pushNotification(appError.userMessage)

    return Promise.reject(appError)
  },
)

export default api
