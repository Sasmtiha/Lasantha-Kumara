import configPromise from '@payload-config'
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Headphones,
  MapPin,
  MessageCircle,
  Mic2,
  NotebookPen,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import type {
  AboutTeacherBlock,
  InstituteHeroBlock,
  Gallery as GalleryItem,
  Page,
} from '@/payload-types'
import { ContactForm } from '@/components/institute/ContactForm'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteLocale, localized } from '@/utilities/locale'
import { Reveal } from './Reveal'
import { AnimatedMetric } from './AnimatedMetric'
import { DynamicGallery } from './DynamicGallery'
import { HeroSlideshow } from './HeroSlideshow'

type LayoutBlock = Page['layout'][number]
type Locale = 'en' | 'si'

const classPlaceholders = [
  '/class-placeholder-1.png',
  '/class-placeholder-2.png',
  '/class-placeholder-3.png',
  '/class-placeholder-4.png',
  '/class-placeholder-5.png',
  '/class-placeholder-6.png',
]

const findBlock = <T extends LayoutBlock['blockType']>(
  blocks: Page['layout'],
  type: T,
) =>
  blocks.find((block) => block.blockType === type) as
    | Extract<LayoutBlock, { blockType: T }>
    | undefined

export async function PremiumHome({ page }: { page: Pick<Page, 'layout'> }) {
  const locale = await getSiteLocale()
  const payload = await getPayload({ config: configPromise })
  const hero = findBlock(page.layout, 'instituteHero')
  const metrics = findBlock(page.layout, 'metrics')
  const about = findBlock(page.layout, 'aboutTeacher')
  const process = findBlock(page.layout, 'workProcess')
  const featuredProgram = findBlock(page.layout, 'featuredProgram')
  const classesBlock = findBlock(page.layout, 'classesGrid')
  const results = findBlock(page.layout, 'results')
  const portal = findBlock(page.layout, 'studentPortalPreview')
  const scheduleBlock = findBlock(page.layout, 'schedule')
  const galleryBlock = findBlock(page.layout, 'galleryBlock')
  const testimonialsBlock = findBlock(page.layout, 'instituteTestimonials')
  const contact = findBlock(page.layout, 'instituteContact')

  const [classes, schedules, testimonials, gallery, settings] = await Promise.all([
    payload.find({
      collection: 'classes',
      limit: 6,
      pagination: false,
      sort: 'displayOrder',
      where: { isActive: { equals: true } },
    }),
    payload.find({
      collection: 'schedules',
      depth: 1,
      limit: 50,
      pagination: false,
      sort: 'displayOrder',
      where: { isActive: { equals: true } },
    }),
    payload.find({
      collection: 'testimonials',
      limit: 6,
      pagination: false,
      sort: 'displayOrder',
      ...(testimonialsBlock?.showFeaturedOnly
        ? { where: { isFeatured: { equals: true } } }
        : {}),
    }),
    payload.find({
      collection: 'gallery',
      depth: 1,
      limit: 8,
      pagination: false,
      sort: 'displayOrder',
      where: { isPublished: { equals: true } },
    }),
    getCachedGlobal('site-settings', 1)(),
  ])

  return (
    <main className="premium-home overflow-hidden bg-white text-[#111827]">
      {hero ? <Hero block={hero} locale={locale} phone={settings.secondaryPhone || settings.phone} /> : null}
      {about ? <About block={about} locale={locale} /> : null}
      {results ? (
        <Results
          block={results}
          locale={locale}
          metrics={metrics?.items || hero?.metrics || []}
        />
      ) : null}
      {process ? <Process block={process} locale={locale} /> : null}
      {featuredProgram ? <FeaturedProgram block={featuredProgram} locale={locale} /> : null}

      {portal ? <Portal block={portal} locale={locale} /> : null}

      <section className="premium-section border-y border-black/5 bg-[#f4f4f2]" id="classes">
        <div className="premium-container">
          <SectionHeading
            description={localized(locale, classesBlock?.subtitleEn, classesBlock?.subtitleSi)}
            kicker="Classes"
            title={localized(
              locale,
              classesBlock?.headingEn || 'Programs for every English goal',
              classesBlock?.headingSi,
            )}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {classes.docs.map((course, index) => (
              <Reveal delay={index * 70} key={course.id}>
                <article className="premium-card group flex min-h-[25rem] flex-col overflow-hidden">
                  <div className="relative h-44 lg:h-55 overflow-hidden bg-[#e8e9ed]">
                    {course.featuredImage && typeof course.featuredImage === 'object' ? (
                      <Media
                        fill
                        imgClassName="object-cover transition duration-700 group-hover:scale-105"
                        resource={course.featuredImage}
                      />
                    ) : (
                      <img
                        alt={course.titleEn}
                        className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                        src={classPlaceholders[index % classPlaceholders.length]}
                      />
                    )}
                    <span className="absolute left-0 top-0 bg-[#ed1d26] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white">
                      {course.category.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-sm font-medium text-[#034EA2]">{course.titleSi}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#111827]">{course.titleEn}</h3>
                    <p className="mt-4 leading-7 text-[#6b7280]">
                      {localized(
                        locale,
                        course.shortDescriptionEn,
                        course.shortDescriptionSi,
                      )}
                    </p>
                    <div className="mt-6 flex gap-5 border-t border-[#e5e7eb] pt-5 text-sm text-[#6b7280]">
                      <span className="flex items-center gap-2">
                        <Clock3 className="size-4" /> {course.durationPerWeek}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4" /> Max {course.maxStudents || 20}
                      </span>
                    </div>
                    <div className="mt-auto flex gap-3 pt-7">
                      <Link className="premium-button-secondary flex-1" href={`/classes/${course.slug}`}>
                        View Details <ArrowUpRight className="size-4" />
                      </Link>
                      <Link className="premium-button-primary flex-1" href={`/enroll?class=${course.id}`}>
                        Enroll <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="premium-section bg-white" id="schedule">
        <div className="premium-container">
          <SectionHeading
            description={localized(
              locale,
              scheduleBlock?.subtitleEn,
              scheduleBlock?.subtitleSi,
            )}
            kicker="Schedule"
            title={localized(
              locale,
              scheduleBlock?.headingEn || 'Find a class time that works',
              scheduleBlock?.headingSi,
            )}
          />
          <Reveal className="mt-12">
            <div className="hidden overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_20px_70px_rgba(15,23,42,.06)] md:block">
              <table className="w-full text-left">
                <thead className="bg-[#0a0b0f] text-white">
                  <tr>
                    {['Day', 'Class', 'Time', 'Mode', 'Location'].map((label) => (
                      <th className="px-6 py-5 text-sm font-semibold" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.docs.map((item) => {
                    return (
                      <tr className="border-t border-[#e5e7eb] transition hover:bg-[#f1f3fa]" key={item.id}>
                        <td className="px-6 py-5 font-semibold text-[#034EA2]">{item.dayOfWeek}</td>
                        <td className="px-6 py-5">
                          {item.batchLabel}
                        </td>
                        <td className="px-6 py-5 text-[#6b7280]">
                          <span className="border-l-2 border-[#ed1d26] bg-[#f4f4f2] px-3 py-1.5 text-sm font-semibold text-[#111827]">{item.startTime} – {item.endTime}</span>
                        </td>
                        <td className="px-6 py-5 capitalize text-[#6b7280]">{item.mode}</td>
                        <td className="px-6 py-5 text-[#6b7280]">{item.location}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 md:hidden">
            {schedules.docs.map((item) => {
              return (
                <article className="premium-card p-6" key={item.id}>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#034EA2]">
                    {item.dayOfWeek}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    {item.batchLabel}
                  </h3>
                  <p className="mt-3">{item.startTime} – {item.endTime}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#6b7280]">
                    <MapPin className="size-4" /> {item.location}
                  </p>
                </article>
              )
            })}
          </div>
          <div className="mt-9 text-center">
            <Link className="premium-button-primary inline-flex" href="/enroll">
              Reserve Your Seat <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Gallery
        description={localized(
          locale,
          galleryBlock?.descriptionEn,
          galleryBlock?.descriptionSi,
        )}
        items={gallery.docs}
        locale={locale}
        title={localized(
          locale,
          galleryBlock?.headingEn || 'Life at IEM.lk',
          galleryBlock?.headingSi,
        )}
      />

      <section className="premium-section relative overflow-hidden bg-[#11101d] text-white" id="testimonials">
        <span aria-hidden className="premium-wordmark right-0 top-0 text-white/[.018]">VOICE</span>
        <div className="premium-container">
          <SectionHeading
            dark
            description={localized(
              locale,
              testimonialsBlock?.subtitleEn,
              testimonialsBlock?.subtitleSi,
            )}
            kicker="Student Stories"
            title={localized(
              locale,
              testimonialsBlock?.headingEn || 'Progress you can hear and see',
              testimonialsBlock?.headingSi,
            )}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.docs.map((item, index) => (
              <Reveal delay={index * 80} key={item.id}>
                <figure className="relative h-full overflow-hidden rounded-md border border-white/10 bg-white/[.055] p-8 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#ed1d26]">
                  <Quote className="size-9 text-[#034EA2]" />
                  <div className="mt-5 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: item.rating }).map((_, star) => (
                      <Star className="size-4 fill-[#ed1d26] text-[#ed1d26]" key={star} />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-lg leading-8 text-white/75">
                    “{localized(locale, item.feedbackEn, item.feedbackSi)}”
                  </blockquote>
                  <figcaption className="mt-7 border-t border-white/10 pt-5">
                    <strong>{item.name}</strong>
                    <span className="mt-1 block text-sm text-white/45">{item.studentType}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {contact ? (
        <section className="premium-section bg-[#f4f4f2]" id="contact">
          <div className="premium-container">
            <SectionHeading
              description={localized(locale, contact.descriptionEn, contact.descriptionSi)}
              kicker="Contact"
              title={localized(locale, contact.headingEn, contact.headingSi)}
            />
            <div className="mt-12 grid overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_24px_80px_rgba(10,11,15,.08)] lg:grid-cols-[1.15fr_.85fr]">
              <Reveal className="p-6 sm:p-10">
                <ContactForm classes={classes.docs} />
              </Reveal>
              <Reveal className="bg-[#034B9B] p-8 text-white sm:p-10" delay={120}>
                <h3 className="text-3xl font-semibold">Let’s start your English journey</h3>
                <p className="mt-4 leading-7 text-white/70">
                  Speak with our team about classes, schedules and enrollment.
                </p>
                <div className="mt-8 grid gap-4">
                  <InfoCard icon={<Headphones />} label="Phone" value={settings.phone} />
                  <InfoCard icon={<Headphones />} label="Mobile" value={settings.secondaryPhone} />
                  <InfoCard icon={<MessageCircle />} label="Email" value={settings.email} />
                  <InfoCard icon={<MapPin />} label="Location" value={localized(locale, settings.addressEn, settings.addressSi)} />
                  <InfoCard icon={<Clock3 />} label="Office Hours" value={localized(locale, settings.officeHoursEn, settings.officeHoursSi)} />
                </div>
                {settings.whatsappNumber ? (
                  <a
                    className="portal-outline-button mt-6 inline-flex"
                    href={
                      settings.whatsappNumber.startsWith('http')
                        ? settings.whatsappNumber
                        : `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    WhatsApp Us <ArrowUpRight className="size-4" />
                  </a>
                ) : null}
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function Hero({ block, locale, phone }: { block: InstituteHeroBlock; locale: Locale; phone?: null | string }) {
  return (
    <section className="premium-hero relative flex min-h-svh items-end overflow-hidden bg-[#101827] text-white" id="home">
      <div className="premium-hero-media absolute inset-0 z-0">
        <HeroSlideshow
          duration={block.slideDuration}
          fallback={typeof block.heroImage === 'object' ? block.heroImage : null}
          slides={block.heroSlides}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(15,23,42,.86)_0%,rgba(0,63,125,.58)_40%,rgba(0,45,88,.18)_72%,rgba(0,0,0,.04)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#101827]/75 via-transparent to-[#101827]/10" />
      <span className="absolute right-[8%] top-[22%] z-[2] size-24 rounded-full border-[14px] border-[#ed1c24]/60" />
      <div className="premium-container relative z-10 pb-20 pt-40 lg:pb-24">
        <div className="max-w-5xl">
          <p className="hero-reveal hero-delay-1 inline-flex items-center gap-2 rounded-full bg-[#ed1c24] px-4 py-2 text-xs font-medium uppercase tracking-[.14em] shadow-lg">
            <Sparkles className="size-4 text-white" />
            {localized(locale, block.badgeEn, block.badgeSi)}
          </p>
          <h1 className="hero-reveal hero-delay-2 mt-7 max-w-5xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[.98] tracking-[-.035em] [text-shadow:0_6px_30px_rgba(0,0,0,.35)]">
            {localized(locale, block.headingEn, block.headingSi)}
          </h1>
          <p className="heading-font hero-reveal hero-delay-3 mt-7 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
            {localized(locale, block.subheadingEn, block.subheadingSi)}
          </p>
          <p className="hero-reveal hero-delay-3 mt-4 inline-block border-l-4 border-[#ed1d26] bg-white/95 px-4 py-2 text-xl font-medium text-[#101827]">
            ඉංග්‍රීසි විශ්වාසයෙන් ඉගෙනගන්න
          </p>
          <div className="hero-reveal hero-delay-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="premium-button-primary" href={block.primaryButtonUrl}>
              {block.primaryButtonLabel} <ArrowUpRight className="size-4" />
            </Link>
            <Link
              className="premium-button-light"
              href={block.secondaryButtonUrl || '/login'}
            >
              {block.secondaryButtonLabel || 'Student Portal'}
            </Link>
          </div>
          <p className="hero-reveal hero-delay-4 mt-7 text-sm text-white/60">
            Call us: {phone}
          </p>
        </div>
        <a
          className="absolute bottom-8 right-4 hidden items-center gap-3 text-xs uppercase tracking-[.2em] text-white/60 md:flex"
          href="#about"
        >
          Scroll to explore <span className="block h-10 w-px bg-white/40" />
        </a>
      </div>
    </section>
  )
}

function About({ block, locale }: { block: AboutTeacherBlock; locale: Locale }) {
  return (
    <section className="premium-section relative border-b border-black/5 bg-white" id="about">
      <span aria-hidden className="premium-wordmark left-0 top-12">ENGLISH</span>
      <div className="premium-container relative grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <Reveal>
          <div className="relative min-h-[32rem] overflow-hidden rounded-md bg-[#e8e9ed] shadow-[0_30px_90px_rgba(10,11,15,.13)]">
            {block.teacherImage && typeof block.teacherImage === 'object' ? (
              <Media fill imgClassName="object-cover" resource={block.teacherImage} />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <GraduationCap className="size-24 text-[#034EA2]/20" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 border-l-4 border-[#ed1d26] bg-white/95 p-5 shadow-xl backdrop-blur">
              <p className="text-3xl font-semibold text-[#111827]">15+</p>
              <p className="text-sm text-[#6b7280]">Years teaching English</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <SectionHeading
            kicker="About Us"
            title={localized(locale, block.headingEn, block.headingSi)}
          />
          <RichText
            className="mt-6 max-w-none text-lg leading-8 text-[#6b7280]"
            data={locale === 'si' && block.descriptionSi ? block.descriptionSi : block.descriptionEn}
            enableGutter={false}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {block.featureCards?.map((feature) => (
              <div className="flex gap-3 border-t border-black/10 py-4" key={feature.id}>
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#ed1d26]" />
                <div>
                  <strong>{localized(locale, feature.titleEn, feature.titleSi)}</strong>
                  <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                    {localized(locale, feature.descriptionEn, feature.descriptionSi)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link className="premium-button-primary mt-8 inline-flex" href="/enroll">
            Join Now <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

const featuredIcons = {
  exam: GraduationCap,
  grammar: BookOpen,
  progress: TrendingUp,
  spoken: Mic2,
  writing: NotebookPen,
}

function FeaturedProgram({
  block,
  locale,
}: {
  block: Extract<LayoutBlock, { blockType: 'featuredProgram' }>
  locale: Locale
}) {
  const features = block.features || []
  return (
    <section className="premium-section overflow-hidden bg-white" id="featured-program">
      <div className="premium-container">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[.14em] text-[#034EA2]">
            {localized(locale, block.eyebrowEn, block.eyebrowSi)}
          </p>
          <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-semibold leading-tight text-[#111827] sm:text-6xl">
            {localized(locale, block.headingEn, block.headingSi)}
          </h2>
          <p className="heading-font mx-auto mt-5 max-w-2xl leading-8 text-[#034EA2]">
            {localized(locale, block.descriptionEn, block.descriptionSi)}
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-center">
          <div className="space-y-6">
            {features.slice(0, 2).map((feature, index) => (
              <FeaturePoint feature={feature} index={index} key={feature.id} locale={locale} />
            ))}
          </div>
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-md bg-[#e8e9ed] shadow-[0_24px_70px_rgba(10,11,15,.14)]">
              {block.image && typeof block.image === 'object' ? (
                <Media fill imgClassName="object-cover" resource={block.image} />
              ) : (
                <img
                  alt="Student"
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/student-middle.png"
                />
              )}
            </div>
          </Reveal>
          <div className="space-y-6">
            {features.slice(2).map((feature, index) => (
              <FeaturePoint feature={feature} index={index + 2} key={feature.id} locale={locale} />
            ))}
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link className="premium-button-primary inline-flex" href={block.buttonUrl || '/enroll'}>
            {block.buttonLabel || 'Join Now'} <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturePoint({
  feature,
  index,
  locale,
}: {
  feature: Extract<LayoutBlock, { blockType: 'featuredProgram' }>['features'][number]
  index: number
  locale: Locale
}) {
  const Icon = featuredIcons[feature.icon || 'spoken']
  return (
    <Reveal delay={index * 70}>
      <article className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#034EA2] text-white shadow-sm">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-[#111827]">
            {localized(locale, feature.titleEn, feature.titleSi)}
          </h3>
          <span className="mt-2 block h-1 w-10 bg-[#ed1c24]" />
          <p className="mt-3 text-sm leading-7 text-[#6b7280]">
            {localized(locale, feature.descriptionEn, feature.descriptionSi)}
          </p>
        </div>
      </article>
    </Reveal>
  )
}

function Process({
  block,
  locale,
}: {
  block: Extract<LayoutBlock, { blockType: 'workProcess' }>
  locale: Locale
}) {
  return (
    <section className="premium-section relative overflow-hidden bg-[#090a0e] text-white" id="process">
      <span aria-hidden className="premium-wordmark text-white/[.025]">LEARN</span>
      <div className="premium-container relative">
        <SectionHeading
          dark
          description={localized(locale, block.descriptionEn, block.descriptionSi)}
          kicker="Our Process"
          title={localized(locale, block.headingEn, block.headingSi)}
        />
        <div className="relative mt-16 grid gap-8 lg:grid-cols-5">
          <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-white/15 lg:block" />
          {block.steps.map((step, index) => (
            <Reveal delay={index * 100} key={step.id}>
              <article className="relative">
                <span className="relative z-10 grid size-16 place-items-center rounded-md border border-[#034EA2] bg-[#062f61] text-lg font-semibold text-white">
                  <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-[#ed1c24] text-[10px] text-white">{index + 1}</span>
                  <GraduationCap className="size-6 text-[#75aff0]" />
                </span>
                <h3 className="mt-6 text-xl font-semibold">
                  {localized(locale, step.titleEn, step.titleSi)}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {localized(locale, step.descriptionEn, step.descriptionSi)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Results({
  block,
  locale,
  metrics,
}: {
  block: Extract<LayoutBlock, { blockType: 'results' }>
  locale: Locale
  metrics: { id?: null | string; labelEn: string; labelSi?: null | string; value: string }[]
}) {
  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-white py-24 text-[#111827]">
      {block.backgroundImage && typeof block.backgroundImage === 'object' ? (
        <Media fill imgClassName="object-cover opacity-30" resource={block.backgroundImage} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-[#eef1ff]/85" />
      <div className="premium-container relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            description={localized(locale, block.descriptionEn, block.descriptionSi)}
            kicker="Results & Trust"
            title={localized(locale, block.headingEn, block.headingSi)}
          />
          <Link className="premium-button-primary mt-8 inline-flex" href={block.ctaUrl || '#classes'}>
            {block.ctaLabel || 'Explore Classes'} <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal delay={100}>
          <div className="relative rounded-md border border-black/10 bg-[#f4f4f2] p-7 shadow-[0_24px_70px_rgba(10,11,15,.08)]">
            <div className="absolute -right-5 -top-8 grid size-32 rotate-[-4deg] place-items-center border-4 border-double border-[#ed1d26] bg-white text-center text-[#111827] shadow-xl">
              <span className="text-sm font-medium uppercase leading-tight">Trusted<br />Since<br />2009</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-10">
            {(metrics.length ? metrics : block.metrics || []).slice(0, 4).map((metric) => (
              <div className="border-l-4 border-[#ed1d26] bg-white p-5" key={metric.id}>
                <strong className="text-4xl font-semibold text-[#111827]"><AnimatedMetric value={metric.value} /></strong>
                <p className="mt-2 text-sm text-[#6b7280]">
                  {localized(locale, metric.labelEn, metric.labelSi)}
                </p>
              </div>
            ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const portalIcons = {
  classes: BookOpen,
  notices: Bell,
  resources: GraduationCap,
  schedule: CalendarDays,
  status: TrendingUp,
  support: MessageCircle,
}

function Portal({
  block,
  locale,
}: {
  block: Extract<LayoutBlock, { blockType: 'studentPortalPreview' }>
  locale: Locale
}) {
  return (
    <section className="premium-section relative overflow-hidden bg-[#034B9B] text-white" id="portal">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/stacked-waves-haikei-blue.svg')] bg-cover bg-center opacity-70"
      />
      <div className="absolute inset-0 bg-[#034B9B]/25" />
      <div className="premium-container relative">
        <SectionHeading
          dark
          description={localized(locale, block.descriptionEn, block.descriptionSi)}
          kicker="Student Portal"
          title={localized(locale, block.headingEn, block.headingSi)}
        />
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {block.features?.map((feature, index) => {
            const Icon = portalIcons[feature.icon || 'classes']
            return (
              <Reveal delay={index * 70} key={feature.id}>
                <article className="group text-center">
                  <div className="relative mx-auto grid aspect-square max-w-40 place-items-center rounded-md border border-white/15 bg-white/[.06] shadow-[0_14px_35px_rgba(0,0,0,.16)] transition group-hover:-translate-y-1 group-hover:border-white">
                    <Icon className="size-10 text-[#75aff0]" />
                    <span className="absolute right-2 top-4 size-3 rounded-full bg-white" />
                  </div>
                  <h3 className="mt-4 font-medium text-white">
                    {localized(locale, feature.titleEn, feature.titleSi)}
                  </h3>
                </article>
              </Reveal>
            )
          })}
        </div>
        <Link
          className="portal-outline-button mt-10 inline-flex"
          href={block.buttonUrl || '/login'}
        >
          {block.buttonLabel || 'Go to Student Portal'} <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

function Gallery({
  description,
  items,
  locale,
  title,
}: {
  description: string
  items: GalleryItem[]
  locale: Locale
  title: string
}) {
  return (
    <section className="premium-section bg-[#f4f4f2]" id="gallery">
      <div className="premium-container">
        <SectionHeading description={description} kicker="Gallery" title={title} />
        {items.length ? (
          <DynamicGallery items={items} locale={locale} />
        ) : (
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-dashed border-[#034EA2]/25 bg-gradient-to-br from-[#eaf3ff] to-white px-6 py-24 text-center">
            <GraduationCap className="mx-auto size-12 text-[#034EA2]/35" />
            <p className="mt-5 text-xl font-medium text-[#111827]">Gallery photos will be added soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
              Classroom moments, student activities and achievements can be managed from Payload Gallery.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: null | string }) {
  return (
    <div className="premium-card flex gap-4 p-5 text-[#111827]">
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white/90 text-[#034EA2]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[#6b7280]">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-[#111827]">{value || 'Not provided'}</p>
      </div>
    </div>
  )
}

function SectionHeading({
  dark,
  description,
  kicker,
  title,
}: {
  dark?: boolean
  description?: string
  kicker: string
  title: string
}) {
  return (
    <div className="max-w-3xl">
      <p className={`premium-kicker ${dark ? 'text-[#75aff0]' : 'text-[#034EA2]'}`}>
        {kicker}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.15] tracking-[-.015em] sm:text-5xl ${dark ? 'text-white' : 'text-[#111827]'}`}>
        {title}
      </h2>
      {description ? (
        <p className={`heading-font mt-5 text-lg leading-8 ${dark ? 'text-white/70' : 'text-[#034EA2]'}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
