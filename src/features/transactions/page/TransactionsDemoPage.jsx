import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  BadgeDollarSign,
  CheckCircle2,
  RotateCcw,
  Shuffle,
} from 'lucide-react'
import { useState } from 'react'
import { modules } from '../../../data/modules.js'
import { text } from '../../../lib/i18n.js'
import { useNotificationStore } from '../../../store/useNotificationStore.js'
import { useUiStore } from '../../../store/useUiStore.js'
import { PageShell, Panel, StateAlert } from '../../shared/components/OperationsUI.jsx'

const unavailableMessage = {
  en: 'You do not have access in this version.',
  fa: 'در این نسخه دسترسی ندارید.',
}

const transactionButtons = [
  {
    key: 'deposit',
    icon: ArrowDownToLine,
    label: { en: 'Deposit', fa: 'واریز' },
  },
  {
    key: 'withdrawal',
    icon: ArrowUpFromLine,
    label: { en: 'Withdrawal', fa: 'برداشت' },
  },
  {
    key: 'transfer',
    icon: ArrowLeftRight,
    label: { en: 'Transfer', fa: 'انتقال' },
  },
  {
    key: 'exchange',
    icon: Shuffle,
    label: { en: 'Exchange', fa: 'تبادله ارز' },
  },
  {
    key: 'approval',
    icon: CheckCircle2,
    label: { en: 'Approval', fa: 'تاییدی' },
  },
  {
    key: 'reversal',
    icon: RotateCcw,
    label: { en: 'Reversal', fa: 'برگشت' },
  },
]

export default function TransactionsDemoPage() {
  const language = useUiStore((state) => state.language)
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const module = modules.find((item) => item.key === 'transactions')
  const [message, setMessage] = useState('')

  function showUnavailable(buttonLabel) {
    const localizedLabel = text(buttonLabel, language)
    const localizedMessage = text(unavailableMessage, language)

    setMessage(localizedMessage)
    pushNotification({
      tone: 'warning',
      title: buttonLabel,
      message: unavailableMessage,
      hideSecondary: true,
      durationMs: 4500,
    })

    return `${localizedLabel}: ${localizedMessage}`
  }

  return (
    <PageShell language={language} module={module}>
      <Panel
        description={{
          en: 'Transaction actions are shown for demo navigation only.',
          fa: 'دکمه‌های معاملات فقط برای نمایش در نسخه دمو هستند.',
        }}
        icon={BadgeDollarSign}
        language={language}
        title={{ en: 'Transaction buttons', fa: 'دکمه‌های معاملات' }}
      >
        <div className="transaction-demo-grid">
          {transactionButtons.map((button) => {
            const Icon = button.icon

            return (
              <button
                className="transaction-demo-button"
                key={button.key}
                onClick={() => showUnavailable(button.label)}
                type="button"
              >
                <Icon size={18} strokeWidth={1.9} />
                <span>{text(button.label, language)}</span>
              </button>
            )
          })}
        </div>
        <StateAlert language={language} message={message} />
      </Panel>
    </PageShell>
  )
}
