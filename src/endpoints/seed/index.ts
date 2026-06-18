import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import type { Class, Page } from '@/payload-types'

const collections: CollectionSlug[] = [
  'contact-submissions',
  'gallery',
  'resources',
  'notices',
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

const richText = (text: string, heading?: 'h1' | 'h2' | 'h3'): NonNullable<Class['fullDescriptionEn']> => ({
  root: {
    type: 'root',
    children: [
      heading
        ? {
            type: 'heading',
            children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: heading,
            version: 1,
          }
        : {
            type: 'paragraph',
            children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
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

export async function seed({ payload, req }: { payload: Payload; req: PayloadRequest }): Promise<void> {
  payload.logger.info('Seeding Lasantha Kumara English Classes…')

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
    where: { email: { in: ['admin@lasanthaenglish.lk', 'lasantha@lasanthaenglish.lk', 'student@example.com'] } },
  })

  const admin = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: 'admin@lasanthaenglish.lk',
      password: 'Admin123!',
      firstName: 'Institute',
      lastName: 'Admin',
      phone: '+94 77 123 4567',
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
      phone: '+94 77 123 4567',
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
      bio: richText('An experienced English educator dedicated to helping Sri Lankan students speak confidently, write clearly, and achieve excellent examination results.'),
      qualifications: 'Certified English Teacher · 15+ years of teaching experience · Best Teacher Award 2022',
      phone: '+94 77 123 4567',
      email: 'lasantha@lasanthaenglish.lk',
      isActive: true,
    },
  })

  const classDefinitions = [
    ['Spoken English', 'කථන ඉංග්‍රීසි', 'spoken-english', 'Build practical vocabulary, clear pronunciation, and confidence for everyday conversations.', 'දෛනික සංවාද සඳහා වචන මාලාව, නිවැරදි උච්චාරණය සහ විශ්වාසය වර්ධනය කරන්න.', 'intermediate', 'spoken'],
    ['Grammar & Writing', 'ව්‍යාකරණ හා ලිවීම', 'grammar-writing', 'Master essential grammar and develop accurate, expressive writing skills.', 'අත්‍යවශ්‍ය ව්‍යාකරණ සහ නිවැරදි ලිවීමේ කුසලතා ප්‍රගුණ කරන්න.', 'intermediate', 'grammar'],
    ['O/L English', 'සාමාන්‍ය පෙළ ඉංග්‍රීසි', 'ol-english', 'Focused preparation for the G.C.E. O/L English examination with proven techniques.', 'සාමාන්‍ය පෙළ ඉංග්‍රීසි විභාගය සඳහා ඉලක්කගත සූදානම.', 'exam', 'ol'],
    ['A/L English', 'උසස් පෙළ ඉංග්‍රීසි', 'al-english', 'Advanced language and literature guidance for strong A/L performance.', 'උසස් පෙළ සඳහා උසස් භාෂා සහ සාහිත්‍ය මාර්ගෝපදේශනය.', 'advanced', 'al'],
    ['Grade 6-9 English', '6-9 ශ්‍රේණි ඉංග්‍රීසි', 'grade-6-9-english', 'A strong foundation in school English through engaging, age-appropriate lessons.', 'සිසුන්ට ගැළපෙන පාඩම් මගින් පාසල් ඉංග්‍රීසියට ශක්තිමත් පදනමක්.', 'beginner', 'grade_6_9'],
    ['Business English', 'ව්‍යාපාරික ඉංග්‍රීසි', 'business-english', 'Professional communication, presentations, email writing, and workplace confidence.', 'වෘත්තීය සන්නිවේදනය, ඉදිරිපත් කිරීම් සහ සේවා ස්ථාන විශ්වාසය.', 'professional', 'business'],
  ] as const

  const classes = []
  for (const [titleEn, titleSi, slug, shortDescriptionEn, shortDescriptionSi, level, category] of classDefinitions) {
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
          fullDescriptionEn: richText(`${shortDescriptionEn} Lessons combine clear explanations, guided practice, individual feedback, and regular progress checks.`),
          fullDescriptionSi: richText(`${shortDescriptionSi} පැහැදිලි විස්තර, පුහුණුව සහ පුද්ගල ප්‍රතිචාර මෙම පාඨමාලාවට ඇතුළත් වේ.`),
          durationPerWeek: '2 hours',
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
    ['Monday', '4:00 PM', '6:00 PM', 'ol-english'],
    ['Monday', '6:30 PM', '8:30 PM', 'spoken-english'],
    ['Tuesday', '3:00 PM', '5:00 PM', 'grade-6-9-english'],
    ['Tuesday', '5:30 PM', '7:30 PM', 'grammar-writing'],
    ['Wednesday', '4:00 PM', '6:00 PM', 'al-english'],
    ['Wednesday', '6:30 PM', '8:30 PM', 'business-english'],
    ['Thursday', '3:00 PM', '5:00 PM', 'ol-english'],
    ['Thursday', '5:30 PM', '7:30 PM', 'spoken-english'],
    ['Friday', '4:00 PM', '6:00 PM', 'grade-6-9-english'],
    ['Friday', '6:30 PM', '7:30 PM', 'grammar-writing'],
    ['Saturday', '8:00 AM', '10:00 AM', 'al-english'],
    ['Saturday', '10:30 AM', '12:30 PM', 'ol-english'],
    ['Saturday', '2:00 PM', '4:00 PM', 'business-english'],
  ] as const
  const schedules = []
  for (const [dayOfWeek, startTime, endTime, slug] of scheduleDefinitions) {
    const course = classBySlug[slug]
    schedules.push(
      await payload.create({
        collection: 'schedules',
        overrideAccess: true,
        data: {
          class: course.id,
          dayOfWeek,
          batchLabel: `${course.titleEn} – ${dayOfWeek}`,
          startTime,
          endTime,
          location: '123 Education Lane, Colombo 05',
          mode: 'physical',
          isActive: true,
          displayOrder: schedules.length + 1,
        },
      }),
    )
  }

  const testimonials = []
  const testimonialData = [
    ['Dilshan Sampath', 'O/L Student, Batch 2023', 'Sir made difficult grammar lessons simple. I improved my confidence and achieved an A pass at O/L.', 'අමාරු ව්‍යාකරණ පාඩම් සරලව තේරුම් කළ නිසා මට O/L විභාගයෙන් A සාමාර්ථයක් ලැබුණා.'],
    ['Kumari Perera', 'Parent of A/L Student', 'The personal attention and regular progress updates gave us confidence throughout the year.', 'පුද්ගල අවධානය සහ නිරන්තර ප්‍රගති දැනුම්දීම් අපට විශාල විශ්වාසයක් ලබා දුන්නා.'],
    ['Naduni Rathnayake', 'Business English Student', 'I now lead meetings and write professional emails in English without hesitation.', 'දැන් මට ඉංග්‍රීසියෙන් රැස්වීම් මෙහෙයවීමට සහ වෘත්තීය ඊමේල් ලිවීමට විශ්වාසයක් තියෙනවා.'],
  ] as const
  for (const [name, studentType, feedbackEn, feedbackSi] of testimonialData) {
    testimonials.push(await payload.create({ collection: 'testimonials', overrideAccess: true, data: { name, studentType, feedbackEn, feedbackSi, rating: 5, isFeatured: true, displayOrder: testimonials.length + 1 } }))
  }

  await payload.create({
    collection: 'notices',
    overrideAccess: true,
    data: {
      title: 'Welcome to the new student portal',
      message: richText('Approved students can now view class schedules, notices, and learning resources from one place.'),
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
      title: 'Spoken English Practice Guide',
      description: 'A starter collection of daily speaking prompts and vocabulary activities.',
      class: classBySlug['spoken-english'].id,
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
          badgeEn: 'Trusted by 500+ Students & Parents',
          badgeSi: 'සිසුන් සහ දෙමාපියන් 500+ කගේ විශ්වාසය',
          headingEn: 'Master English with Lasantha Kumara',
          headingSi: 'ලසන්ත කුමාර සමඟ ඉංග්‍රීසි ප්‍රගුණ කරන්න',
          subheadingEn: 'Transform your English skills with expert guidance, practical lessons, and a clear path to confidence and exam success.',
          subheadingSi: 'ප්‍රවීණ මඟපෙන්වීම සහ ප්‍රායෝගික පාඩම් සමඟ ඔබේ ඉංග්‍රීසි කුසලතා වර්ධනය කරගන්න.',
          primaryButtonLabel: 'Enroll Now',
          primaryButtonUrl: '/enroll',
          secondaryButtonLabel: 'Student Portal',
          secondaryButtonUrl: '/login',
          metrics: [],
        },
        {
          blockType: 'metrics',
          items: [
            { value: '15+', labelEn: 'Years Experience', labelSi: 'වසරක අත්දැකීම්', icon: 'experience' },
            { value: '500+', labelEn: 'Students Taught', labelSi: 'ඉගැන්වූ සිසුන්', icon: 'students' },
            { value: '98%', labelEn: 'Pass Rate', labelSi: 'සමත් ප්‍රතිශතය', icon: 'results' },
            { value: '20', labelEn: 'Small Batch Learning', labelSi: 'කුඩා කණ්ඩායම් ඉගෙනීම', icon: 'batch' },
          ],
        },
        {
          blockType: 'aboutTeacher',
          headingEn: 'Expert guidance. Personal attention. Real progress.',
          headingSi: 'ප්‍රවීණ මඟපෙන්වීම සහ සැබෑ ප්‍රගතිය',
          descriptionEn: richText('Lasantha Kumara has helped hundreds of students build confidence, improve examination results, and use English successfully in study, work, and daily life.'),
          descriptionSi: richText('ලසන්ත කුමාර ගුරුවරයා සිසුන් සිය ගණනකට ඉංග්‍රීසි විශ්වාසයෙන් භාවිතා කිරීමට සහ විභාග ජයග්‍රහණ ලබා ගැනීමට උපකාර කර ඇත.'),
          featureCards: [
            { titleEn: 'Certified English Teacher', titleSi: 'සහතිකලත් ඉංග්‍රීසි ගුරුවරයෙක්', descriptionEn: 'Clear, structured teaching grounded in proven methods.', icon: 'book' },
            { titleEn: 'Best Teacher Award 2022', titleSi: 'හොඳම ගුරු සම්මානය 2022', descriptionEn: 'Recognized for commitment to student achievement.', icon: 'award' },
            { titleEn: 'Small Class Sizes', titleSi: 'කුඩා පන්ති', descriptionEn: 'More feedback and personal attention for every learner.', icon: 'users' },
            { titleEn: 'O/L & A/L Specialized', titleSi: 'O/L සහ A/L විශේෂඥ', descriptionEn: 'Focused exam preparation and answer-writing strategies.', icon: 'target' },
          ],
        },
        {
          blockType: 'workProcess',
          headingEn: 'Our Learning Process',
          headingSi: 'අපගේ ඉගෙනුම් ක්‍රියාවලිය',
          descriptionEn: 'A clear learning path designed to build confidence, accuracy and exam-ready English skills.',
          descriptionSi: 'විශ්වාසය, නිවැරදි භාෂාව සහ විභාග කුසලතා ගොඩනැගීමට පැහැදිලි ඉගෙනුම් මාර්ගයක්.',
          steps: [
            { titleEn: 'Foundation First', titleSi: 'පදනම මුලින්', descriptionEn: 'Grammar, vocabulary and sentence structure are taught clearly from the basics.' },
            { titleEn: 'Active Practice', titleSi: 'ක්‍රියාකාරී පුහුණුව', descriptionEn: 'Students speak, write, listen and apply lessons through guided activities.' },
            { titleEn: 'Exam & Real-Life Focus', titleSi: 'විභාග සහ සැබෑ ජීවිත අවධානය', descriptionEn: 'Lessons connect school exams, interviews, public speaking and daily communication.' },
            { titleEn: 'Regular Feedback', titleSi: 'නිරන්තර ප්‍රතිචාර', descriptionEn: 'Students receive corrections, progress updates and personal guidance.' },
            { titleEn: 'Better Results', titleSi: 'වඩා හොඳ ප්‍රතිඵල', descriptionEn: 'The goal is confident communication and stronger academic performance.' },
          ],
        },
        { blockType: 'classesGrid', headingEn: 'Choose the right English class', headingSi: 'ඔබට ගැළපෙන ඉංග්‍රීසි පන්තිය', subtitleEn: 'Courses for school students, exam candidates, adults, and professionals.', showAllClasses: true },
        {
          blockType: 'results',
          headingEn: 'Real progress comes from consistent practice',
          headingSi: 'සැබෑ ප්‍රගතිය නිරන්තර පුහුණුවෙන්',
          descriptionEn: 'Clear guidance, focused practice and personal attention help every learner move forward with confidence.',
          descriptionSi: 'පැහැදිලි මඟපෙන්වීම, ඉලක්කගත පුහුණුව සහ පුද්ගල අවධානය සෑම සිසුවෙකුටම විශ්වාසයෙන් ඉදිරියට යාමට උපකාරී වේ.',
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
          descriptionEn: 'Students can view schedules, notices, resources, enrollment status and class updates from one place.',
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
        { blockType: 'schedule', headingEn: 'A timetable built around learners', headingSi: 'සිසුන්ට ගැළපෙන කාලසටහන', subtitleEn: 'Weekday and weekend classes at convenient times.', showAllSchedules: true },
        {
          blockType: 'galleryBlock',
          headingEn: 'Life at IEMlk',
          headingSi: 'IEMlk හි ශිෂ්‍ය ජීවිතය',
          descriptionEn: 'Classes, events, achievements and the everyday moments that shape confident learners.',
          descriptionSi: 'විශ්වාසවන්ත සිසුන් ගොඩනඟන පන්ති, උත්සව, ජයග්‍රහණ සහ දෛනික අවස්ථා.',
          showAll: true,
        },
        { blockType: 'instituteTestimonials', headingEn: 'Progress that students can feel', headingSi: 'සිසුන්ට දැනෙන ප්‍රගතිය', subtitleEn: 'Honest feedback from our learning community.', showFeaturedOnly: true },
        { blockType: 'enrollmentCTA', headingEn: 'Ready to speak English with confidence?', headingSi: 'විශ්වාසයෙන් ඉංග්‍රීසි කතා කිරීමට සූදානම්ද?', descriptionEn: 'Submit your enrollment today and we will help you choose the best class.', buttonLabel: 'Start Enrollment', buttonUrl: '/enroll', backgroundStyle: 'gold' },
        { blockType: 'instituteContact', headingEn: 'Talk to our institute', headingSi: 'අප ආයතනය අමතන්න', descriptionEn: 'Ask about classes, schedules, or the enrollment process.', showContactForm: true, showContactDetails: true },
      ],
      meta: {
        title: 'English Classes in Colombo',
        description: 'Lasantha Kumara English Classes offers spoken, O/L, A/L, school, grammar, and business English classes in Colombo.',
      },
    },
  })

  const basicPages: Array<[string, string, string, string, Page['layout'][number]]> = [
    ['About', 'about', 'About Lasantha Kumara', 'Learn about our teacher, approach, and mission.', { blockType: 'aboutTeacher', headingEn: 'More than lessons—guidance for lasting confidence', headingSi: 'පාඩම්වලට වඩා දිගුකාලීන විශ්වාසය', descriptionEn: richText('Since 2009, Lasantha Kumara English Classes has supported learners with structured lessons, personal feedback, and practical language skills.'), featureCards: [] }],
    ['Classes', 'classes', 'English Classes', 'Explore English classes for every age and goal.', { blockType: 'classesGrid', headingEn: 'All English classes', showAllClasses: true }],
    ['Schedule', 'schedule', 'Class Schedule', 'View our current English class timetable.', { blockType: 'schedule', headingEn: 'Weekly class schedule', showAllSchedules: true }],
    ['Testimonials', 'testimonials', 'Student Testimonials', 'Read student and parent feedback.', { blockType: 'instituteTestimonials', headingEn: 'Student success stories', showFeaturedOnly: false }],
    ['Contact', 'contact', 'Contact Us', 'Contact Lasantha Kumara English Classes.', { blockType: 'instituteContact', headingEn: 'Contact our team', descriptionEn: 'We are happy to answer your questions.', showContactForm: true, showContactDetails: true }],
    ['Enroll', 'enroll', 'Enroll Now', 'Register for an English class.', { blockType: 'enrollmentCTA', headingEn: 'Start your enrollment', descriptionEn: 'Create your account and request a class place online.', buttonLabel: 'Open enrollment form', buttonUrl: '/enroll', backgroundStyle: 'gold' }],
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
      instituteNameEn: 'Lasantha Kumara English Classes',
      instituteNameSi: 'ලසන්ත කුමාර ඉංග්‍රීසි පන්ති',
      phone: '+94 77 123 4567',
      whatsappNumber: '+94 77 123 4567',
      email: 'info@lasanthaenglish.lk',
      addressEn: '123 Education Lane, Colombo 05, Sri Lanka',
      addressSi: '123, අධ්‍යාපන මාවත, කොළඹ 05, ශ්‍රී ලංකාව',
      officeHoursEn: 'Mon – Sat: 8:00 AM – 6:00 PM',
      officeHoursSi: 'සඳුදා – සෙනසුරාදා: පෙ.ව. 8.00 – ප.ව. 6.00',
      missionEn: 'Empowering students with English language excellence since 2009. Your success is our mission.',
      missionSi: '2009 සිට ඉංග්‍රීසි භාෂා විශිෂ්ටත්වයෙන් සිසුන් සවිබල ගන්වමු. ඔබේ සාර්ථකත්වය අපගේ මෙහෙවරයි.',
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
        ['Classes', '/#classes'],
        ['Process', '/#process'],
        ['Schedule', '/#schedule'],
        ['Gallery', '/#gallery'],
        ['Contact', '/#contact'],
      ].map(([label, url]) => ({ link: { type: 'custom' as const, label, url } })),
      primaryCTA: { label: 'Enroll Now', url: '/enroll' },
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
      missionText: 'Empowering students with English language excellence since 2009. Your success is our mission.',
      navItems: [
        ['Classes', '/classes'],
        ['Schedule', '/schedule'],
        ['Contact', '/contact'],
        ['Student Portal', '/login'],
      ].map(([label, url]) => ({ link: { type: 'custom' as const, label, url } })),
      copyrightText: `© ${new Date().getFullYear()} Lasantha Kumara English Classes. All rights reserved.`,
    },
  })

  payload.logger.info('Institute seed completed.')
}
