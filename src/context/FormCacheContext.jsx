import { useCallback, useMemo, useState } from 'react'
import { FormCacheContext } from './formCache.js'

export function FormCacheProvider({ children }) {
  const [forms, setForms] = useState({})

  const setFormValues = useCallback((formKey, nextValues) => {
    setForms((currentForms) => {
      const currentValues = currentForms[formKey] || {}
      const resolvedValues =
        typeof nextValues === 'function' ? nextValues(currentValues) : nextValues

      return {
        ...currentForms,
        [formKey]: resolvedValues || {},
      }
    })
  }, [])

  const patchFormValue = useCallback((formKey, fieldKey, value) => {
    setForms((currentForms) => ({
      ...currentForms,
      [formKey]: {
        ...(currentForms[formKey] || {}),
        [fieldKey]: value,
      },
    }))
  }, [])

  const resetForm = useCallback((formKey, nextValues = {}) => {
    setForms((currentForms) => ({
      ...currentForms,
      [formKey]: nextValues,
    }))
  }, [])

  const clearForm = useCallback((formKey) => {
    setForms((currentForms) => {
      const nextForms = { ...currentForms }
      delete nextForms[formKey]
      return nextForms
    })
  }, [])

  const value = useMemo(
    () => ({
      clearForm,
      forms,
      patchFormValue,
      resetForm,
      setFormValues,
    }),
    [clearForm, forms, patchFormValue, resetForm, setFormValues],
  )

  return <FormCacheContext.Provider value={value}>{children}</FormCacheContext.Provider>
}
