import { create } from 'zustand'
import { isDemoApiEnabled } from '../utils/demoApi.js'

const defaultCompanyProfile = {
  name: 'Exchange Desk',
  companyName: 'Exchange Desk',
  legalName: 'Exchange Desk Accounting Services',
  registrationNumber: 'REG-0001',
  registrationNo: 'REG-0001',
  taxId: 'TAX-0001',
  phone: '+93 700 000 000',
  email: 'office@projectonline.local',
  logoPath: '',
  defaultCurrency: 'AFG',
  timezone: 'Asia/Kabul',
  address: 'Main exchange office',
  receiptFooter: 'Thank you for your business.',
}

const defaultSystemDisplay = {
  themeColor: '#173049',
  fontColor: '#141c22',
  fontFamily: 'Inter',
  fontSize: 15,
}

function readString(key, fallback) {
  const savedValue = localStorage.getItem(key)
  return savedValue || fallback
}

function readInitialLanguage() {
  const languageKey = 'projectonline-language'
  const demoDefaultKey = 'projectonline-demo-language-defaulted'

  if (isDemoApiEnabled() && localStorage.getItem(demoDefaultKey) !== 'true') {
    localStorage.setItem(languageKey, 'en')
    localStorage.setItem(demoDefaultKey, 'true')
    return 'en'
  }

  return readString(languageKey, 'en')
}

function readJson(key, fallback) {
  const savedValue = localStorage.getItem(key)

  if (!savedValue) {
    return fallback
  }

  try {
    return { ...fallback, ...JSON.parse(savedValue) }
  } catch {
    return fallback
  }
}

function normalizeCompanyProfile(profile = {}) {
  const mergedProfile = { ...defaultCompanyProfile, ...profile }
  const name = mergedProfile.name || mergedProfile.companyName || defaultCompanyProfile.name
  const registrationNo = mergedProfile.registrationNo || mergedProfile.registrationNumber || ''

  return {
    ...mergedProfile,
    name,
    companyName: name,
    registrationNo,
    registrationNumber: registrationNo,
    logoPath: mergedProfile.logoPath || '',
  }
}

export const useUiStore = create((set) => ({
  companyProfile: normalizeCompanyProfile(readJson('projectonline-company-profile', defaultCompanyProfile)),
  language: readInitialLanguage(),
  sidebarCollapsed: readString('projectonline-sidebar-collapsed', 'false') === 'true',
  systemDisplay: readJson('projectonline-system-display', defaultSystemDisplay),
  theme: readString('projectonline-theme', 'dusk'),

  setLanguage: (language) => {
    localStorage.setItem('projectonline-language', language)
    set({ language })
  },

  setTheme: (theme) => {
    localStorage.setItem('projectonline-theme', theme)
    set({ theme })
  },

  setSystemDisplay: (display = {}) =>
    set((state) => {
      const systemDisplay = {
        ...state.systemDisplay,
        themeColor: display.themeColor || state.systemDisplay.themeColor,
        fontColor: display.fontColor || state.systemDisplay.fontColor,
        fontFamily: display.fontFamily || state.systemDisplay.fontFamily,
        fontSize: Number(display.fontSize || state.systemDisplay.fontSize || defaultSystemDisplay.fontSize),
      }

      localStorage.setItem('projectonline-system-display', JSON.stringify(systemDisplay))

      return { systemDisplay }
    }),

  toggleSidebar: () =>
    set((state) => {
      const sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('projectonline-sidebar-collapsed', String(sidebarCollapsed))

      return { sidebarCollapsed }
    }),

  updateCompanyProfile: (field, value) =>
    set((state) => {
      const companyProfile = {
        ...state.companyProfile,
        [field]: value,
      }
      const normalizedProfile = normalizeCompanyProfile(companyProfile)

      localStorage.setItem('projectonline-company-profile', JSON.stringify(normalizedProfile))

      return { companyProfile: normalizedProfile }
    }),

  setCompanyProfile: (profile = {}) =>
    set((state) => {
      const companyProfile = normalizeCompanyProfile({
        ...state.companyProfile,
        ...profile,
      })

      localStorage.setItem('projectonline-company-profile', JSON.stringify(companyProfile))

      return { companyProfile }
    }),
}))
