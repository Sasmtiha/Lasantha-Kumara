import React from 'react'

import type { InstituteContactBlock as Props } from '@/payload-types'
import { ContactForm } from '@/components/institute/ContactForm'
import { FormBlock } from '@/blocks/Form/Component'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { LocalizedText } from '@/components/LocalizedText'

export async function InstituteContactBlock({ headingEn, headingSi, descriptionEn, descriptionSi, showContactDetails, showContactForm, form }: Props) {
  const settings = await getCachedGlobal('site-settings', 1)()
  return (
    <section className="container grid gap-12 py-20 lg:grid-cols-2">
      <div>
        <p className="section-kicker">Get in touch</p>
        <h2 className="section-title">
          <LocalizedText english={headingEn} sinhala={headingSi} />
        </h2>
        {descriptionEn || descriptionSi ? (
          <p className="section-subtitle">
            <LocalizedText english={descriptionEn} sinhala={descriptionSi} />
          </p>
        ) : null}
        {showContactDetails ? (
          <address className="mt-8 space-y-3 not-italic text-muted-foreground">
            <p><strong className="text-navy">Phone:</strong> {settings.phone}</p>
            <p><strong className="text-navy">Email:</strong> {settings.email}</p>
            <p>
              <strong className="text-navy">Address:</strong>{' '}
              <LocalizedText english={settings.addressEn} sinhala={settings.addressSi} />
            </p>
            <p>
              <strong className="text-navy">Office hours:</strong>{' '}
              <LocalizedText english={settings.officeHoursEn} sinhala={settings.officeHoursSi} />
            </p>
          </address>
        ) : null}
      </div>
      {showContactForm ? (
        <div className="premium-contact-form-wrapper">
          {form && typeof form === 'object' ? (
            <FormBlock enableIntro={false} form={form as any} disableInnerContainer />
          ) : (
            <ContactForm />
          )}
        </div>
      ) : null}
    </section>
  )
}
