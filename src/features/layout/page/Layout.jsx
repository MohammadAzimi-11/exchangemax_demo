import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { modules } from '../../../data/modules.js'
import { isRtl, text } from '../../../lib/i18n.js'
import NotificationCenter from '../../../components/NotificationCenter.jsx'
import { useNotificationStore } from '../../../store/useNotificationStore.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { useAuthStore } from '../../../store/useAuthStore.js'
import LayoutHeader from '../components/LayoutHeader.jsx'
import LayoutSidebar from '../components/LayoutSidebar.jsx'

const readyNotificationKeys = new Set()

function findModuleForPath(pathname) {
  if (pathname === '/' || pathname === '/dashboard') {
    return modules.find((module) => module.key === 'dashboard')
  }

  return modules
    .filter((module) => module.path !== '/')
    .sort((first, second) => second.path.length - first.path.length)
    .find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`))
}

function getReadableTextColor(hexColor) {
  const normalized = String(hexColor || '').replace('#', '')

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return '#ffffff'
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.62 ? '#111820' : '#ffffff'
}

export default function Layout({ children }) {
  const language = useUiStore((state) => state.language)
  const setCompanyProfile = useUiStore((state) => state.setCompanyProfile)
  const systemDisplay = useUiStore((state) => state.systemDisplay)
  const theme = useUiStore((state) => state.theme)
  const setSystemDisplay = useUiStore((state) => state.setSystemDisplay)
  const currentUser = useAuthStore((state) => state.user)
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const location = useLocation()

  useEffect(() => {
    const activeModule = findModuleForPath(location.pathname)

    if (!currentUser || !activeModule || readyNotificationKeys.has(activeModule.key)) {
      return
    }

    readyNotificationKeys.add(activeModule.key)
    pushNotification({
      id: `section-ready-${activeModule.key}`,
      tone: 'success',
      title: activeModule.title,
      message: {
        en: `${text(activeModule.title, 'en')} is ready to work.`,
        fa: `بخش ${text(activeModule.title, 'fa')} آماده کار است.`,
      },
      hideSecondary: true,
      durationMs: 4000,
    })
  }, [currentUser, location.pathname, pushNotification])

  useEffect(() => {
    let isActive = true

    Promise.allSettled([
      api.get('/api/settings/system-config'),
      api.get('/api/company'),
    ])
      .then(([systemResult, companyResult]) => {
        const display = systemResult.status === 'fulfilled'
          ? systemResult.value.data?.data?.config?.display
          : null
        const companyProfile = companyResult.status === 'fulfilled'
          ? companyResult.value.data?.data?.profile
          : null

        if (isActive && display) {
          setSystemDisplay(display)
        }

        if (isActive && companyProfile) {
          setCompanyProfile(companyProfile)
        }
      })
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [setCompanyProfile, setSystemDisplay])

  const shellStyle = {
    '--app-font-family': systemDisplay.fontFamily || 'Inter',
    '--app-font-size': `${Number(systemDisplay.fontSize || 15)}px`,
    '--brand': systemDisplay.themeColor || '#173049',
    '--blue': systemDisplay.themeColor || '#315a85',
    '--brand-contrast': getReadableTextColor(systemDisplay.themeColor),
    '--text': systemDisplay.fontColor || '#141c22',
  }

  return (
    <div
      className="app-shell portal-layout"
      data-theme={theme}
      dir={isRtl(language) ? 'rtl' : 'ltr'}
      style={shellStyle}
    >
      <LayoutHeader currentUser={currentUser} />
      <LayoutSidebar currentUser={currentUser} language={language} />
      <NotificationCenter />
      <main className="layout-main">
        <div className="layout-content">{children}</div>
      </main>
    </div>
  )
}
