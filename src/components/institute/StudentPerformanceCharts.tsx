'use client'

type PerformanceRecord = {
  id: number
  title: string
  examType: string
  assessmentArea: string
  examDate: string
  marksObtained: number
  totalMarks: number
  percentage: number
  letterGrade: string
  resultStatus: string
  teacherRemarks?: null | string
}

export function StudentPerformanceCharts({ records }: { records: PerformanceRecord[] }) {
  if (!records.length) {
    return (
      <div className="rounded-md border border-dashed border-[#034EA2]/25 bg-white p-10 text-center">
        <p className="text-lg font-semibold text-[#111827]">No published results yet</p>
        <p className="mt-2 text-[#6b7280]">Your exam performance will appear here after marks are published.</p>
      </div>
    )
  }

  const chronological = [...records].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
  )
  const average = records.reduce((sum, item) => sum + item.percentage, 0) / records.length
  const best = Math.max(...records.map((item) => item.percentage))
  const latest = chronological[chronological.length - 1]
  const passed = records.filter((item) => item.resultStatus === 'Pass').length
  const dateKeys = [...new Set(chronological.map((item) => item.examDate.slice(0, 10)))]
  const width = Math.max(1080, dateKeys.length * 150)
  const chartHeight = 340
  const left = 58
  const right = 38
  const top = 24
  const bottom = 56
  const plotWidth = width - left - right
  const plotHeight = chartHeight - top - bottom
  const x = (index: number) =>
    dateKeys.length === 1
      ? left + plotWidth / 2
      : left + (index / (dateKeys.length - 1)) * plotWidth
  const y = (percentage: number) => top + ((100 - percentage) / 100) * plotHeight

  const palette: Record<string, string> = {
    'Overall English': '#034EA2',
    Reading: '#0F766E',
    Writing: '#7C3AED',
    Listening: '#D97706',
    'Speaking / Oral': '#0891B2',
    Grammar: '#4F46E5',
    Vocabulary: '#BE185D',
    Assignment: '#15803D',
  }
  const areaOrder = Object.keys(palette)
  const activeAreas = areaOrder.filter((area) =>
    chronological.some((record) => record.assessmentArea === area),
  )
  const totalSeries = dateKeys.map((date, index) => {
    const results = chronological.filter((record) => record.examDate.slice(0, 10) === date)
    return {
      date,
      index,
      percentage: results.reduce((sum, result) => sum + result.percentage, 0) / results.length,
    }
  })
  const areaSeries = activeAreas.map((area) => ({
    area,
    color: palette[area],
    points: dateKeys.flatMap((date, index) => {
      const results = chronological.filter(
        (record) =>
          record.examDate.slice(0, 10) === date && record.assessmentArea === area,
      )
      if (!results.length) return []
      return [{
        date,
        index,
        percentage: results.reduce((sum, result) => sum + result.percentage, 0) / results.length,
      }]
    }),
  }))
  const showTotalSeparately =
    activeAreas.length > 1 || !activeAreas.includes('Overall English')

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Average score" value={`${average.toFixed(1)}%`} />
        <Metric label="Best performance" value={`${best.toFixed(1)}%`} />
        <Metric label="Latest result" value={`${latest.percentage.toFixed(1)}%`} />
        <Metric label="Exams passed" value={`${passed}/${records.length}`} />
      </div>

      <section className="mt-6 rounded-md border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,.06)] sm:p-7">
        <div>
          <p className="premium-kicker text-[#034EA2]">Progress trend</p>
          <h2 className="mt-2 text-2xl font-medium text-[#111827]">Performance over time</h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            Compare each English skill with your combined overall progress.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {showTotalSeparately && <Legend color="#111827" label="Total average" />}
          {areaSeries.map((series) => (
            <Legend color={series.color} key={series.area} label={series.area} />
          ))}
        </div>
        <div className="mt-6 w-full overflow-x-auto pb-2">
          <svg
            aria-label="Exam percentage trend"
            className="h-[340px] w-full"
            role="img"
            style={{ minWidth: `${width}px` }}
            viewBox={`0 0 ${width} ${chartHeight}`}
          >
            <defs>
              {areaSeries.map((series) => {
                const gradientID = `area-${series.area.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                return (
                  <linearGradient
                    id={gradientID}
                    key={gradientID}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={series.color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={series.color} stopOpacity="0.025" />
                  </linearGradient>
                )
              })}
            </defs>
            {[0, 25, 50, 75, 100].map((value) => {
              const lineY = y(value)
              return (
                <g key={value}>
                  <line stroke="#e5e7eb" strokeWidth="1" x1={left} x2={width - right} y1={lineY} y2={lineY} />
                  <text fill="#6b7280" fontSize="11" textAnchor="end" x={left - 10} y={lineY + 4}>{value}%</text>
                </g>
              )
            })}
            {areaSeries.map((series) => {
              if (series.points.length < 2) return null
              const gradientID = `area-${series.area.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              const first = series.points[0]
              const last = series.points[series.points.length - 1]
              const areaPoints = [
                `${x(first.index)},${y(0)}`,
                ...series.points.map((point) => `${x(point.index)},${y(point.percentage)}`),
                `${x(last.index)},${y(0)}`,
              ].join(' ')

              return (
                <polygon
                  fill={`url(#${gradientID})`}
                  key={`${series.area}-background`}
                  points={areaPoints}
                />
              )
            })}
            {showTotalSeparately && (
              <>
                <polyline
                  fill="none"
                  points={totalSeries.map((point) => `${x(point.index)},${y(point.percentage)}`).join(' ')}
                  stroke="#111827"
                  strokeDasharray="8 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
                {totalSeries.map((point) => (
                  <circle
                    cx={x(point.index)}
                    cy={y(point.percentage)}
                    fill="white"
                    key={`total-${point.date}`}
                    r="5"
                    stroke="#111827"
                    strokeWidth="3"
                  />
                ))}
              </>
            )}
            {areaSeries.map((series) => (
              <g key={series.area}>
                <polyline
                  fill="none"
                  opacity="0.14"
                  points={series.points.map((point) => `${x(point.index)},${y(point.percentage)}`).join(' ')}
                  stroke={series.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="14"
                />
                <polyline
                  fill="none"
                  points={series.points.map((point) => `${x(point.index)},${y(point.percentage)}`).join(' ')}
                  stroke={series.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {series.points.map((point) => (
                  <g key={`${series.area}-${point.date}`}>
                    <circle
                      cx={x(point.index)}
                      cy={y(point.percentage)}
                      fill={series.color}
                      opacity="0.12"
                      r="13"
                    />
                    <circle
                      cx={x(point.index)}
                      cy={y(point.percentage)}
                      fill="white"
                      r="7"
                      stroke={series.color}
                      strokeWidth="4"
                    />
                    <text
                      fill="#111827"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                      x={x(point.index)}
                      y={y(point.percentage) - 14}
                    >
                      {point.percentage.toFixed(0)}%
                    </text>
                  </g>
                ))}
              </g>
            ))}
            {dateKeys.map((date, index) => (
              <text
                fill="#6b7280"
                fontSize="11"
                key={date}
                textAnchor="middle"
                x={x(index)}
                y={chartHeight - 18}
              >
                {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
              </text>
            ))}
          </svg>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-md border border-black/8 bg-white shadow-[0_18px_55px_rgba(15,23,42,.06)]">
        <div className="border-b border-black/8 p-6 sm:p-7">
          <p className="premium-kicker text-[#034EA2]">Exam history</p>
          <h2 className="mt-2 text-2xl font-medium text-[#111827]">Marks and grades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#f7faff] text-xs uppercase tracking-wider text-[#6b7280]">
              <tr>
                {['Exam', 'Date', 'Marks', 'Percentage', 'Grade', 'Result', 'Teacher remarks'].map((heading) => (
                  <th className="px-6 py-4 font-semibold" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...records]
                .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
                .map((record) => (
                  <tr className="border-t border-black/8" key={record.id}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#111827]">{record.title}</p>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        {record.examType} · {record.assessmentArea}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-[#6b7280]">{new Date(record.examDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-5 font-semibold text-[#111827]">{record.marksObtained}/{record.totalMarks}</td>
                    <td className="px-6 py-5 font-semibold text-[#034EA2]">{record.percentage.toFixed(1)}%</td>
                    <td className="px-6 py-5"><span className="grid size-9 place-items-center rounded-md bg-[#eef5ff] font-bold text-[#034EA2]">{record.letterGrade}</span></td>
                    <td className="px-6 py-5">
                      <span className={record.resultStatus === 'Pass' ? 'text-emerald-700' : 'text-red-700'}>{record.resultStatus}</span>
                    </td>
                    <td className="max-w-xs px-6 py-5 text-sm leading-6 text-[#6b7280]">{record.teacherRemarks || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-[#374151]"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      <span className="h-0.5 w-7 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-black/8 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,.05)]">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-[-.025em] text-[#111827]">{value}</p>
      <span className="mt-4 block h-1 w-12 rounded-full bg-[#034EA2]" />
    </article>
  )
}
