import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { isRtl, text } from '../../../lib/i18n.js'
import { useAuthStore } from '../../../store/useAuthStore.js'
import { useUiStore } from '../../../store/useUiStore.js'
import { loginCurrentUser } from '../../../utils/currentUser.js'
import { formatUserMessage } from '../../../utils/userMessages.js'

export default function LoginPage() {
  const language = useUiStore((state) => state.language)
  const theme = useUiStore((state) => state.theme)
  const user = useAuthStore((state) => state.user)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const usernameRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = location.state?.from?.pathname || '/'

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  if (user && !user.isPublicAccess) {
    return <Navigate replace to={redirectTo} />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.username.trim() || !form.password) {
      setError(text({ en: 'Username and password are required.', fa: 'یوزرنیم و پسورد ضروری است.' }, language))
      return
    }

    setSubmitting(true)
    try {
      await loginCurrentUser(form)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(formatUserMessage(requestError.userMessage || requestError.message, language))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell auth-shell" data-theme={theme} dir={isRtl(language) ? 'rtl' : 'ltr'}>
      <main className="auth-main">
        <section className="auth-panel">
          <div className="auth-hero">
            <div className="auth-mark">
              <LockKeyhole size={24} />
            </div>
            <div className="auth-signal">
              <ShieldCheck size={17} />
              <span>{text({ en: 'Secure staff access', fa: 'دسترسی امن کارمندان' }, language)}</span>
            </div>
          </div>

          <div className="auth-heading">
            <h1>{text({ en: 'Exchange Desk', fa: 'سیستم صرافی' }, language)}</h1>
            <p>{text({ en: 'Sign in to continue your counter operations.', fa: 'برای ادامه عملیات وارد شوید.' }, language)}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>{text({ en: 'Username or email', fa: 'یوزرنیم یا ایمیل' }, language)}</span>
              <input
                autoComplete="username"
                autoFocus
                ref={usernameRef}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                value={form.username}
              />
            </label>
            <label>
              <span>{text({ en: 'Password', fa: 'پسورد' }, language)}</span>
              <input
                autoComplete="current-password"
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                value={form.password}
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" disabled={submitting} type="submit">
              <LogIn size={17} />
              {submitting
                ? text({ en: 'Signing in...', fa: 'در حال ورود...' }, language)
                : text({ en: 'Sign in', fa: 'ورود' }, language)}
            </button>
          </form>

          <div className="auth-footnote">
            <BadgeCheck size={16} />
            <span>{text({ en: 'Role-based menu after login', fa: 'منوی مطابق نقش بعد از ورود' }, language)}</span>
          </div>
        </section>
      </main>
    </div>
  )
}
