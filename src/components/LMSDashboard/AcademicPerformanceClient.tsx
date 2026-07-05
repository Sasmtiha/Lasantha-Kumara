'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { AdminThemePreservingLink } from '@/components/AdminThemePreservingLink'

type MarkDoc = {
  percentage?: number | string | null
  gradeLevel: string
  resultStatus?: string | null
  createdAt?: string | null
  examDate?: string | null
}

type Props = {
  marks: MarkDoc[]
  publishedCounts: Record<string, number>
}

const adminPath = '/admin'
const collectionUrl = (slug: string, query?: string) =>
  `${adminPath}/collections/${slug}${query ? `?${query}` : ''}`

const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'] as const

export default function AcademicPerformanceClient({ marks, publishedCounts }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 6')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load selection from localStorage
  useEffect(() => {
    const savedGrade = localStorage.getItem('iem-lms-performance-grade')
    if (savedGrade && gradeOptions.includes(savedGrade as any)) {
      setSelectedGrade(savedGrade)
    }
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectGrade = (grade: string) => {
    setSelectedGrade(grade)
    localStorage.setItem('iem-lms-performance-grade', grade)
    setDropdownOpen(false)
  }

  // Filter marks by selected grade level
  const filteredMarks = marks.filter((mark) => mark.gradeLevel === selectedGrade)
  const latestMarks = filteredMarks.slice(-8)

  const averageScore = latestMarks.length
    ? Math.round(
        latestMarks.reduce((total, mark) => total + Number(mark.percentage || 0), 0) /
          latestMarks.length,
      )
    : 0

  const passRate = latestMarks.length
    ? Math.round(
        (latestMarks.filter((mark) => mark.resultStatus === 'Pass').length / latestMarks.length) * 100,
      )
    : 0

  const publishedResults = publishedCounts[selectedGrade] || 0

  return (
    <article className="iem-lms-performance-card">
      <div className="iem-lms-performance-card__top">
        <p>Academic Performance</p>
        
        <div className="iem-lms-performance-filter" ref={dropdownRef}>
          <button
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="Filter by grade"
            className="iem-lms-performance-filter__btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            type="button"
          >
            <Filter aria-hidden size={14} />
            <span>{selectedGrade}</span>
            <ChevronDown aria-hidden size={14} className={dropdownOpen ? 'is-open' : ''} />
          </button>

          {dropdownOpen && (
            <ul className="iem-lms-performance-filter__dropdown" role="listbox">
              {gradeOptions.map((grade) => (
                <li key={grade} role="option" aria-selected={selectedGrade === grade}>
                  <button
                    className={selectedGrade === grade ? 'is-active' : ''}
                    onClick={() => selectGrade(grade)}
                    type="button"
                  >
                    {grade}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AdminThemePreservingLink href={collectionUrl('student-marks', `where[gradeLevel][equals]=${encodeURIComponent(selectedGrade)}`)}>
          See more
        </AdminThemePreservingLink>
      </div>

      <strong>{averageScore || 0}%</strong>
      <span>Recent {selectedGrade.toLowerCase()} performance score</span>

      <div className="iem-lms-performance-card__footer">
        <span>{passRate || 0}% pass rate</span>
        <small>{publishedResults} published result records</small>
      </div>
    </article>
  )
}
