import { modules } from '../../../data/modules.js'
import { useUiStore } from '../../../store/useUiStore.js'
import { MasterComponent } from '../../shared/components/MasterComponent/index.js'
import { customersConfig } from '../../shared/components/MasterComponent/masterConfigs.jsx'

const customerModule =
  modules.find((module) => module.key === 'customers') || {
    title: { en: 'Customers', fa: 'مشتریان' },
    description: { en: 'Customer management.', fa: 'مدیریت مشتریان.' },
  }

export default function CustomerPage() {
  const language = useUiStore((state) => state.language)

  return (
    <MasterComponent
      config={customersConfig}
      language={language}
      title={customerModule.title}
    />
  )
}
