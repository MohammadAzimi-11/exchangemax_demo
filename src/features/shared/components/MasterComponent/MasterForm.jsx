import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react'
import FilePreviewInput from '../../../../components/FilePreviewInput.jsx'
import { useCachedForm } from '../../../../context/formCache.js'
import SearchableSelect from '../../../../components/SearchableSelect.jsx'
import api from '../../../../utils/api.js'
import { getCurrentUserId } from '../../../../utils/currentUser.js'
import { cn, formatAmountInWordsFa, getNestedValue } from '../../../../utils/utils.js'
import { text } from '../../../../lib/i18n.js'

function getInitialValues(fields, mode, record, config) {
  const sourceRecord = mode === 'edit' && config.transformRecord ? config.transformRecord(record) : record

  return fields.reduce((values, field) => {
    if (field.hidden || (mode === 'edit' && field.createOnly)) {
      return values
    }

    const rawValue = mode === 'edit' ? getNestedValue(sourceRecord, field.key) : undefined
    values[field.key] =
      rawValue !== undefined && rawValue !== null
        ? rawValue
        : field.defaultValue ?? (field.type === 'toggle' || field.type === 'boolean' ? false : '')

    return values
  }, {})
}

function isFieldVisible(field, values, mode) {
  if (field.hidden || (mode === 'edit' && field.createOnly)) {
    return false
  }

  if (!field.visibleWhen) {
    return true
  }

  return field.visibleWhen(values, mode)
}

function isSectionVisible(section, values, mode) {
  if (!section.visibleWhen) {
    return true
  }

  return section.visibleWhen(values, mode)
}

function normalizeInputValue(field, rawValue) {
  if (field.type === 'number') {
    return normalizeDecimalInputValue(rawValue)
  }

  return rawValue
}

function normalizeDecimalInputValue(rawValue) {
  if (rawValue === '') {
    return ''
  }

  const digitMap = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  }
  const normalized = String(rawValue)
    .replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] || digit)
    .replace(/[,\s٬،]/g, '')
    .replace(/٫/g, '.')

  return /^-?\d*(\.\d*)?$/.test(normalized) ? normalized : rawValue
}

function validateFields(fields, values, language) {
  const errors = {}

  fields.forEach((field) => {
    if (field.hidden) {
      return
    }

    const value = values[field.key]
    const isEmpty = value === '' || value === null || value === undefined

    if (field.required && isEmpty) {
      errors[field.key] = text({ en: 'This field is required.', fa: 'این بخش ضروری است.' }, language)
      return
    }

    if (field.validate) {
      const message = field.validate(value, values, language)
      if (message) {
        errors[field.key] = text(message, language)
      }
    }
  })

  return errors
}

function buildPayload(fields, values, mode) {
  return fields.reduce((payload, field) => {
    if (field.hidden || field.readOnly || (mode === 'edit' && field.createOnly)) {
      return payload
    }

    const value = values[field.key]
    payload[field.key] = value === '' ? null : value
    return payload
  }, {})
}

async function resolveFileUploads(fields, payload) {
  const nextPayload = { ...payload }
  const uploadFields = fields.filter((field) => field.type === 'file' && payload[field.key] instanceof File)

  for (const field of uploadFields) {
    const formData = new FormData()
    formData.append('file', payload[field.key])

    const response = await api.post(field.uploadPath || '/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const uploadedFile = response.data?.data || response.data
    nextPayload[field.key] = uploadedFile.relativePath || uploadedFile.url || uploadedFile.fileName
  }

  return nextPayload
}

function getActorFieldKeys(config, mode, payload) {
  if (!config.actorFields) {
    return []
  }

  if (typeof config.actorFields === 'function') {
    return config.actorFields({ mode, payload }) || []
  }

  if (Array.isArray(config.actorFields)) {
    return config.actorFields
  }

  return config.actorFields[mode] || config.actorFields.all || []
}

async function applyCurrentUserFields(config, payload, mode) {
  const actorFieldKeys = getActorFieldKeys(config, mode, payload)

  if (actorFieldKeys.length === 0) {
    return payload
  }

  const currentUserId = await getCurrentUserId()
  const nextPayload = { ...payload }

  actorFieldKeys.forEach((fieldKey) => {
    nextPayload[fieldKey] = currentUserId
  })

  return nextPayload
}

function getCollectionItems(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return getCollectionItems(payload.data)
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

function buildDynamicOption(field, item) {
  const source = typeof field.optionsSource === 'string' ? { path: field.optionsSource } : field.optionsSource
  const value = getNestedValue(item, source.valueKey || 'id')
  const label =
    typeof source.label === 'function'
      ? source.label(item)
      : getNestedValue(item, source.labelKey || 'name') || getNestedValue(item, source.fallbackLabelKey || 'code') || value

  return {
    value,
    label,
  }
}

function normalizeOption(option) {
  if (option && typeof option === 'object' && 'value' in option) {
    return option
  }

  return {
    value: option,
    label: option,
  }
}

function isMoneyField(field) {
  if (field.amountInWords === false || field.type !== 'number') {
    return false
  }

  if (field.amountInWords === true) {
    return true
  }

  const key = String(field.key || '').toLowerCase()
  const label = `${field.label?.en || ''} ${field.label?.fa || ''}`.toLowerCase()
  const content = `${key} ${label}`

  if (/(rate|spread|percent|days|hours|count|padding|decimal|port|copies|number)/.test(content)) {
    return false
  }

  return /(amount|balance|limit|fee|commission|payable|credit)/.test(content)
}

function optionLabelToCurrencyCode(option) {
  const label = typeof option?.label === 'object' ? option.label.en || option.label.fa : option?.label
  return String(label || option?.value || '').trim().match(/^[A-Z]{3}\b/)?.[0] || ''
}

function resolveMoneyCurrencyCode(field, values, dynamicOptions) {
  if (field.currencyField && values[field.currencyField]) {
    return values[field.currencyField]
  }

  const key = String(field.key || '')

  if (/^send/i.test(key) && values.sendCurrency) {
    return values.sendCurrency
  }

  if (/^receive/i.test(key) && values.receiveCurrency) {
    return values.receiveCurrency
  }

  if (/commission|fee/i.test(key) && (values.currencyCode || values.sendCurrency)) {
    return values.currencyCode || values.sendCurrency
  }

  if (values.currencyCode || values.sendCurrency || values.receiveCurrency) {
    return values.currencyCode || values.sendCurrency || values.receiveCurrency
  }

  if (values.currencyId) {
    const selectedCurrency = (dynamicOptions.currencyId || []).find((option) => option.value === values.currencyId)
    return optionLabelToCurrencyCode(selectedCurrency)
  }

  return ''
}

function FieldControl({ error, field, language, onChange, options, value }) {
  const label = text(field.label, language)

  if (field.type === 'file') {
    return (
      <FilePreviewInput
        accept={field.accept}
        ariaInvalid={Boolean(error)}
        language={language}
        onChange={onChange}
        value={value}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        onChange={(event) => onChange(event.target.value)}
        placeholder={text(field.placeholder, language)}
        rows={field.rows || 2}
        value={value || ''}
      />
    )
  }

  if (field.type === 'select') {
    const normalizedOptions = (options || field.options || []).map((rawOption) => normalizeOption(rawOption))

    return (
      <SearchableSelect
        error={Boolean(error)}
        isClearable={!field.required}
        language={language}
        onChange={onChange}
        options={normalizedOptions}
        placeholder={text(field.placeholder || { en: `Select ${label}`, fa: `${label} را انتخاب کنید` }, language)}
        value={value === null || value === undefined ? '' : value}
      />
    )
  }

  if (field.type === 'toggle' || field.type === 'boolean') {
    return (
      <button
        aria-checked={Boolean(value)}
        className={cn('master-toggle', value ? 'checked' : '')}
        onClick={() => onChange(!value)}
        role="switch"
        type="button"
      >
        <span />
      </button>
    )
  }

  return (
    <input
      aria-invalid={Boolean(error)}
      max={field.max}
      min={field.min}
      onChange={(event) => onChange(normalizeInputValue(field, event.target.value))}
      placeholder={text(field.placeholder, language)}
      step={field.step}
      type={field.type === 'number' ? field.inputType || 'text' : field.inputType || field.type || 'text'}
      inputMode={field.type === 'number' ? 'decimal' : undefined}
      value={value === null || value === undefined ? '' : value}
    />
  )
}

function FormField({ dynamicOptions, error, field, language, onChange, options, value, values }) {
  const amountWords = isMoneyField(field)
    ? formatAmountInWordsFa(value, resolveMoneyCurrencyCode(field, values, dynamicOptions))
    : ''

  return (
    <label className={cn('master-field', field.fullWidth ? 'full' : '')}>
      <span>
        {text(field.label, language)}
        {field.required && <strong>*</strong>}
      </span>
      <FieldControl
        error={error}
        field={field}
        language={language}
        onChange={onChange}
        options={options}
        value={value}
      />
      {field.hint && !error && <small>{text(field.hint, language)}</small>}
      {amountWords && <small className="amount-in-words">{amountWords}</small>}
      {field.type === 'file' && typeof value === 'string' && value && !error && (
        <small>{text({ en: `Current file: ${value}`, fa: `فایل فعلی: ${value}` }, language)}</small>
      )}
      {error && <small className="master-field-error">{error}</small>}
    </label>
  )
}

export default function MasterForm({ config, language, mode, onDelete, onSuccess, record }) {
  const initialValues = useMemo(
    () => getInitialValues(config.fields || [], mode, record, config),
    [config, mode, record],
  )
  const formKey = useMemo(() => {
    const configKey = config.cacheKey || config.apiPath || text(config.entityName, 'en') || 'master-form'
    const recordKey = mode === 'edit' ? record?.id || 'unknown' : 'new'

    return `master:${configKey}:${recordKey}`
  }, [config, mode, record?.id])
  const [values, setValues, formCache] = useCachedForm(formKey, initialValues)
  const [errors, setErrors] = useState({})
  const [dynamicOptions, setDynamicOptions] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [globalError, setGlobalError] = useState(null)
  const visibleFields = useMemo(
    () => (config.fields || []).filter((field) => isFieldVisible(field, values, mode)),
    [config.fields, mode, values],
  )

  const sections = config.formSections || [
    {
      title: null,
      keys: visibleFields.map((field) => field.key),
      columns: 2,
    },
  ]
  const canDelete =
    mode === 'edit' &&
    (typeof config.allowDelete === 'function' ? config.allowDelete(record) : Boolean(config.allowDelete)) &&
    (config.permissions?.delete ? config.permissions.delete(record) : true)

  const loadDynamicOptions = useCallback(async (isActive = () => true) => {
    const fieldsWithSources = (config.fields || []).filter((field) => field.optionsSource)

    if (fieldsWithSources.length === 0) {
      return
    }

    const entries = await Promise.all(
      fieldsWithSources.map(async (field) => {
        const source = typeof field.optionsSource === 'string' ? { path: field.optionsSource } : field.optionsSource
        const response = await api.get(source.path, { params: source.params || {} })
        const items = getCollectionItems(response.data)
        const filteredItems = source.filter ? items.filter(source.filter) : items

        return [
          field.key,
          filteredItems
            .map((item) => buildDynamicOption(field, item))
            .filter((option) => option.value !== undefined && option.value !== null && option.value !== ''),
        ]
      }),
    )

    if (!isActive()) {
      return
    }

    const nextOptions = Object.fromEntries(entries)
    setDynamicOptions(nextOptions)

    setValues((currentValues) => {
      const nextValues = { ...currentValues }

      for (const field of fieldsWithSources) {
        const options = nextOptions[field.key] || []

        if (field.autoSelectFirst && !nextValues[field.key] && options.length > 0) {
          nextValues[field.key] = options[0].value
        }
      }

      return nextValues
    })
  }, [config.fields, setValues])

  useEffect(() => {
    let isActive = true

    const timer = window.setTimeout(() => {
      loadDynamicOptions(() => isActive).catch((error) => {
        if (isActive) {
          setGlobalError(error.message)
        }
      })
    }, 0)

    return () => {
      isActive = false
      window.clearTimeout(timer)
    }
  }, [loadDynamicOptions, config.optionsRefreshToken])

  function getFieldOptions(field) {
    return dynamicOptions[field.key] || field.options
  }

  function handleChange(key, value) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }))
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors[key]
      return nextErrors
    })
  }

  async function handleSubmit() {
    setGlobalError(null)

    const nextErrors = validateFields(visibleFields, values, language)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      const rawPayload = buildPayload(visibleFields, values, mode)
      const uploadedPayload = await resolveFileUploads(visibleFields, rawPayload)
      const actorPayload = await applyCurrentUserFields(config, uploadedPayload, mode)
      const payload = config.transformPayload ? config.transformPayload(actorPayload, mode, values) : actorPayload
      const response =
        mode === 'new'
          ? await api.post(config.apiPath, payload)
          : await api[config.updateMethod || 'put'](`${config.apiPath}/${record.id}`, payload)
      const responsePayload = response.data?.data || response.data
      const entityPayload = responsePayload?.item || responsePayload

      formCache.resetValues(initialValues)
      onSuccess?.(mode === 'new' ? 'created' : 'updated', entityPayload)
    } catch (error) {
      setGlobalError(error.message)
    } finally {
      setSaving(false)
    }
  }

  function handleFormSubmit(event) {
    event?.preventDefault()

    if (saving || deleting) {
      return
    }

    void handleSubmit()
  }

  function handleFormKeyDown(event) {
    if (event.key !== 'Enter' || event.isComposing) {
      return
    }

    const targetTag = event.target?.tagName?.toLowerCase()

    if (targetTag === 'textarea') {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        event.currentTarget.requestSubmit()
      }

      return
    }

    if (event.shiftKey || event.altKey) {
      return
    }

    if (targetTag === 'input' || targetTag === 'select') {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    setGlobalError(null)

    try {
      if (config.deleteAction) {
        const currentUserId = await getCurrentUserId()
        await config.deleteAction({ api, currentUserId, record, values })
      } else {
        const currentUserId = await getCurrentUserId()
        await api.delete(`${config.apiPath}/${record.id}`, {
          data: { deletedById: currentUserId },
        })
      }

      onDelete?.()
    } catch (error) {
      setGlobalError(error.message)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <form className="master-form" onKeyDown={handleFormKeyDown} onSubmit={handleFormSubmit}>
      {globalError && (
        <div className="master-alert">
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      )}

      {config.formHeader &&
        config.formHeader({
          api,
          language,
          mode,
          refreshOptions: () => loadDynamicOptions(),
          setValues,
          values,
        })}

      {sections.map((section, index) => {
        if (!isSectionVisible(section, values, mode)) {
          return null
        }

        const sectionFields = section.keys
          .map((key) => visibleFields.find((field) => field.key === key))
          .filter(Boolean)

        if (sectionFields.length === 0) {
          return null
        }

        const sectionKey = `${section.key || text(section.title, 'en') || 'section'}-${index}`

        return (
          <section className="master-form-section" key={sectionKey}>
            {section.title && <h3>{text(section.title, language)}</h3>}
            <div
              className={cn(
                'master-form-grid',
                section.columns === 1 ? 'one' : '',
                section.columns === 3 ? 'three' : '',
                section.columns === 4 ? 'four' : '',
              )}
            >
              {sectionFields.map((field) => (
                <FormField
                  dynamicOptions={dynamicOptions}
                  error={errors[field.key]}
                  field={field}
                  key={field.key}
                  language={language}
                  onChange={(nextValue) => handleChange(field.key, nextValue)}
                  options={getFieldOptions(field)}
                  value={values[field.key]}
                  values={values}
                />
              ))}
            </div>
          </section>
        )
      })}

      <div className="master-form-actions">
        {canDelete && (
          <button
            className={cn('master-button danger', confirmDelete ? 'confirm' : '')}
            disabled={deleting || saving}
            onClick={handleDelete}
            type="button"
          >
            <Trash2 size={16} />
            {confirmDelete
              ? text(config.confirmDeleteLabel || { en: 'Confirm delete', fa: 'حذف را تایید کنید' }, language)
              : text(config.deleteLabel || { en: 'Delete', fa: 'حذف' }, language)}
          </button>
        )}

        <button className="master-button primary" disabled={saving || deleting} type="submit">
          {mode === 'new' ? <Plus size={16} /> : <Save size={16} />}
          {mode === 'new'
            ? text(config.createSubmitLabel || { en: 'Create record', fa: 'ثبت معلومات' }, language)
            : text({ en: 'Save changes', fa: 'ذخیره تغییرات' }, language)}
        </button>
      </div>
    </form>
  )
}
