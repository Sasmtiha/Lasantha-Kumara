import configPromise from '@payload-config'
import {
  ArrowRight,
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

type LayoutBlock = Page['layout'][number]
type Locale = 'en' | 'si'

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
    <main className="premium-home overflow-hidden bg-[#f7f8f5] text-[#111827]">
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

      <section className="premium-section bg-[#f6f8fb]" id="classes">
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
                  <div className="relative h-36 overflow-hidden bg-[#eaf3ff]">
                    {course.featuredImage && typeof course.featuredImage === 'object' ? (
                      <Media
                        fill
                        imgClassName="object-cover transition duration-700 group-hover:scale-105"
                        resource={course.featuredImage}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <GraduationCap className="size-12 text-[#0057a8]/25" />
                      </div>
                    )}
                    <span className="absolute left-5 top-5 rounded-full bg-[#ed1c24] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {course.category.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-sm font-medium text-[#ed1c24]">{course.titleSi}</p>
                    <h3 className="mt-2 text-2xl font-bold text-[#0057a8]">{course.titleEn}</h3>
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
                        View Details
                      </Link>
                      <Link className="premium-button-primary flex-1" href={`/enroll?class=${course.id}`}>
                        Enroll
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {portal ? <Portal block={portal} locale={locale} /> : null}

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
            <div className="hidden overflow-hidden rounded-[1.75rem] border border-[#e5e7eb] bg-white shadow-[0_20px_70px_rgba(15,23,42,.06)] md:block">
              <table className="w-full text-left">
                <thead className="bg-[#0057a8] text-white">
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
                      <tr className="border-t border-[#e5e7eb] transition hover:bg-[#eaf3ff]" key={item.id}>
                        <td className="px-6 py-5 font-bold text-[#0057a8]">{item.dayOfWeek}</td>
                        <td className="px-6 py-5">
                          {item.batchLabel}
                        </td>
                        <td className="px-6 py-5 text-[#6b7280]">
                          <span className="rounded-full bg-[#fff9cc] px-3 py-1.5 text-sm font-semibold text-[#6d5800]">{item.startTime} – {item.endTime}</span>
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
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0057a8]">
                    {item.dayOfWeek}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">
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
              Reserve Your Seat <ArrowRight className="size-4" />
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
          galleryBlock?.headingEn || 'Life at IESM',
          galleryBlock?.headingSi,
        )}
      />

      <section className="premium-section bg-[#f6f8fb]" id="testimonials">
        <div className="premium-container">
          <SectionHeading
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
                <figure className="premium-card relative h-full overflow-hidden p-8 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#ed1c24]">
                  <Quote className="size-9 text-[#0057a8]" />
                  <div className="mt-5 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: item.rating }).map((_, star) => (
                      <Star className="size-4 fill-[#f5b400] text-[#f5b400]" key={star} />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-lg leading-8 text-[#374151]">
                    “{localized(locale, item.feedbackEn, item.feedbackSi)}”
                  </blockquote>
                  <figcaption className="mt-7 border-t border-[#e5e7eb] pt-5">
                    <strong>{item.name}</strong>
                    <span className="mt-1 block text-sm text-[#6b7280]">{item.studentType}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {contact ? (
        <section className="premium-section bg-[#f6f8fb]" id="contact">
          <div className="premium-container">
            <SectionHeading
              description={localized(locale, contact.descriptionEn, contact.descriptionSi)}
              kicker="Contact"
              title={localized(locale, contact.headingEn, contact.headingSi)}
            />
            <div className="mt-12 grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(0,63,125,.10)] lg:grid-cols-[1.15fr_.85fr]">
              <Reveal className="p-6 sm:p-10">
                <ContactForm classes={classes.docs} />
              </Reveal>
              <Reveal className="bg-[#0057a8] p-8 text-white sm:p-10" delay={120}>
                <h3 className="text-3xl font-black">Let’s start your English journey</h3>
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
                    className="premium-button-light mt-6 inline-flex"
                    href={
                      settings.whatsappNumber.startsWith('http')
                        ? settings.whatsappNumber
                        : `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="size-4" /> WhatsApp Us
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
      <div className="premium-hero-media absolute inset-0">
        {block.heroImage && typeof block.heroImage === 'object' ? (
          <Media fill imgClassName="object-cover" priority resource={block.heroImage} />
        ) : (
          <div className="h-full bg-[radial-gradient(circle_at_75%_30%,#0057a8_0%,#003f7d_38%,#101827_78%)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#101827]/95 via-[#003f7d]/75 to-[#0057a8]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101827] via-transparent to-[#101827]/20" />
      <span className="absolute right-[8%] top-[22%] size-24 rounded-full border-[14px] border-[#ed1c24]/60" />
      <div className="premium-container relative z-10 pb-20 pt-40 lg:pb-24">
        <div className="max-w-5xl">
          <p className="hero-reveal hero-delay-1 inline-flex items-center gap-2 rounded-full bg-[#ed1c24] px-4 py-2 text-xs font-bold uppercase tracking-[.18em] shadow-lg">
            <Sparkles className="size-4 text-[#ffc107]" />
            {localized(locale, block.badgeEn, block.badgeSi)}
          </p>
          <h1 className="hero-reveal hero-delay-2 mt-7 max-w-5xl text-[clamp(3.2rem,8vw,7rem)] font-black uppercase leading-[.88] tracking-[-.055em] [text-shadow:0_6px_30px_rgba(0,0,0,.35)]">
            {localized(locale, block.headingEn, block.headingSi)}
          </h1>
          <p className="hero-reveal hero-delay-3 mt-7 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
            {localized(locale, block.subheadingEn, block.subheadingSi)}
          </p>
          <p className="hero-reveal hero-delay-3 mt-4 inline-block bg-[#ffe600] px-3 py-1 text-xl font-black text-[#101827]">
            ඉංග්‍රීසි විශ්වාසයෙන් ඉගෙනගන්න
          </p>
          <div className="hero-reveal hero-delay-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="premium-button-primary" href={block.primaryButtonUrl}>
              {block.primaryButtonLabel} <ArrowRight className="size-4" />
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
    <section className="premium-section relative bg-white" id="about">
      <span aria-hidden className="premium-wordmark left-0 top-12">ENGLISH</span>
      <div className="premium-container relative grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <Reveal>
          <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] bg-[#eaf3ff] shadow-[0_30px_90px_rgba(0,63,125,.14)]">
            {block.teacherImage && typeof block.teacherImage === 'object' ? (
              <Media fill imgClassName="object-cover" resource={block.teacherImage} />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <GraduationCap className="size-24 text-[#0057a8]/20" />
              </div>
            )}
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
              <p className="text-3xl font-black text-[#ed1c24]">15+</p>
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
              <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm" key={feature.id}>
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#f2c200]" />
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
            Join Now <ArrowRight className="size-4" />
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
          <p className="text-sm font-black uppercase tracking-[.22em] text-[#ed1c24]">
            {localized(locale, block.eyebrowEn, block.eyebrowSi)}
          </p>
          <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-black leading-tight text-[#0057a8] sm:text-6xl">
            {localized(locale, block.headingEn, block.headingSi)}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#6b7280]">
            {localized(locale, block.descriptionEn, block.descriptionSi)}
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_.8fr_1fr] lg:items-center">
          <div className="space-y-6">
            {features.slice(0, 2).map((feature, index) => (
              <FeaturePoint feature={feature} index={index} key={feature.id} locale={locale} />
            ))}
          </div>
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border-[14px] border-[#fff9cc] bg-[#eaf3ff] shadow-[0_24px_70px_rgba(0,63,125,.12)]">
              {block.image && typeof block.image === 'object' ? (
                <Media fill imgClassName="object-cover" resource={block.image} />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid size-32 place-items-center rounded-full bg-white text-[#0057a8] shadow-lg">
                    <BookOpen className="size-16" />
                  </span>
                </div>
              )}
              <span className="absolute right-5 top-5 size-7 rounded-full bg-[#ed1c24]" />
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
            {block.buttonLabel || 'Join Now'} <ArrowRight className="size-4" />
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
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#ffe600] text-[#003f7d] shadow-sm">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-black text-[#0057a8]">
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
    <section className="premium-section relative overflow-hidden bg-[#101827] text-white" id="process">
      <span aria-hidden className="premium-wordmark text-white/[.025]">LEARN</span>
      <div className="premium-container relative">
        <SectionHeading
          dark
          description={localized(locale, block.descriptionEn, block.descriptionSi)}
          kicker="Our Process"
          title={localized(locale, block.headingEn, block.headingSi)}
        />
        <div className="relative mt-16 grid gap-8 lg:grid-cols-5">
          <div className="absolute left-[10%] right-[10%] top-8 hidden h-0.5 bg-[#0057a8] lg:block" />
          {block.steps.map((step, index) => (
            <Reveal delay={index * 100} key={step.id}>
              <article className="relative">
                <span className="relative z-10 grid size-16 place-items-center rounded-full border-4 border-[#ffe600] bg-[#101827] text-lg font-black text-white">
                  <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-[#ed1c24] text-[10px] text-white">{index + 1}</span>
                  <GraduationCap className="size-6 text-[#ffe600]" />
                </span>
                <h3 className="mt-6 text-xl font-bold">
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
    <section className="relative overflow-hidden bg-[#fffdf3] py-24 text-[#111827]">
      {block.backgroundImage && typeof block.backgroundImage === 'object' ? (
        <Media fill imgClassName="object-cover opacity-30" resource={block.backgroundImage} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf3] via-[#fffdf3]/95 to-[#eaf3ff]/80" />
      <div className="premium-container relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            description={localized(locale, block.descriptionEn, block.descriptionSi)}
            kicker="Results & Trust"
            title={localized(locale, block.headingEn, block.headingSi)}
          />
          <Link className="premium-button-primary mt-8 inline-flex" href={block.ctaUrl || '#classes'}>
            {block.ctaLabel || 'Explore Classes'} <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal delay={100}>
          <div className="relative rounded-[2rem] border border-[#0057a8]/10 bg-white p-7 shadow-[0_24px_70px_rgba(0,63,125,.10)]">
            <div className="absolute -right-5 -top-8 grid size-32 rotate-[-9deg] place-items-center rounded-full border-[8px] border-double border-[#ed1c24] bg-white text-center text-[#ed1c24] shadow-xl">
              <span className="text-sm font-black uppercase leading-tight">Trusted<br />Since<br />2009</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-10">
            {(metrics.length ? metrics : block.metrics || []).slice(0, 4).map((metric) => (
              <div className="border-l-4 border-[#ffe600] bg-[#eaf3ff] p-5" key={metric.id}>
                <strong className="text-4xl font-black text-[#0057a8]"><AnimatedMetric value={metric.value} /></strong>
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
    <section className="premium-section bg-[#fffdf3]" id="portal">
      <div className="premium-container text-center">
        <SectionHeading
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
                  <div className="relative mx-auto grid aspect-square max-w-40 place-items-center rounded-full border-4 border-[#ffe600] bg-white shadow-[0_14px_35px_rgba(0,63,125,.08)] transition group-hover:scale-105 group-hover:border-[#0057a8]">
                    <Icon className="size-10 text-[#0057a8]" />
                    <span className="absolute right-2 top-4 size-3 rounded-full bg-[#ed1c24]" />
                  </div>
                  <h3 className="mt-4 font-black text-[#0057a8]">
                    {localized(locale, feature.titleEn, feature.titleSi)}
                  </h3>
                </article>
              </Reveal>
            )
          })}
        </div>
        <Link className="premium-button-primary mt-10 inline-flex" href={block.buttonUrl || '/login'}>
          {block.buttonLabel || 'Go to Student Portal'} <ArrowRight className="size-4" />
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
    <section className="premium-section bg-[#f7f8f5]" id="gallery">
      <div className="premium-container">
        <SectionHeading description={description} kicker="Gallery" title={title} />
        <div className="mt-8 flex flex-wrap gap-2">
          {['All', 'Classes', 'Events', 'Student Life', 'Achievements'].map((category, index) => (
            <span
              className={`rounded-full px-5 py-2 text-sm font-bold ${
                index === 0 ? 'bg-[#ffe600] text-[#111827]' : 'border border-[#0057a8]/20 bg-white text-[#0057a8]'
              }`}
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
        {items.length ? (
          <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((item, index) => {
              return (
                <Reveal className="mb-5 break-inside-avoid" delay={index * 60} key={item.id}>
                  <article className="group relative min-h-64 overflow-hidden rounded-[1.5rem] bg-[#e8e6dd]">
                    {item.image && typeof item.image === 'object' ? (
                      <Media
                        fill
                        imgClassName="object-cover transition duration-700 group-hover:scale-105"
                        resource={item.image}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <p className="text-xs uppercase tracking-widest text-[#ffc107]">{item.category}</p>
                      <h3 className="mt-2 text-xl font-bold">
                        {localized(locale, item.titleEn, item.titleSi)}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        ) : (
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-dashed border-[#0057a8]/25 bg-gradient-to-br from-[#eaf3ff] to-white px-6 py-24 text-center">
            <GraduationCap className="mx-auto size-12 text-[#0057a8]/35" />
            <p className="mt-5 text-xl font-black text-[#0057a8]">Gallery photos will be added soon</p>
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
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff9cc] text-[#0057a8]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[#6b7280]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#111827]">{value || 'Not provided'}</p>
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
      <p className={`premium-kicker ${dark ? 'text-[#ffe600]' : 'text-[#0057a8]'}`}>
        {kicker}
      </p>
      <h2 className={`mt-4 text-4xl font-black leading-[1.08] tracking-[-.03em] sm:text-5xl ${dark ? 'text-white' : 'text-[#111827]'}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 text-lg leading-8 ${dark ? 'text-white/60' : 'text-[#6b7280]'}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
