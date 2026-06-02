import { createContext, useCallback, useContext, useEffect } from 'react'

export const FormCacheContext = createContext(null)

export function useFormCache() {
  const context = useContext(FormCacheContext)

  if (!context) {
    throw new Error('useFormCache must be used inside FormCacheProvider')
  }

  return context
}

export function useCachedForm(formKey, initialValues) {
  const { clearForm, forms, resetForm, setFormValues } = useFormCache()

  useEffect(() => {
    setFormValues(formKey, (currentValues) => {
      if (currentValues && Object.keys(currentValues).length > 0) {
        return currentValues
      }

      return initialValues
    })
  }, [formKey, initialValues, setFormValues])

  const values = forms[formKey] || initialValues

  const setValues = useCallback(
    (nextValues) => {
      setFormValues(formKey, nextValues)
    },
    [formKey, setFormValues],
  )

  const resetValues = useCallback(
    (nextValues = initialValues) => {
      resetForm(formKey, nextValues)
    },
    [formKey, initialValues, resetForm],
  )

  const clearValues = useCallback(() => {
    clearForm(formKey)
  }, [clearForm, formKey])

  return [values, setValues, { clearValues, formKey, resetValues }]
}
