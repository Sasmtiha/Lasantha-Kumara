import { StudentPerformanceCharts } from '@/components/institute/StudentPerformanceCharts'
import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentPerformancePage() {
  const { payload, req, user } = await getStudentPortalData()
  const marks = await payload.find({
    collection: 'student-marks',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    req,
    sort: 'examDate',
    where: {
      and: [
        { user: { equals: user.id } },
        { isPublished: { equals: true } },
      ],
    },
  })

  const records = marks.docs.map((mark) => {
    const exam = typeof mark.exam === 'object' ? mark.exam : null
    return {
      id: mark.id,
      title: exam?.title || 'English Exam',
      examType: exam?.examType || 'Exam',
      assessmentArea: exam?.assessmentArea || 'Overall English',
      examDate: mark.examDate,
      marksObtained: mark.marksObtained,
      totalMarks: mark.totalMarks,
      percentage: mark.percentage || 0,
      letterGrade: mark.letterGrade || '—',
      resultStatus:
        exam && mark.marksObtained >= exam.passMark
          ? 'Pass'
          : exam
            ? 'Fail'
            : mark.resultStatus || '—',
      teacherRemarks: mark.teacherRemarks,
    }
  })

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Academic progress</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">My performance</h1>
      <p className="mt-3 max-w-2xl text-[#6b7280]">
        Follow your English exam results, marks, grades and progress over time.
      </p>
      <div className="mt-9">
        <StudentPerformanceCharts records={records} />
      </div>
    </div>
  )
}
