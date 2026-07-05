import { describe, expect, it, vi } from 'vitest'

import { authenticated } from '@/access/authenticated'
import { getRole } from '@/access/roles'
import { canRunSeed } from '@/app/(frontend)/next/seed/route'
import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { ResourceFiles } from '@/collections/ResourceFiles'
import { Users } from '@/collections/Users'

const activeStudent = { id: 1, role: 'student', status: 'active' }
const activeAdmin = { id: 2, role: 'admin', status: 'active' }
const suspendedAdmin = { id: 3, role: 'admin', status: 'suspended' }

const accessArgs = (user: unknown) => ({ req: { user } }) as any

const runAccess = async (access: unknown, user: unknown) =>
  typeof access === 'function' ? access(accessArgs(user)) : undefined

describe('security access regressions', () => {
  it('does not treat suspended users as authenticated or privileged', () => {
    expect(getRole(suspendedAdmin)).toBeNull()
    expect(authenticated(accessArgs(suspendedAdmin))).toBe(false)
    expect(Users.access?.admin?.(accessArgs(suspendedAdmin))).toBe(false)
  })

  it('allows only active admins to run the destructive seed route', () => {
    expect(canRunSeed(activeAdmin)).toBe(true)
    expect(canRunSeed(activeStudent)).toBe(false)
    expect(canRunSeed(suspendedAdmin)).toBe(false)
  })

  it('blocks normal users from mutating public CMS collections', async () => {
    expect(await runAccess(Pages.access?.create, activeStudent)).toBe(false)
    expect(await runAccess(Categories.access?.update, activeStudent)).toBe(false)
    expect(await runAccess(Media.access?.delete, activeStudent)).toBe(false)

    expect(await runAccess(Pages.access?.create, activeAdmin)).toBe(true)
    expect(await runAccess(Categories.access?.update, activeAdmin)).toBe(true)
    expect(await runAccess(Media.access?.delete, activeAdmin)).toBe(true)
  })

  it('does not expose draft pages to normal authenticated users', async () => {
    expect(await runAccess(Pages.access?.read, activeStudent)).toEqual({
      _status: { equals: 'published' },
    })
  })

  it('scopes resource file reads to files referenced by accessible resources', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [{ file: 10 }, { file: { id: 11 } }],
    })

    const result = await ResourceFiles.access?.read?.({
      req: {
        payload: { find },
        user: null,
      },
    } as any)

    expect(result).toEqual({ id: { in: [10, 11] } })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'resources',
        overrideAccess: true,
      }),
    )
  })
})
