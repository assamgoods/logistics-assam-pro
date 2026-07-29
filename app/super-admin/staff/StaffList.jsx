import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  RotateCw,
  Search,
  Filter,
  XCircle,
  Eye,
  Edit,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  Loader2
} from 'lucide-react';

const StaffList = () => {
  // State Management
  const [staffList, setStaffList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters and Pagination State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Formatting Utilities
  const formatCurrency = (val) => {
    const numericVal = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numericVal);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch Staff Data from API
  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(role && { role }),
        ...(branch && { branch }),
        ...(status && { status })
      });

      const response = await fetch(`/api/v1/users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff members');
      }

      setStaffList(data.users || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, branch, status]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Filter Actions
  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setBranch('');
    setStatus('');
    setPage(1);
  };

  // Action Handlers
  const handleView = (id) => {
    console.log(`View Staff ID: ${id}`);
  };

  const handleEdit = (id) => {
    console.log(`Edit Staff ID: ${id}`);
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Are you sure you want to reset password for this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: 'TempPassword123!' })
      });

      if (response.ok) {
        alert('Password reset successfully to: TempPassword123!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || 'Failed to reset password'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        fetchStaffData();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || 'Failed to change status'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this staff account?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchStaffData();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || 'Failed to delete staff'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                {totalCount} Total
              </span>
            </div>
            <p className="text-sm text-slate-500">Manage internal team members, access roles, and monitor performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaffData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => console.log('Open Add Staff Modal')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter & Search Staff
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Username, Mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Booking Staff">Booking Staff</option>
              <option value="Operation Staff">Operation Staff</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="">All Branches</option>
              <option value="MAIN_DELHI">Delhi Main Office</option>
              <option value="MUMBAI_HUB">Mumbai Central Hub</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Action */}
        {(search || role || branch || status) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Staff Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading staff details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500 space-y-2">
            <ShieldAlert className="w-10 h-10" />
            <p className="text-base font-semibold">Error Loading Data</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
            <Users className="w-12 h-12 text-slate-300" />
            <p className="text-base font-semibold text-slate-600">No Staff Found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4 text-center">Today's Booking</th>
                  <th className="py-3.5 px-4 text-center">Total Booking</th>
                  <th className="py-3.5 px-4 text-right">Revenue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee ID */}
                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      {staff.employeeId || 'N/A'}
                    </td>

                    {/* Full Name */}
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">
                      {staff.fullName}
                    </td>

                    {/* Username */}
                    <td className="py-3.5 px-4 text-slate-500">
                      @{staff.username}
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {staff.mobileNumber}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {staff.role}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {staff.branch?.name || 'Unassigned'}
                      </div>
                    </td>

                    {/* Today's Booking */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      {staff.performance?.todaysBookings || 0}
                    </td>

                    {/* Total Booking */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      {staff.performance?.totalBookings || 0}
                    </td>

                    {/* Revenue */}
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(staff.performance?.todaysRevenue || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          staff.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(staff.lastLogin)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(staff._id)}
                          title="View Staff Profile"
                          className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(staff._id)}
                          title="Edit Staff"
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(staff._id)}
                          title="Reset Password"
                          className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(staff._id, staff.status)}
                          title={staff.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            staff.status === 'Active'
                              ? 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                              : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                          }`}
                        >
                          {staff.status === 'Active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          title="Delete Staff"
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && staffList.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing Page <span className="font-bold text-slate-800">{page}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} Staff Records)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">
                {page}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;