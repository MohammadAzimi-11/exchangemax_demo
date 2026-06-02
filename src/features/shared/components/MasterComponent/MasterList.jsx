import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Pencil,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import api from '../../../../utils/api.js'
import { getCurrentUserId } from '../../../../utils/currentUser.js'
import { cn, getNestedValue } from '../../../../utils/utils.js'
import { text } from '../../../../lib/i18n.js'

function normalizeCollectionResponse(payload, limit) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit, pages: 1 },
    }
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return normalizeCollectionResponse(payload.data, limit)
  }

  if (Array.isArray(payload?.data)) {
    return {
      data: payload.data,
      meta: payload.meta || { total: payload.data.length, page: 1, limit, pages: 1 },
    }
  }

  if (Array.isArray(payload?.items)) {
    return {
      data: payload.items,
      meta: {
        total: payload.count ?? payload.items.length,
        page: 1,
        limit,
        pages: Math.max(1, Math.ceil((payload.count ?? payload.items.length) / limit)),
      },
    }
  }

  return {
    data: [],
    meta: { total: 0, page: 1, limit, pages: 1 },
  }
}

function CellValue({ column, language, row }) {
  const rawValue = getNestedValue(row, column.key)

  if (column.render) {
    return column.render(rawValue, row, language)
  }

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return <span className="master-muted">-</span>
  }

  if (typeof rawValue === 'boolean') {
    return (
      <span className={cn('master-badge', rawValue ? 'success' : 'muted')}>
        {rawValue ? text({ en: 'Yes', fa: 'بلی' }, language) : text({ en: 'No', fa: 'نخیر' }, language)}
      </span>
    )
  }

  return <span>{String(rawValue)}</span>
}

function FilterSelect({ activeValue, filter, language, onChange }) {
  const options = (filter.options || []).map((option) =>
    option && typeof option === 'object' && 'value' in option
      ? option
      : { value: option, label: option },
  )

  return (
    <label className="master-filter">
      <span>{text(filter.label, language)}</span>
      <select value={activeValue || ''} onChange={(event) => onChange(filter.key, event.target.value)}>
        <option value="">{text({ en: 'All', fa: 'همه' }, language)}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {text(option.label, language)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function MasterList({ config, language, onEdit, refreshRef }) {
  const [records, setRecords] = useState([])
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: config.pageSize || 15,
    pages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [orderBy, setOrderBy] = useState(config.defaultOrderBy || '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const limit = config.pageSize || 15
  const columns = config.columns || []
  const rowActions = config.rowActions || []
  const canUpdateRecord = (row) => (config.permissions?.update ? config.permissions.update(row) : true)
  const canDeleteRecord = (row) => {
    const allowedByConfig =
      typeof config.allowDelete === 'function' ? config.allowDelete(row) : Boolean(config.allowDelete)
    const allowedByPermission = config.permissions?.delete ? config.permissions.delete(row) : true

    return allowedByConfig && allowedByPermission
  }
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(orderBy ? { orderBy } : {}),
        ...(config.defaultParams || {}),
        ...filters,
      }

      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await api.get(config.apiPath, { params })
      const normalized = normalizeCollectionResponse(response.data, limit)

      setRecords(normalized.data)
      setMeta(normalized.meta)
    } catch (requestError) {
      setRecords([])
      setMeta({ total: 0, page: 1, limit, pages: 1 })
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [config.apiPath, config.defaultParams, filters, limit, orderBy, page, search])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      fetchRecords()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [fetchRecords])

  useEffect(() => {
    if (!refreshRef) {
      return undefined
    }

    refreshRef.current = { refresh: fetchRecords }

    return () => {
      refreshRef.current = null
    }
  }, [fetchRecords, refreshRef])

  const sortState = useMemo(() => {
    const [key, direction] = (orderBy || ':').split(':')
    return { key, direction }
  }, [orderBy])

  function handleFilterChange(key, value) {
    setFilters((currentFilters) => {
      const nextFilters = { ...currentFilters }

      if (!value) {
        delete nextFilters[key]
      } else {
        nextFilters[key] = value
      }

      return nextFilters
    })
    setPage(1)
  }

  function clearSearchAndFilters() {
    setSearch('')
    setFilters({})
    setPage(1)
  }

  function toggleSort(column) {
    if (!column.sortable) {
      return
    }

    const key = column.sortKey || column.key
    const nextDirection = sortState.key === key && sortState.direction === 'asc' ? 'desc' : 'asc'
    setOrderBy(`${key}:${nextDirection}`)
    setPage(1)
  }

  function getRowKey(row, index) {
    return row.id || `${index}-${columns[0]?.key || 'row'}`
  }

  async function deleteRecord(row, index) {
    const rowKey = getRowKey(row, index)

    if (!canDeleteRecord(row)) {
      return
    }

    if (confirmingDeleteId !== rowKey) {
      setConfirmingDeleteId(rowKey)
      return
    }

    setDeletingId(rowKey)
    setError(null)

    try {
      const currentUserId = await getCurrentUserId()

      if (config.deleteAction) {
        await config.deleteAction({ api, currentUserId, record: row, values: row })
      } else {
        await api.delete(`${config.apiPath}/${row.id}`, {
          data: { deletedById: currentUserId },
        })
      }

      config.onDeleted?.()
      setConfirmingDeleteId(null)
      await fetchRecords()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="master-list">
      <div className="master-toolbar">
        {config.searchable !== false && (
          <div className="master-search">
            <Search size={16} />
            <input
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={text(config.searchPlaceholder, language)}
              type="search"
              value={search}
            />
            {search && (
              <button aria-label={text({ en: 'Clear search', fa: 'پاک کردن جستجو' }, language)} onClick={() => setSearch('')} type="button">
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {config.filters?.length > 0 && (
          <button
            className={cn('master-button subtle', filtersOpen || activeFilterCount ? 'active' : '')}
            onClick={() => setFiltersOpen((value) => !value)}
            type="button"
          >
            <SlidersHorizontal size={16} />
            {text({ en: 'Filters', fa: 'فیلترها' }, language)}
            {activeFilterCount > 0 && <span className="master-count">{activeFilterCount}</span>}
          </button>
        )}

        {(search || activeFilterCount > 0) && (
          <button className="master-button ghost" onClick={clearSearchAndFilters} type="button">
            {text({ en: 'Clear', fa: 'پاک کردن' }, language)}
          </button>
        )}

        <button className="master-button ghost master-refresh" onClick={fetchRecords} type="button">
          <RefreshCcw size={16} />
          {text({ en: 'Refresh', fa: 'تازه‌سازی' }, language)}
        </button>

        <span className="master-total">
          {meta.total || 0} {text(config.entityNamePlural || config.entityName, language)}
        </span>
      </div>

      {filtersOpen && config.filters?.length > 0 && (
        <div className="master-filter-row">
          {config.filters.map((filter) => (
            <FilterSelect
              activeValue={filters[filter.key]}
              filter={filter}
              key={filter.key}
              language={language}
              onChange={handleFilterChange}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="master-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="master-table-wrap">
        <table className="master-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(column.sortable ? 'sortable' : '', column.align ? `align-${column.align}` : '')}
                  key={column.key}
                  onClick={() => toggleSort(column)}
                  style={{ width: column.width }}
                >
                  <span>
                    {text(column.label, language)}
                    {column.sortable && <ChevronsUpDown size={14} />}
                  </span>
                </th>
              ))}
              <th className="master-action-column" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="master-empty" colSpan={columns.length + 1}>
                  {text({ en: 'Loading records...', fa: 'در حال بارگذاری معلومات...' }, language)}
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td className="master-empty" colSpan={columns.length + 1}>
                  {text(config.emptyMessage || { en: 'No records found.', fa: 'هیچ معلوماتی پیدا نشد.' }, language)}
                </td>
              </tr>
            ) : (
              records.map((row, index) => {
                const rowKey = getRowKey(row, index)
                const deleteIsConfirming = confirmingDeleteId === rowKey
                const deleteIsRunning = deletingId === rowKey

                return (
                <tr key={rowKey}>
                  {columns.map((column) => (
                    <td
                      className={cn(column.align ? `align-${column.align}` : '', column.className)}
                      key={column.key}
                    >
                      <CellValue column={column} language={language} row={row} />
                    </td>
                  ))}
                  <td className="master-action-cell">
                    <div className="master-action-buttons">
                      {rowActions
                        .filter((action) => !(action.disabled && action.disabled(row)))
                        .map((action) => (
                          <button
                            aria-label={text(action.label, language)}
                            className={action.className}
                            key={`${action.key || text(action.label, 'en')}-${row.id || index}`}
                            onClick={() => action.onClick(row)}
                            title={text(action.label, language)}
                            type="button"
                          >
                            <action.icon size={15} />
                          </button>
                        ))}
                      {canUpdateRecord(row) && (
                        <button
                          aria-label={text({ en: 'Edit record', fa: 'ویرایش معلومات' }, language)}
                          onClick={() => onEdit(row)}
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {canDeleteRecord(row) && (
                        <button
                          aria-label={text(deleteIsConfirming ? config.confirmDeleteLabel || { en: 'Confirm delete', fa: 'حذف را تایید کنید' } : config.deleteLabel || { en: 'Delete', fa: 'حذف' }, language)}
                          className={cn('danger', deleteIsConfirming ? 'confirm' : '')}
                          disabled={deleteIsRunning}
                          onClick={() => deleteRecord(row, index)}
                          title={text(deleteIsConfirming ? config.confirmDeleteLabel || { en: 'Confirm delete', fa: 'حذف را تایید کنید' } : config.deleteLabel || { en: 'Delete', fa: 'حذف' }, language)}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {meta.pages > 1 && (
        <div className="master-pagination">
          <span>
            {text({ en: 'Page', fa: 'صفحه' }, language)} {meta.page} / {meta.pages}
          </span>
          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= meta.pages || loading}
              onClick={() => setPage((value) => Math.min(meta.pages, value + 1))}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
