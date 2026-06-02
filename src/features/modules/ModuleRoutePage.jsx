import { useEffect, useMemo, useState } from 'react'
import { modules, navigationGroups } from '../../data/modules.js'
import { ModuleWorkspace } from '../../components/ModuleWorkspace.jsx'
import { MasterComponent } from '../shared/components/MasterComponent/index.js'
import { masterConfigByModuleKey } from '../shared/components/MasterComponent/masterConfigs.jsx'
import { useUiStore } from '../../store/useUiStore.js'
import { hasAreaAccess } from '../../utils/accessControl.js'
import { getCurrentUser } from '../../utils/currentUser.js'

const CREATE_LEVELS = new Set(['CREATE', 'EDIT', 'DELETE', 'FULL'])
const EDIT_LEVELS = new Set(['EDIT', 'DELETE', 'FULL'])
const DELETE_LEVELS = new Set(['DELETE', 'FULL'])

const moduleActionAreas = {
  accounts: { create: 'accountCreate', update: 'accounts', delete: 'accountClose' },
  'cash-funds': { create: 'cashFundManage', update: 'cashFundManage', delete: 'cashFundManage' },
  customers: { create: 'customerCreate', update: 'customers', delete: 'customers' },
  'exchange-rates': { create: 'exchangeRates', update: 'exchangeRates', delete: 'exchangeRates' },
  hawala: { create: 'hawalaCreate', update: 'hawalaPay', delete: 'hawalaPay' },
}

function withActionPermissions(config, moduleKey, currentUser) {
  const actionAreas = moduleActionAreas[moduleKey]

  if (!config || !actionAreas) {
    return config
  }

  return {
    ...config,
    permissions: {
      ...(config.permissions || {}),
      create: (record) =>
        hasAreaAccess(currentUser, actionAreas.create, CREATE_LEVELS) &&
        (config.permissions?.create ? config.permissions.create(record) : true),
      update: (record) =>
        hasAreaAccess(currentUser, actionAreas.update, EDIT_LEVELS) &&
        (config.permissions?.update ? config.permissions.update(record) : true),
      delete: (record) =>
        hasAreaAccess(currentUser, actionAreas.delete, DELETE_LEVELS) &&
        (config.permissions?.delete ? config.permissions.delete(record) : true),
    },
  }
}

export default function ModuleRoutePage({ moduleKey }) {
  const companyProfile = useUiStore((state) => state.companyProfile)
  const language = useUiStore((state) => state.language)
  const updateCompanyProfile = useUiStore((state) => state.updateCompanyProfile)
  const [currentUser, setCurrentUser] = useState(null)

  const activeModule = modules.find((module) => module.key === moduleKey) || modules[0]
  const activeGroup =
    navigationGroups.find((group) => group.key === activeModule.groupKey) || navigationGroups[0]
  const groupModules = modules.filter((module) => module.groupKey === activeGroup.key)
  const masterConfig = masterConfigByModuleKey[moduleKey]
  const protectedMasterConfig = useMemo(
    () => withActionPermissions(masterConfig, moduleKey, currentUser),
    [currentUser, masterConfig, moduleKey],
  )

  useEffect(() => {
    let isActive = true

    getCurrentUser()
      .then((user) => {
        if (isActive) {
          setCurrentUser(user)
        }
      })
      .catch(() => {
        if (isActive) {
          setCurrentUser(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  if (protectedMasterConfig) {
    return (
      <MasterComponent
        config={protectedMasterConfig}
        language={language}
        title={activeModule.title}
      />
    )
  }

  return (
    <ModuleWorkspace
      activeGroup={activeGroup}
      activeModule={activeModule}
      companyProfile={companyProfile}
      groupModules={groupModules}
      language={language}
      modules={modules}
      onCompanyProfileChange={updateCompanyProfile}
      previewImage="/72534a184581527.655498e69decc.png"
    />
  )
}
