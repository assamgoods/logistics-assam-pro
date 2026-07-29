'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import DashboardCards from './DashboardCards';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const result = await response.json();
      setDashboardData(result.data?.data || result.data || {});
    } catch (err) {
      // Fallback mock data in case backend API is disconnected during development
      setDashboardData({
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
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/v1/dashboard/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data?.snapshot) {
          setDashboardData(result.data.snapshot);
        } else {
          await fetchDashboardData();
        }
      } else {
        await fetchDashboardData();
      }
    } catch (err) {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              Welcome, Super Admin
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-all duration-200 shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* Notice Banner when operating on fallback data */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              Connected to <strong>Mock Fallback Data Mode</strong>. Active dashboard metrics are simulated.
            </span>
          </div>
        )}

        {/* Dashboard Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-slate-600">Loading Enterprise Dashboard Metrics...</p>
          </div>
        ) : (
          /* Dashboard Cards Section */
          <DashboardCards metrics={dashboardData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;