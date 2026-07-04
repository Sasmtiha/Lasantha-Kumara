'use client'

import { CalendarDays, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'

type FilterOption = {
  label: string
  value: string
}

export type LMSListFilterConfig = {
  fields: {
    label: string
    name: string
    options: FilterOption[]
  }[]
  statusField?: string
  hideStatusTabCounts?: boolean
  statusTabs?: FilterOption[]
}

type LMSListFiltersClientProps = {
  collectionLabel: string
  collectionSlug: string
  config: LMSListFilterConfig
  counts?: {
    all: number
    byValue: Record<string, number>
  }
}

const prettyLabel = (value: string) =>
  value
    .replaceAll('_', ' ')
    .split(' ')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')

const whereEqualsKey = (fieldName: string) => `where[${fieldName}][equals]`
const dateFromKey = 'where[createdAt][greater_than_equal]'
const dateToKey = 'where[createdAt][less_than_equal]'

const clearWhereParams = (params: URLSearchParams) => {
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith('where[')) {
      params.delete(key)
    }
  })
}

export default function LMSListFiltersClient({
  collectionLabel,
  collectionSlug,
  config,
  counts,
}: LMSListFiltersClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(false)

  const initialValues = useMemo(() => {
    return Object.fromEntries(
      config.fields.map((field) => [field.name, searchParams.get(whereEqualsKey(field.name)) || '']),
    )
  }, [config.fields, searchParams])

  const [values, setValues] = useState(initialValues)
  const [dateFrom, setDateFrom] = useState(searchParams.get(dateFromKey)?.slice(0, 10) || '')
  const [dateTo, setDateTo] = useState(searchParams.get(dateToKey)?.slice(0, 10) || '')

  const basePath = pathname || `/admin/collections/${collectionSlug}`
  const activeStatus = config.statusField ? searchParams.get(whereEqualsKey(config.statusField)) : null
  const showStatusCounts = Boolean(counts && !config.hideStatusTabCounts)
  const hasFilters =
    Object.values(initialValues).some(Boolean) ||
    Boolean(searchParams.get(dateFromKey)) ||
    Boolean(searchParams.get(dateToKey))

  const buildStatusHref = (value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    clearWhereParams(params)

    if (value && config.statusField) {
      params.set(whereEqualsKey(config.statusField), value)
    }

    const query = params.toString()

    return query ? `${basePath}?${query}` : basePath
  }

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    clearWhereParams(params)

    Object.entries(values).forEach(([fieldName, value]) => {
      if (value) {
        params.set(whereEqualsKey(fieldName), value)
      }
    })

    if (dateFrom) params.set(dateFromKey, dateFrom)
    if (dateTo) params.set(dateToKey, dateTo)

    setPanelOpen(false)
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    clearWhereParams(params)
    setValues(Object.fromEntries(config.fields.map((field) => [field.name, ''])))
    setDateFrom('')
    setDateTo('')
    setPanelOpen(false)
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath)
  }

  return (
    <section className="iem-list-filter-shell" aria-label={`${collectionLabel} list filters`}>
      {config.statusField && config.statusTabs?.length ? (
        <nav
          className={[
            'iem-list-status-tabs',
            config.hideStatusTabCounts && 'iem-list-status-tabs--grade',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`${collectionLabel} status views`}
        >
          <Link className={!activeStatus ? 'is-active' : undefined} href={buildStatusHref()}>
            <span>All</span>
            {showStatusCounts ? <em>{counts?.all}</em> : null}
          </Link>
          {config.statusTabs.map((tab) => (
            <Link
              className={activeStatus === tab.value ? 'is-active' : undefined}
              href={buildStatusHref(tab.value)}
              key={tab.value}
            >
              <span>{prettyLabel(tab.label)}</span>
              {showStatusCounts ? <em>{counts?.byValue[tab.value] || 0}</em> : null}
            </Link>
          ))}
        </nav>
      ) : (
        <div />
      )}

      <div className="iem-list-filter-action">
        {hasFilters ? (
          <button className="iem-list-filter-clear" onClick={clearFilters} type="button">
            <X aria-hidden />
            <span>Clear</span>
          </button>
        ) : null}
        <button
          aria-expanded={panelOpen}
          className="iem-list-filter-trigger"
          onClick={() => setPanelOpen((open) => !open)}
          type="button"
        >
          <SlidersHorizontal aria-hidden />
          <span>Filter</span>
        </button>

        {panelOpen ? (
          <form className="iem-list-filter-panel" onSubmit={applyFilters}>
            <div className="iem-list-filter-panel__header">
              <h2>Filter</h2>
              <button aria-label="Close filters" onClick={() => setPanelOpen(false)} type="button">
                <X aria-hidden />
              </button>
            </div>

            {config.fields.map((field) => (
              <label className="iem-list-filter-field" key={field.name}>
                <span>{field.label}</span>
                <select
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  value={values[field.name] || ''}
                >
                  <option value="">All</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {prettyLabel(option.label)}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <div className="iem-list-filter-dates">
              <label className="iem-list-filter-field">
                <span>Created from</span>
                <div>
                  <CalendarDays aria-hidden />
                  <input
                    onChange={(event) => setDateFrom(event.target.value)}
                    type="date"
                    value={dateFrom}
                  />
                </div>
              </label>
              <label className="iem-list-filter-field">
                <span>Created to</span>
                <div>
                  <CalendarDays aria-hidden />
                  <input onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} />
                </div>
              </label>
            </div>

            <div className="iem-list-filter-panel__actions">
              <button onClick={clearFilters} type="button">
                Reset
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  )
}
