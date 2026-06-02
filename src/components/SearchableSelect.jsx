import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import Select from 'react-select'
import { isRtl, text } from '../lib/i18n.js'

function buildFallbackOption(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return {
    value,
    label: String(value),
  }
}

function createSelectStyles(hasError) {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: 34,
      borderRadius: 6,
      borderColor: hasError
        ? 'color-mix(in srgb, var(--red, #a54545) 45%, var(--border, #d9e0de))'
        : state.isFocused
          ? 'color-mix(in srgb, var(--brand, #0d2b45) 65%, var(--border, #d9e0de))'
          : 'var(--border, #d9e0de)',
      backgroundColor: 'var(--surface-2, #eef3f2)',
      boxShadow: 'none',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      color: 'var(--text, #18202a)',
      '&:hover': {
        borderColor: hasError
          ? 'color-mix(in srgb, var(--red, #a54545) 45%, var(--border, #d9e0de))'
          : 'color-mix(in srgb, var(--brand, #0d2b45) 45%, var(--border, #d9e0de))',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '1px 9px',
      color: 'var(--text, #18202a)',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--subtle, #8a949e)',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text, #18202a)',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text, #18202a)',
    }),
    indicatorContainer: (base) => ({
      ...base,
      color: 'var(--muted, #63707b)',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      marginTop: 4,
      border: '1px solid var(--border, #d9e0de)',
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: 'var(--surface, #ffffff)',
      color: 'var(--text, #18202a)',
      boxShadow: '0 14px 36px rgba(18, 24, 32, 0.14)',
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      backgroundColor: 'var(--surface, #ffffff)',
    }),
    option: (base, state) => ({
      ...base,
      minHeight: 30,
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
      padding: '6px 8px',
      backgroundColor: state.isSelected
        ? 'var(--brand, #0d2b45)'
        : state.isFocused
          ? 'color-mix(in srgb, var(--brand, #0d2b45) 10%, var(--surface, #ffffff))'
          : 'transparent',
      color: state.isSelected ? 'var(--brand-contrast, #ffffff)' : 'var(--text, #18202a)',
      cursor: 'pointer',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: 'var(--muted, #63707b)',
    }),
    clearIndicator: (base) => ({
      ...base,
      color: 'var(--muted, #63707b)',
      '&:hover': {
        color: 'var(--text, #18202a)',
      },
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? 'var(--brand, #0d2b45)' : 'var(--muted, #63707b)',
      '&:hover': {
        color: 'var(--brand, #0d2b45)',
      },
    }),
  }
}

const SearchableSelect = forwardRef(function SearchableSelect({
  error = false,
  isClearable = true,
  isDisabled = false,
  isMulti = false,
  language = 'en',
  name,
  onChange,
  onKeyDown,
  options,
  placeholder,
  value,
}, ref) {
  const selectRef = useRef(null)
  const normalizedOptions = useMemo(
    () =>
      (options || []).map((option) => ({
        value: option.value,
        label:
          typeof option.label === 'string'
            ? option.label
            : text(option.label || option.value, language),
      })),
    [language, options],
  )

  const selectedOption = useMemo(() => {
    if (isMulti) {
      const values = Array.isArray(value) ? value : []
      return values
        .map((nextValue) => normalizedOptions.find((option) => option.value === nextValue) || buildFallbackOption(nextValue))
        .filter(Boolean)
    }

    const matchedOption = normalizedOptions.find((option) => option.value === value)

    return matchedOption || buildFallbackOption(value)
  }, [isMulti, normalizedOptions, value])

  useImperativeHandle(ref, () => ({
    focus: () => selectRef.current?.focus(),
  }))

  return (
    <Select
      classNamePrefix="search-select"
      components={{ IndicatorSeparator: null }}
      name={name}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isMulti={isMulti}
      isRtl={isRtl(language)}
      menuPlacement="auto"
      menuPortalTarget={typeof document === 'undefined' ? null : document.body}
      noOptionsMessage={() => text({ en: 'No results found.', fa: 'نتیجه‌ای پیدا نشد.' }, language)}
      onKeyDown={onKeyDown}
      onChange={(option) => {
        if (isMulti) {
          onChange(Array.isArray(option) ? option.map((item) => item.value) : [])
          return
        }

        onChange(option ? option.value : '')
      }}
      options={normalizedOptions}
      placeholder={placeholder}
      ref={selectRef}
      styles={createSelectStyles(error)}
      value={selectedOption}
    />
  )
})

export default SearchableSelect
