'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

type ChartConfig = Record<
  string,
  {
    color?: string
    label?: React.ReactNode
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn('shadcn-chart-container', className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color)

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig.map(([key, item]) => `  --color-${key}: ${item.color};`).join('\n')}
}
`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = {
  active?: boolean
  className?: string
  formatter?: (...args: any[]) => React.ReactNode
  label?: React.ReactNode
  payload?: any[]
}

function ChartTooltipContent({
  active,
  className,
  formatter,
  label,
  payload,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div className={cn('shadcn-chart-tooltip', className)}>
      {label ? <div className="shadcn-chart-tooltip__label">{label}</div> : null}
      <div className="shadcn-chart-tooltip__items">
        {payload.map((item) => {
          const key = String(item.dataKey || item.name || '')
          const itemConfig = config[key]
          const indicatorColor = item.color || itemConfig?.color

          return (
            <div className="shadcn-chart-tooltip__item" key={key}>
              <span style={{ backgroundColor: indicatorColor }} />
              <div>
                <small>{itemConfig?.label || item.name || key}</small>
                <strong>
                  {formatter
                    ? formatter(item.value, item.name, item, item.payload, payload)
                    : item.value}
                </strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
export type { ChartConfig }
