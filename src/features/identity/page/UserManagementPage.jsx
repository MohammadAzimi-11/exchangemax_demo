import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react'
import { useCachedForm } from '../../../context/formCache.js'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { getCurrentUser, getCurrentUserId } from '../../../utils/currentUser.js'
import { DataTable, Field, Panel, PrimaryButton, RefreshButton, StateAlert } from '../../shared/components/OperationsUI.jsx'
import { MasterComponent } from '../../shared/components/MasterComponent/index.js'
import { identityConfig } from '../../shared/components/MasterComponent/masterConfigs.jsx'
import { extractApiData, getItems } from '../../shared/components/operations-data.js'

const identityModule =
  modules.find((module) => module.key === 'identity') || {
    title: { en: 'Users & Roles', fa: 'کاربران و نقش‌ها' },
    description: { en: 'Staff access management.', fa: 'مدیریت دسترسی کارمندان.' },
  }

const roleColumns = [
  { key: 'name', label: { en: 'Role name', fa: 'نام نقش' } },
  { key: 'permissionSummary', label: { en: 'Access', fa: 'دسترسی' } },
  { key: 'isActive', label: { en: 'Active', fa: 'فعال' } },
]

const CREATE_LEVELS = new Set(['CREATE', 'EDIT', 'DELETE', 'FULL'])
const EDIT_LEVELS = new Set(['EDIT', 'DELETE', 'FULL'])
const DELETE_LEVELS = new Set(['DELETE', 'FULL'])
const permissionLevelLabels = {
  HIDDEN: { en: 'Hidden - do not show', fa: 'پنهان - اصلاً نمایش داده نشود' },
  NONE: { en: 'None', fa: 'هیچ' },
  VIEW: { en: 'View', fa: 'مشاهده' },
  CREATE: { en: 'Create', fa: 'ثبت' },
  EDIT: { en: 'Edit', fa: 'ویرایش' },
  DELETE: { en: 'Delete', fa: 'حذف' },
  FULL: { en: 'Full', fa: 'کامل' },
}

function createBlankRoleForm() {
  return {
    name: '',
    description: '',
    permissionLevels: {},
    isActive: true,
  }
}

const permissionAreaLabels = {
  dashboard: { en: 'Dashboard', fa: 'داشبورد' },
  customers: { en: 'Customers list', fa: 'لیست مشتریان' },
  customerCreate: { en: 'Create customers', fa: 'ثبت مشتری' },
  customerKyc: { en: 'KYC and risk', fa: 'احراز هویت و ریسک' },
  fxExchange: { en: 'FX exchange', fa: 'تبادله ارز' },
  journalLedger: { en: 'Journal and ledger', fa: 'ژورنال و لیجر' },
  ledgerExport: { en: 'Statements and export', fa: 'صورت‌حساب و خروجی' },
  exchangeRates: { en: 'Exchange rates', fa: 'نرخ ارز' },
  reports: { en: 'Reports', fa: 'گزارش‌ها' },
  reportExport: { en: 'Export reports', fa: 'خروجی گزارش‌ها' },
  notifications: { en: 'Notifications', fa: 'اطلاعیه‌ها' },
  companySettings: { en: 'Company settings', fa: 'تنظیمات شرکت' },
  systemSettings: { en: 'System settings', fa: 'تنظیمات سیستم' },
  userManagement: { en: 'Users', fa: 'کاربران' },
  roleManagement: { en: 'Roles and permissions', fa: 'نقش‌ها و اجازه‌ها' },
  auditLog: { en: 'Audit log', fa: 'ثبت فعالیت‌ها' },
  backup: { en: 'Backup and restore', fa: 'بکاپ و بازیابی' },
}

const permissionGroups = [
  { key: 'overview', title: { en: 'Overview', fa: 'نمای کلی' }, areas: ['dashboard'] },
  { key: 'customers', title: { en: 'Customers', fa: 'مشتری' }, areas: ['customers', 'customerCreate', 'customerKyc'] },
  { key: 'ledger', title: { en: 'Ledger and reports', fa: 'لیجر و گزارش‌ها' }, areas: ['journalLedger', 'ledgerExport', 'exchangeRates', 'reports', 'reportExport'] },
  { key: 'system', title: { en: 'System and security', fa: 'سیستم و امنیت' }, areas: ['notifications', 'companySettings', 'systemSettings', 'userManagement', 'roleManagement', 'auditLog', 'backup'] },
]

const visiblePermissionKeys = new Set(permissionGroups.flatMap((group) => group.areas))

function visiblePermissionAreas(permissionAreas = []) {
  return permissionAreas.filter((area) => visiblePermissionKeys.has(area.key))
}

function permissionsFromForm({ permissionLevels, selectedAreas = [] }, permissionAreas) {
  const selected = new Set(selectedAreas)

  return (permissionAreas || []).map((area) => ({
    area: area.key,
    level: permissionLevels?.[area.key] || (selected.has(area.key) ? 'FULL' : 'NONE'),
  }))
}

function permissionLevelsFromRole(role) {
  return Object.fromEntries((role.permissions || []).map((permission) => [permission.area, permission.level]))
}

function hasPermissionLevel(user, area, allowedLevels) {
  if (user?.role === 'ADMIN') {
    return true
  }

  return allowedLevels.has((user?.permissions || []).find((permission) => permission.area === area)?.level)
}

function permissionAreaLabel(area) {
  if (permissionAreaLabels[area?.key]) {
    return permissionAreaLabels[area.key]
  }

  if (area?.label && typeof area.label === 'object') {
    return area.label
  }

  return {
    en: area?.label || area?.key || 'Permission',
    fa: area?.label || area?.key || 'Permission',
  }
}

function groupPermissionAreas(permissionAreas = []) {
  const areaMap = new Map(permissionAreas.map((area) => [area.key, area]))
  const usedKeys = new Set()
  const groups = permissionGroups
    .map((group) => {
      const areas = group.areas.map((key) => areaMap.get(key)).filter(Boolean)
      areas.forEach((area) => usedKeys.add(area.key))
      return { ...group, areas }
    })
    .filter((group) => group.areas.length > 0)

  const remaining = permissionAreas.filter((area) => !usedKeys.has(area.key))
  if (remaining.length > 0) {
    groups.push({ key: 'other', title: { en: 'Other permissions', fa: 'اجازه‌های دیگر' }, areas: remaining })
  }

  return groups
}

function summarizeRole(role, language) {
  const activePermissions = (role.permissions || []).filter((permission) => !['HIDDEN', 'NONE'].includes(permission.level))
  if (activePermissions.length === 0) {
    return text({ en: 'No access', fa: 'بدون دسترسی' }, language)
  }

  const hiddenPermissions = (role.permissions || []).filter((permission) => permission.level === 'HIDDEN').length
  const visibleText = `${activePermissions.length} ${text({ en: 'visible sections', fa: 'بخش قابل نمایش' }, language)}`

  if (!hiddenPermissions) {
    return visibleText
  }

  return `${visibleText} - ${hiddenPermissions} ${text({ en: 'hidden', fa: 'پنهان' }, language)}`
}

function RoleProfileModal({
  error,
  form,
  language,
  onClose,
  onSave,
  onUpdateForm,
  permissionLevelOptions,
  reference,
  saving,
  selectedRole,
}) {
  const groupedPermissionAreas = groupPermissionAreas(reference.permissionAreas || [])

  function updateGroupPermissions(areas, level) {
    onUpdateForm({
      permissionLevels: {
        ...form.permissionLevels,
        ...Object.fromEntries(areas.map((area) => [area.key, level])),
      },
    })
  }

  return (
    <div className="role-profile-modal" role="dialog" aria-modal="true">
      <div className="role-profile-modal-panel">
        <header>
          <div>
            <span>{text({ en: 'Access profile', fa: 'پروفایل دسترسی' }, language)}</span>
            <h2>{selectedRole ? text({ en: 'Edit role', fa: 'ویرایش نقش' }, language) : text({ en: 'New role', fa: 'نقش جدید' }, language)}</h2>
          </div>
          <button aria-label={text({ en: 'Close', fa: 'بستن' }, language)} className="role-profile-close" onClick={onClose} type="button">
            <X size={17} />
          </button>
        </header>

        <div className="role-profile-modal-body">
          <Field
            label={{ en: 'Role name', fa: 'نام نقش' }}
            language={language}
            onChange={(value) => onUpdateForm({ name: value })}
            value={form.name}
          />
          <Field
            label={{ en: 'Active', fa: 'فعال' }}
            language={language}
            onChange={(value) => onUpdateForm({ isActive: value })}
            type="toggle"
            value={form.isActive}
          />
          <Field
            full
            label={{ en: 'Description', fa: 'شرح' }}
            language={language}
            onChange={(value) => onUpdateForm({ description: value })}
            type="textarea"
            value={form.description}
          />

          <div className="role-permission-levels">
            <div className="role-permission-help">
              <strong>{text({ en: 'Access levels', fa: 'سطح‌های دسترسی' }, language)}</strong>
              <span>
                {text(
                  {
                    en: 'Hidden removes the section completely. None keeps it unavailable. View and higher levels show the section.',
                    fa: 'پنهان بخش را کاملاً از دید کاربر حذف می‌کند. هیچ یعنی دسترسی ندارد. مشاهده و سطح‌های بالاتر بخش را نمایش می‌دهد.',
                  },
                  language,
                )}
              </span>
            </div>
            <div className="role-permission-board">
              {groupedPermissionAreas.map((group) => (
                <section className="role-permission-group" key={group.key}>
                  <header>
                    <div>
                      <strong>{text(group.title, language)}</strong>
                      <small>
                        {group.areas.length} {text({ en: 'items', fa: 'مورد' }, language)}
                      </small>
                    </div>
                    <div className="role-permission-quick-actions">
                      <button onClick={() => updateGroupPermissions(group.areas, 'VIEW')} type="button">
                        {text({ en: 'View', fa: 'مشاهده' }, language)}
                      </button>
                      <button onClick={() => updateGroupPermissions(group.areas, 'FULL')} type="button">
                        {text({ en: 'Full', fa: 'کامل' }, language)}
                      </button>
                      <button onClick={() => updateGroupPermissions(group.areas, 'HIDDEN')} type="button">
                        {text({ en: 'Hide', fa: 'پنهان' }, language)}
                      </button>
                      <button onClick={() => updateGroupPermissions(group.areas, 'NONE')} type="button">
                        {text({ en: 'None', fa: 'هیچ' }, language)}
                      </button>
                    </div>
                  </header>
                  <div className="role-permission-group-fields">
                    {group.areas.map((area) => (
                      <Field
                        key={area.key}
                        label={permissionAreaLabel(area)}
                        language={language}
                        onChange={(value) =>
                          onUpdateForm({
                            permissionLevels: {
                              ...form.permissionLevels,
                              [area.key]: value,
                            },
                          })
                        }
                        options={permissionLevelOptions}
                        type="select"
                        value={form.permissionLevels[area.key] || 'NONE'}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        {error && <StateAlert error={error} />}

        <footer>
          <button className="ops-button" onClick={onClose} type="button">
            {text({ en: 'Cancel', fa: 'لغو' }, language)}
          </button>
          <PrimaryButton disabled={saving} onClick={onSave}>
            <Save size={16} />
            {selectedRole ? text({ en: 'Save role', fa: 'ذخیره نقش' }, language) : text({ en: 'Create role', fa: 'ثبت نقش' }, language)}
          </PrimaryButton>
        </footer>
      </div>
    </div>
  )
}

function RoleProfilesPanel({ canCreate, canDelete, canEdit, language, onRolesChanged }) {
  const [roles, setRoles] = useState([])
  const [reference, setReference] = useState({ permissionAreas: [] })
  const [selectedRole, setSelectedRole] = useState(null)
  const blankRoleForm = useMemo(() => createBlankRoleForm(), [])
  const [form, setForm] = useCachedForm('identity:role-profile', blankRoleForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const permissionLevelOptions = useMemo(
    () =>
      (reference.permissionLevels || []).map((level) => ({
        value: level,
        label: permissionLevelLabels[level] || level,
      })),
    [reference],
  )

  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [rolesResponse, referenceResponse] = await Promise.all([
        api.get('/api/identity/roles'),
        api.get('/api/identity/options'),
      ])
      const rolePayload = extractApiData(rolesResponse)
      const referencePayload = extractApiData(referenceResponse)
      const reference = referencePayload.reference || {}
      setReference({
        ...reference,
        permissionAreas: visiblePermissionAreas(reference.permissionAreas || []),
      })
      setRoles(
        getItems(rolePayload).map((role) => ({
          ...role,
          permissionSummary: summarizeRole(role, language),
        })),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    const timer = window.setTimeout(loadRoles, 0)
    return () => window.clearTimeout(timer)
  }, [loadRoles])

  function resetForm() {
    setSelectedRole(null)
    setForm(createBlankRoleForm())
    setError('')
    setModalOpen(false)
  }

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }))
    setError('')
  }

  function openNewRole() {
    if (!canCreate) {
      return
    }

    setSelectedRole(null)
    setForm(createBlankRoleForm())
    setMessage('')
    setError('')
    setModalOpen(true)
  }

  function editRole(role) {
    if (!canEdit) {
      return
    }

    setSelectedRole(role)
    setForm({
      name: role.name || '',
      description: role.description || '',
      permissionLevels: permissionLevelsFromRole(role),
      isActive: role.isActive,
    })
    setMessage('')
    setError('')
    setModalOpen(true)
  }

  async function saveRole() {
    if (selectedRole ? !canEdit : !canCreate) {
      setError(text({ en: 'You do not have permission for this action.', fa: 'شما اجازه انجام این عمل را ندارید.' }, language))
      return
    }

    if (!form.name.trim()) {
      setError(text({ en: 'Role name is required.', fa: 'نام نقش ضروری است.' }, language))
      return
    }

    if (!reference.permissionAreas?.length) {
      setError(text({ en: 'Permission list is not ready. Refresh roles and try again.', fa: 'لیست اجازه‌ها آماده نیست. نقش‌ها را تازه‌سازی کنید و دوباره تلاش کنید.' }, language))
      return
    }

    setSaving(true)
    setError('')

    try {
      const actorId = await getCurrentUserId()
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        isActive: Boolean(form.isActive),
        permissions: permissionsFromForm(form, reference.permissionAreas),
        ...(selectedRole ? { updatedById: actorId } : { createdById: actorId }),
      }

      if (selectedRole) {
        await api.put(`/api/identity/roles/${selectedRole.id}`, payload)
      } else {
        await api.post('/api/identity/roles', payload)
      }

      setMessage(text({ en: 'Role saved. It is now available in user registration.', fa: 'نقش ذخیره شد و حالا در ثبت کاربر قابل انتخاب است.' }, language))
      resetForm()
      await loadRoles()
      onRolesChanged?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRole(role) {
    if (!canDelete) {
      setError(text({ en: 'You do not have permission to delete roles.', fa: 'شما اجازه حذف نقش را ندارید.' }, language))
      return
    }

    const confirmed = window.confirm(
      text(
        {
          en: `Delete role "${role.name}"? This is allowed only when no users are assigned to this role.`,
          fa: `نقش «${role.name}» حذف شود؟ این کار فقط وقتی انجام می‌شود که هیچ کاربری به این نقش وصل نباشد.`,
        },
        language,
      ),
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const actorId = await getCurrentUserId()
      await api.delete(`/api/identity/roles/${role.id}`, {
        data: { deletedById: actorId },
      })
      setMessage(text({ en: 'Role deleted.', fa: 'نقش حذف شد.' }, language))
      resetForm()
      await loadRoles()
      onRolesChanged?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }
  

  return (
    <Panel
      actions={
        <>
          <button className="ops-button primary" disabled={!canCreate} onClick={openNewRole} type="button">
            <Plus size={16} />
            {text({ en: 'New role', fa: 'نقش جدید' }, language)}
          </button>
          <RefreshButton language={language} loading={loading} onClick={loadRoles} />
        </>
      }
      icon={ShieldCheck}
      language={language}
      title={{ en: 'Prepared roles', fa: 'نقش‌های آماده' }}
    >
      <div className="role-profile-grid">
        <StateAlert error={modalOpen ? '' : error} message={message} />
        <DataTable
          columns={roleColumns}
          emptyText={{ en: 'No prepared roles yet.', fa: 'هنوز نقش آماده ثبت نشده است.' }}
          language={language}
          rowActions={[
            {
              label: { en: 'Edit', fa: 'ویرایش' },
              disabled: () => !canEdit,
              onClick: editRole,
            },
            {
              disabled: () => !canDelete,
              icon: Trash2,
              label: { en: 'Delete', fa: 'حذف' },
              onClick: deleteRole,
            },
          ]}
          rows={roles}
        />
      </div>
      {modalOpen && (
        <RoleProfileModal
          error={error}
          form={form}
          language={language}
          onClose={resetForm}
          onSave={saveRole}
          onUpdateForm={updateForm}
          permissionLevelOptions={permissionLevelOptions}
          reference={reference}
          saving={saving}
          selectedRole={selectedRole}
        />
      )}
    </Panel>
  )
}

export default function UserManagementPage() {
  const language = useUiStore((state) => state.language)
  const [currentUser, setCurrentUser] = useState(null)
  const [rolesRevision, setRolesRevision] = useState(0)
  const canCreateUsers = hasPermissionLevel(currentUser, 'userManagement', CREATE_LEVELS)
  const canEditUsers = hasPermissionLevel(currentUser, 'userManagement', EDIT_LEVELS)
  const canDeleteUsers = hasPermissionLevel(currentUser, 'userManagement', DELETE_LEVELS)
  const canCreateRoles = hasPermissionLevel(currentUser, 'roleManagement', CREATE_LEVELS)
  const canEditRoles = hasPermissionLevel(currentUser, 'roleManagement', EDIT_LEVELS)
  const canDeleteRoles = hasPermissionLevel(currentUser, 'roleManagement', DELETE_LEVELS)

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

  const userConfig = useMemo(
    () => ({
      ...identityConfig,
      allowDelete: (record) => canDeleteUsers && (typeof identityConfig.allowDelete === 'function' ? identityConfig.allowDelete(record) : Boolean(identityConfig.allowDelete)),
      optionsRefreshToken: rolesRevision,
      permissions: {
        ...(identityConfig.permissions || {}),
        create: () => canCreateUsers,
        update: () => canEditUsers,
        delete: () => canDeleteUsers,
      },
    }),
    [canCreateUsers, canDeleteUsers, canEditUsers, rolesRevision],
  )

  return (
    <div className="identity-access-page">
      <RoleProfilesPanel
        canCreate={canCreateRoles}
        canDelete={canDeleteRoles}
        canEdit={canEditRoles}
        language={language}
        onRolesChanged={() => setRolesRevision((value) => value + 1)}
      />
      <MasterComponent
        config={userConfig}
        language={language}
        title={identityModule.title}
      />
    </div>
  )
}
