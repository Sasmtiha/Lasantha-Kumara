'use client'

import * as React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type PerformancePoint = {
  benchmark: number
  label: string
  score: number
}

type LMSDashboardChartsProps = {
  data: PerformancePoint[]
}

export type GradeTrendPoint = {
  benchmark: number
  grade6?: number | null
  grade7?: number | null
  grade8?: number | null
  grade9?: number | null
  grade10?: number | null
  grade11?: number | null
  label: string
}

type GradeTrendChartProps = {
  data: GradeTrendPoint[]
}

const chartConfig = {
  benchmark: {
    color: 'var(--iem-lms-chart-benchmark)',
    label: 'Pass benchmark',
  },
  score: {
    color: 'var(--iem-lms-blue)',
    label: 'Recent marks',
  },
} satisfies ChartConfig

const gradeChartConfig = {
  benchmark: {
    color: 'var(--iem-lms-chart-benchmark)',
    label: 'Pass benchmark',
  },
  grade6: {
    color: '#034ea2',
    label: 'Grade 6',
  },
  grade7: {
    color: '#0a66c2',
    label: 'Grade 7',
  },
  grade8: {
    color: '#2563eb',
    label: 'Grade 8',
  },
  grade9: {
    color: '#7c4dff',
    label: 'Grade 9',
  },
  grade10: {
    color: '#0f766e',
    label: 'Grade 10',
  },
  grade11: {
    color: '#d15cf2',
    label: 'Grade 11',
  },
} satisfies ChartConfig

const gradeOptions = [
  { key: 'grade6', label: 'Grade 6' },
  { key: 'grade7', label: 'Grade 7' },
  { key: 'grade8', label: 'Grade 8' },
  { key: 'grade9', label: 'Grade 9' },
  { key: 'grade10', label: 'Grade 10' },
  { key: 'grade11', label: 'Grade 11' },
] as const

const formatPercent = (value: unknown) => `${Math.round(Number(value) || 0)}%`

export function LMSDashboardSparkline({ data }: LMSDashboardChartsProps) {
  return (
    <ChartContainer className="iem-lms-stat-sparkline" config={chartConfig}>
      <LineChart accessibilityLayer data={data} margin={{ bottom: 4, left: 4, right: 4, top: 4 }}>
        <Line
          dataKey="score"
          dot={false}
          isAnimationActive={false}
          stroke="var(--color-score)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  )
}

export function LMSDashboardProgressChart({ data }: LMSDashboardChartsProps) {
  return (
    <ChartContainer className="iem-lms-progress-chart" config={chartConfig}>
      <LineChart accessibilityLayer data={data} margin={{ bottom: 8, left: 0, right: 12, top: 14 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={14}
        />
        <YAxis
          axisLine={false}
          domain={[0, 100]}
          tickCount={5}
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          width={42}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => formatPercent(value)} />}
          cursor={{ stroke: 'var(--iem-lms-border)', strokeDasharray: '4 6' }}
        />
        <ReferenceLine
          stroke="var(--color-benchmark)"
          strokeDasharray="7 8"
          strokeWidth={2}
          y={50}
        />
        <Line
          activeDot={{ r: 5, strokeWidth: 0 }}
          dataKey="score"
          dot={false}
          isAnimationActive={false}
          stroke="var(--color-score)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={5}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  )
}

export function LMSDashboardGradeTrendChart({ data }: GradeTrendChartProps) {
  const [selectedGrade, setSelectedGrade] = React.useState<null | (typeof gradeOptions)[number]['key']>(null)
  const visibleGrades = selectedGrade
    ? gradeOptions.filter((grade) => grade.key === selectedGrade)
    : gradeOptions

  return (
    <>
      <ChartContainer className="iem-lms-progress-chart" config={gradeChartConfig}>
        <LineChart accessibilityLayer data={data} margin={{ bottom: 8, left: 0, right: 12, top: 14 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={14}
          />
          <YAxis
            axisLine={false}
            domain={[0, 100]}
            tickCount={5}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            width={42}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => formatPercent(value)} />}
            cursor={{ stroke: 'var(--iem-lms-border)', strokeDasharray: '4 6' }}
          />
          <ReferenceLine
            stroke="var(--color-benchmark)"
            strokeDasharray="7 8"
            strokeWidth={2}
            y={50}
          />
          {visibleGrades.map((grade) => (
            <Line
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
              dataKey={grade.key}
              dot={false}
              isAnimationActive={false}
              key={grade.key}
              stroke={`var(--color-${grade.key})`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={selectedGrade ? 5 : 3.5}
              type="monotone"
            />
          ))}
        </LineChart>
      </ChartContainer>
      <div className="iem-lms-grade-filters" aria-label="Academic progress grade filters">
        {gradeOptions.map((grade) => (
          <button
            aria-pressed={selectedGrade === grade.key}
            className={selectedGrade === grade.key ? 'is-active' : undefined}
            key={grade.key}
            onClick={() => setSelectedGrade((current) => (current === grade.key ? null : grade.key))}
            type="button"
          >
            <span>{grade.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
