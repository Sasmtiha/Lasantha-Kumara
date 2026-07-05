'use client'

import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GalleryHorizontalEnd,
  GraduationCap,
  Home,
  Image,
  LibraryBig,
  LogOut,
  Mail,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '@payloadcms/ui'
import type { LucideIcon } from 'lucide-react'

import { AdminLogo } from '@/components/AdminBrand'

type LMSNavItem = {
  href: string
  icon: LucideIcon
  label: string
}

type LMSNavGroup = {
  items: LMSNavItem[]
  label: string
}

const navGroups: LMSNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: Home, label: 'Dashboard' },
    ],
  },
  {
    label: 'Academic Management',
    items: [
      { href: '/admin/collections/classes', icon: GraduationCap, label: 'Classes' },
      { href: '/admin/collections/schedules', icon: CalendarDays, label: 'Class Schedule' },
      { href: '/admin/collections/teachers', icon: UserCog, label: 'Teachers' },
      { href: '/admin/collections/exams', icon: ClipboardList, label: 'English Exams' },
    ],
  },
  {
    label: 'Student Management',
    items: [
      { href: '/admin/collections/students', icon: Users, label: 'Students' },
      { href: '/admin/collections/enrollments?where[status][equals]=pending', icon: UserPlus, label: 'Enrollments' },
      { href: '/admin/collections/payment-slips?where[status][equals]=pending', icon: CreditCard, label: 'Payment Slips' },
      { href: '/admin/collections/contact-submissions', icon: Mail, label: 'Contact Messages' },
      { href: '/admin/collections/users', icon: UserCog, label: 'Users' },
    ],
  },
  {
    label: 'Learning Content',
    items: [
      { href: '/admin/collections/notices', icon: MessageSquareText, label: 'Notices' },
      { href: '/admin/collections/resources', icon: LibraryBig, label: 'Learning Resources' },
      { href: '/admin/collections/gallery', icon: GalleryHorizontalEnd, label: 'Gallery' },
      { href: '/admin/collections/media', icon: Image, label: 'Media' },
    ],
  },
  {
    label: 'Website Settings',
    items: [
      { href: '/admin/collections/pages', icon: FileText, label: 'Pages' },
      { href: '/admin/collections/testimonials', icon: MessageSquareText, label: 'Testimonials' },
      { href: '/admin/collections/form-submissions', icon: Mail, label: 'Form Submissions' },
      { href: '/admin/globals/site-settings', icon: Settings, label: 'Site Settings' },
    ],
  },
]

export default function LMSAdminNavClient() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const { modalState } = useModal()
  const modalOpen = Object.values(modalState || {}).some((modal) => modal?.isOpen)

  useEffect(() => {
    // Add no-transition class to prevent initial load animation flash
    document.documentElement.classList.add('iem-admin-nav-no-transition')

    setMounted(true)

    const saved = window.localStorage.getItem('iem-admin-sidebar')
    const mobileDefaultCollapsed = window.matchMedia('(max-width: 768px)').matches
    const shouldCollapse = saved ? saved === 'collapsed' : mobileDefaultCollapsed
    const savedGroups = window.localStorage.getItem('iem-admin-sidebar-groups')

    setCollapsed(shouldCollapse)
    if (savedGroups) {
      try {
        setCollapsedGroups(JSON.parse(savedGroups) as Record<string, boolean>)
      } catch {
        setCollapsedGroups({})
      }
    }
    document.documentElement.style.setProperty('--nav-width', shouldCollapse ? '76px' : '292px')

    // Remove the no-transition class in the next frame so subsequent toggles animate smoothly
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.remove('iem-admin-nav-no-transition')
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current

      window.localStorage.setItem('iem-admin-sidebar', next ? 'collapsed' : 'expanded')
      document.documentElement.style.setProperty('--nav-width', next ? '76px' : '292px')

      return next
    })
  }

  const toggleGroup = (label: string) => {
    setCollapsedGroups((current) => {
      const next = {
        ...current,
        [label]: !current[label],
      }

      window.localStorage.setItem('iem-admin-sidebar-groups', JSON.stringify(next))

      return next
    })
  }

  const isActive = (href: string) => {
    if (!pathname || href.startsWith('http')) return false
    if (href === '/admin') return pathname === href

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const toggleButton = (
    <button
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="iem-admin-nav__toggle"
      onClick={toggleSidebar}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      type="button"
    >
      {collapsed ? <ChevronRight aria-hidden /> : <ChevronLeft aria-hidden />}
    </button>
  )

  return (
    <>
      <aside className={collapsed ? 'iem-admin-nav-shell is-collapsed' : 'iem-admin-nav-shell'}>
        <div className="iem-admin-nav" ref={navRef}>
          <div className="iem-admin-nav__top">
            <Link className="iem-admin-nav__brand" href="/admin">
              <AdminLogo />
            </Link>
          </div>

          <nav aria-label="LMS admin navigation" className="iem-admin-nav__groups">
            {navGroups.map((group) => {
              const groupCollapsed = Boolean(collapsedGroups[group.label])
              const linksId = `iem-admin-nav-group-${group.label.toLowerCase().replaceAll(' ', '-')}`

              return (
                <section
                  className={
                    groupCollapsed
                      ? 'iem-admin-nav__group is-group-collapsed'
                      : 'iem-admin-nav__group'
                  }
                  key={group.label}
                >
                  <button
                    aria-controls={linksId}
                    aria-expanded={!groupCollapsed}
                    className="iem-admin-nav__group-label"
                    onClick={() => toggleGroup(group.label)}
                    type="button"
                  >
                    <span>{group.label}</span>
                    {groupCollapsed ? <ChevronRight aria-hidden /> : <ChevronDown aria-hidden />}
                  </button>
                  <div className="iem-admin-nav__links" id={linksId}>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    const isExternal = item.href.startsWith('http')

                    return (
                      <Link
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                        className={active ? 'iem-admin-nav__link is-active' : 'iem-admin-nav__link'}
                        href={item.href}
                        key={item.href}
                        rel={isExternal ? 'noreferrer' : undefined}
                        target={isExternal ? '_blank' : undefined}
                        title={item.label}
                      >
                        <Icon aria-hidden strokeWidth={1.9} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  </div>
                </section>
              )
            })}
          </nav>

            <div className="iem-admin-nav__bottom">
              <Link className="iem-admin-nav__logout" href="/admin/logout">
                <LogOut aria-hidden />
                <span>Sign out</span>
              </Link>
            </div>
        </div>
      </aside>
      {mounted && !modalOpen ? createPortal(toggleButton, document.body) : null}
    </>
  )
}
