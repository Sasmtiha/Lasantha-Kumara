'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function AdminHeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = query.trim()

    if (value) {
      const params = new URLSearchParams()
      ;['fullName', 'firstName', 'lastName', 'email', 'phone'].forEach((field, index) => {
        params.set(`where[or][${index}][${field}][like]`, value)
      })

      router.push(`/admin/collections/students?${params.toString()}`)
    }
  }

  return (
    <form aria-label="Admin search" className="iem-admin-header-search" onSubmit={onSubmit}>
      <Search aria-hidden />
      <input
        aria-label="Search admin records"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search students, classes, exams, resources..."
        type="search"
        value={query}
      />
    </form>
  )
}
