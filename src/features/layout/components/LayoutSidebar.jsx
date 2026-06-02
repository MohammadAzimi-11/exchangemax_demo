import { NavLink, useLocation } from 'react-router'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import { filterNavConfigByAccess } from '../../../utils/accessControl.js'
import BrandIdentity from './BrandIdentity.jsx'
import { navConfig } from './navconfig.js'

function isActivePath(currentPath, itemPath) {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

function GroupButton({ language, section }) {
  const nameOnly = ['money', 'accounting', 'administration'].includes(section.groupKey)
  const GroupIcon = nameOnly ? null : section.groupIcon || section.items[0]?.icon
  const location = useLocation()
  const hasActive = section.items.some((item) => isActivePath(location.pathname, item.path))
  const targetPath = section.items[0]?.path || '/'
  const label = section.group || section.items[0]?.label

  return (
    <NavLink className={`layout-nav-group-header ${hasActive ? 'active' : ''}`} to={targetPath}>
      {GroupIcon && <GroupIcon size={17} strokeWidth={2} />}
      <span>{text(label, language)}</span>
    </NavLink>
  )
}

export default function LayoutSidebar({ currentUser, language }) {
  const companyProfile = useUiStore((state) => state.companyProfile)
  const allowedNavConfig = filterNavConfigByAccess(navConfig, currentUser)
  const hasNavigation = allowedNavConfig.length > 0

  return (
    <aside className="layout-sidebar nav-compact">
      <BrandIdentity profile={companyProfile} />

      <nav className="layout-nav" aria-label={text({ en: 'Main navigation', fa: 'ناوبری اصلی' }, language)}>
        {hasNavigation ? (
          <div className="layout-nav-groups">
            {allowedNavConfig.map((section) => (
              <GroupButton key={section.groupKey} language={language} section={section} />
            ))}
          </div>
        ) : null}
      </nav>
    </aside>
  )
}
