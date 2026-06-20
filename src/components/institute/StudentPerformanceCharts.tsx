'use client'

type PerformanceRecord = {
  id: number
  title: string
  examType: string
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
  const width = Math.max(720, chronological.length * 110)
  const chartHeight = 260
  const left = 52
  const right = 30
  const top = 24
  const bottom = 48
  const plotWidth = width - left - right
  const plotHeight = chartHeight - top - bottom
  const x = (index: number) =>
    chronological.length === 1
      ? left + plotWidth / 2
      : left + (index / (chronological.length - 1)) * plotWidth
  const y = (percentage: number) => top + ((100 - percentage) / 100) * plotHeight
  const points = chronological.map((item, index) => `${x(index)},${y(item.percentage)}`).join(' ')

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
        </div>
        <div className="mt-7 overflow-x-auto pb-2">
          <svg
            aria-label="Exam percentage trend"
            className="h-[260px]"
            role="img"
            style={{ minWidth: `${width}px` }}
            viewBox={`0 0 ${width} ${chartHeight}`}
          >
            {[0, 25, 50, 75, 100].map((value) => {
              const lineY = y(value)
              return (
                <g key={value}>
                  <line stroke="#e5e7eb" strokeWidth="1" x1={left} x2={width - right} y1={lineY} y2={lineY} />
                  <text fill="#6b7280" fontSize="11" textAnchor="end" x={left - 10} y={lineY + 4}>{value}%</text>
                </g>
              )
            })}
            <polyline fill="none" points={points} stroke="#034EA2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            {chronological.map((item, index) => (
              <g key={item.id}>
                <circle cx={x(index)} cy={y(item.percentage)} fill="white" r="7" stroke="#034EA2" strokeWidth="4" />
                <text fill="#111827" fontSize="12" fontWeight="600" textAnchor="middle" x={x(index)} y={y(item.percentage) - 15}>
                  {item.percentage.toFixed(0)}%
                </text>
                <text fill="#6b7280" fontSize="11" textAnchor="middle" x={x(index)} y={chartHeight - 18}>
                  {new Date(item.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </text>
              </g>
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
                      <p className="mt-1 text-sm text-[#6b7280]">{record.examType}</p>
                    </td>
                    <td className="px-6 py-5 text-[#6b7280]">{new Date(record.examDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-5 font-semibold">{record.marksObtained}/{record.totalMarks}</td>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-black/8 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,.05)]">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-[-.025em] text-[#111827]">{value}</p>
      <span className="mt-4 block h-1 w-12 rounded-full bg-[#034EA2]" />
    </article>
  )
}
