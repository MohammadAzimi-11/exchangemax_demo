import { create } from 'zustand'

function createNotificationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  pushNotification: (notification) => {
    const id = notification.id || createNotificationId()
    const durationMs = notification.durationMs ?? (notification.tone === 'error' ? 9000 : 6000)
    const nextNotification = {
      id,
      tone: notification.tone || 'info',
      title: notification.title || { en: 'Notice', fa: 'اطلاعیه' },
      message: notification.message || { en: 'Action completed.', fa: 'عملیات انجام شد.' },
      code: notification.code || '',
      hideSecondary: Boolean(notification.hideSecondary),
      durationMs,
    }

    set((state) => ({
      notifications: [...state.notifications, nextNotification].slice(-5),
    }))

    if (durationMs > 0) {
      window.setTimeout(() => {
        get().removeNotification(id)
      }, durationMs)
    }

    return id
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))
