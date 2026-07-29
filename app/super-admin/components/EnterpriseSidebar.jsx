'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Building2, Users, ShieldCheck, KeyRound, 
  Package, Truck, MapPin, Search as SearchIcon, AlertCircle, RotateCcw, 
  Wallet, DollarSign, FileText, BarChart3, Settings, 
  Building, Code, User, Lock, LogOut, ChevronDown, 
  Menu, X, Bell, ChevronRight, CheckCircle2, ShieldAlert
} from 'lucide-react';

const menuGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Branches', href: '/super-admin/branches', icon: Building2 },
      { name: 'Users', href: '/super-admin/users', icon: Users, badge: '12' },
      { name: 'Roles', href: '/super-admin/roles', icon: ShieldCheck },
      { name: 'Permissions', href: '/super-admin/permissions', icon: KeyRound }
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Bookings', href: '/super-admin/bookings', icon: Package, badge: '1.4k' },
      { name: 'Pickup', href: '/super-admin/pickup', icon: Truck },
      { name: 'Delivery', href: '/super-admin/delivery', icon: MapPin },
      { name: 'Tracking', href: '/super-admin/tracking', icon: SearchIcon },
      { name: 'NDR', href: '/super-admin/ndr', icon: AlertCircle, badge: '48' },
      { name: 'RTO', href: '/super-admin/rto', icon: RotateCcw }
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Wallet', href: '/super-admin/wallet', icon: Wallet },
      { name: 'COD', href: '/super-admin/cod', icon: DollarSign },
      { name: 'Billing', href: '/super-admin/billing', icon: FileText },
      { name: 'Reports', href: '/super-admin/reports', icon: BarChart3 }
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'Company', href: '/super-admin/settings/company', icon: Building },
      { 
        name: 'Courier APIs', 
        icon: Code, 
        isExpandable: true,
        children: [
          { name: 'Delhivery', href: '/super-admin/partners/delhivery' },
          { name: 'DTDC', href: '/super-admin/partners/dtdc' },
          { name: 'XpressBees', href: '/super-admin/partners/xpressbees' },
          { name: 'Ecom', href: '/super-admin/partners/ecom' },
          { name: 'Shadowfax', href: '/super-admin/partners/shadowfax' },
          { name: 'Blue Dart', href: '/super-admin/partners/bluedart' }
        ]
      },
      { name: 'API Settings', href: '/super-admin/settings/api', icon: Code },
      { name: 'Profile', href: '/super-admin/settings/profile', icon: User },
      { name: 'Change Password', href: '/super-admin/settings/password', icon: Lock }
    ]
  }
];

// Reusable Company Logo Component
function AGCLogo({ className = "w-10 h-10" }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px)] bg-[size:4px_4px]"></div>
      <div className="flex flex-col items-center justify-center text-white relative z-10 leading-none">
        <span className="font-black tracking-tighter text-sm">AGC</span>
        <span className="text-[7px] font-bold tracking-widest opacity-90">LOGISTICS</span>
      </div>
    </div>
  );
}

// Reusable Breadcrumb Component
function Breadcrumb({ pathname }) {
  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
      <Link href="/super-admin/dashboard" className="hover:text-slate-800 transition">Portal</Link>
      {segments.map((seg, idx) => {
        const formatted = seg.replace(/-/g, ' ').toUpperCase();
        const isLast = idx === segments.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className={isLast ? 'text-slate-900 font-bold' : 'capitalize'}>
              {formatted}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Get dynamic title based on path
function getPageTitle(pathname) {
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return item.name;
      if (item.children) {
        const childMatch = item.children.find(c => c.href === pathname);
        if (childMatch) return `${item.name}: ${childMatch.name}`;
      }
    }
  }
  return 'Dashboard Overview';
}

export default function EnterpriseSidebar({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: 'Super Admin', role: 'System Administrator' });
  const [expandedMenus, setExpandedMenus] = useState({ 'Courier APIs': true });

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('portalAdminName');
      const storedRole = localStorage.getItem('portalAdminRole');
      if (storedName || storedRole) {
        setAdminUser({
          name: storedName || 'Super Admin',
          role: storedRole || 'System Administrator'
        });
      }
    } catch {
      // Fallback gracefully
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (name) => {
    if (isCollapsed) return;
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    router.push('/portal/login');
  };

  const dynamicTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Component */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col
        bg-[#090D16] border-r border-slate-800/80 text-slate-300
        transition-all duration-300 ease-in-out shadow-2xl
        ${isCollapsed ? 'w-20' : 'w-[280px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Sidebar Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#060A12]">
          <div className="flex items-center gap-3 overflow-hidden">
            <AGCLogo className="w-10 h-10 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-black tracking-widest text-orange-500 uppercase truncate">Assam Goods</span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider">ERP ENTERPRISE</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer shadow-sm"
            aria-label="Toggle Sidebar"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-90'}`} />
          </button>

          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                  {group.title}
                </h3>
              )}
              {group.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                const hasChildren = item.isExpandable && item.children;
                const isExpanded = expandedMenus[item.name];
                const isChildActive = hasChildren && item.children.some(child => pathname === child.href);

                return (
                  <div key={itemIdx} className="space-y-1">
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all duration-200 group cursor-pointer
                            ${isChildActive 
                              ? 'bg-slate-800/80 text-white font-bold shadow-sm border border-slate-700/50' 
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                            }
                            ${isCollapsed ? 'justify-center px-0' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isChildActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>

                        {!isCollapsed && isExpanded && (
                          <div className="pl-9 pr-2 py-1 space-y-1 mt-1 border-l border-slate-800/80 ml-5">
                            {item.children.map((child, childIdx) => {
                              const isSubActive = pathname === child.href;
                              return (
                                <Link
                                  key={childIdx}
                                  href={child.href}
                                  className={`
                                    block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                    ${isSubActive 
                                      ? 'text-orange-400 bg-orange-500/10 font-bold shadow-sm' 
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                                    }
                                  `}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        title={isCollapsed ? item.name : undefined}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20 font-bold' 
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                          }
                          ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-orange-400 border border-slate-700/60'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Logout Action Item */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 group cursor-pointer
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && <span className="truncate font-semibold">Logout System</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Admin Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060A12]">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-blue-500/30">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-200 truncate">{adminUser.name}</span>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight truncate">{adminUser.role}</span>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* Main Content Layout Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]'}`}>
        
        {/* Top Header Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="space-y-0.5">
              <Breadcrumb pathname={pathname} />
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{dynamicTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Global Search */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs w-64 shadow-xs">
              <SearchIcon className="w-4 h-4 text-slate-400" />
              <span className="truncate">Search waybill, branch, user...</span>
              <span className="ml-auto px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500">⌘K</span>
            </div>

            {/* Notification Dropdown Container */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileOpen(false); }}
                className="relative w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Notifications</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    <div className="p-3 hover:bg-slate-50 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Delhivery API Synced</p>
                        <p className="text-[11px] text-slate-500">All 1,420 manifests updated successfully.</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">2 mins ago</span>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-slate-50 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">NDR Spike Detected</p>
                        <p className="text-[11px] text-slate-500">Guwahati hub reported 12 delayed deliveries.</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">15 mins ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 px-4 border-t border-slate-100 text-center">
                    <button className="text-xs font-bold text-orange-600 hover:text-orange-700 transition">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationOpen(false); }}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
                aria-label="User Menu"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {adminUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-bold text-slate-800 block leading-none">{adminUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{adminUser.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                    <p className="text-xs font-bold text-slate-800">{adminUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{adminUser.role}</p>
                  </div>
                  <Link href="/super-admin/settings/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                    <User className="w-4 h-4 text-slate-400" /> My Profile
                  </Link>
                  <Link href="/super-admin/settings/password" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                    <Lock className="w-4 h-4 text-slate-400" /> Change Password
                  </Link>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                    <LogOut className="w-4 h-4 text-rose-500" /> Logout Session
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Page Content View (White Background) */}
        <main className="flex-1 p-6 md:p-10 bg-white text-slate-900">
          {children}
        </main>

      </div>

    </div>
  );
}