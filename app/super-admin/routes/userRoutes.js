const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateUser,
  validateUpdateUser,
  validateChangeStatus,
  validateResetPassword,
  validateUserId
} = require('../validations/userValidation');

// Protect all routes with authentication middleware
router.use(protect);

/**
 * @route   POST /api/v1/users
 * @desc    Create new staff user
 * @access  Private (Super Admin, Admin only)
 */
router.post(
  '/',
  authorize('Super Admin', 'Admin'),
  validateCreateUser,
  userController.createUser
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all staff users with search, filter, pagination
 * @access  Private (Super Admin, Admin, Branch Manager)
 */
router.get(
  '/',
  authorize('Super Admin', 'Admin', 'Branch Manager'),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get staff user details by ID
 * @access  Private (All Authenticated Users - Self or Authorized Roles)
 */
router.get(
  '/:id',
  validateUserId,
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update staff user details
 * @access  Private (Super Admin, Admin only)
 */
router.put(
  '/:id',
  authorize('Super Admin', 'Admin'),
  validateUserId,
  validateUpdateUser,
  userController.updateUser
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Change staff user active/inactive status
 * @access  Private (Super Admin, Admin only)
 */
router.patch(
  '/:id/status',
  authorize('Super Admin', 'Admin'),
  validateUserId,
  validateChangeStatus,
  userController.changeUserStatus
);

/**
 * @route   PATCH /api/v1/users/:id/reset-password
 * @desc    Reset staff user password
 * @access  Private (Super Admin, Admin only)
 */
router.patch(
  '/:id/reset-password',
  authorize('Super Admin', 'Admin'),
  validateUserId,
  validateResetPassword,
  userController.resetPassword
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft delete staff user (sets status to Inactive)
 * @access  Private (Super Admin, Admin only)
 */
router.delete(
  '/:id',
  authorize('Super Admin', 'Admin'),
  validateUserId,
  userController.deleteUser
);

/**
 * @route   GET /api/v1/users/:id/performance
 * @desc    Get staff performance statistics
 * @access  Private (All Authenticated Users - Self or Authorized Roles)
 */
router.get(
  '/:id/performance',
  validateUserId,
  userController.getStaffPerformance
);

module.exports = router;