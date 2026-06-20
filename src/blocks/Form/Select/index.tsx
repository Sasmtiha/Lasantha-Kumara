import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'

export const Select: React.FC<
  SelectField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, options, required, width, defaultValue }) => {
  const [dynamicOptions, setDynamicOptions] = useState(options)

  useEffect(() => {
    if (name === 'preferredClass') {
      fetch('/api/classes?where[isActive][equals]=true&limit=100')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.docs)) {
            const classOptions = data.docs.map((cls: any) => ({
              label: cls.titleEn,
              value: cls.id.toString(),
            }))
            setDynamicOptions([
              { label: 'Select a class (optional)', value: '' },
              ...classOptions,
            ])
          }
        })
        .catch((err) => console.error('Error fetching classes:', err))
    }
  }, [name])

  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = dynamicOptions.find((t) => t.value === value)

          return (
            <SelectComponent onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
              <SelectTrigger className="w-full" id={name}>
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {dynamicOptions.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
          )
        }}
        rules={{ required }}
      />
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
