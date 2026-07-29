import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  ArrowLeft,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  Upload,
  CheckSquare,
  Lock,
  Calendar,
  Clock,
  Activity,
  PackageCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const EditStaff = ({ staffId, onBack }) => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    profilePhoto: '',
    role: 'Booking Staff',
    branch: '',
    status: 'Active',
    permissions: {
      canCreateBooking: true,
      canEditBooking: true,
      canCancelBooking: false,
      canPrintLabel: true,
      canGenerateManifest: true,
      canViewReports: false,
      canManageStaff: false,
      canManageCourierApi: false
    }
  });

  // Original Data State (For Reset)
  const [initialData, setInitialData] = useState(null);

  // Read-only Details State
  const [readOnlyDetails, setReadOnlyDetails] = useState({
    employeeId: '',
    username: '',
    createdAt: '',
    lastLogin: '',
    loginCount: 0,
    todaysBookings: 0,
    totalBookings: 0,
    todaysRevenue: 0,
    todaysProfit: 0
  });

  const [errors, setErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Currency Formatter
  const formatCurrency = (val) => {
    const numericVal = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numericVal);
  };

  // Date Formatter
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

  // Fetch Staff Data
  const fetchStaffDetails = useCallback(async () => {
    if (!staffId) return;

    setFetchLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/users/${staffId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff details.');
      }

      const user = data.user || data;

      const populatedData = {
        fullName: user.fullName || '',
        mobileNumber: user.mobileNumber || '',
        email: user.email || '',
        profilePhoto: user.profilePhoto || '',
        role: user.role || 'Booking Staff',
        branch: user.branch?._id || user.branch || '',
        status: user.status || 'Active',
        permissions: {
          canCreateBooking: user.permissions?.canCreateBooking ?? true,
          canEditBooking: user.permissions?.canEditBooking ?? true,
          canCancelBooking: user.permissions?.canCancelBooking ?? false,
          canPrintLabel: user.permissions?.canPrintLabel ?? true,
          canGenerateManifest: user.permissions?.canGenerateManifest ?? true,
          canViewReports: user.permissions?.canViewReports ?? false,
          canManageStaff: user.permissions?.canManageStaff ?? false,
          canManageCourierApi: user.permissions?.canManageCourierApi ?? false
        }
      };

      setFormData(populatedData);
      setInitialData(populatedData);

      setReadOnlyDetails({
        employeeId: user.employeeId || 'N/A',
        username: user.username || 'N/A',
        createdAt: user.createdAt || '',
        lastLogin: user.lastLogin || '',
        loginCount: user.loginCount || 0,
        todaysBookings: user.performance?.todaysBookings || 0,
        totalBookings: user.performance?.totalBookings || 0,
        todaysRevenue: user.performance?.todaysRevenue || 0,
        todaysProfit: user.performance?.todaysProfit || 0
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setFetchLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchStaffDetails();
  }, [fetchStaffDetails]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Permission Checkbox Changes
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset Changes
  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        profilePhoto: formData.profilePhoto,
        role: formData.role,
        branch: formData.branch || null,
        status: formData.status,
        permissions: formData.permissions
      };

      const response = await fetch(`/api/v1/users/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const apiErrors = {};
          data.details.forEach((err) => {
            apiErrors[err.field] = err.message;
          });
          setErrors(apiErrors);
        }
        throw new Error(data.message || data.error || 'Failed to update staff account');
      }

      setInitialData(formData);
      setSuccessMessage('Staff details updated successfully!');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-500 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Loading staff information...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Edit Staff</h1>
              <span className="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-slate-200">
                {readOnlyDetails.employeeId}
              </span>
            </div>
            <p className="text-sm text-slate-500">Update staff details, privileges, and branch mapping</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack || (() => window.history.back())}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <p className="text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Read-Only System & Performance Details Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Meta */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            Account Identifiers
          </div>
          <div>
            <div className="text-xs text-slate-500">Username</div>
            <div className="text-sm font-bold text-slate-900">@{readOnlyDetails.username}</div>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
            <span>Logins: <strong className="text-slate-800">{readOnlyDetails.loginCount}</strong></span>
            <span>Created: <strong className="text-slate-800">{formatDate(readOnlyDetails.createdAt).split(',')[0]}</strong></span>
          </div>
        </div>

        {/* Activity Meta */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Last Active
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {formatDate(readOnlyDetails.lastLogin)}
          </div>
          <div className="text-xs text-slate-400">Recorded authentication activity</div>
        </div>

        {/* Bookings Summary */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <PackageCheck className="w-3.5 h-3.5 text-indigo-500" />
            Bookings Stat
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs text-slate-500">Today: </span>
              <span className="text-lg font-bold text-indigo-600">{readOnlyDetails.todaysBookings}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Total: </span>
              <span className="text-lg font-bold text-slate-900">{readOnlyDetails.totalBookings}</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">Parcels processed by staff</div>
        </div>

        {/* Revenue & Profit Summary */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Today's Financials
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs text-slate-500">Rev: </span>
              <span className="text-sm font-bold text-emerald-600">{formatCurrency(readOnlyDetails.todaysRevenue)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Profit: </span>
              <span className="text-sm font-bold text-indigo-600">{formatCurrency(readOnlyDetails.todaysProfit)}</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">Generated today</div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 text-slate-800 ${
                    errors.fullName
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="mobileNumber"
                  placeholder="9876543210"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 text-slate-800 ${
                    errors.mobileNumber
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.mobileNumber && <p className="text-xs text-rose-500 mt-1">{errors.mobileNumber}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="john.doe@courier.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 text-slate-800 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* Profile Photo URL */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Profile Photo URL
              </label>
              <div className="relative">
                <Upload className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="profilePhoto"
                  placeholder="https://example.com/photos/john.jpg"
                  value={formData.profilePhoto}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Credentials Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            <Lock className="w-5 h-5 text-indigo-600" />
            System Credentials <span className="text-xs font-normal text-slate-400">(Read Only)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Employee ID
              </label>
              <input
                type="text"
                disabled
                value={readOnlyDetails.employeeId}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                disabled
                value={readOnlyDetails.username}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Role & Branch Mapping */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Role & Branch Assignment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Branch Manager">Branch Manager</option>
                <option value="Booking Staff">Booking Staff</option>
                <option value="Operation Staff">Operation Staff</option>
              </select>
              {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Branch Assignment
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              >
                <option value="">Head Office / Unassigned</option>
                <option value="65a1234567890abcdef12345">Delhi Main Office</option>
                <option value="65a1234567890abcdef12346">Mumbai Regional Hub</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access Permissions Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Module Permissions
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[
              { id: 'canCreateBooking', label: 'Can Create Booking' },
              { id: 'canEditBooking', label: 'Can Edit Booking' },
              { id: 'canCancelBooking', label: 'Can Cancel Booking' },
              { id: 'canPrintLabel', label: 'Can Print Label' },
              { id: 'canGenerateManifest', label: 'Can Generate Manifest' },
              { id: 'canViewReports', label: 'Can View Reports' },
              { id: 'canManageStaff', label: 'Can Manage Staff' },
              { id: 'canManageCourierApi', label: 'Can Manage Courier API' }
            ].map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={permission.id}
                  checked={formData.permissions[permission.id]}
                  onChange={handlePermissionChange}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  {permission.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={submitLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Staff...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Staff
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;