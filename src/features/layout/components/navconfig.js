import { modules, navigationGroups } from '../../../data/modules.js'

function moduleItem(moduleKey) {
  const module = modules.find((item) => item.key === moduleKey)

  if (!module) {
    throw new Error(`Unknown navigation module: ${moduleKey}`)
  }

  return {
    icon: module.icon,
    label: module.title,
    moduleKey: module.key,
    path: module.path,
  }
}

function groupItem(groupKey, moduleKeys) {
  const group = navigationGroups.find((item) => item.key === groupKey)

  if (!group) {
    throw new Error(`Unknown navigation group: ${groupKey}`)
  }

  return {
    group: group.label,
    groupIcon: group.icon,
    groupKey: group.key,
    items: moduleKeys.map(moduleItem),
  }
}

export const navConfig = [
  {
    group: null,
    groupIcon: null,
    groupKey: 'overview',
    items: [moduleItem('dashboard')],
  },
  groupItem('setup', ['identity', 'customers']),
  groupItem('money', ['accounts', 'cash-funds', 'transactions', 'exchange-rates', 'hawala']),
  groupItem('accounting', ['ledger', 'reports']),
  groupItem('administration', ['notifications', 'audit', 'backup', 'settings']),
]

export const flatNavItems = navConfig.flatMap((section) => section.items)
