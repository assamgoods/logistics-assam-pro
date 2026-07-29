const DashboardSnapshot = require('../models/DashboardSnapshot');

class DashboardService {
  /**
   * Helper function to return static mock metrics when MongoDB has no snapshots or for fallback
   */
  _getMockMetrics() {
    return {
      totalBookings: 14850,
      todaysBookings: 342,
      prepaidShipments: 9210,
      codShipments: 5640,
      totalFreight: 1845200,
      codAmount: 892400,
      walletBalance: 425000,
      todaysRevenue: 128400,
      todaysProfit: 34500,
      pendingPickup: 185,
      inTransit: 1420,
      delivered: 12650,
      ndr: 312,
      rto: 283
    };
  }

  /**
   * 1. Get Dashboard Data
   * Retrieves overall combined metrics (from DB snapshot or fallback mock data)
   */
  async getDashboardData(branchId = null) {
    try {
      const query = branchId ? { branch: branchId } : {};
      const latestSnapshot = await DashboardSnapshot.findOne(query)
        .sort({ snapshotDate: -1 })
        .lean();

      if (latestSnapshot) {
        return {
          source: 'DATABASE',
          timestamp: latestSnapshot.snapshotDate,
          data: latestSnapshot
        };
      }

      return {
        source: 'MOCK',
        timestamp: new Date(),
        data: this._getMockMetrics()
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }

  /**
   * 2. Get Today's Summary
   * Focuses on daily volume, daily revenue, daily profit, and today's bookings
   */
  async getTodaysSummary(branchId = null) {
    try {
      const fullData = await this.getDashboardData(branchId);
      const { todaysBookings, todaysRevenue, todaysProfit, pendingPickup } = fullData.data;

      return {
        todaysBookings,
        todaysRevenue,
        todaysProfit,
        pendingPickup,
        currency: 'INR',
        date: new Date()
      };
    } catch (error) {
      throw new Error(`Error fetching today's summary: ${error.message}`);
    }
  }

  /**
   * 3. Get Revenue Summary
   * Financial analytics including total freight, today's revenue, profit, and COD collection
   */
  async getRevenueSummary(branchId = null) {
    try {
      const fullData = await this.getDashboardData(branchId);
      const { totalFreight, codAmount, todaysRevenue, todaysProfit, walletBalance } = fullData.data;

      return {
        totalFreight,
        codAmount,
        todaysRevenue,
        todaysProfit,
        walletBalance,
        currency: 'INR',
        profitMarginPercentage: todaysRevenue > 0 ? ((todaysProfit / todaysRevenue) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Error fetching revenue summary: ${error.message}`);
    }
  }

  /**
   * 4. Get Shipment Summary
   * Operational status counts for shipments (Pending, In Transit, Delivered, NDR, RTO)
   */
  async getShipmentSummary(branchId = null) {
    try {
      const fullData = await this.getDashboardData(branchId);
      const {
        totalBookings,
        todaysBookings,
        prepaidShipments,
        codShipments,
        pendingPickup,
        inTransit,
        delivered,
        ndr,
        rto
      } = fullData.data;

      return {
        totalBookings,
        todaysBookings,
        paymentBreakdown: {
          prepaid: prepaidShipments,
          cod: codShipments
        },
        statusBreakdown: {
          pendingPickup,
          inTransit,
          delivered,
          ndr,
          rto
        }
      };
    } catch (error) {
      throw new Error(`Error fetching shipment summary: ${error.message}`);
    }
  }

  /**
   * 5. Get Wallet Summary
   * Wallet details and available balance for courier bookings
   */
  async getWalletSummary(branchId = null) {
    try {
      const fullData = await this.getDashboardData(branchId);
      const { walletBalance } = fullData.data;

      return {
        walletBalance,
        currency: 'INR',
        thresholdAlert: walletBalance < 50000,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Error fetching wallet summary: ${error.message}`);
    }
  }

  /**
   * 6. Get Mock Dashboard Data
   * Directly exposes raw structured mock data without querying DB
   */
  async getMockDashboardData() {
    try {
      return {
        status: 'SUCCESS',
        mode: 'MOCK_ONLY',
        generatedAt: new Date(),
        metrics: this._getMockMetrics()
      };
    } catch (error) {
      throw new Error(`Error generating mock dashboard data: ${error.message}`);
    }
  }

  /**
   * 7. Refresh Dashboard
   * Re-calculates and persists a fresh snapshot in MongoDB (using realistic mock variation)
   */
  async refreshDashboard(userId = null, branchId = null) {
    try {
      const baseMock = this._getMockMetrics();

      const newSnapshot = await DashboardSnapshot.create({
        snapshotDate: new Date(),
        totalBookings: baseMock.totalBookings + Math.floor(Math.random() * 10),
        todaysBookings: baseMock.todaysBookings + Math.floor(Math.random() * 5),
        prepaidShipments: baseMock.prepaidShipments + Math.floor(Math.random() * 3),
        codShipments: baseMock.codShipments + Math.floor(Math.random() * 2),
        totalFreight: baseMock.totalFreight + Math.floor(Math.random() * 1000),
        codAmount: baseMock.codAmount + Math.floor(Math.random() * 500),
        walletBalance: baseMock.walletBalance,
        todaysRevenue: baseMock.todaysRevenue + Math.floor(Math.random() * 800),
        todaysProfit: baseMock.todaysProfit + Math.floor(Math.random() * 200),
        pendingPickup: baseMock.pendingPickup,
        inTransit: baseMock.inTransit,
        delivered: baseMock.delivered,
        ndr: baseMock.ndr,
        rto: baseMock.rto,
        branch: branchId,
        createdByUser: userId
      });

      return {
        message: 'Dashboard snapshot refreshed successfully.',
        snapshot: newSnapshot
      };
    } catch (error) {
      throw new Error(`Error refreshing dashboard snapshot: ${error.message}`);
    }
  }

  /**
   * 8. Dashboard Statistics
   * Provides comparative high-level ratios and percentages for executive analytics
   */
  async getDashboardStatistics(branchId = null) {
    try {
      const fullData = await this.getDashboardData(branchId);
      const d = fullData.data;

      const deliverySuccessRate = d.totalBookings > 0 ? ((d.delivered / d.totalBookings) * 100).toFixed(2) : 0;
      const ndrRate = d.totalBookings > 0 ? ((d.ndr / d.totalBookings) * 100).toFixed(2) : 0;
      const rtoRate = d.totalBookings > 0 ? ((d.rto / d.totalBookings) * 100).toFixed(2) : 0;
      const codRatio = d.totalBookings > 0 ? ((d.codShipments / d.totalBookings) * 100).toFixed(2) : 0;

      return {
        deliverySuccessRate: `${deliverySuccessRate}%`,
        ndrRate: `${ndrRate}%`,
        rtoRate: `${rtoRate}%`,
        codRatio: `${codRatio}%`,
        prepaidRatio: `${(100 - parseFloat(codRatio)).toFixed(2)}%`,
        calculatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Error calculating dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();