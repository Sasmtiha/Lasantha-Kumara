import type { Block } from 'payload'

export const InstituteContact: Block = {
  slug: 'instituteContact',
  interfaceName: 'InstituteContactBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'descriptionSi', type: 'textarea' },
    {
      name: 'panelHeadingEn',
      type: 'text',
      defaultValue: 'Let’s start your English journey',
      label: 'Details panel heading (English)',
    },
    { name: 'panelHeadingSi', type: 'text', label: 'Details panel heading (සිංහල)' },
    {
      name: 'panelDescriptionEn',
      type: 'text',
      defaultValue: 'Speak with our team about classes, schedules and enrollment.',
      label: 'Details panel description (English)',
    },
    {
      name: 'panelDescriptionSi',
      type: 'text',
      label: 'Details panel description (සිංහල)',
    },
    { name: 'fullNameLabel', type: 'text', defaultValue: 'Full name' },
    { name: 'emailLabel', type: 'text', defaultValue: 'Email' },
    { name: 'phoneLabel', type: 'text', defaultValue: 'Phone' },
    { name: 'preferredClassLabel', type: 'text', defaultValue: 'Preferred class' },
    {
      name: 'preferredClassPlaceholder',
      type: 'text',
      defaultValue: 'Select a class (optional)',
    },
    { name: 'messageLabel', type: 'text', defaultValue: 'Message' },
    { name: 'submitLabel', type: 'text', defaultValue: 'Send Message' },
    { name: 'whatsappLabel', type: 'text', defaultValue: 'WhatsApp Us' },
    { name: 'phoneInfoLabel', type: 'text', defaultValue: 'Phone' },
    { name: 'mobileInfoLabel', type: 'text', defaultValue: 'Mobile' },
    { name: 'emailInfoLabel', type: 'text', defaultValue: 'Email' },
    { name: 'locationInfoLabel', type: 'text', defaultValue: 'Location' },
    { name: 'officeHoursInfoLabel', type: 'text', defaultValue: 'Office Hours' },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Thank you. We will contact you shortly.',
    },
    {
      name: 'errorMessage',
      type: 'text',
      defaultValue: 'We could not send your message. Please try again.',
    },
    { name: 'showContactForm', type: 'checkbox', defaultValue: true },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        condition: (_, { showContactForm }) => showContactForm !== false,
      },
    },
    { name: 'showContactDetails', type: 'checkbox', defaultValue: true },
  ],
}
