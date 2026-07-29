const mongoose = require('mongoose');

const DashboardSnapshotSchema = new mongoose.Schema(
  {
    snapshotDate: {
      type: Date,
      required: [true, 'Snapshot date is required'],
      default: Date.now,
      index: true
    },
    totalBookings: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total bookings cannot be negative']
    },
    todaysBookings: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Today\'s bookings cannot be negative']
    },
    prepaidShipments: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Prepaid shipments count cannot be negative']
    },
    codShipments: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'COD shipments count cannot be negative']
    },
    totalFreight: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total freight amount cannot be negative']
    },
    codAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'COD amount cannot be negative']
    },
    walletBalance: {
      type: Number,
      required: true,
      default: 0
    },
    todaysRevenue: {
      type: Number,
      required: true,
      default: 0
    },
    monthlyRevenue: {
      type: Number,
      required: true,
      default: 0
    },
    todaysProfit: {
      type: Number,
      required: true,
      default: 0
    },
    monthlyProfit: {
      type: Number,
      required: true,
      default: 0
    },
    pendingPickup: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Pending pickup count cannot be negative']
    },
    inTransit: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'In-transit count cannot be negative']
    },
    delivered: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Delivered count cannot be negative']
    },
    ndr: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'NDR count cannot be negative']
    },
    rto: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'RTO count cannot be negative']
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimized querying and analytics reporting
DashboardSnapshotSchema.index({ snapshotDate: -1, branch: 1 });
DashboardSnapshotSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DashboardSnapshot', DashboardSnapshotSchema);