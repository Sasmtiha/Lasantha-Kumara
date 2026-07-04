'use client'

import { Bell, X } from 'lucide-react'
import { useState } from 'react'

type NotificationMessage = {
  createdAt?: string | null
  href: string
  id: string
  message?: string | null
  name: string
  status?: string | null
  subject?: string | null
}

type LMSDashboardNotificationsProps = {
  count: number
  messages: NotificationMessage[]
}

const formatDate = (value?: string | null) => {
  if (!value) return 'No date'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function LMSDashboardNotifications({ count, messages }: LMSDashboardNotificationsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="iem-lms-notifications">
      <button
        aria-expanded={open}
        aria-label={`Open unread messages${count ? `, ${count} unread` : ''}`}
        className="iem-lms-notification-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell aria-hidden />
        {count ? <span>{count > 99 ? '99+' : count}</span> : null}
      </button>

      {open ? (
        <div className="iem-lms-notification-overlay" role="presentation">
          <section
            aria-label="Unread contact messages"
            className="iem-lms-notification-modal"
            role="dialog"
          >
            <div className="iem-lms-notification-modal__header">
              <div>
                <p className="iem-lms-eyebrow">Inbox</p>
                <h2>Unread Messages</h2>
              </div>
              <button aria-label="Close notifications" onClick={() => setOpen(false)} type="button">
                <X aria-hidden />
              </button>
            </div>

            <div className="iem-lms-notification-list">
              {messages.length ? (
                messages.map((message) => (
                  <a className="iem-lms-notification-item" href={message.href} key={message.id}>
                    <span className="iem-lms-notification-item__avatar">
                      {message.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <strong>{message.subject || 'New contact message'}</strong>
                      <small>
                        {message.name} · {formatDate(message.createdAt)}
                      </small>
                      {message.message ? <em>{message.message}</em> : null}
                    </span>
                  </a>
                ))
              ) : (
                <p className="iem-lms-empty">No unread contact messages right now.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
