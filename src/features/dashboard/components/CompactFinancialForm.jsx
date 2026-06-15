import { text } from '../../../lib/i18n.js'

function Field({ children, className = '', label }) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]'

export default function CompactFinancialForm({ language = 'en' }) {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4">
      <div>
        <span className="text-xs font-bold uppercase text-[var(--muted)]">{text({ en: 'Compact form layout', fa: 'نمونه فرم فشرده' }, language)}</span>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">{text({ en: 'Financial Setup', fa: 'تنظیم مالی' }, language)}</h2>
      </div>

      <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">{text({ en: 'Account Details', fa: 'جزئیات حساب' }, language)}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label={text({ en: 'Customer', fa: 'مشتری' }, language)}>
              <input className={inputClass} defaultValue={text({ en: 'Ahmad Exchange Client', fa: 'مشتری صرافی احمد' }, language)} />
            </Field>
            <Field label={text({ en: 'Source Account', fa: 'حساب مبدا' }, language)}>
              <select className={inputClass} defaultValue="USD Vault">
                <option value="USD Vault">{text({ en: 'USD Vault', fa: 'خزانه دالر' }, language)}</option>
                <option value="AED Vault">{text({ en: 'AED Vault', fa: 'خزانه درهم' }, language)}</option>
                <option value="AFN Cash Fund">{text({ en: 'AFN Cash Fund', fa: 'صندوق افغانی' }, language)}</option>
              </select>
            </Field>
            <Field label={text({ en: 'Transaction Type', fa: 'نوع معامله' }, language)}>
              <select className={inputClass} defaultValue="Exchange">
                <option value="Withdrawal">{text({ en: 'Withdrawal', fa: 'برداشت' }, language)}</option>
                <option value="Transfer">{text({ en: 'Transfer', fa: 'انتقال' }, language)}</option>
                <option value="Exchange">{text({ en: 'Exchange', fa: 'تبدیل ارز' }, language)}</option>
                <option value="Reversal">{text({ en: 'Reversal', fa: 'برگشت معامله' }, language)}</option>
              </select>
            </Field>
            <Field label={text({ en: 'Reference No.', fa: 'شماره مرجع' }, language)}>
              <input className={inputClass} defaultValue="TX-2026-0581" />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">{text({ en: 'Money Movement', fa: 'حرکت پول' }, language)}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={text({ en: 'Send Amount', fa: 'مبلغ پرداخت' }, language)}>
              <input className={inputClass} defaultValue="12,500" inputMode="decimal" />
            </Field>
            <Field label={text({ en: 'Send Currency', fa: 'ارز پرداخت' }, language)}>
              <select className={inputClass} defaultValue="USD">
                <option>USD</option>
                <option>AED</option>
                <option>AFN</option>
              </select>
            </Field>
            <Field label={text({ en: 'Exchange Rate', fa: 'نرخ تبدیل' }, language)}>
              <input className={inputClass} defaultValue="71.20" inputMode="decimal" />
            </Field>
            <Field label={text({ en: 'Receive Amount', fa: 'مبلغ دریافت' }, language)}>
              <input className={inputClass} defaultValue="890,000" inputMode="decimal" />
            </Field>
            <Field label={text({ en: 'Receive Currency', fa: 'ارز دریافت' }, language)}>
              <select className={inputClass} defaultValue="AFN">
                <option>USD</option>
                <option>AED</option>
                <option>AFN</option>
              </select>
            </Field>
            <Field label={text({ en: 'Fee', fa: 'فیس' }, language)}>
              <input className={inputClass} defaultValue="35" inputMode="decimal" />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">{text({ en: 'Security and Approval', fa: 'امنیت و تایید' }, language)}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(180px,0.45fr)_minmax(260px,1fr)]">
            <Field label={text({ en: 'Approval Required', fa: 'نیاز به تایید' }, language)}>
              <select className={inputClass} defaultValue="Yes">
                <option value="Yes">{text({ en: 'Yes', fa: 'بلی' }, language)}</option>
                <option value="No">{text({ en: 'No', fa: 'نخیر' }, language)}</option>
              </select>
            </Field>
            <Field label={text({ en: 'Internal Note', fa: 'یادداشت داخلی' }, language)}>
              <input className={inputClass} defaultValue={text({ en: 'Require manager approval above daily limit.', fa: 'برای مبلغ بالاتر از حد روزانه تایید مدیر لازم است.' }, language)} />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <button className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)]" type="button">
            {text({ en: 'Cancel', fa: 'لغو' }, language)}
          </button>
          <button className="min-h-9 rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-contrast)]" type="submit">
            {text({ en: 'Save Record', fa: 'ذخیره رکورد' }, language)}
          </button>
        </div>
      </form>
    </section>
  )
}
