import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Layout from '../layout/page/Layout.jsx'
import { hasModuleAccess } from '../../utils/accessControl.js'
import { getCurrentUser } from '../../utils/currentUser.js'
import { useAuthStore } from '../../store/useAuthStore.js'
import { modules } from '../../data/modules.js'
import routes from './routes.jsx'

function firstAccessiblePath(user) {
  const module = modules.find((item) => hasModuleAccess(user, item.key))
  return module?.path || module?.route || ''
}

function ProtectedRoute({ children, moduleKey }) {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const setStatus = useAuthStore((state) => state.setStatus)
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  useEffect(() => {
    let isActive = true

    if (status === 'ready' && user) {
      return () => {
        isActive = false
      }
    }

    setStatus('loading')

    getCurrentUser()
      .then((nextUser) => {
        if (isActive) {
          setUser(nextUser)
        }
      })
      .catch(() => {
        if (isActive) {
          clearUser()
        }
      })

    return () => {
      isActive = false
    }
  }, [clearUser, location.pathname, setStatus, setUser, status, user])

  if (status !== 'ready') {
    return <div className="route-loading">Loading...</div>
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (moduleKey && !hasModuleAccess(user, moduleKey)) {
    const fallbackPath = firstAccessiblePath(user)

    if (fallbackPath && fallbackPath !== location.pathname) {
      return <Navigate replace to={fallbackPath} />
    }

    return <div className="route-loading">{user ? 'No accessible sections.' : 'Loading...'}</div>
  }

  return children
}

export default function PortalRoutes() {
  return (
    <Routes>
      {routes.map((route) => {
        const element = route.protected ? (
          <ProtectedRoute moduleKey={route.moduleKey}>{route.element}</ProtectedRoute>
        ) : (
          route.element
        )

        return route.layout ? (
          <Route
            element={<Layout>{element}</Layout>}
            key={route.path}
            path={route.path}
          />
        ) : (
          <Route element={element} key={route.path} path={route.path} />
        )
      })}
    </Routes>
  )
}
