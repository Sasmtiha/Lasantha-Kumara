import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import type { Class, Page } from '@/payload-types'

const collections: CollectionSlug[] = [
  'contact-submissions',
  'gallery',
  'resources',
  'notices',
  'student-marks',
  'exams',
  'enrollments',
  'students',
  'schedules',
  'classes',
  'teachers',
  'testimonials',
  'pages',
  'posts',
  'categories',
  'forms',
  'form-submissions',
  'search',
  'media',
]

const richText = (
  text: string,
  heading?: 'h1' | 'h2' | 'h3',
): NonNullable<Class['fullDescriptionEn']> => ({
  root: {
    type: 'root',
    children: [
      heading
        ? {
            type: 'heading',
            children: [
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: heading,
            version: 1,
          }
        : {
            type: 'paragraph',
            children: [
              { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

export async function seed({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> {
  payload.logger.info('Seeding IEM.lk…')

  // Keep cleanup sequential because PostgreSQL relationships require child
  // collections (for example schedules) to be deleted before their parents.
  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
  }

  for (const collection of collections.filter((collection) =>
    Boolean(payload.collections[collection]?.config.versions),
  )) {
    await payload.db.deleteVersions({ collection, req, where: {} })
  }

  await payload.delete({
    collection: 'users',
    overrideAccess: true,
    where: {
      email: {
        in: ['admin@lasanthaenglish.lk', 'lasantha@lasanthaenglish.lk', 'student@example.com'],
      },
    },
  })

  const admin = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'admin@lasanthaenglish.lk',
      password: 'Admin123!',
      firstName: 'Institute',
      lastName: 'Admin',
      phone: '071 449 2540',
      role: 'super_admin',
      status: 'active',
    },
  })
  const teacherUser = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'lasantha@lasanthaenglish.lk',
      password: 'Teacher123!',
      firstName: 'Lasantha',
      lastName: 'Kumara',
      phone: '071 449 2540',
      role: 'teacher',
      status: 'active',
    },
  })
  const teacher = await payload.create({
    collection: 'teachers',
    overrideAccess: true,
    data: {
      user: teacherUser.id,
      fullName: 'Lasantha Kumara',
      bio: richText(
        'An experienced English educator dedicated to helping Sri Lankan students speak confidently, write clearly, and achieve excellent examination results.',
      ),
      qualifications:
        'Certified English Teacher · 15+ years of teaching experience · Best Teacher Award 2022',
      phone: '071 449 2540',
      email: 'lasantha@lasanthaenglish.lk',
      isActive: true,
    },
  })

  const classDefinitions = [
    [
      'Grade 6 English',
      '6 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-6-english',
      'Build a confident foundation in school English through clear, engaging lessons.',
      'පැහැදිලි හා ආකර්ෂණීය පාඩම් මඟින් පාසල් ඉංග්‍රීසියට ශක්තිමත් පදනමක් ගොඩනඟන්න.',
      'beginner',
      'grade_6',
      '2 hours',
    ],
    [
      'Grade 7 English',
      '7 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-7-english',
      'Strengthen grammar, vocabulary, reading, and writing for the Grade 7 syllabus.',
      '7 ශ්‍රේණියේ විෂය නිර්දේශයට අදාළ ව්‍යාකරණ, වචන මාලාව, කියවීම සහ ලිවීම වර්ධනය කරන්න.',
      'beginner',
      'grade_7',
      '2 hours',
    ],
    [
      'Grade 8 English',
      '8 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-8-english',
      'Develop stronger language skills with guided practice for the Grade 8 syllabus.',
      '8 ශ්‍රේණියේ විෂය නිර්දේශයට අදාළ මඟපෙන්වූ පුහුණුවෙන් භාෂා කුසලතා වර්ධනය කරන්න.',
      'intermediate',
      'grade_8',
      '2 hours',
    ],
    [
      'Grade 9 English',
      '9 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-9-english',
      'Prepare for upper-school English with focused grammar, comprehension, and writing.',
      'ව්‍යාකරණ, අවබෝධය සහ ලිවීම කෙරෙහි අවධානය යොමු කරමින් ඉහළ ශ්‍රේණි සඳහා සූදානම් වන්න.',
      'intermediate',
      'grade_9',
      '2 hours',
    ],
    [
      'Grade 10 English',
      '10 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-10-english',
      'Begin focused O/L preparation with syllabus coverage, writing, and exam practice.',
      'විෂය නිර්දේශ ආවරණය, ලිවීම සහ විභාග පුහුණුව සමඟ O/L සඳහා ඉලක්කගත සූදානම ආරම්භ කරන්න.',
      'exam',
      'grade_10',
      '3 hours',
    ],
    [
      'Grade 11 English',
      '11 ශ්‍රේණිය ඉංග්‍රීසි',
      'grade-11-english',
      'Complete O/L preparation with revision, past papers, and proven exam strategies.',
      'පුනරීක්ෂණය, පසුගිය ප්‍රශ්න පත්‍ර සහ සාර්ථක විභාග ක්‍රම සමඟ O/L සූදානම සම්පූර්ණ කරන්න.',
      'exam',
      'grade_11',
      '3 hours',
    ],
  ] as const

  const classes = []
  for (const [
    titleEn,
    titleSi,
    slug,
    shortDescriptionEn,
    shortDescriptionSi,
    level,
    category,
    durationPerWeek,
  ] of classDefinitions) {
    classes.push(
      await payload.create({
        collection: 'classes',
        overrideAccess: true,
        data: {
          titleEn,
          titleSi,
          slug,
          shortDescriptionEn,
          shortDescriptionSi,
          fullDescriptionEn: richText(
            `${shortDescriptionEn} Lessons combine clear explanations, guided practice, individual feedback, and regular progress checks.`,
          ),
          fullDescriptionSi: richText(
            `${shortDescriptionSi} පැහැදිලි විස්තර, පුහුණුව සහ පුද්ගල ප්‍රතිචාර මෙම පාඨමාලාවට ඇතුළත් වේ.`,
          ),
          durationPerWeek,
          maxStudents: 20,
          level,
          category,
          teacher: teacher.id,
          isActive: true,
          displayOrder: classes.length + 1,
        },
      }),
    )
  }
  await payload.update({
    collection: 'teachers',
    id: teacher.id,
    overrideAccess: true,
    data: { classesHandled: classes.map((item) => item.id) },
  })

  const classBySlug = Object.fromEntries(classes.map((item) => [item.slug, item]))
  const scheduleDefinitions = [
    ['Saturday', '1:00 PM', '3:00 PM', 'grade-6-english', 'Grade 6 English'],
    ['Saturday', '3:00 PM', '5:00 PM', 'grade-7-english', 'Grade 7 English'],
    ['Sunday', '3:00 PM', '5:00 PM', 'grade-8-english', 'Grade 8 English'],
    ['Sunday', '1:00 PM', '3:00 PM', 'grade-9-english', 'Grade 9 English'],
    ['Saturday', '10:00 AM', '1:00 PM', 'grade-10-english', 'Grade 10 English'],
    ['Saturday', '7:00 AM', '10:00 AM', 'grade-11-english', 'Grade 11 English'],
  ] as const
  const schedules = []
  for (const [dayOfWeek, startTime, endTime, slug, batchLabel] of scheduleDefinitions) {
    const course = classBySlug[slug]
    schedules.push(
      await payload.create({
        collection: 'schedules',
        overrideAccess: true,
        data: {
          class: course.id,
          dayOfWeek,
          batchLabel,
          startTime,
          endTime,
          location: '123 Education Lane, Middeniya',
          mode: 'physical',
          isActive: true,
          displayOrder: schedules.length + 1,
        },
      }),
    )
  }

  const studentUser = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'student@example.com',
      password: 'Student123!',
      firstName: 'Sample',
      lastName: 'Student',
      phone: '071 000 0000',
      role: 'student',
      status: 'active',
    },
  })
  const grade11Class = classBySlug['grade-11-english']
  const student = await payload.create({
    collection: 'students',
    overrideAccess: true,
    data: {
      user: studentUser.id,
      firstName: 'Sample',
      lastName: 'Student',
      email: 'student@example.com',
      phone: '071 000 0000',
      gradeLevel: 'Grade 11',
      preferredClass: grade11Class.id,
      currentClasses: [grade11Class.id],
      enrollmentStatus: 'approved',
    },
  })
  await payload.create({
    collection: 'enrollments',
    overrideAccess: true,
    data: {
      student: student.id,
      user: studentUser.id,
      class: grade11Class.id,
      firstName: 'Sample',
      lastName: 'Student',
      email: 'student@example.com',
      phone: '071 000 0000',
      gradeLevel: 'Grade 11',
      status: 'approved',
      approvedBy: admin.id,
      approvedAt: new Date().toISOString(),
    },
  })

  const examDefinitions = [
    [
      'Grammar Foundation Test',
      'Monthly Test',
      'Grammar',
      '2026-01-24T00:00:00.000Z',
      62,
      'Good foundation. Review sentence structure.',
    ],
    [
      'Reading & Vocabulary Test',
      'Unit Test',
      'Reading',
      '2026-02-21T00:00:00.000Z',
      71,
      'Strong improvement in comprehension.',
    ],
    [
      'First Term English Test',
      'Term Test',
      'Writing',
      '2026-04-04T00:00:00.000Z',
      78,
      'Well-structured answers and improved accuracy.',
    ],
    [
      'O/L English Mock Exam',
      'Mock Exam',
      'Overall English',
      '2026-05-30T00:00:00.000Z',
      84,
      'Excellent progress. Continue timed paper practice.',
    ],
  ] as const

  for (const [
    title,
    examType,
    assessmentArea,
    examDate,
    marksObtained,
    teacherRemarks,
  ] of examDefinitions) {
    const exam = await payload.create({
      collection: 'exams',
      overrideAccess: true,
      data: {
        title,
        gradeLevel: 'Grade 11',
        class: grade11Class.id,
        examType,
        assessmentArea,
        term: examType === 'Term Test' ? 'Term 1' : 'Other',
        examDate,
        academicYear: 2026,
        totalMarks: 100,
        passMark: 40,
        isPublished: true,
      },
    })
    await payload.create({
      collection: 'student-marks',
      overrideAccess: true,
      data: {
        student: student.id,
        exam: exam.id,
        user: studentUser.id,
        gradeLevel: 'Grade 11',
        class: grade11Class.id,
        marksObtained,
        totalMarks: 100,
        examDate,
        teacherRemarks,
        isPublished: true,
      },
    })
  }

  const testimonials = []
  const testimonialData = [
    [
      'Dilshan Sampath',
      'O/L Student, Batch 2023',
      'Sir made difficult grammar lessons simple. I improved my confidence and achieved an A pass at O/L.',
      'අමාරු ව්‍යාකරණ පාඩම් සරලව තේරුම් කළ නිසා මට O/L විභාගයෙන් A සාමාර්ථයක් ලැබුණා.',
    ],
    [
      'Kumari Perera',
      'Parent of Grade 9 Student',
      'The personal attention and regular progress updates gave us confidence throughout the year.',
      'පුද්ගල අවධානය සහ නිරන්තර ප්‍රගති දැනුම්දීම් අපට විශාල විශ්වාසයක් ලබා දුන්නා.',
    ],
    [
      'Naduni Rathnayake',
      'Grade 10 Student',
      'The focused lessons made grammar and writing much clearer, and I feel ready for my school exams.',
      'ඉලක්කගත පාඩම් නිසා ව්‍යාකරණ සහ ලිවීම වඩා පැහැදිලි වුණා. දැන් පාසල් විභාගවලට හොඳින් සූදානම්.',
    ],
  ] as const
  for (const [name, studentType, feedbackEn, feedbackSi] of testimonialData) {
    testimonials.push(
      await payload.create({
        collection: 'testimonials',
        overrideAccess: true,
        data: {
          name,
          studentType,
          feedbackEn,
          feedbackSi,
          rating: 5,
          isFeatured: true,
          displayOrder: testimonials.length + 1,
        },
      }),
    )
  }

  await payload.create({
    collection: 'notices',
    overrideAccess: true,
    data: {
      title: 'Welcome to the new student portal',
      message: richText(
        'Approved students can now view class schedules, notices, and learning resources from one place.',
      ),
      targetType: 'all',
      priority: 'important',
      publishDate: new Date().toISOString(),
      isPublished: true,
    },
  })
  await payload.create({
    collection: 'resources',
    overrideAccess: true,
    data: {
      title: 'Grade 11 English Revision Guide',
      description: 'A starter collection of revision activities for Grade 11 English students.',
      class: classBySlug['grade-11-english'].id,
      resourceType: 'link',
      externalUrl: 'https://dictionary.cambridge.org/',
      visibility: 'enrolled_students',
      isPublished: true,
      uploadedBy: admin.id,
    },
  })

  const home = await payload.create({
    collection: 'pages',
    overrideAccess: true,
    context: {
      disableRevalidate: true,
    },
    data: {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'instituteHero',
          badgeSi: 'සිසුන් සහ දෙමාපියන් 500+ කගේ විශ්වාසය',
          badgeEn: 'IEM.lk English Academy · Trusted by 500+ Students',
          headingEn: 'Master English with Confidence',
          headingSi: 'ඉංග්‍රීසි විශ්වාසයෙන් ඉගෙනගන්න',
          subheadingEn:
            'Transform your English skills with expert guidance, practical lessons, and a clear path to confidence and exam success.',
          subheadingSi:
            'ප්‍රවීණ මඟපෙන්වීම සහ ප්‍රායෝගික පාඩම් සමඟ ඔබේ ඉංග්‍රීසි කුසලතා වර්ධනය කරගන්න.',
          primaryButtonLabel: 'Enroll Now',
          primaryButtonUrl: '/enroll',
          secondaryButtonLabel: 'Student Portal',
          secondaryButtonUrl: '/login',
          metrics: [],
        },
        {
          blockType: 'metrics',
          items: [
            {
              value: '15+',
              labelEn: 'Years Experience',
              labelSi: 'වසරක අත්දැකීම්',
              icon: 'experience',
            },
            {
              value: '500+',
              labelEn: 'Students Taught',
              labelSi: 'ඉගැන්වූ සිසුන්',
              icon: 'students',
            },
            { value: '98%', labelEn: 'Pass Rate', labelSi: 'සමත් ප්‍රතිශතය', icon: 'results' },
            {
              value: '20',
              labelEn: 'Small Batch Learning',
              labelSi: 'කුඩා කණ්ඩායම් ඉගෙනීම',
              icon: 'batch',
            },
          ],
        },
        {
          blockType: 'aboutUs',
          headingEn: 'A focused place to build confident English',
          headingSi: 'විශ්වාසයෙන් ඉංග්‍රීසි ගොඩනගන නිවැරදි ස්ථානය',
          descriptionEn: richText(
            'IEM.lk provides structured English education for Grade 6 to Grade 11 students, combining clear teaching, regular practice, and personal guidance in a supportive learning environment.',
          ),
          descriptionSi: richText(
            'IEM.lk හි 6 ශ්‍රේණියේ සිට 11 ශ්‍රේණිය දක්වා සිසුන්ට පැහැදිලි ඉගැන්වීම, නිරන්තර පුහුණුව සහ පුද්ගලික මඟපෙන්වීම සමඟ ඉංග්‍රීසි අධ්‍යාපනය ලබා දෙයි.',
          ),
          buttonLabel: 'Learn More',
          buttonUrl: '/about',
        },
        {
          blockType: 'aboutTeacher',
          headingEn: 'Expert guidance. Personal attention. Real progress.',
          headingSi: 'ප්‍රවීණ මඟපෙන්වීම සහ සැබෑ ප්‍රගතිය',
          descriptionEn: richText(
            'Lasantha Kumara has helped hundreds of students build confidence, improve examination results, and use English successfully in study, work, and daily life.',
          ),
          descriptionSi: richText(
            'ලසන්ත කුමාර ගුරුවරයා සිසුන් සිය ගණනකට ඉංග්‍රීසි විශ්වාසයෙන් භාවිතා කිරීමට සහ විභාග ජයග්‍රහණ ලබා ගැනීමට උපකාර කර ඇත.',
          ),
          featureCards: [
            {
              titleEn: 'Certified English Teacher',
              titleSi: 'සහතිකලත් ඉංග්‍රීසි ගුරුවරයෙක්',
              descriptionEn: 'Clear, structured teaching grounded in proven methods.',
              icon: 'book',
            },
            {
              titleEn: 'Best Teacher Award 2022',
              titleSi: 'හොඳම ගුරු සම්මානය 2022',
              descriptionEn: 'Recognized for commitment to student achievement.',
              icon: 'award',
            },
            {
              titleEn: 'Small Class Sizes',
              titleSi: 'කුඩා පන්ති',
              descriptionEn: 'More feedback and personal attention for every learner.',
              icon: 'users',
            },
            {
              titleEn: 'O/L & A/L Specialized',
              titleSi: 'O/L සහ A/L විශේෂඥ',
              descriptionEn: 'Focused exam preparation and answer-writing strategies.',
              icon: 'target',
            },
          ],
        },
        {
          blockType: 'workProcess',
          headingEn: 'Our Learning Process',
          headingSi: 'අපගේ ඉගෙනුම් ක්‍රියාවලිය',
          descriptionEn:
            'A clear learning path designed to build confidence, accuracy and exam-ready English skills.',
          descriptionSi:
            'විශ්වාසය, නිවැරදි භාෂාව සහ විභාග කුසලතා ගොඩනැගීමට පැහැදිලි ඉගෙනුම් මාර්ගයක්.',
          steps: [
            {
              titleEn: 'Foundation First',
              titleSi: 'පදනම මුලින්',
              descriptionEn:
                'Grammar, vocabulary and sentence structure are taught clearly from the basics.',
            },
            {
              titleEn: 'Active Practice',
              titleSi: 'ක්‍රියාකාරී පුහුණුව',
              descriptionEn:
                'Students speak, write, listen and apply lessons through guided activities.',
            },
            {
              titleEn: 'Exam & Real-Life Focus',
              titleSi: 'විභාග සහ සැබෑ ජීවිත අවධානය',
              descriptionEn:
                'Lessons connect school exams, interviews, public speaking and daily communication.',
            },
            {
              titleEn: 'Regular Feedback',
              titleSi: 'නිරන්තර ප්‍රතිචාර',
              descriptionEn:
                'Students receive corrections, progress updates and personal guidance.',
            },
            {
              titleEn: 'Better Results',
              titleSi: 'වඩා හොඳ ප්‍රතිඵල',
              descriptionEn:
                'The goal is confident communication and stronger academic performance.',
            },
          ],
        },
        {
          blockType: 'featuredProgram',
          eyebrowEn: 'IEM.lk Special',
          eyebrowSi: 'IEM.lk විශේෂ',
          headingEn: 'The Complete English Class',
          headingSi: 'සම්පූර්ණ ඉංග්‍රීසි පන්තිය',
          descriptionEn:
            'One balanced program that strengthens communication, grammar, writing and exam confidence.',
          descriptionSi:
            'සන්නිවේදනය, ව්‍යාකරණ, ලිවීම සහ විභාග විශ්වාසය එකවර වර්ධනය කරන සම්පූර්ණ වැඩසටහනක්.',
          buttonLabel: 'Join Now',
          buttonUrl: '/enroll',
          features: [
            {
              titleEn: 'Spoken Practice',
              titleSi: 'කථන පුහුණුව',
              descriptionEn:
                'Build confidence for daily conversations, interviews and presentations.',
              icon: 'spoken',
            },
            {
              titleEn: 'Grammar Mastery',
              titleSi: 'ව්‍යාකරණ ප්‍රවීණතාව',
              descriptionEn: 'Learn sentence structure, tense usage and writing rules clearly.',
              icon: 'grammar',
            },
            {
              titleEn: 'Exam Preparation',
              titleSi: 'විභාග සූදානම',
              descriptionEn:
                'Focused preparation for school exams and the Grade 10–11 O/L syllabus.',
              icon: 'exam',
            },
            {
              titleEn: 'Writing Improvement',
              titleSi: 'ලිවීමේ දියුණුව',
              descriptionEn: 'Improve essays, letters, answers and creative writing.',
              icon: 'writing',
            },
            {
              titleEn: 'Progress Tracking',
              titleSi: 'ප්‍රගති අධීක්ෂණය',
              descriptionEn: 'Receive regular guidance and feedback to improve consistently.',
              icon: 'progress',
            },
          ],
        },
        {
          blockType: 'classesGrid',
          headingEn: 'Choose your grade',
          headingSi: 'ඔබේ ශ්‍රේණිය තෝරන්න',
          subtitleEn: 'Focused English classes for students in Grades 6 through 11.',
          showAllClasses: true,
        },
        {
          blockType: 'results',
          headingEn: 'Real progress comes from consistent practice',
          headingSi: 'සැබෑ ප්‍රගතිය නිරන්තර පුහුණුවෙන්',
          descriptionEn:
            'Clear guidance, focused practice and personal attention help every learner move forward with confidence.',
          descriptionSi:
            'පැහැදිලි මඟපෙන්වීම, ඉලක්කගත පුහුණුව සහ පුද්ගල අවධානය සෑම සිසුවෙකුටම විශ්වාසයෙන් ඉදිරියට යාමට උපකාරී වේ.',
          ctaLabel: 'Explore Classes',
          ctaUrl: '#classes',
          metrics: [
            { value: '500+', labelEn: 'Students', labelSi: 'සිසුන්' },
            { value: '98%', labelEn: 'Pass Rate', labelSi: 'සමත් ප්‍රතිශතය' },
            { value: '15+', labelEn: 'Years', labelSi: 'වසර' },
            { value: '20', labelEn: 'Students per batch', labelSi: 'කණ්ඩායමකට සිසුන්' },
          ],
        },
        {
          blockType: 'studentPortalPreview',
          headingEn: 'Student Portal for Smarter Learning',
          headingSi: 'වඩා දක්ෂ ඉගෙනීමකට ශිෂ්‍ය ද්වාරය',
          descriptionEn:
            'Students can view schedules, notices, resources, enrollment status and class updates from one place.',
          descriptionSi: 'කාලසටහන්, නිවේදන, සම්පත් සහ ලියාපදිංචි තත්ත්වය එකම ස්ථානයකින් බලන්න.',
          buttonLabel: 'Open Student Portal',
          buttonUrl: '/login',
          features: [
            { titleEn: 'My Classes', titleSi: 'මගේ පන්ති', icon: 'classes' },
            { titleEn: 'Class Schedule', titleSi: 'පන්ති කාලසටහන', icon: 'schedule' },
            { titleEn: 'Learning Resources', titleSi: 'ඉගෙනුම් සම්පත්', icon: 'resources' },
            { titleEn: 'Notices', titleSi: 'නිවේදන', icon: 'notices' },
            { titleEn: 'Enrollment Status', titleSi: 'ලියාපදිංචි තත්ත්වය', icon: 'status' },
            { titleEn: 'Support Messages', titleSi: 'සහාය පණිවිඩ', icon: 'support' },
          ],
        },
        {
          blockType: 'schedule',
          headingEn: 'A timetable built around learners',
          headingSi: 'සිසුන්ට ගැළපෙන කාලසටහන',
          subtitleEn: 'Weekday and weekend classes at convenient times.',
          showAllSchedules: true,
        },
        {
          blockType: 'galleryBlock',
          headingEn: 'Life at IEM.lk',
          headingSi: 'IEM.lk හි ශිෂ්‍ය ජීවිතය',
          descriptionEn:
            'Classes, events, achievements and the everyday moments that shape confident learners.',
          descriptionSi: 'විශ්වාසවන්ත සිසුන් ගොඩනඟන පන්ති, උත්සව, ජයග්‍රහණ සහ දෛනික අවස්ථා.',
          showAll: true,
        },
        {
          blockType: 'instituteTestimonials',
          headingEn: 'Progress that students can feel',
          headingSi: 'සිසුන්ට දැනෙන ප්‍රගතිය',
          subtitleEn: 'Honest feedback from our learning community.',
          showFeaturedOnly: true,
        },
        {
          blockType: 'enrollmentCTA',
          headingEn: 'Ready to speak English with confidence?',
          headingSi: 'විශ්වාසයෙන් ඉංග්‍රීසි කතා කිරීමට සූදානම්ද?',
          descriptionEn: 'Submit your enrollment today and we will help you choose the best class.',
          buttonLabel: 'Start Enrollment',
          buttonUrl: '/enroll',
          backgroundStyle: 'gold',
        },
        {
          blockType: 'instituteContact',
          headingEn: 'Talk to our institute',
          headingSi: 'අප ආයතනය අමතන්න',
          descriptionEn: 'Ask about classes, schedules, or the enrollment process.',
          showContactForm: true,
          showContactDetails: true,
        },
      ],
      meta: {
        title: 'IEM',
        description:
          'Lasantha Kumara English Classes offers focused English education for Grade 6 to Grade 11 students.',
      },
    },
  })

  const basicPages: Array<[string, string, string, string, Page['layout'][number]]> = [
    [
      'About',
      'about',
      'About IEM.lk',
      'Learn about our institute, approach, and mission.',
      {
        blockType: 'aboutUs',
        headingEn: 'A focused place to build confident English',
        headingSi: 'විශ්වාසයෙන් ඉංග්‍රීසි ගොඩනගන නිවැරදි ස්ථානය',
        descriptionEn: richText(
          'Since 2009, IEM.lk has supported learners with structured lessons, personal feedback, and practical language skills.',
        ),
        buttonLabel: 'View Classes',
        buttonUrl: '/#classes',
      },
    ],
    [
      'Classes',
      'classes',
      'English Classes',
      'Explore English classes for every age and goal.',
      { blockType: 'classesGrid', headingEn: 'All English classes', showAllClasses: true },
    ],
    [
      'Schedule',
      'schedule',
      'Class Schedule',
      'View our current English class timetable.',
      { blockType: 'schedule', headingEn: 'Weekly class schedule', showAllSchedules: true },
    ],
    [
      'Testimonials',
      'testimonials',
      'Student Testimonials',
      'Read student and parent feedback.',
      {
        blockType: 'instituteTestimonials',
        headingEn: 'Student success stories',
        showFeaturedOnly: false,
      },
    ],
    [
      'Contact',
      'contact',
      'Contact Us',
      'Contact Lasantha Kumara English Classes.',
      {
        blockType: 'instituteContact',
        headingEn: 'Contact our team',
        descriptionEn: 'We are happy to answer your questions.',
        showContactForm: true,
        showContactDetails: true,
      },
    ],
    [
      'Enroll',
      'enroll',
      'Enroll Now',
      'Register for an English class.',
      {
        blockType: 'enrollmentCTA',
        headingEn: 'Start your enrollment',
        descriptionEn: 'Create your account and request a class place online.',
        buttonLabel: 'Open enrollment form',
        buttonUrl: '/enroll',
        backgroundStyle: 'gold',
      },
    ],
  ]
  const pageIds: Record<string, string | number> = { home: home.id }
  for (const [title, slug, metaTitle, metaDescription, block] of basicPages) {
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      context: {
        disableRevalidate: true,
      },
      data: {
        title,
        slug,
        _status: 'published',
        hero: { type: 'none' },
        layout: [block],
        meta: { title: metaTitle, description: metaDescription },
      },
    })
    pageIds[slug] = page.id
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    context: {
      disableRevalidate: true,
    },
    data: {
      instituteNameEn: 'IEM.lk',
      instituteNameSi: 'IEM.lk ඉංග්‍රීසි පන්ති',
      phone: '0472 248 019',
      secondaryPhone: '071 449 2540',
      whatsappNumber: 'https://wa.me/qr/LCPU7GTT5YXOC1',
      email: 'iem.lasantha@gmail.com',
      addressEn: '123 Education Lane, Middeniya, Sri Lanka',
      addressSi: '123, අධ්‍යාපන මාවත, කොළඹ 05, ශ්‍රී ලංකාව',
      officeHoursEn: 'Mon – Sat: 8:00 AM – 6:00 PM',
      officeHoursSi: 'සඳුදා – සෙනසුරාදා: පෙ.ව. 8.00 – ප.ව. 6.00',
      missionEn:
        'Empowering students with English language excellence since 2009. Your success is our mission.',
      missionSi:
        '2009 සිට ඉංග්‍රීසි භාෂා විශිෂ්ටත්වයෙන් සිසුන් සවිබල ගන්වමු. ඔබේ සාර්ථකත්වය අපගේ මෙහෙවරයි.',
      facebookUrl: 'https://www.facebook.com/iem.lasantha',
      youtubeUrl: 'https://www.youtube.com/@lasanthakumara8109/featured',
    },
  })
  await payload.updateGlobal({
    slug: 'header',
    overrideAccess: true,
    context: {
      disableRevalidate: true,
    },
    data: {
      navItems: [
        ['Home', '/#home'],
        ['About', '/#about'],
        ['Process', '/#process'],
        ['Classes', '/#classes'],
        ['Schedule', '/#schedule'],
        ['Gallery', '/#gallery'],
        ['Contact', '/#contact'],
      ].map(([label, url]) => ({ link: { type: 'custom' as const, label, url } })),
      primaryCTA: { label: 'Log In', url: '/login' },
      showLanguageToggle: true,
      showLoginLink: true,
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    overrideAccess: true,
    context: {
      disableRevalidate: true,
    },
    data: {
      missionText:
        'Empowering students with English language excellence since 2009. Your success is our mission.',
      navItems: [
        ['Classes', '/#classes'],
        ['Schedule', '/#schedule'],
        ['Contact', '/#contact'],
        ['Student Portal', '/login'],
      ].map(([label, url]) => ({ link: { type: 'custom' as const, label, url } })),
      copyrightText: `© ${new Date().getFullYear()} IEM.lk. All rights reserved.`,
    },
  })

  payload.logger.info('Institute seed completed.')
}
