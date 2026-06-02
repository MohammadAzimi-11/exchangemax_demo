import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Save,
  Shield,
} from 'lucide-react'
import { Link } from 'react-router'
import {
  activityRows,
  companyFields,
  settingsSections,
  workspaceMetrics,
} from '../data/modules.js'
import { text } from '../lib/i18n.js'

const copy = {
  en: {
    automaticSave: 'Changes are saved in this browser until the backend settings API is connected.',
    buildSurface: 'Build surface',
    companyRoute: 'Settings / Company',
    companySaved: 'Editable company profile',
    currentFoundation: 'Current foundation',
    databaseTarget: 'Database target',
    desktopBackend: 'Desktop backend',
    auditLog: 'Audit log',
    local: 'Local',
    locked: 'Locked',
    moduleMap: 'Module map',
    modules: 'modules',
    modulesInSection: 'Modules in this section',
    offline: 'Offline',
    offlineControl: 'Offline control center',
    publicAsset: 'Public asset',
    ready: 'Ready',
    readyState: 'Ready',
    referenceScreen: 'Reference screen',
    readOnly: 'Read-only',
    route: 'Route',
    runtimeMode: 'Runtime mode',
    stable: 'Stable',
    systemHealth: 'System health',
  },
  fa: {
    automaticSave: 'تغییرات فعلا در همین مرورگر ذخیره می‌شود تا API تنظیمات بک‌اند وصل شود.',
    buildSurface: 'سطح ساخت',
    companyRoute: 'تنظیمات / کمپانی',
    companySaved: 'پروفایل قابل تنظیم کمپانی',
    currentFoundation: 'فوندیشن فعلی',
    databaseTarget: 'هدف دیتابیس',
    desktopBackend: 'بک‌اند دسکتاپ',
    auditLog: 'ادیت لاگ',
    local: 'محلی',
    locked: 'قفل',
    moduleMap: 'نقشه ماژول‌ها',
    modules: 'ماژول',
    modulesInSection: 'ماژول‌های این بخش',
    offline: 'آفلاین',
    offlineControl: 'مرکز کنترول آفلاین',
    publicAsset: 'عکس عمومی',
    ready: 'آماده',
    readyState: 'آماده',
    referenceScreen: 'نمای مرجع',
    readOnly: 'فقط‌خواندنی',
    route: 'مسیر',
    runtimeMode: 'حالت اجرا',
    stable: 'پایدار',
    systemHealth: 'صحت سیستم',
  },
}

export function ModuleWorkspace({
  activeGroup,
  activeModule,
  companyProfile,
  groupModules,
  language,
  modules,
  onCompanyProfileChange,
  previewImage,
}) {
  const ui = copy[language] || copy.en
  const selectedModule = activeModule || groupModules[0]
  const ActiveIcon = selectedModule.icon
  const readyCount = modules.filter((module) => text(module.status, 'en') === 'Ready').length
  const showCompanySettings = selectedModule.key === 'settings'

  return (
    <div className="workspace-grid">
      <section className="overview-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{ui.offlineControl}</span>
            <h1>{text(selectedModule.title, language)}</h1>
          </div>
          <span className={`status-pill accent-${selectedModule.accent}`}>
            <CheckCircle2 size={16} />
            {text(selectedModule.status, language)}
          </span>
        </div>

        <div className="selected-module">
          <div className={`module-emblem accent-${selectedModule.accent}`}>
            <ActiveIcon size={30} strokeWidth={1.75} />
          </div>
          <div>
            <p>{text(selectedModule.description, language)}</p>
            <div className="module-meta">
              <span>{text(activeGroup.label, language)}</span>
              <span>{ui.route}: {selectedModule.route}</span>
            </div>
          </div>
        </div>

        <div className="metric-strip">
          {workspaceMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <article className="metric-card" key={text(metric.label, 'en')}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{text(metric.label, language)}</span>
                <strong>{text(metric.value, language)}</strong>
                <small>{text(metric.trend, language)}</small>
              </article>
            )
          })}
        </div>
      </section>

      <section className="health-panel">
        <div className="panel-heading compact">
          <div>
            <span className="eyebrow">{ui.systemHealth}</span>
            <h2>{ui.desktopBackend}</h2>
          </div>
          <Database size={20} strokeWidth={1.8} />
        </div>

        <div className="health-list">
          <HealthRow label={ui.moduleMap} state={ui.ready} value={`${readyCount}/${modules.length}`} />
          <HealthRow label={ui.runtimeMode} state={ui.stable} value={ui.offline} />
          <HealthRow label={ui.databaseTarget} state={ui.local} value="PostgreSQL" />
          <HealthRow label={ui.auditLog} state={ui.locked} value={ui.readOnly} />
        </div>
      </section>

      <section className="module-board">
        <div className="panel-heading compact">
          <div>
            <span className="eyebrow">{ui.moduleMap}</span>
            <h2>{ui.modulesInSection}</h2>
          </div>
          <FileText size={20} strokeWidth={1.8} />
        </div>

        <div className="module-card-grid">
          {groupModules.map((module) => {
            const Icon = module.icon

            return (
              <Link
                className={`module-card ${module.key === selectedModule.key ? 'selected' : ''}`}
                key={module.key}
                to={module.path}
              >
                <div className={`card-icon accent-${module.accent}`}>
                  <Icon size={19} strokeWidth={1.8} />
                </div>
                <div>
                  <strong>{text(module.title, language)}</strong>
                  <span>{text(module.metric, language)}</span>
                </div>
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            )
          })}
        </div>
      </section>

      {showCompanySettings && (
        <CompanySettingsPanel
          companyProfile={companyProfile}
          language={language}
          onCompanyProfileChange={onCompanyProfileChange}
          ui={ui}
        />
      )}

      <section className="activity-panel">
        <div className="panel-heading compact">
          <div>
            <span className="eyebrow">{ui.buildSurface}</span>
            <h2>{ui.currentFoundation}</h2>
          </div>
          <Shield size={20} strokeWidth={1.8} />
        </div>

        <div className="activity-list">
          {activityRows.map((row) => {
            const Icon = row.icon

            return (
              <article className="activity-row" key={text(row.item, 'en')}>
                <div className="activity-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <strong>{text(row.area, language)}</strong>
                  <span>{text(row.item, language)}</span>
                </div>
                <small>{text(row.state, language)}</small>
              </article>
            )
          })}
        </div>
      </section>

      <section className="preview-panel">
        <div className="panel-heading compact">
          <div>
            <span className="eyebrow">{ui.publicAsset}</span>
            <h2>{ui.referenceScreen}</h2>
          </div>
          <Clock3 size={20} strokeWidth={1.8} />
        </div>
        <img alt={ui.referenceScreen} src={previewImage} />
      </section>
    </div>
  )
}

function CompanySettingsPanel({ companyProfile, language, onCompanyProfileChange, ui }) {
  const companySection = settingsSections[0]
  const CompanyIcon = companySection.icon

  return (
    <section className="settings-panel">
      <div className="panel-heading compact">
        <div>
          <span className="eyebrow">{ui.companyRoute}</span>
          <h2>{text(companySection.title, language)}</h2>
        </div>
        <CompanyIcon size={20} strokeWidth={1.8} />
      </div>

      <div className="settings-intro">
        <p>{text(companySection.description, language)}</p>
        <span>
          <Save size={15} strokeWidth={1.9} />
          {ui.companySaved}
        </span>
      </div>

      <form className="company-form">
        {companyFields.map((field) => (
          <label className={`form-field ${field.wide ? 'field-wide' : ''}`} key={field.key}>
            <span>{text(field.label, language)}</span>
            {field.type === 'textarea' ? (
              <textarea
                onChange={(event) => onCompanyProfileChange(field.key, event.target.value)}
                rows={3}
                value={companyProfile[field.key] || ''}
              />
            ) : (
              <input
                onChange={(event) => onCompanyProfileChange(field.key, event.target.value)}
                type={field.type}
                value={companyProfile[field.key] || ''}
              />
            )}
          </label>
        ))}
      </form>

      <div className="settings-note">{ui.automaticSave}</div>
    </section>
  )
}

function HealthRow({ label, state, value }) {
  return (
    <article className="health-row">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{state}</small>
    </article>
  )
}
