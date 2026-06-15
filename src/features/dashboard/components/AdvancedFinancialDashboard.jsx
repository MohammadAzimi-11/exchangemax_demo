import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { text } from '../../../lib/i18n.js'

const movementByType = [
  { key: 'withdrawals', label: { en: 'Withdrawals', fa: 'برداشت ها' }, count: 128, fees: 2460 },
  { key: 'transfers', label: { en: 'Transfers', fa: 'انتقال ها' }, count: 214, fees: 3890 },
  { key: 'exchanges', label: { en: 'Exchanges', fa: 'تبدیل ارز' }, count: 176, fees: 6120 },
  { key: 'reversals', label: { en: 'Reversals', fa: 'برگشت ها' }, count: 21, fees: 340 },
]

const pnlTrend = [
  { date: { en: 'May 01', fa: '۱ می' }, netProfit: 12200, netLoss: -2400 },
  { date: { en: 'May 02', fa: '۲ می' }, netProfit: 14850, netLoss: -1850 },
  { date: { en: 'May 03', fa: '۳ می' }, netProfit: 13100, netLoss: -3100 },
  { date: { en: 'May 04', fa: '۴ می' }, netProfit: 16920, netLoss: -2200 },
  { date: { en: 'May 05', fa: '۵ می' }, netProfit: 18340, netLoss: -1600 },
  { date: { en: 'May 06', fa: '۶ می' }, netProfit: 15880, netLoss: -2750 },
  { date: { en: 'May 07', fa: '۷ می' }, netProfit: 19750, netLoss: -2100 },
]

const complianceStatus = [
  { key: 'highRisk', name: { en: 'High risk', fa: 'ریسک بالا' }, value: 18, color: '#a24646' },
  { key: 'kycPending', name: { en: 'KYC pending', fa: 'احراز هویت در انتظار' }, value: 42, color: '#9c691d' },
  { key: 'overdueItems', name: { en: 'Overdue items', fa: 'موارد سررسید گذشته' }, value: 27, color: '#287078' },
  { key: 'cleared', name: { en: 'Cleared', fa: 'بررسی شده' }, value: 136, color: '#2f735d' },
]

const currencyExposure = [
  { date: { en: 'May 01', fa: '۱ می' }, USD: 420000, AED: 156000, AFN: 9800000 },
  { date: { en: 'May 02', fa: '۲ می' }, USD: 438000, AED: 162500, AFN: 10150000 },
  { date: { en: 'May 03', fa: '۳ می' }, USD: 427500, AED: 149800, AFN: 9950000 },
  { date: { en: 'May 04', fa: '۴ می' }, USD: 451000, AED: 171300, AFN: 10420000 },
  { date: { en: 'May 05', fa: '۵ می' }, USD: 472400, AED: 184000, AFN: 10940000 },
  { date: { en: 'May 06', fa: '۶ می' }, USD: 463200, AED: 179200, AFN: 10810000 },
  { date: { en: 'May 07', fa: '۷ می' }, USD: 489500, AED: 191400, AFN: 11270000 },
]

const currencyColors = {
  AED: '#287078',
  AFN: '#9c691d',
  USD: '#315a85',
}

function compactNumber(value) {
  return new Intl.NumberFormat('en', {
    compactDisplay: 'short',
    maximumFractionDigits: 1,
    notation: Math.abs(Number(value || 0)) >= 10000 ? 'compact' : 'standard',
  }).format(value || 0)
}

function money(value) {
  return `$${compactNumber(value)}`
}

function localizedMovement(language) {
  return movementByType.map((item) => ({
    ...item,
    type: text(item.label, language),
  }))
}

function localizedPnl(language) {
  return pnlTrend.map((item) => ({
    ...item,
    dateLabel: text(item.date, language),
  }))
}

function localizedCompliance(language) {
  return complianceStatus.map((item) => ({
    ...item,
    name: text(item.name, language),
  }))
}

function localizedExposure(language) {
  return currencyExposure.map((item) => ({
    ...item,
    dateLabel: text(item.date, language),
  }))
}

function ChartTooltip({ active, label, language, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-[var(--text)]">{label || payload[0]?.payload?.name}</div>
      <div className="grid gap-1">
        {payload.map((item) => (
          <div className="flex items-center justify-between gap-5" key={`${item.name}-${item.dataKey}`}>
            <span className="font-medium text-[var(--muted)]">{item.name}</span>
            <span className="font-semibold text-[var(--text)]">
              {String(item.dataKey).toLowerCase().includes('count') ? compactNumber(item.value) : money(item.value)}
            </span>
          </div>
        ))}
      </div>
      {language === 'fa' && <div className="mt-1 text-[var(--muted)]">ارقام به‌صورت خلاصه نمایش داده شده‌اند.</div>}
    </div>
  )
}

function ChartCard({ children, description, language, title }) {
  return (
    <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="m-0 text-sm font-semibold text-[var(--text)]">{text(title, language)}</h3>
        <p className="mt-1 text-xs font-medium text-[var(--muted)]">{text(description, language)}</p>
      </div>
      <div className="h-[300px] min-w-0">{children}</div>
    </section>
  )
}

export default function AdvancedFinancialDashboard({ language = 'en' }) {
  const movementData = localizedMovement(language)
  const pnlData = localizedPnl(language)
  const complianceData = localizedCompliance(language)
  const exposureData = localizedExposure(language)

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase text-[var(--muted)]">{text({ en: 'Financial analysis', fa: 'تحلیل مالی' }, language)}</span>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">{text({ en: 'Advanced Dashboard', fa: 'داشبورد تحلیلی' }, language)}</h2>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
          {text({ en: 'Sample analytical data', fa: 'داده نمونه برای تحلیل' }, language)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          description={{ en: 'Grouped comparison of financial movement and collected fees.', fa: 'مقایسه حرکت مالی و فیس دریافت شده بر اساس نوع.' }}
          language={language}
          title={{ en: 'Movement by Type', fa: 'حرکت مالی بر اساس نوع' }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={movementData} margin={{ bottom: 4, left: -18, right: 8, top: 10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} />
              <Tooltip content={<ChartTooltip language={language} />} />
              <Legend iconType="circle" wrapperStyle={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }} />
              <Bar dataKey="count" fill="#315a85" name={text({ en: 'Count', fa: 'تعداد' }, language)} radius={[6, 6, 0, 0]} />
              <Bar dataKey="fees" fill="#9c691d" name={text({ en: 'Fees', fa: 'فیس' }, language)} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          description={{ en: 'Daily net profit and loss trend for administration review.', fa: 'روند سود و زیان خالص روزانه برای بررسی مدیریت.' }}
          language={language}
          title={{ en: 'Profit and Loss', fa: 'سود و زیان' }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={pnlData} margin={{ bottom: 4, left: -18, right: 16, top: 10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} tickFormatter={money} />
              <ReferenceLine stroke="var(--border)" y={0} />
              <Tooltip content={<ChartTooltip language={language} />} />
              <Legend iconType="circle" wrapperStyle={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }} />
              <Line dataKey="netProfit" dot={false} name={text({ en: 'Net profit', fa: 'سود خالص' }, language)} stroke="#2f735d" strokeWidth={3} type="monotone" />
              <Line dataKey="netLoss" dot={false} name={text({ en: 'Net loss', fa: 'زیان خالص' }, language)} stroke="#a24646" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          description={{ en: 'Compliance work queue split by risk status.', fa: 'کارهای کنترلی تفکیک شده بر اساس وضعیت ریسک.' }}
          language={language}
          title={{ en: 'Risk and Compliance', fa: 'ریسک و کنترل' }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={complianceData}
                dataKey="value"
                innerRadius={72}
                nameKey="name"
                outerRadius={112}
                paddingAngle={2}
              >
                {complianceData.map((item) => (
                  <Cell fill={item.color} key={item.key} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip language={language} />} />
              <Legend iconType="circle" wrapperStyle={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          description={{ en: 'Real balance exposure over time for major currencies.', fa: 'تغییر موجودی واقعی ارزهای مهم در طول زمان.' }}
          language={language}
          title={{ en: 'Currency Exposure', fa: 'وضعیت ارزها' }}
        >
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={exposureData} margin={{ bottom: 4, left: -18, right: 16, top: 10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 700 }} tickFormatter={compactNumber} />
              <Tooltip content={<ChartTooltip language={language} />} />
              <Legend iconType="circle" wrapperStyle={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }} />
              {Object.entries(currencyColors).map(([currency, color]) => (
                <Area
                  dataKey={currency}
                  fill={color}
                  fillOpacity={0.16}
                  key={currency}
                  name={currency}
                  stroke={color}
                  strokeWidth={2}
                  type="monotone"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  )
}
