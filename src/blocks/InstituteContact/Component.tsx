import React from 'react'

import type { InstituteContactBlock as Props } from '@/payload-types'
import { ContactForm } from '@/components/institute/ContactForm'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteLocale, localized } from '@/utilities/locale'

export async function InstituteContactBlock({ headingEn, headingSi, descriptionEn, descriptionSi, showContactDetails, showContactForm }: Props) {
  const settings = await getCachedGlobal('site-settings', 1)()
  const locale = await getSiteLocale()
  return (
    <section className="container grid gap-12 py-20 lg:grid-cols-2">
      <div>
        <p className="section-kicker">Get in touch</p>
        <h2 className="section-title">{localized(locale, headingEn, headingSi)}</h2>
        {localized(locale, descriptionEn, descriptionSi) ? <p className="section-subtitle">{localized(locale, descriptionEn, descriptionSi)}</p> : null}
        {showContactDetails ? (
          <address className="mt-8 space-y-3 not-italic text-muted-foreground">
            <p><strong className="text-navy">Phone:</strong> {settings.phone}</p>
            <p><strong className="text-navy">Email:</strong> {settings.email}</p>
            <p><strong className="text-navy">Address:</strong> {localized(locale, settings.addressEn, settings.addressSi)}</p>
            <p><strong className="text-navy">Office hours:</strong> {localized(locale, settings.officeHoursEn, settings.officeHoursSi)}</p>
          </address>
        ) : null}
      </div>
      {showContactForm ? <ContactForm /> : null}
    </section>
  )
}
