'use client';

import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Filter, MapPin, Phone, 
  Mail, UserCheck, MoreVertical, Edit, Trash2, Shield, ChevronLeft, ChevronRight 
} from 'lucide-react';

const initialBranches = [
  {
    id: 1,
    name: 'Guwahati Central Hub',
    code: 'GHY-01',
    city: 'Guwahati',
    state: 'Assam',
    manager: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'ghy.central@assamgoodscarrier.com',
    status: 'Active',
    shipments: '1,420 / day'
  },
  {
    id: 2,
    name: 'Dibrugarh Cargo Terminal',
    code: 'DBR-02',
    city: 'Dibrugarh',
    state: 'Assam',
    manager: 'Bhaskar Hazarika',
    phone: '+91 91234 56789',
    email: 'dbr.cargo@assamgoodscarrier.com',
    status: 'Active',
    shipments: '850 / day'
  },
  {
    id: 3,
    name: 'Silchar Distribution Center',
    code: 'SLCR-03',
    city: 'Silchar',
    state: 'Assam',
    manager: 'Anirban Roy',
    phone: '+91 99887 76655',
    email: 'silchar.hub@assamgoodscarrier.com',
    status: 'Active',
    shipments: '620 / day'
  },
  {
    id: 4,
    name: 'Jorhat Express Depot',
    code: 'JRT-04',
    city: 'Jorhat',
    state: 'Assam',
    manager: 'Pranjal Bora',
    phone: '+91 97000 11223',
    email: 'jorhat.depot@assamgoodscarrier.com',
    status: 'Inactive',
    shipments: '0 / day'
  },
  {
    id: 5,
    name: 'Tinsukia Freight Station',
    code: 'TSK-05',
    city: 'Tinsukia',
    state: 'Assam',
    manager: 'Sanjay Gogoi',
    phone: '+91 94350 99887',
    email: 'tinsukia.freight@assamgoodscarrier.com',
    status: 'Active',
    shipments: '410 / day'
  }
];

export default function BranchManagementPage() {
  const [branches, setBranches] = useState(initialBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter branches based on search and status
  const filteredBranches = branches.filter((branch) => {
    const matchesSearch = 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || branch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Branch Infrastructure</h2>
          <p className="text-sm text-slate-500 mt-1">Manage Assam Goods Carrier operational hubs, terminals, and sorting depots.</p>
        </div>
        <button 
          onClick={() => alert('Add Branch modal trigger')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 hover:from-orange-700 hover:to-amber-700 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hubs</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">320+</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Terminals</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">315</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Throughput</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">45.2k Packets</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by branch name, code, city..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* Branch Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Branch & Code</th>
                <th className="py-4 px-6">City / State</th>
                <th className="py-4 px-6">Branch Manager</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Throughput</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {currentBranches.length > 0 ? (
                currentBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{branch.name}</div>
                      <div className="font-mono text-[10px] text-orange-600 mt-0.5">{branch.code}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{branch.city}</div>
                      <div className="text-[10px] text-slate-400">{branch.state}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {branch.manager.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{branch.manager}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{branch.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {branch.shipments}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        branch.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => alert(`Edit branch: ${branch.name}`)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
                              setBranches(branches.filter(b => b.id !== branch.id));
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No branches found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredBranches.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredBranches.length)}</span> of <span className="font-bold text-slate-800">{filteredBranches.length}</span> branches
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}