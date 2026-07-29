'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, ShieldCheck, Lock, Mail, Eye, EyeOff, 
  ArrowRight, Globe, Layers, Cpu, MapPin, PackageCheck, AlertTriangle 
} from 'lucide-react';

export default function PortalLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect already authenticated users directly to /super-admin/dashboard
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedLogin = login.trim();

    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: trimmedLogin,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Invalid login credentials');
      }

      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('portalToken', data.token);
        } else {
          sessionStorage.setItem('portalToken', data.token);
          // Clean up localStorage if session-only is chosen
          localStorage.removeItem('portalToken');
        }
      }

      router.push('/super-admin/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong during login.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#060E21] font-sans antialiased text-slate-100 overflow-x-hidden relative selection:bg-orange-500 selection:text-white">
      
      {/* Background Ambient Glow & Floating Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen relative z-10">
        
        {/* LEFT SIDE: Logistics Hero & Enterprise Showcase (Col 7) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 relative border-r border-slate-800/60 bg-gradient-to-br from-[#0B1F4D]/80 via-[#060E21] to-[#040814]">
          
          {/* Top Brand Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-orange-500 uppercase block">Assam Goods Carrier</span>
              <span className="text-xs font-medium text-slate-400">Enterprise Logistics Infrastructure</span>
            </div>
          </div>

          {/* Center Graphic & Value Proposition */}
          <div className="my-auto py-12 space-y-8 max-w-2xl">
            
            {/* Floating SaaS Interactive Visual Matrix */}
            <div className="relative w-full h-72 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 text-[11px] font-mono text-slate-400">agc-gateway-prod-v4.2.0</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SYSTEM ONLINE
                </div>
              </div>

              {/* Central Map & Nodes UI simulation */}
              <div className="grid grid-cols-3 gap-4 my-auto">
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-orange-500 mb-2"><Globe className="w-5 h-5" /></div>
                  <div className="text-xs text-slate-400 font-medium">API Endpoints</div>
                  <div className="text-lg font-black text-white mt-0.5">99.98% SLA</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-blue-400 mb-2"><Cpu className="w-5 h-5" /></div>
                  <div className="text-xs text-slate-400 font-medium">Daily Requests</div>
                  <div className="text-lg font-black text-white mt-0.5">1.4M+</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-orange-400 mb-2"><MapPin className="w-5 h-5" /></div>
                  <div className="text-xs text-slate-400 font-medium">Active Hubs</div>
                  <div className="text-lg font-black text-white mt-0.5">320+ India</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5"><PackageCheck className="w-4 h-4 text-orange-500"/> Real-time freight & courier sync</span>
                <span className="font-mono text-slate-500">SECURE_TLS_1.3</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                India's Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Logistics Network</span>
              </h1>
              <p className="text-slate-400 text-base xl:text-lg max-w-xl font-normal leading-relaxed">
                Manage courier APIs, branches, wallets and shipments from one secure portal.
              </p>
            </div>
          </div>

          {/* Bottom Security Trust Badge */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Enterprise Grade OAuth2 Authentication</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Multi-Region Failover Active</span>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE: Glassmorphism Login Card (Col 5) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative bg-[#040814]/60">
          
          {/* Mobile Top Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-md">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">AGC API Portal</span>
            </div>
          </div>

          <div className="my-auto w-full max-w-md mx-auto space-y-8">
            
            {/* Header Titles */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
                <Lock className="w-3.5 h-3.5" /> Restricted Access
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="text-sm text-slate-400">Sign in to your Assam Goods Carrier API control panel.</p>
            </div>

            {/* Glassmorphism Login Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-[24px] p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Username / Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="login-identifier" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      id="login-identifier"
                      type="text" 
                      required
                      autoComplete="username"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="admin@assamgoodscarrier.com" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <a href="#forgot" className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      id="login-password"
                      type={showPassword ? 'text' : 'password'} 
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full pl-10 pr-12 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-sm py-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-slate-200 transition">Remember this device</span>
                  </label>
                </div>

                {/* Premium Gradient Login Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Portal Login</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Enterprise Security Sub-badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Secured with 256-Bit SSL Encryption</span>
            </div>

          </div>

          {/* Footer Copyright */}
          <div className="pt-8 text-center text-xs text-slate-500 border-t border-slate-800/40">
            © Assam Goods Carrier. All rights reserved.
          </div>

        </div>

      </div>

    </div>
  );
}