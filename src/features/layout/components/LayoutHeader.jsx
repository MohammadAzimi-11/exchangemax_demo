import {
  ChevronDown,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Sunset,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { languages, themes } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import { logoutCurrentUser } from '../../../utils/currentUser.js'
import BrandIdentity from './BrandIdentity.jsx'
import { flatNavItems } from './navconfig.js'

const themeIcons = {
  light: Sun,
  dusk: Sunset,
  dark: Moon,
}

const copy = {
  en: {
    language: 'Language',
    role: 'Admin',
    theme: 'Theme',
    user: 'Admin',
  },
  fa: {
    language: 'زبان',
    role: 'ادمین',
    theme: 'تم',
    user: 'ادمین',
  },
}

function findCurrentItem(pathname) {
  return (
    flatNavItems
      .filter((item) => (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)))
      .sort((first, second) => second.path.length - first.path.length)[0] || flatNavItems[0]
  )
}

export default function LayoutHeader({ currentUser }) {
  const companyProfile = useUiStore((state) => state.companyProfile)
  const language = useUiStore((state) => state.language)
  const setLanguage = useUiStore((state) => state.setLanguage)
  const setTheme = useUiStore((state) => state.setTheme)
  const theme = useUiStore((state) => state.theme)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutPending, setLogoutPending] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const ui = copy[language] || copy.en

  const currentItem = useMemo(() => findCurrentItem(location.pathname), [location.pathname])
  const CurrentIcon = currentItem.icon
  const userName = currentUser?.fullName || currentUser?.username || ui.user
  const userRole = currentUser?.role || ui.role
  const userInitials = (currentUser?.username || userName || 'AD').slice(0, 2).toUpperCase()
  const brandName = companyProfile?.name || companyProfile?.companyName || 'Exchange Desk'

  useEffect(() => {
    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleLogout() {
    setLogoutPending(true)

    try {
      await logoutCurrentUser()
      setProfileOpen(false)
      navigate('/login', { replace: true })
    } finally {
      setLogoutPending(false)
    }
  }

  return (
    <header className="layout-header">
      <BrandIdentity className="layout-header-brand" profile={companyProfile} />

      <div className="layout-header-title">
        <div className="section-icon">
          <CurrentIcon size={19} strokeWidth={1.9} />
        </div>
        <div>
          <strong>{text(currentItem.label, language)}</strong>
        </div>
      </div>

      <div className="layout-header-spacer" />

      <div className="language-switch" role="group" aria-label={ui.language}>
        {languages.map((item) => (
          <button
            aria-pressed={language === item.key}
            className={language === item.key ? 'selected' : ''}
            key={item.key}
            onClick={() => setLanguage(item.key)}
            title={text(item.label, language)}
            type="button"
          >
            {item.shortLabel}
          </button>
        ))}
      </div>

      <div className="theme-switch" role="group" aria-label={ui.theme}>
        {themes.map((item) => {
          const Icon = themeIcons[item.key]

          return (
            <button
              aria-pressed={theme === item.key}
              className={theme === item.key ? 'selected' : ''}
              key={item.key}
              onClick={() => setTheme(item.key)}
              title={text(item.label, language)}
              type="button"
            >
              <Icon size={16} strokeWidth={1.8} />
            </button>
          )
        })}
      </div>

      <div className="layout-profile" ref={profileRef}>
        <button
          aria-expanded={profileOpen}
          className={`profile-button ${profileOpen ? 'active' : ''}`}
          onClick={() => setProfileOpen((value) => !value)}
          type="button"
        >
          <span className="avatar">{userInitials}</span>
          <span>{userName}</span>
          <ChevronDown className={profileOpen ? 'open' : ''} size={16} />
        </button>

        {profileOpen && (
          <div className="profile-menu">
            <strong>{brandName}</strong>
            <span>{userRole}</span>
            <button className="profile-menu-action" disabled={logoutPending} onClick={handleLogout} type="button">
              {currentUser?.isPublicAccess ? <LogIn size={15} /> : <LogOut size={15} />}
              {logoutPending
                ? language === 'fa' ? 'در حال انتقال...' : 'Redirecting...'
                : currentUser?.isPublicAccess
                  ? language === 'fa' ? 'ورود با حساب کاربری' : 'Sign in'
                  : language === 'fa' ? 'خروج' : 'Log out'}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
