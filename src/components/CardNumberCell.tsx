import React from 'react'
import { formatStudentId } from '@/utilities/studentCardNumber'

export interface CardNumberCellProps {
  cellData?: string | number | null
  value?: string | number | null
  rowData?: Record<string, unknown>
}

export const CardNumberCell: React.FC<CardNumberCellProps> = ({ cellData, value, rowData }) => {
  const rowCardNumber = rowData?.cardNumber
  const num =
    cellData ??
    value ??
    (typeof rowCardNumber === 'string' || typeof rowCardNumber === 'number'
      ? rowCardNumber
      : null)

  if (num == null) {
    return <span>—</span>
  }
  return <span>{formatStudentId(num)}</span>
}
