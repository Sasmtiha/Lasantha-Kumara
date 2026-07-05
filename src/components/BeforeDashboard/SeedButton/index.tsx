'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC = () => (
  <div>
    Database seeded! You can now{' '}
    <a target="_blank" href="/">
      visit your website
    </a>
  </div>
)

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info('Database already seeded.')
        return
      }
      if (loading) {
        toast.info('Seeding already in progress.')
        return
      }
      if (error) {
        toast.error(`An error occurred, please refresh and try again.`)
        return
      }

      setLoading(true)

      try {
        const seedPromise = fetch('/next/seed', { method: 'POST', credentials: 'include' }).then((res) => {
          if (res.ok) {
            setSeeded(true)
            return true
          }

          throw new Error('An error occurred while seeding.')
        })

        toast.promise(
          seedPromise,
          {
            loading: 'Seeding with data....',
            success: <SuccessMessage />,
            error: 'An error occurred while seeding.',
          },
        )

        seedPromise.catch((err) => {
          const error = err instanceof Error ? err.message : String(err)
          setError(error)
        }).finally(() => {
          setLoading(false)
        })
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setError(error)
        setLoading(false)
      }
    },
    [loading, seeded, error],
  )

  let message = ''
  if (loading) message = ' (seeding...)'
  if (seeded) message = ' (done!)'
  if (error) message = ` (error: ${error})`

  return (
    <Fragment>
      <button className="seedButton" onClick={handleClick}>
        Seed your database
      </button>
      {message}
    </Fragment>
  )
}
