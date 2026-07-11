import * as migration_20260628165500_add_payment_status from './20260628165500_add_payment_status'
import * as migration_20260705000000_add_user_must_change_password from './20260705000000_add_user_must_change_password'
import * as migration_20260705003000_add_enrollment_temporary_password from './20260705003000_add_enrollment_temporary_password'
import * as migration_20260708000000_add_protected_uploads from './20260708000000_add_protected_uploads'

export const migrations = [
  {
    up: migration_20260628165500_add_payment_status.up,
    down: migration_20260628165500_add_payment_status.down,
    name: '20260628165500_add_payment_status',
  },
  {
    up: migration_20260705000000_add_user_must_change_password.up,
    down: migration_20260705000000_add_user_must_change_password.down,
    name: '20260705000000_add_user_must_change_password',
  },
  {
    up: migration_20260705003000_add_enrollment_temporary_password.up,
    down: migration_20260705003000_add_enrollment_temporary_password.down,
    name: '20260705003000_add_enrollment_temporary_password',
  },
  {
    up: migration_20260708000000_add_protected_uploads.up,
    down: migration_20260708000000_add_protected_uploads.down,
    name: '20260708000000_add_protected_uploads',
  },
]
