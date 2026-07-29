const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * 1. Get Complete Dashboard Data
   * GET /api/v1/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getDashboardData(branchId);

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. Get Today's Summary
   * GET /api/v1/dashboard/todays-summary
   */
  async getTodaysSummary(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getTodaysSummary(branchId);

      return res.status(200).json({
        success: true,
        message: "Today's summary retrieved successfully.",
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. Get Revenue Summary
   * GET /api/v1/dashboard/revenue-summary
   */
  async getRevenueSummary(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getRevenueSummary(branchId);

      return res.status(200).json({
        success: true,
        message: 'Revenue summary retrieved successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. Get Shipment Summary
   * GET /api/v1/dashboard/shipment-summary
   */
  async getShipmentSummary(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getShipmentSummary(branchId);

      return res.status(200).json({
        success: true,
        message: 'Shipment summary retrieved successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 5. Get Wallet Summary
   * GET /api/v1/dashboard/wallet-summary
   */
  async getWalletSummary(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getWalletSummary(branchId);

      return res.status(200).json({
        success: true,
        message: 'Wallet summary retrieved successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 6. Get Dashboard Statistics
   * GET /api/v1/dashboard/statistics
   */
  async getDashboardStatistics(req, res, next) {
    try {
      const branchId = req.query.branchId || req.user?.branch || null;
      const data = await dashboardService.getDashboardStatistics(branchId);

      return res.status(200).json({
        success: true,
        message: 'Dashboard statistics calculated successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 7. Refresh Dashboard Snapshot
   * POST /api/v1/dashboard/refresh
   */
  async refreshDashboard(req, res, next) {
    try {
      const userId = req.user?._id || null;
      const branchId = req.body.branchId || req.user?.branch || null;

      const data = await dashboardService.refreshDashboard(userId, branchId);

      return res.status(200).json({
        success: true,
        message: 'Dashboard snapshot refreshed successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 8. Get Courier Status (Mock Mode Response)
   * GET /api/v1/dashboard/courier-status
   */
  async getCourierStatus(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          activeCourier: 'No Courier Connected',
          apiStatus: 'MOCK MODE',
          connectionStatus: 'Disconnected',
          environment: 'Sandbox'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();