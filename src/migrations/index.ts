import * as migration_20260628165500_add_payment_status from './20260628165500_add_payment_status'

export const migrations = [
  {
    up: migration_20260628165500_add_payment_status.up,
    down: migration_20260628165500_add_payment_status.down,
    name: '20260628165500_add_payment_status',
  },
]
