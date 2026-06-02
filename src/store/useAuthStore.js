import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  status: 'idle',
  user: null,

  clearUser: () => set({ status: 'ready', user: null }),
  setStatus: (status) => set({ status }),
  setUser: (user) => set({ status: 'ready', user }),
}))
