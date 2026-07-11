import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AboutUsBlock as AboutUsBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { LocalizedText } from '@/components/LocalizedText'

export async function AboutUsBlock({
  buttonLabel,
  buttonUrl,
  descriptionEn,
  descriptionSi,
  headingEn,
  headingSi,
  image,
}: AboutUsBlockProps) {
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
          <Media
            fill
            imgClassName="object-cover"
            preferredSize="large"
            resource={mediaResource}
            size="(max-width: 1024px) 100vw, 50vw"
          />
        ) : null}
      </div>
      <div>
        <p className="section-kicker">About IEM</p>
        <h2 className="section-title">
          <LocalizedText english={headingEn} sinhala={headingSi} />
        </h2>
        <div className="i18n-text i18n-en">
          <RichText
            className="mt-5 text-muted-foreground"
            data={descriptionEn}
            enableGutter={false}
          />
        </div>
        {descriptionSi ? (
          <div className="i18n-text i18n-si">
            <RichText
              className="mt-5 text-muted-foreground"
              data={descriptionSi}
              enableGutter={false}
            />
          </div>
        ) : (
          <div className="i18n-text i18n-si">
            <RichText
              className="mt-5 text-muted-foreground"
              data={descriptionEn}
              enableGutter={false}
            />
          </div>
        )}
        {buttonLabel && buttonUrl ? (
          <a className="premium-button-primary mt-8 inline-flex" href={buttonUrl}>
            {buttonLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
