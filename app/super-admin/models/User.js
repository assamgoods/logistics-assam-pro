const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['Super Admin', 'Admin', 'Branch Manager', 'Booking Staff', 'Operation Staff'],
        message: '{VALUE} is not a valid role'
      },
      default: 'Booking Staff',
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastLogout: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },

    // Staff Performance Metrics
    performance: {
      todaysBookings: { type: Number, default: 0, min: 0 },
      totalBookings: { type: Number, default: 0, min: 0 },
      prepaidBookings: { type: Number, default: 0, min: 0 },
      codBookings: { type: Number, default: 0, min: 0 },
      totalFreight: { type: Number, default: 0, min: 0 },
      todaysRevenue: { type: Number, default: 0, min: 0 },
      monthlyRevenue: { type: Number, default: 0, min: 0 },
      todaysProfit: { type: Number, default: 0, min: 0 },
      monthlyProfit: { type: Number, default: 0, min: 0 },
      pendingPickup: { type: Number, default: 0, min: 0 },
      delivered: { type: Number, default: 0, min: 0 },
      ndr: { type: Number, default: 0, min: 0 },
      rto: { type: Number, default: 0, min: 0 },
      cancelled: { type: Number, default: 0, min: 0 }
    },

    // Staff Access Permissions
    permissions: {
      canCreateBooking: { type: Boolean, default: true },
      canEditBooking: { type: Boolean, default: true },
      canCancelBooking: { type: Boolean, default: false },
      canPrintLabel: { type: Boolean, default: true },
      canGenerateManifest: { type: Boolean, default: true },
      canViewReports: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canManageCourierApi: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying
UserSchema.index({ username: 1, status: 1 });
UserSchema.index({ role: 1, branch: 1 });

// Auto-generate employeeId before saving new document
UserSchema.pre('save', async function (next) {
  if (this.isNew && !this.employeeId) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    this.employeeId = `EMP-${randomDigits}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);