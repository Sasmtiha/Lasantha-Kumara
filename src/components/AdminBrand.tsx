import React from 'react'

import { ThemeLogo } from '@/components/ThemeLogo'

export function AdminLogo() {
  return (
    <div className="iem-admin-logo" aria-label="Institute of English Middeniya">
      <span className="iem-admin-logo__mark">
        <ThemeLogo />
      </span>
      <span className="iem-admin-logo__name">
        <span>Institute of</span>
        <span>English</span>
        <span>Middeniya</span>
      </span>
    </div>
  )
}

export function AdminIcon() {
  return (
    <span className="iem-admin-icon" aria-label="IEM.lk">
      <ThemeLogo />
    </span>
  )
}
