import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { text } from '../../../lib/i18n.js'
import { useUiStore } from '../../../store/useUiStore.js'
import api from '../../../utils/api.js'
import { formatMoney } from '../../../utils/utils.js'
import { extractApiData } from '../../shared/components/operations-data.js'
import { PrintState, ThermalReceipt, ThermalSection } from '../../print/ThermalReceipt.jsx'
import { formatDateTime } from '../../print/thermalReceiptUtils.js'

const statusLabels = {
  CREATED: { en: 'Created', fa: 'ثبت شده' },
  PAID: { en: 'Paid', fa: 'پرداخت شده' },
  RETURNED: { en: 'Returned', fa: 'برگشت شده' },
  CANCELLED: { en: 'Cancelled', fa: 'لغو شده' },
}

const directionLabels = {
  OUTGOING: { en: 'Outgoing hawala', fa: 'حواله ارسالی' },
  INCOMING: { en: 'Incoming hawala', fa: 'حواله دریافتی' },
}

function getAutoprintValue() {
  if (typeof window === 'undefined') {
    return false
  }

  return new URLSearchParams(window.location.search).get('autoprint') === '1'
}

function moneyRow(label, amount, currencyCode) {
  return {
    label,
    value: formatMoney(amount, currencyCode),
  }
}

async function loadOptionalPrintPayload(path) {
  try {
    return extractApiData(await api.get(path))
  } catch {
    return null
  }
}

function buildOfficeAddress(hawala, companyProfile) {
  return hawala.destinationTradingCity?.officeAddress || hawala.originTradingCity?.officeAddress || companyProfile?.address || '-'
}

function buildOfficePhone(hawala, companyProfile) {
  return hawala.destinationTradingCity?.phone || hawala.originTradingCity?.phone || hawala.agent?.phone || companyProfile?.phone || '-'
}

export default function HawalaPrintPage() {
  const { hawalaId } = useParams()
  const language = useUiStore((state) => state.language)
  const fallbackCompanyProfile = useUiStore((state) => state.companyProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hawala, setHawala] = useState(null)
  const [companyProfile, setCompanyProfile] = useState(null)
  const printTriggeredRef = useRef(false)
  const shouldAutoprint = getAutoprintValue()

  useEffect(() => {
    let isActive = true

    async function loadPage() {
      setLoading(true)
      setError('')

      try {
        const [hawalaResponse, companyPayload] = await Promise.all([
          api.get(`/api/hawala/${hawalaId}`),
          loadOptionalPrintPayload('/api/company'),
        ])

        if (!isActive) {
          return
        }

        const hawalaPayload = extractApiData(hawalaResponse)

        setHawala(hawalaPayload.item || hawalaPayload)
        setCompanyProfile(companyPayload?.profile || companyPayload || fallbackCompanyProfile)
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      isActive = false
    }
  }, [fallbackCompanyProfile, hawalaId])

  useEffect(() => {
    if (!shouldAutoprint || loading || error || !hawala || printTriggeredRef.current) {
      return
    }

    printTriggeredRef.current = true

    const timerId = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => window.clearTimeout(timerId)
  }, [error, hawala, loading, shouldAutoprint])

  if (loading || error || !hawala) {
    return <PrintState error={error} language={language} loading={loading} />
  }

  const hawalaCode = hawala.externalTrackingCode || hawala.trackingCode
  const payableAmount = hawala.payableAmount || hawala.receiveAmount
  const officeAddress = buildOfficeAddress(hawala, companyProfile)
  const officePhone = buildOfficePhone(hawala, companyProfile)
  const status = text(statusLabels[hawala.status] || { en: hawala.status, fa: hawala.status }, language)

  return (
    <ThermalReceipt
      badge={text(directionLabels[hawala.direction] || { en: 'Hawala slip', fa: 'رسید حواله' }, language)}
      code={hawalaCode}
      companyProfile={companyProfile}
      footerText=""
      language={language}
      meta={[
        { label: text({ en: 'Date', fa: 'تاریخ' }, language), value: formatDateTime(hawala.createdAt, language) },
        { label: text({ en: 'Status', fa: 'وضعیت' }, language), value: status },
      ]}
      status={status}
      title={text({ en: 'Hawala Receipt', fa: 'رسید حواله' }, language)}
    >
      <ThermalSection
        rows={[
          { label: text({ en: 'Hawala no.', fa: 'نمبر حواله' }, language), value: hawalaCode },
          { label: text({ en: 'Tracking', fa: 'کد سیستم' }, language), value: hawala.trackingCode },
          moneyRow(text({ en: 'Payable amount', fa: 'مبلغ پرداخت' }, language), payableAmount, hawala.receiveCurrency),
          moneyRow(text({ en: 'Commission', fa: 'کمیشن' }, language), hawala.totalCommission ?? hawala.feeAmount, hawala.sendCurrency),
          { label: text({ en: 'Commission paid by', fa: 'پرداخت کننده کمیشن' }, language), value: hawala.feePaidBy },
        ]}
        title={text({ en: 'Money', fa: 'پول' }, language)}
      />

      <ThermalSection
        rows={[
          { label: text({ en: 'Sender', fa: 'فرستنده' }, language), value: hawala.senderName },
          { label: text({ en: 'Sender phone', fa: 'شماره فرستنده' }, language), value: hawala.senderPhone },
          { label: text({ en: 'Receiver', fa: 'گیرنده' }, language), value: hawala.receiverName },
          { label: text({ en: 'Receiver phone', fa: 'شماره گیرنده' }, language), value: hawala.receiverPhone },
          { label: text({ en: 'Secret code', fa: 'کد مخفی' }, language), value: hawala.secretCode },
        ]}
        title={text({ en: 'People', fa: 'اشخاص' }, language)}
      />

      <ThermalSection
        rows={[
          { label: text({ en: 'From city', fa: 'شهر مبدا' }, language), value: hawala.originTradingCity?.title || hawala.hawalaCity },
          { label: text({ en: 'To city', fa: 'شهر مقصد' }, language), value: hawala.destinationTradingCity?.title || hawala.receiverCity },
          { label: text({ en: 'Office address', fa: 'آدرس دفتر' }, language), value: officeAddress },
          { label: text({ en: 'Office phone', fa: 'شماره دفتر' }, language), value: officePhone },
        ]}
        title={text({ en: 'Delivery', fa: 'تحویل' }, language)}
      />
    </ThermalReceipt>
  )
}
