import api from './api.js'
import { useAuthStore } from '../store/useAuthStore.js'

const CURRENT_USER_STORAGE_KEY = 'projectonline-current-user-id'
const CURRENT_USER_CACHE_KEY = 'projectonline-current-user'
const SESSION_TOKEN_STORAGE_KEY = 'projectonline-session-token'

let cachedCurrentUser = null

function syncAuthState(user) {
  if (user?.id) {
    useAuthStore.getState().setUser(user)
    return
  }

  useAuthStore.getState().clearUser()
}

export function readSessionToken() {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeSessionToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
    }
  } catch {
    // localStorage is only a convenience cache. Runtime can continue without it.
  }
}

function readStoredUser() {
  try {
    const rawValue = window.localStorage.getItem(CURRENT_USER_CACHE_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

function storeUser(user) {
  try {
    if (user?.id) {
      window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id)
      window.localStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      window.localStorage.removeItem(CURRENT_USER_CACHE_KEY)
    }
  } catch {
    // localStorage is only a convenience cache. Runtime can continue without it.
  }
}

function isActiveUser(user) {
  return Boolean(user?.id && user.isActive !== false)
}

export function isAdminOrManager(user) {
  return ['ADMIN', 'MANAGER'].includes(user?.role)
}

export async function getCurrentUser({ forceRefresh = false, predicate = null } = {}) {
  const token = readSessionToken()
  const allowCachedUser = Boolean(token)

  if (
    !forceRefresh &&
    allowCachedUser &&
    cachedCurrentUser &&
    isActiveUser(cachedCurrentUser) &&
    (!predicate || predicate(cachedCurrentUser))
  ) {
    return cachedCurrentUser
  }

  try {
    const response = await api.get('/api/identity/me')
    const currentUser = response.data?.data?.item || response.data?.item || response.data?.data?.user || response.data?.user

    if (!currentUser || !isActiveUser(currentUser) || (predicate && !predicate(currentUser))) {
      throw new Error('The logged-in user does not have access to this action.')
    }

    cachedCurrentUser = currentUser
    storeUser(currentUser)
    syncAuthState(currentUser)

    return currentUser
  } catch (error) {
    const statusCode = error?.statusCode || error?.response?.status

    if (statusCode === 401 || statusCode === 403) {
      cachedCurrentUser = null
      storeSessionToken(null)
      storeUser(null)
      syncAuthState(null)
    }

    throw error
  }
}

export async function getCurrentUserId(options) {
  const currentUser = await getCurrentUser(options)

  return currentUser.id
}

export async function loginCurrentUser({ username, password }) {
  const response = await api.post('/api/identity/login', { username, password })
  const payload = response.data?.data || response.data

  if (!payload?.token || !payload?.user) {
    throw new Error('Login did not return a valid session.')
  }

  storeSessionToken(payload.token)
  cachedCurrentUser = payload.user
  storeUser(payload.user)
  syncAuthState(payload.user)

  return payload.user
}

export async function logoutCurrentUser() {
  try {
    if (readSessionToken()) {
      await api.post('/api/identity/logout')
    }
  } finally {
    cachedCurrentUser = null
    storeSessionToken(null)
    storeUser(null)
    syncAuthState(null)
  }
}

export function getCachedCurrentUser() {
  if (cachedCurrentUser) {
    return cachedCurrentUser
  }

  const cachedUser = readStoredUser()
  cachedCurrentUser = cachedUser
  return cachedUser
}
