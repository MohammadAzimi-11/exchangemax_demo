import ModuleRoutePage from '../modules/ModuleRoutePage.jsx'
import { modules } from '../../data/modules.js'
import AccountOperationsPage from '../accounts/page/AccountOperationsPage.jsx'
import LedgerPage from '../accounting/page/LedgerPage.jsx'
import ReportsPage from '../accounting/page/ReportsPage.jsx'
import AuditPage from '../system/page/AuditPage.jsx'
import BackupPage from '../system/page/BackupPage.jsx'
import CustomerPage from '../customers/page/CustomerPage.jsx'
import DashboardPage from '../dashboard/page/DashboardPage.jsx'
import HawalaPrintPage from '../hawala/page/HawalaPrintPage.jsx'
import LoginPage from '../identity/page/LoginPage.jsx'
import UserManagementPage from '../identity/page/UserManagementPage.jsx'
import NotificationsPage from '../system/page/NotificationsPage.jsx'
import SettingsPage from '../system/page/SettingsPage.jsx'
import TransactionsDemoPage from '../transactions/page/TransactionsDemoPage.jsx'

const modulePages = {
  dashboard: <DashboardPage />,
  customers: <CustomerPage />,
  identity: <UserManagementPage />,
  ledger: <LedgerPage />,
  reports: <ReportsPage />,
  notifications: <NotificationsPage />,
  audit: <AuditPage />,
  backup: <BackupPage />,
  settings: <SettingsPage />,
  transactions: <TransactionsDemoPage />,
}

const moduleRoutes = modules.map((module) => ({
  path: module.path,
  element: modulePages[module.key] || <ModuleRoutePage moduleKey={module.key} />,
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
    element: <SettingsPage />,
    layout: true,
    moduleKey: 'settings',
    protected: true,
  },
  {
    path: '/accounts/:accountId/operations',
    element: <AccountOperationsPage />,
    layout: true,
    moduleKey: 'accounts',
    protected: true,
  },
  {
    path: '/print/hawala/:hawalaId',
    element: <HawalaPrintPage />,
    layout: false,
    moduleKey: 'hawala',
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
