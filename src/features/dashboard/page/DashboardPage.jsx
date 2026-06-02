import { CheckCircle2, DatabaseZap, FileText, Loader2, ShieldCheck, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { PageShell, Panel, RefreshButton, StateAlert } from '../../shared/components/OperationsUI.jsx'
import { extractApiData } from '../../shared/components/operations-data.js'

function numberValue(value) {
  return Number(value || 0).toLocaleString('en')
}

function DemoStat({ icon, label, language, tone = 'blue', value }) {
  const CardIcon = icon

  return (
    <article className={`dashboard-kpi ${tone}`}>
      <div className="dashboard-kpi-icon">
        <CardIcon size={19} strokeWidth={1.9} />
      </div>
      <div>
        <span>{text(label, language)}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function DemoArea({ description, icon, language, title }) {
  const AreaIcon = icon

  return (
    <article className="dashboard-exposure-row demo-area-card">
      <div>
        <strong>{text(title, language)}</strong>
        <span>{text(description, language)}</span>
      </div>
      <AreaIcon size={22} strokeWidth={1.8} />
    </article>
  )
}

export default function DashboardPage() {
  const language = useUiStore((state) => state.language)
  const module = modules.find((item) => item.key === 'dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/dashboard')
      setPayload(extractApiData(response))
    } catch (requestError) {
      setError(requestError.userMessage || { en: 'Demo dashboard could not be loaded.', fa: 'Demo dashboard could not be loaded.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(timerId)
  }, [loadDashboard])

  const totals = useMemo(() => payload?.totals || {}, [payload])
  const unreadNotifications = numberValue(totals.unreadNotifications)
  const reportExports = numberValue(totals.reportExports)

  return (
    <PageShell actions={<RefreshButton language={language} loading={loading} onClick={loadDashboard} />} language={language} module={module}>
      <StateAlert error={error} language={language} />

      {loading && !payload ? (
        <div className="dashboard-loading">
          <Loader2 className="spin" size={24} />
          <span>{text({ en: 'Loading demo workspace...', fa: 'Loading demo workspace...' }, language)}</span>
        </div>
      ) : (
        <div className="dashboard-board demo-dashboard-board">
          <div className="dashboard-kpi-grid">
            <DemoStat icon={UsersRound} label={{ en: 'Demo customers', fa: 'Demo customers' }} language={language} value={numberValue(totals.customers)} />
            <DemoStat icon={ShieldCheck} label={{ en: 'Ready roles', fa: 'Ready roles' }} language={language} tone="green" value="3" />
            <DemoStat icon={FileText} label={{ en: 'Report exports', fa: 'Report exports' }} language={language} tone="gold" value={reportExports} />
            <DemoStat icon={DatabaseZap} label={{ en: 'Unread notices', fa: 'Unread notices' }} language={language} tone="red" value={unreadNotifications} />
          </div>

          <Panel
            description={{ en: 'The online demo is focused on the first two usable sections. The remaining main buttons stay visible as placeholders only.', fa: 'The online demo is focused on the first two usable sections. The remaining main buttons stay visible as placeholders only.' }}
            icon={CheckCircle2}
            language={language}
            title={{ en: 'Online demo workspace', fa: 'Online demo workspace' }}
          >
            <div className="dashboard-exposure-list demo-area-list">
              <DemoArea
                description={{ en: 'A compact landing view with clean demo metrics.', fa: 'A compact landing view with clean demo metrics.' }}
                icon={CheckCircle2}
                language={language}
                title={{ en: 'Dashboard', fa: 'Dashboard' }}
              />
              <DemoArea
                description={{ en: 'Users, roles, and customer records remain available for the live demo.', fa: 'Users, roles, and customer records remain available for the live demo.' }}
                icon={UsersRound}
                language={language}
                title={{ en: 'Setup', fa: 'Setup' }}
              />
              <DemoArea
                description={{ en: 'Name-only navigation button with no demo content.', fa: 'Name-only navigation button with no demo content.' }}
                icon={FileText}
                language={language}
                title={{ en: 'Accounting', fa: 'Accounting' }}
              />
              <DemoArea
                description={{ en: 'Name-only navigation button with no demo content.', fa: 'Name-only navigation button with no demo content.' }}
                icon={ShieldCheck}
                language={language}
                title={{ en: 'Administration', fa: 'Administration' }}
              />
            </div>
          </Panel>
        </div>
      )}
    </PageShell>
  )
}
