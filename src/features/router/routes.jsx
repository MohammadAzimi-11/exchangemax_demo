import { Navigate } from 'react-router'
import ModuleRoutePage from '../modules/ModuleRoutePage.jsx'
import { modules } from '../../data/modules.js'
import CustomerPage from '../customers/page/CustomerPage.jsx'
import DashboardPage from '../dashboard/page/DashboardPage.jsx'
import LoginPage from '../identity/page/LoginPage.jsx'
import UserManagementPage from '../identity/page/UserManagementPage.jsx'

const groupOnlyPathByModuleKey = {
  ledger: '/accounting',
  reports: '/accounting',
  notifications: '/administration',
  audit: '/administration',
  backup: '/administration',
  settings: '/administration',
}

const modulePages = {
  dashboard: <DashboardPage />,
  customers: <CustomerPage />,
  identity: <UserManagementPage />,
}

const moduleRoutes = modules.map((module) => ({
  path: module.path,
  element: groupOnlyPathByModuleKey[module.key]
    ? <Navigate replace to={groupOnlyPathByModuleKey[module.key]} />
    : modulePages[module.key] || <ModuleRoutePage moduleKey={module.key} />,
  layout: true,
  moduleKey: module.key,
  protected: true,
}))

const routes = [
  {
    path: '/login',
    element: <LoginPage />,
    layout: false,
    protected: false,
  },
  ...['/money', '/accounts', '/cash-funds', '/transactions', '/exchange-rates', '/hawala'].map((path) => ({
    path,
    element: <Navigate replace to="/" />,
    layout: true,
    moduleKey: 'dashboard',
    protected: true,
  })),
  {
    path: '/accounting',
    element: null,
    layout: true,
    moduleKey: 'reports',
    protected: true,
  },
  {
    path: '/administration',
    element: null,
    layout: true,
    moduleKey: 'settings',
    protected: true,
  },
  ...moduleRoutes,
  {
    path: '/dashboard',
    element: <DashboardPage />,
    layout: true,
    moduleKey: 'dashboard',
    protected: true,
  },
  {
    path: '/settings/company',
    element: <Navigate replace to="/administration" />,
    layout: true,
    moduleKey: 'settings',
    protected: true,
  },
  {
    path: '*',
    element: <ModuleRoutePage moduleKey="dashboard" />,
    layout: true,
    moduleKey: 'dashboard',
    protected: true,
  },
]

export default routes
