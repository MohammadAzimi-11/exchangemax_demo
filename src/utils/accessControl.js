const READ_LEVELS = new Set(['VIEW', 'CREATE', 'EDIT', 'DELETE', 'FULL'])

const modulePermissionAreas = {
  dashboard: ['dashboard'],
  accounts: ['accounts', 'accountCreate', 'accountClose'],
  audit: ['auditLog'],
  backup: ['backup'],
  'cash-funds': ['cashFunds', 'cashFundManage'],
  customers: ['customers', 'customerCreate', 'customerKyc'],
  'exchange-rates': ['exchangeRates'],
  hawala: ['hawala', 'hawalaCreate', 'hawalaPay', 'hawalaAgents'],
  identity: ['userManagement', 'roleManagement'],
  ledger: ['journalLedger', 'ledgerExport'],
  notifications: ['notifications', 'userManagement', 'systemSettings'],
  reports: ['reports', 'reportExport'],
  settings: ['companySettings', 'systemSettings'],
  transactions: ['transactionsDemo'],
}

export function permissionMapForUser(user) {
  return new Map((user?.permissions || []).map((permission) => [permission.area, permission.level]))
}

export function hasAreaAccess(user, area, allowedLevels = READ_LEVELS) {
  if (user?.role === 'ADMIN') {
    return true
  }

  return allowedLevels.has(permissionMapForUser(user).get(area))
}

function hasHiddenModuleBlock(user, areas) {
  if (user?.role === 'ADMIN') {
    return false
  }

  const permissions = permissionMapForUser(user)
  return areas.some((area) => permissions.get(area) === 'HIDDEN')
}

export function hasModuleAccess(user, moduleKey) {
  if (!user) {
    return false
  }

  const areas = modulePermissionAreas[moduleKey] || [moduleKey]
  const permissions = permissionMapForUser(user)

  if (hasHiddenModuleBlock(user, areas)) {
    return false
  }

  if (moduleKey === 'dashboard' && !permissions.has('dashboard')) {
    return true
  }

  return areas.some((area) => allowedReadLevel(permissions.get(area)))
}

function allowedReadLevel(level) {
  return READ_LEVELS.has(level)
}

export function filterModulesByAccess(modules, user) {
  return modules.filter((module) => hasModuleAccess(user, module.key))
}

export function filterNavConfigByAccess(navConfig, user) {
  return navConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasModuleAccess(user, item.moduleKey)),
    }))
    .filter((section) => section.items.length > 0)
}
