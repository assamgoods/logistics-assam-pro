const { body, param, validationResult } = require('express-validator');

/**
 * Reusable validation error handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Valid Roles Enum
 */
const ALLOWED_ROLES = [
  'Super Admin',
  'Admin',
  'Branch Manager',
  'Booking Staff',
  'Operation Staff'
];

/**
 * 1. Validate Create User Payload
 */
exports.validateCreateUser = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters.'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long.')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, hyphens, and dots.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),

  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required.')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('role')
    .notEmpty()
    .withMessage('Role is required.')
    .isIn(ALLOWED_ROLES)
    .withMessage(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`),

  body('branch')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid branch format. Must be a valid Mongo ObjectId.'),

  handleValidationErrors
];

/**
 * 2. Validate Update User Payload (All Optional)
 */
exports.validateUpdateUser = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters.'),

  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number.'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(ALLOWED_ROLES)
    .withMessage(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`),

  body('branch')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid branch format. Must be a valid Mongo ObjectId.'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive.'),

  handleValidationErrors
];

/**
 * 3. Validate Change User Status Payload
 */
exports.validateChangeStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive.'),

  handleValidationErrors
];

/**
 * 4. Validate Reset Password Payload
 */
exports.validateResetPassword = [
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.'),

  handleValidationErrors
];

/**
 * 5. Validate MongoDB ObjectId in Request Params
 */
exports.validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format. Must be a valid Mongo ObjectId.'),

  handleValidationErrors
];