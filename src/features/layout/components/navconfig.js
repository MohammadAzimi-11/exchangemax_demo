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

function groupOnlyItem(groupKey, path, accessModuleKey) {
  const group = navigationGroups.find((item) => item.key === groupKey)

  if (!group) {
    throw new Error(`Unknown navigation group: ${groupKey}`)
  }

  return {
    group: group.label,
    groupIcon: group.icon,
    groupKey: group.key,
    items: [
      {
        icon: group.icon,
        label: group.label,
        moduleKey: accessModuleKey,
        path,
      },
    ],
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
  groupOnlyItem('accounting', '/accounting', 'reports'),
  groupOnlyItem('administration', '/administration', 'settings'),
]

export const flatNavItems = navConfig.flatMap((section) => section.items)
