import {
  AlertTriangle,
  Banknote,
  Bell,
  CheckCircle2,
  Coins,
  DatabaseBackup,
  FileBarChart,
  Gauge,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldAlert,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { formatDate, formatMoney } from '../../../utils/utils.js'
import { Badge, DataTable, PageShell, Panel, RefreshButton, StateAlert } from '../../shared/components/OperationsUI.jsx'
import { extractApiData, statusTone } from '../../shared/components/operations-data.js'
import AdvancedFinancialDashboard from '../components/AdvancedFinancialDashboard.jsx'

const palette = ['#315b8f', '#2f7d63', '#a06318', '#287a83', '#a54545', '#63707b']

const transactionTypeLabels = {
  DEPOSIT: { en: 'Deposit', fa: 'واریز' },
  WITHDRAWAL: { en: 'Withdrawal', fa: 'برداشت' },
  TRANSFER: { en: 'Transfer', fa: 'انتقال' },
  EXCHANGE: { en: 'Currency exchange', fa: 'تبدیل ارز' },
  REVERSAL: { en: 'Correction', fa: 'اصلاح مالی' },
  ADJUSTMENT: { en: 'Adjustment', fa: 'اصلاح حساب' },
  VAULT_IN: { en: 'Vault in', fa: 'ورود به خزانه' },
  VAULT_OUT: { en: 'Vault out', fa: 'خروج از خزانه' },
  HAWALA_SEND: { en: 'Hawala send', fa: 'ارسال حواله' },
  HAWALA_PAY: { en: 'Hawala payment', fa: 'پرداخت حواله' },
  HAWALA_RETURN: { en: 'Hawala return', fa: 'برگشت حواله' },
  HAWALA_SETTLE: { en: 'Hawala settlement', fa: 'تسویه حواله' },
}

const statusLabels = {
  DRAFT: { en: 'Draft', fa: 'پیش نویس' },
  PENDING: { en: 'Pending', fa: 'در انتظار' },
  PENDING_APPROVAL: { en: 'Pending approval', fa: 'در انتظار تایید' },
  APPROVED: { en: 'Approved', fa: 'تایید شده' },
  COMPLETED: { en: 'Completed', fa: 'تکمیل شده' },
  REJECTED: { en: 'Rejected', fa: 'رد شده' },
  FAILED: { en: 'Failed', fa: 'ناموفق' },
  SENT: { en: 'Sent', fa: 'ارسال شده' },
  READ: { en: 'Read', fa: 'خوانده شده' },
  UNREAD: { en: 'Unread', fa: 'خوانده نشده' },
  NONE: { en: 'None', fa: 'ثبت نشده' },
  READY: { en: 'Ready', fa: 'آماده' },
  REVERSAL_REQUESTED: { en: 'Reversal requested', fa: 'درخواست برگشت' },
  REVERSED: { en: 'Reversed', fa: 'برگشت شده' },
  configured: { en: 'Configured', fa: 'تنظیم شده' },
  database: { en: 'Database connected', fa: 'وصل به دیتابیس' },
  degraded: { en: 'Degraded', fa: 'دارای مشکل' },
  scaffold: { en: 'Scaffold mode', fa: 'بدون اتصال دیتابیس' },
}

const channelLabels = {
  IN_APP: { en: 'In-app', fa: 'داخل سیستم' },
  EMAIL: { en: 'Email', fa: 'ایمیل' },
  SMS: { en: 'SMS', fa: 'پیامک' },
}

const auditActionLabels = {
  CREATE: { en: 'Create', fa: 'ثبت' },
  UPDATE: { en: 'Update', fa: 'ویرایش' },
  DELETE: { en: 'Delete', fa: 'حذف' },
  LOGIN: { en: 'Login', fa: 'ورود' },
  LOGOUT: { en: 'Logout', fa: 'خروج' },
  APPROVE: { en: 'Approve', fa: 'تایید' },
  REJECT: { en: 'Reject', fa: 'رد' },
}

function readableValue(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function translatedValue(map, value, language) {
  if (!value) {
    return '-'
  }

  return text(map[value] || { en: readableValue(value), fa: readableValue(value) }, language)
}

const transactionColumns = [
  { key: 'referenceNo', label: { en: 'Reference', fa: 'شماره مرجع' } },
  {
    key: 'type',
    label: { en: 'Type', fa: 'نوع' },
    render: (value, _row, language) => <Badge tone="muted" value={translatedValue(transactionTypeLabels, value, language)} />,
  },
  {
    key: 'status',
    label: { en: 'Status', fa: 'وضعیت' },
    render: (value, _row, language) => <Badge tone={statusTone(value)} value={translatedValue(statusLabels, value, language)} />,
  },
  { key: 'customer.displayName', label: { en: 'Customer', fa: 'مشتری' } },
  { key: 'amount', label: { en: 'Amount', fa: 'مبلغ' }, align: 'right', render: (value, row) => formatMoney(value, row.currencyCode) },
  { key: 'createdAt', label: { en: 'Date', fa: 'تاریخ' }, type: 'date' },
]

const notificationColumns = [
  { key: 'createdAt', label: { en: 'Created', fa: 'زمان ثبت' }, type: 'date' },
  {
    key: 'status',
    label: { en: 'Status', fa: 'وضعیت' },
    render: (value, _row, language) => <Badge tone={statusTone(value)} value={translatedValue(statusLabels, value, language)} />,
  },
  {
    key: 'channel',
    label: { en: 'Channel', fa: 'مسیر اطلاع رسانی' },
    render: (value, _row, language) => translatedValue(channelLabels, value, language),
  },
  { key: 'subject', label: { en: 'Subject', fa: 'موضوع' } },
]

const auditColumns = [
  { key: 'createdAt', label: { en: 'Time', fa: 'زمان' }, type: 'date' },
  { key: 'username', label: { en: 'User', fa: 'کاربر' } },
  {
    key: 'action',
    label: { en: 'Action', fa: 'عملیات' },
    render: (value, _row, language) => <Badge tone={statusTone(value)} value={translatedValue(auditActionLabels, value, language)} />,
  },
  { key: 'entityType', label: { en: 'Section', fa: 'بخش' }, render: (value) => readableValue(value) },
  { key: 'description', label: { en: 'Description', fa: 'توضیح' } },
]

const reportColumns = [
  { key: 'createdAt', label: { en: 'Generated', fa: 'زمان تولید' }, type: 'date' },
  { key: 'name', label: { en: 'Report', fa: 'گزارش' } },
  { key: 'reportType', label: { en: 'Type', fa: 'نوع گزارش' }, render: (value) => readableValue(value) },
  { key: 'format', label: { en: 'Format', fa: 'قالب فایل' }, render: (value) => <Badge tone="warning" value={value} /> },
]

function numberValue(value) {
  return Number(value || 0).toLocaleString('en')
}

function toNumber(value) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function groupBy(items, keyName, labelMap, language) {
  const grouped = new Map()

  for (const item of items) {
    const rawName = item[keyName] || 'UNKNOWN'
    const current = grouped.get(rawName) || {
      name: translatedValue(labelMap, rawName, language),
      rawName,
      count: 0,
      amount: 0,
      fee: 0,
    }

    current.count += toNumber(item.count)
    current.amount += toNumber(item.amount)
    current.fee += toNumber(item.fee)
    grouped.set(rawName, current)
  }

  return Array.from(grouped.values())
}

function groupCashByCurrency(items) {
  const grouped = new Map()

  for (const item of items) {
    const current = grouped.get(item.currencyCode) || {
      currencyCode: item.currencyCode,
      name: item.currencyCode,
      operatorBalance: 0,
      total: 0,
      vaultBalance: 0,
    }

    if (item.isVault) {
      current.vaultBalance += toNumber(item.currentBalance)
    } else {
      current.operatorBalance += toNumber(item.currentBalance)
    }

    current.total += toNumber(item.currentBalance)
    grouped.set(item.currencyCode, current)
  }

  return Array.from(grouped.values()).sort((first, second) => Math.abs(second.total) - Math.abs(first.total))
}

function buildRiskItems(risk, totals, language) {
  return [
    { key: 'pending', label: { en: 'Pending approvals', fa: 'تاییدی های در انتظار' }, value: toNumber(totals.pendingTransactions) },
    { key: 'kycPending', label: { en: 'KYC pending', fa: 'احراز هویت در انتظار' }, value: toNumber(risk.kycPending) },
    { key: 'kycExpired', label: { en: 'KYC expired', fa: 'احراز هویت منقضی شده' }, value: toNumber(risk.kycExpired) },
    { key: 'highRisk', label: { en: 'High risk customers', fa: 'مشتریان پرریسک' }, value: toNumber(risk.highRiskCustomers) },
    { key: 'overdueHawala', label: { en: 'Overdue hawala', fa: 'حواله های سررسید گذشته' }, value: toNumber(risk.overdueHawalas) },
    { key: 'openHolds', label: { en: 'Open holds', fa: 'مبالغ در حالت توقف' }, value: toNumber(risk.openHolds) },
  ].map((item) => ({ ...item, name: text(item.label, language) }))
}

function DashboardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="dashboard-chart-tooltip">
      <strong>{label || payload[0]?.payload?.name}</strong>
      {payload.map((item) => (
        <span key={item.dataKey || item.name}>
          {item.name}: {numberValue(item.value)}
        </span>
      ))}
    </div>
  )
}

function EmptyState({ language }) {
  return <div className="dashboard-chart-empty">{text({ en: 'No live data is available for this section.', fa: 'برای این بخش هنوز معلومات زنده وجود ندارد.' }, language)}</div>
}

function KpiCard({ icon, label, language, tone = 'blue', value }) {
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

function StatLine({ label, language, value }) {
  return (
    <div className="dashboard-stat-line">
      <span>{text(label, language)}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ChartFrame({ children }) {
  return <div className="dashboard-chart-frame">{children}</div>
}

function TransactionMixChart({ data, language }) {
  if (!data.length) {
    return <EmptyState language={language} />
  }

  return (
    <ChartFrame>
      <ResponsiveContainer height={252} width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: -22, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<DashboardTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="count" fill={palette[0]} name={text({ en: 'Count', fa: 'تعداد' }, language)} radius={[6, 6, 0, 0]} />
          <Bar dataKey="fee" fill={palette[2]} name={text({ en: 'Fees', fa: 'فیس' }, language)} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

function CashChart({ data, language }) {
  if (!data.length) {
    return <EmptyState language={language} />
  }

  return (
    <ChartFrame>
      <ResponsiveContainer height={252} width="100%">
        <AreaChart data={data.slice(0, 8)} margin={{ bottom: 8, left: -22, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="currencyCode" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<DashboardTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Area dataKey="vaultBalance" fill={palette[0]} fillOpacity={0.18} name={text({ en: 'Vault', fa: 'خزانه' }, language)} stroke={palette[0]} strokeWidth={2} />
          <Area dataKey="operatorBalance" fill={palette[1]} fillOpacity={0.18} name={text({ en: 'Operator cash', fa: 'صندوق کارمند' }, language)} stroke={palette[1]} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

function RiskChart({ data, language }) {
  const visibleData = data.filter((item) => item.value > 0)

  if (!visibleData.length) {
    return (
      <div className="dashboard-clear-state">
        <CheckCircle2 size={32} strokeWidth={1.8} />
        <strong>{text({ en: 'No urgent risk items', fa: 'مورد فوری برای بررسی وجود ندارد' }, language)}</strong>
        <span>{text({ en: 'Compliance and operations are currently clear.', fa: 'وضعیت کنترلی و عملیاتی فعلا بدون مورد فوری است.' }, language)}</span>
      </div>
    )
  }

  return (
    <ChartFrame>
      <ResponsiveContainer height={252} width="100%">
        <PieChart>
          <Pie cx="50%" cy="50%" data={visibleData} dataKey="value" innerRadius={58} nameKey="name" outerRadius={94} paddingAngle={2}>
            {visibleData.map((item, index) => (
              <Cell fill={palette[index % palette.length]} key={item.key} />
            ))}
          </Pie>
          <Tooltip content={<DashboardTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

function CurrencyExposure({ items, language }) {
  const visibleItems = items
    .filter((item) => toNumber(item.totalCashBalance) || toNumber(item.availableBalance) || toNumber(item.accountCount) || toNumber(item.cashFundCount))
    .slice(0, 8)

  if (!visibleItems.length) {
    return <EmptyState language={language} />
  }

  return (
    <div className="dashboard-exposure-list">
      {visibleItems.map((item) => (
        <article className="dashboard-exposure-row" key={item.currencyCode}>
          <div>
            <strong>{item.currencyCode}</strong>
            <span>{item.name}</span>
          </div>
          <div>
            <span>{text({ en: 'Cash balance', fa: 'موجودی نقد' }, language)}</span>
            <strong>{formatMoney(item.totalCashBalance, item.currencyCode)}</strong>
          </div>
          <div>
            <span>{text({ en: 'Available balance', fa: 'موجودی قابل استفاده' }, language)}</span>
            <strong>{formatMoney(item.availableBalance, item.currencyCode)}</strong>
          </div>
        </article>
      ))}
    </div>
  )
}

function ActivityPanel({ language, payload }) {
  const [activeView, setActiveView] = useState('activity')
  const views = {
    activity: {
      columns: transactionColumns,
      icon: Banknote,
      label: { en: 'Financial activity', fa: 'فعالیت مالی' },
      rows: payload?.recentTransactions || [],
    },
    notifications: {
      columns: notificationColumns,
      icon: Bell,
      label: { en: 'Notifications', fa: 'اطلاعیه ها' },
      rows: payload?.recentNotifications || [],
    },
    reports: {
      columns: reportColumns,
      icon: FileBarChart,
      label: { en: 'Reports', fa: 'گزارش ها' },
      rows: payload?.reportHistory || [],
    },
    audit: {
      columns: auditColumns,
      icon: RefreshCw,
      label: { en: 'Audit log', fa: 'گزارش تغییرات' },
      rows: payload?.recentAudit || [],
    },
  }
  const active = views[activeView]

  return (
    <Panel
      actions={
        <div className="dashboard-segmented">
          {Object.entries(views).map(([key, view]) => {
            const Icon = view.icon

            return (
              <button className={activeView === key ? 'active' : ''} key={key} onClick={() => setActiveView(key)} type="button">
                <Icon size={15} />
                {text(view.label, language)}
              </button>
            )
          })}
        </div>
      }
      description={{ en: 'Recent operational records in one compact workspace.', fa: 'آخرین رکوردهای عملیاتی در یک بخش منظم و قابل پیگیری.' }}
      icon={active.icon}
      language={language}
      title={active.label}
    >
      <DataTable columns={active.columns} language={language} rows={active.rows.slice(0, 8)} />
    </Panel>
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
    } catch (apiError) {
      setError(apiError.userMessage || { en: 'Dashboard data could not be loaded.', fa: 'معلومات داشبورد دریافت نشد.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(loadDashboard, 0)

    return () => window.clearTimeout(timerId)
  }, [loadDashboard])

  const totals = useMemo(() => payload?.totals || {}, [payload])
  const risk = useMemo(() => payload?.risk || {}, [payload])
  const attentionTotal =
    toNumber(totals.pendingTransactions) +
    toNumber(totals.failedNotifications) +
    toNumber(risk.kycPending) +
    toNumber(risk.kycExpired) +
    toNumber(risk.overdueHawalas) +
    toNumber(risk.openHolds)

  const transactionTypeData = useMemo(
    () => groupBy(payload?.transactionBreakdown || [], 'type', transactionTypeLabels, language),
    [language, payload],
  )
  const cashByCurrency = useMemo(() => groupCashByCurrency(payload?.cashPosition || []), [payload])
  const riskItems = useMemo(() => buildRiskItems(risk, totals, language), [language, risk, totals])
  const currencyInventory = payload?.currencyInventory || []
  const topTodayVolume = (payload?.todayVolume || []).slice(0, 4)

  return (
    <PageShell actions={<RefreshButton language={language} loading={loading} onClick={loadDashboard} />} language={language} module={module}>
      <StateAlert error={error} language={language} />

      {loading && !payload ? (
        <div className="dashboard-loading">
          <Loader2 className="spin" size={24} />
          <span>{text({ en: 'Loading dashboard data...', fa: 'در حال دریافت معلومات داشبورد...' }, language)}</span>
        </div>
      ) : (
        <div className="dashboard-board">
          <div className="dashboard-kpi-grid">
            <KpiCard icon={UsersRound} label={{ en: 'Active customers', fa: 'مشتریان فعال' }} language={language} value={`${numberValue(totals.activeCustomers)} / ${numberValue(totals.customers)}`} />
            <KpiCard icon={WalletCards} label={{ en: 'Active accounts', fa: 'حساب های فعال' }} language={language} tone="green" value={`${numberValue(totals.activeAccounts)} / ${numberValue(totals.accounts)}`} />
            <KpiCard icon={Banknote} label={{ en: 'Today activity', fa: 'فعالیت امروز' }} language={language} tone="gold" value={numberValue(totals.todayTransactions)} />
            <KpiCard icon={AlertTriangle} label={{ en: 'Needs review', fa: 'نیازمند بررسی' }} language={language} tone="red" value={numberValue(attentionTotal)} />
          </div>

          <AdvancedFinancialDashboard language={language} />

          <div className="dashboard-command-grid">
            <Panel
              description={{ en: 'Financial activity count and fee movement by type.', fa: 'تعداد فعالیت مالی و مقدار فیس بر اساس نوع.' }}
              icon={Gauge}
              language={language}
              title={{ en: 'Operations summary', fa: 'خلاصه عملیات' }}
            >
              <TransactionMixChart data={transactionTypeData} language={language} />
            </Panel>

            <Panel
              description={{ en: 'Risk and compliance items that need follow-up.', fa: 'موارد کنترلی و ریسکی که نیاز به پیگیری دارند.' }}
              icon={ShieldAlert}
              language={language}
              title={{ en: 'Risk review', fa: 'بررسی ریسک' }}
            >
              <RiskChart data={riskItems} language={language} />
            </Panel>
          </div>

          <div className="dashboard-insight-grid">
            <Panel
              description={{ en: 'Vault and operator cash by currency.', fa: 'موجودی خزانه و صندوق کارمند بر اساس ارز.' }}
              icon={Landmark}
              language={language}
              title={{ en: 'Cash position', fa: 'وضعیت نقدی' }}
            >
              <CashChart data={cashByCurrency} language={language} />
            </Panel>

            <Panel
              description={{ en: 'Top currencies with real balance exposure.', fa: 'ارزهای مهم همراه با موجودی واقعی و قابل استفاده.' }}
              icon={Coins}
              language={language}
              title={{ en: 'Currency exposure', fa: 'وضعیت ارزها' }}
            >
              <CurrencyExposure items={currencyInventory} language={language} />
            </Panel>
          </div>

          <div className="dashboard-status-grid">
            <Panel
              description={{ en: 'Live readiness for database, backup, reports, and notifications.', fa: 'آمادگی فعلی دیتابیس، نسخه پشتیبان، گزارش ها و اطلاعیه ها.' }}
              icon={DatabaseBackup}
              language={language}
              title={{ en: 'System readiness', fa: 'آمادگی سیستم' }}
            >
              <div className="dashboard-readiness dashboard-readiness-modern">
                <StatLine label={{ en: 'Database', fa: 'دیتابیس' }} language={language} value={translatedValue(statusLabels, payload?.database?.mode || payload?.state, language)} />
                <StatLine label={{ en: 'Latest backup', fa: 'آخرین نسخه پشتیبان' }} language={language} value={translatedValue(statusLabels, payload?.backup?.status || 'NONE', language)} />
                <StatLine label={{ en: 'Unread notifications', fa: 'اطلاعیه های خوانده نشده' }} language={language} value={numberValue(totals.unreadNotifications)} />
                <StatLine label={{ en: 'Report exports', fa: 'خروجی های گزارش' }} language={language} value={numberValue(totals.reportExports)} />
              </div>
              {payload?.backup?.startedAt && (
                <p className="dashboard-footnote">
                  {text({ en: 'Last backup', fa: 'آخرین نسخه پشتیبان' }, language)}: {formatDate(payload.backup.startedAt)}
                </p>
              )}
            </Panel>

            <Panel
              description={{ en: 'Today financial volume by currency, kept compact for fast scanning.', fa: 'حجم مالی امروز بر اساس ارز، کوتاه و قابل بررسی سریع.' }}
              icon={FileBarChart}
              language={language}
              title={{ en: 'Today volume', fa: 'حجم امروز' }}
            >
              <div className="dashboard-volume-list">
                {topTodayVolume.length ? (
                  topTodayVolume.map((item) => (
                    <StatLine key={item.currencyCode} label={{ en: item.currencyCode, fa: item.currencyCode }} language={language} value={`${formatMoney(item.amount, item.currencyCode)} - ${numberValue(item.count)}`} />
                  ))
                ) : (
                  <EmptyState language={language} />
                )}
              </div>
            </Panel>
          </div>

          <ActivityPanel language={language} payload={payload} />

        </div>
      )}
    </PageShell>
  )
}
