const { query, body, validationResult } = require('express-validator');

/**
 * Common middleware to evaluate validation results and return formatted error response.
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
 * 1. Validate Query Parameters (e.g., optional branchId in GET requests)
 */
exports.validateBranchQuery = [
  query('branchId')
    .optional()
    .isMongoId()
    .withMessage('Invalid branchId format. Must be a valid Mongo ObjectId.'),
  handleValidationErrors
];

/**
 * 2. Validate Refresh Payload (e.g., optional branchId in POST /refresh request)
 */
exports.validateDashboardRefresh = [
  body('branchId')
    .optional()
    .isMongoId()
    .withMessage('Invalid branchId format. Must be a valid Mongo ObjectId.'),
  handleValidationErrors
];