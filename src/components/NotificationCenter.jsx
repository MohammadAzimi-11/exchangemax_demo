import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useUiStore } from '../store/useUiStore.js'
import { useNotificationStore } from '../store/useNotificationStore.js'
import { getNotificationCopy } from '../utils/userMessages.js'

const toneIcons = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
}

export default function NotificationCenter() {
  const language = useUiStore((state) => state.language)
  const notifications = useNotificationStore((state) => state.notifications)
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  if (notifications.length === 0) {
    return null
  }

  return (
    <aside aria-live="polite" className="notification-center">
      {notifications.map((notification) => {
        const Icon = toneIcons[notification.tone] || Info
        const copy = getNotificationCopy(notification, language)

        return (
          <article className={`notification-card ${notification.tone}`} key={notification.id}>
            <div className="notification-icon">
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="notification-copy">
              <strong>{copy.primaryTitle}</strong>
              {copy.secondaryTitle && copy.secondaryTitle !== copy.primaryTitle && (
                <span className="notification-secondary-title">{copy.secondaryTitle}</span>
              )}
              <p>{copy.primaryMessage}</p>
              {copy.secondaryMessage && copy.secondaryMessage !== copy.primaryMessage && (
                <p className="notification-secondary-message">{copy.secondaryMessage}</p>
              )}
              {notification.code && <small>{notification.code}</small>}
            </div>
            <button
              aria-label={language === 'fa' ? 'بستن پیام' : 'Dismiss notification'}
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              type="button"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </article>
        )
      })}
    </aside>
  )
}
