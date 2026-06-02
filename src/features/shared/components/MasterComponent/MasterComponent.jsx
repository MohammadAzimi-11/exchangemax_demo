import { useCallback, useRef, useState } from 'react'
import { List, Lock, PenLine, Plus } from 'lucide-react'
import { cn } from '../../../../utils/utils.js'
import { text } from '../../../../lib/i18n.js'
import MasterForm from './MasterForm.jsx'
import MasterList from './MasterList.jsx'

function canRun(permissions, action, record = null) {
  if (!permissions?.[action]) {
    return true
  }

  const rule = permissions[action]
  return typeof rule === 'function' ? rule(record) : Boolean(rule)
}

function TabButton({ active, disabled, icon, label, onClick }) {
  const IconComponent = icon

  return (
    <button
      aria-disabled={disabled}
      className={cn('master-tab', active ? 'active' : '', disabled ? 'disabled' : '')}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <IconComponent size={16} />
      <span>{label}</span>
      {disabled && <Lock size={12} />}
    </button>
  )
}

export default function MasterComponent({ config, language, title }) {
  const [tab, setTab] = useState('list')
  const [editRecord, setEditRecord] = useState(null)
  const listRefreshRef = useRef(null)

  const canCreate = canRun(config.permissions, 'create')
  const canUpdate = canRun(config.permissions, 'update', editRecord)
  const entityName = text(config.entityName, language)

  const handleEdit = useCallback(
    (record) => {
      if (!canRun(config.permissions, 'update', record)) {
        return
      }

      setEditRecord(record)
      setTab('edit')
    },
    [config.permissions],
  )

  function handleSuccess(mode, record) {
    if (mode === 'created') {
      config.onCreated?.(record)
    } else {
      config.onUpdated?.(record)
    }

    setTab('list')
    setEditRecord(null)
    listRefreshRef.current?.refresh()
  }

  function handleDelete() {
    config.onDeleted?.()
    setTab('list')
    setEditRecord(null)
    listRefreshRef.current?.refresh()
  }

  function openList() {
    setTab('list')
    setEditRecord(null)
  }

  return (
    <section className={cn('master-shell', config.shellClassName || '')}>
      {title && (
        <header className="master-page-heading">
          <h1>{text(title, language)}</h1>
        </header>
      )}

      <div className="master-tabs">
        <TabButton
          active={tab === 'list'}
          icon={List}
          label={text({ en: 'List', fa: 'لیست' }, language)}
          onClick={openList}
        />
        <TabButton
          active={tab === 'new'}
          disabled={!canCreate || config.allowCreate === false}
          icon={Plus}
          label={text(config.createLabel || { en: `New ${entityName}`, fa: `ثبت ${entityName}` }, language)}
          onClick={() => {
            setEditRecord(null)
            setTab('new')
          }}
        />
        <TabButton
          active={tab === 'edit'}
          disabled={!editRecord || !canUpdate}
          icon={PenLine}
          label={text(config.editLabel || { en: `Edit ${entityName}`, fa: `ویرایش ${entityName}` }, language)}
          onClick={() => setTab('edit')}
        />

        {tab === 'edit' && editRecord && (
          <div className="master-edit-badge">
            <span>{text({ en: 'Editing', fa: 'در حال ویرایش' }, language)}:</span>
            <strong>{config.getRecordLabel ? config.getRecordLabel(editRecord, language) : editRecord.id}</strong>
          </div>
        )}
      </div>

      <div className="master-card">
        {tab === 'list' && (
          <MasterList
            config={config}
            language={language}
            onEdit={handleEdit}
            refreshRef={listRefreshRef}
          />
        )}

        {tab === 'new' && (
          <MasterForm
            config={config}
            key="new"
            language={language}
            mode="new"
            onDelete={handleDelete}
            onSuccess={handleSuccess}
            record={null}
          />
        )}

        {tab === 'edit' && editRecord && (
          <MasterForm
            config={config}
            key={`edit-${editRecord.id}`}
            language={language}
            mode="edit"
            onDelete={handleDelete}
            onSuccess={handleSuccess}
            record={editRecord}
          />
        )}
      </div>
    </section>
  )
}
