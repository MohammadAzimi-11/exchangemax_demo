import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Save, X } from 'lucide-react'
import { text } from '../../../../lib/i18n.js'

function accountCategoryLabel(item) {
  return `${item.nameFa || item.nameEn} - ${item.nameEn || item.key}`
}

function buildAccountCategoryPayload(form) {
  return {
    key: form.key,
    nameEn: form.nameEn,
    nameFa: form.nameFa,
    description: form.description,
    isActive: Boolean(form.isActive),
    sortOrder: form.sortOrder || 0,
  }
}

function createBlankCategoryForm(sortOrder = 0) {
  return {
    key: '',
    nameEn: '',
    nameFa: '',
    description: '',
    isActive: true,
    sortOrder,
  }
}

export default function AccountCategoryManager({ api, language, refreshOptions }) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(createBlankCategoryForm)

  const orderedCategories = useMemo(
    () => [...categories].sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0)),
    [categories],
  )

  const loadCategories = useCallback(async () => {
    const response = await api.get('/api/accounts/categories', { params: { includeInactive: true } })
    const data = response.data?.data || response.data
    setCategories(Array.isArray(data?.items) ? data.items : [])
  }, [api])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      loadCategories().catch((requestError) => setError(requestError.message))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadCategories, open])

  function resetForm() {
    setEditingId(null)
    setForm(createBlankCategoryForm(categories.length * 10 + 10))
  }

  function editCategory(category) {
    setEditingId(category.id)
    setForm({
      key: category.key || '',
      nameEn: category.nameEn || '',
      nameFa: category.nameFa || '',
      description: category.description || '',
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    })
  }

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveCategory() {
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await api.put(`/api/accounts/categories/${editingId}`, buildAccountCategoryPayload(form))
      } else {
        await api.post('/api/accounts/categories', buildAccountCategoryPayload(form))
      }

      await loadCategories()
      await refreshOptions?.()
      resetForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-category-manager">
      <button className="master-button" onClick={() => setOpen(true)} type="button">
        <Pencil size={15} />
        {text({ en: 'Manage account categories', fa: 'مدیریت نوع حساب‌ها' }, language)}
      </button>

      {open && (
        <div className="account-category-modal" role="dialog" aria-modal="true">
          <div className="account-category-panel">
            <header>
              <strong>{text({ en: 'Account categories', fa: 'نوع حساب‌ها' }, language)}</strong>
              <button className="master-button" onClick={() => setOpen(false)} type="button">
                <X size={15} />
              </button>
            </header>
            {error && <div className="master-alert">{error}</div>}
            <div className="account-category-body">
              <div className="account-category-list">
                {orderedCategories.map((category) => (
                  <button
                    className={`account-category-row ${editingId === category.id ? 'active' : ''}`}
                    key={category.id}
                    onClick={() => editCategory(category)}
                    type="button"
                  >
                    <span>{accountCategoryLabel(category)}</span>
                    <small>{category.isActive ? text({ en: 'Active', fa: 'فعال' }, language) : text({ en: 'Inactive', fa: 'غیرفعال' }, language)}</small>
                  </button>
                ))}
              </div>
              <div className="master-form-grid">
                <label className="master-field">
                  <span>{text({ en: 'Key', fa: 'کلید' }, language)}</span>
                  <input disabled={Boolean(editingId)} onChange={(event) => updateForm('key', event.target.value.toUpperCase())} value={form.key} />
                </label>
                <label className="master-field">
                  <span>{text({ en: 'Sort', fa: 'ترتیب' }, language)}</span>
                  <input onChange={(event) => updateForm('sortOrder', event.target.value)} type="number" value={form.sortOrder} />
                </label>
                <label className="master-field">
                  <span>{text({ en: 'English name', fa: 'نام انگلیسی' }, language)}</span>
                  <input onChange={(event) => updateForm('nameEn', event.target.value)} value={form.nameEn} />
                </label>
                <label className="master-field">
                  <span>{text({ en: 'Persian name', fa: 'نام فارسی' }, language)}</span>
                  <input onChange={(event) => updateForm('nameFa', event.target.value)} value={form.nameFa} />
                </label>
                <label className="master-field full">
                  <span>{text({ en: 'Description', fa: 'توضیحات' }, language)}</span>
                  <textarea onChange={(event) => updateForm('description', event.target.value)} value={form.description} />
                </label>
                <label className="master-field">
                  <span>{text({ en: 'Active', fa: 'فعال' }, language)}</span>
                  <button className={`master-toggle ${form.isActive ? 'checked' : ''}`} onClick={() => updateForm('isActive', !form.isActive)} type="button">
                    <span />
                  </button>
                </label>
              </div>
            </div>
            <footer className="master-form-actions">
              <button className="master-button" onClick={resetForm} type="button">
                <Plus size={15} />
                {text({ en: 'New', fa: 'جدید' }, language)}
              </button>
              <button className="master-button primary" disabled={saving} onClick={saveCategory} type="button">
                <Save size={15} />
                {text({ en: 'Save category', fa: 'ذخیره نوع حساب' }, language)}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
