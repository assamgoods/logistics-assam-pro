// config/roles.js

const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRANCH_MANAGER: 'Branch Manager',
  BOOKING_STAFF: 'Booking Staff',
  OPERATION_STAFF: 'Operation Staff'
};

const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    canCreateBooking: true,
    canEditBooking: true,
    canCancelBooking: true,
    canPrintLabel: true,
    canGenerateManifest: true,
    canViewReports: true,
    canManageStaff: true,
    canManageCourierApi: true
  },
  [ROLES.ADMIN]: {
    canCreateBooking: true,
    canEditBooking: true,
    canCancelBooking: true,
    canPrintLabel: true,
    canGenerateManifest: true,
    canViewReports: true,
    canManageStaff: true,
    canManageCourierApi: false
  },
  [ROLES.BRANCH_MANAGER]: {
    canCreateBooking: true,
    canEditBooking: true,
    canCancelBooking: true,
    canPrintLabel: true,
    canGenerateManifest: true,
    canViewReports: true,
    canManageStaff: false,
    canManageCourierApi: false
  },
  [ROLES.BOOKING_STAFF]: {
    canCreateBooking: true,
    canEditBooking: true,
    canCancelBooking: false,
    canPrintLabel: true,
    canGenerateManifest: true,
    canViewReports: false,
    canManageStaff: false,
    canManageCourierApi: false
  },
  [ROLES.OPERATION_STAFF]: {
    canCreateBooking: false,
    canEditBooking: false,
    canCancelBooking: false,
    canPrintLabel: true,
    canGenerateManifest: true,
    canViewReports: false,
    canManageStaff: false,
    canManageCourierApi: false
  }
};

module.exports = {
  ROLES,
  DEFAULT_ROLE_PERMISSIONS
};