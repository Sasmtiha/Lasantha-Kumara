import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AboutUsBlock as AboutUsBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getSiteLocale, localized } from '@/utilities/locale'

export async function AboutUsBlock({
  buttonLabel,
  buttonUrl,
  descriptionEn,
  descriptionSi,
  headingEn,
  headingSi,
  image,
}: AboutUsBlockProps) {
  const locale = await getSiteLocale()
  let mediaResource = image

  if (mediaResource && (typeof mediaResource === 'number' || typeof mediaResource === 'string')) {
    try {
      const payload = await getPayload({ config: configPromise })
      mediaResource = await payload.findByID({ collection: 'media', id: mediaResource })
    } catch {
      // Render the section without an image if the related media no longer exists.
    }
  }

  return (
    <section className="container grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
      <div className="relative min-h-[28rem] overflow-hidden rounded-md bg-[#e8e9ed]">
        {mediaResource && typeof mediaResource === 'object' ? (
          <Media fill imgClassName="object-cover" resource={mediaResource} />
        ) : null}
      </div>
      <div>
        <p className="section-kicker">About IEM.lk</p>
        <h2 className="section-title">{localized(locale, headingEn, headingSi)}</h2>
        <RichText
          className="mt-5 text-muted-foreground"
          data={locale === 'si' && descriptionSi ? descriptionSi : descriptionEn}
          enableGutter={false}
        />
        {buttonLabel && buttonUrl ? (
          <a className="premium-button-primary mt-8 inline-flex" href={buttonUrl}>
            {buttonLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
