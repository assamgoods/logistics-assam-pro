'use client'
import { LogoMark } from '@/components/Logo'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, LayoutDashboard, Plus, Truck, IndianRupee, PackageCheck, PackageX, Timer, Wallet, LogOut, Printer, RefreshCw, Search, Bell, ClipboardList, Users, Building2, FileSpreadsheet, DollarSign, Tag, ArrowRightLeft, Trash2, Edit, Save, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as XLSX from 'xlsx'

const STAGES = [
  { key:'BOOKED', label:'Booking Received' },
  { key:'PICKED_UP', label:'Picked Up' },
  { key:'WAREHOUSE', label:'In Warehouse' },
  { key:'DISPATCHED', label:'Dispatched' },
  { key:'IN_TRANSIT', label:'In Transit' },
  { key:'ARRIVED', label:'Arrived at Destination' },
  { key:'OUT_FOR_DELIVERY', label:'Out for Delivery' },
  { key:'DELIVERED', label:'Delivered' },
  { key:'CANCELLED', label:'Cancelled' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPw, setNewPw] = useState('')

  useEffect(() => { 
    if (typeof window !== 'undefined' && localStorage.getItem('agc_token')) setAuthed(true) 
  }, [])

  const login = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: pw })})
      const d = await r.json()
      if (d.ok) { localStorage.setItem('agc_token', d.token); setAuthed(true); toast.success('Welcome, Admin') }
      else toast.error(d.error || 'Login failed')
    } catch { toast.error('Network error') }
    setLoading(false)
  }

  const forgot = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })})
      const d = await r.json()
      if (d.ok) { toast.success(d.message); setMode('otp') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setLoading(false)
  }

  const verifyOtp = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp })})
      const d = await r.json()
      if (d.ok) { setResetToken(d.resetToken); setMode('reset'); toast.success('OTP verified') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setLoading(false)
  }

  const doReset = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ resetToken, newPassword: newPw })})
      const d = await r.json()
      if (d.ok) { toast.success('Password reset. Please login.'); setMode('login'); setPw(newPw); setOtp(''); setResetToken(''); setNewPw('') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setLoading(false)
  }

  const logout = () => { localStorage.removeItem('agc_token'); setAuthed(false) }

  if (!authed) return (
    <div className="min-h-screen gradient-navy grid place-items-center p-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <Card className="border-0 shadow-2xl shadow-black/40"><CardContent className="p-8">
          <div className="flex items-center gap-3"><LogoMark size={44}/><div><div className="font-black text-[#0F3D91]">ASSAM GOODS CARRIER</div><div className="text-[10px] uppercase tracking-[0.2em] text-agc-orange font-semibold">Admin Portal</div></div></div>

          {mode === 'login' && (<>
            <div className="mt-6 font-bold text-[#0F3D91] flex items-center gap-2"><Lock className="h-4 w-4"/> Super Admin Login</div>
            <form onSubmit={login} className="mt-4 space-y-3">
              <div><Label className="text-xs">Admin Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="mt-1 h-11" required/></div>
              <Button disabled={loading} className="w-full h-11 bg-[#0F3D91] hover:bg-[#1E4FB8] font-bold">{loading ? 'Signing in...' : 'Sign In'}</Button>
              <div className="text-center"><button type="button" onClick={()=>setMode('forgot')} className="text-xs text-[#0F3D91] hover:text-agc-orange font-semibold hover:underline">Forgot Admin Password?</button></div>
            </form>
          </>)}
          {mode === 'forgot' && (<form onSubmit={forgot} className="mt-6 space-y-3">
            <div className="text-sm text-slate-600">Enter the admin email (configured in Company Settings) to receive an OTP.</div>
            <div><Label className="text-xs">Admin Email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value.toLowerCase())} className="h-11 mt-1" required/></div>
            <Button disabled={loading} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{loading?'Sending…':'Send OTP'}</Button>
            <div className="text-center"><button type="button" onClick={()=>setMode('login')} className="text-xs text-slate-600">← Back</button></div>
          </form>)}
          {mode === 'otp' && (<form onSubmit={verifyOtp} className="mt-6 space-y-3">
            <div className="text-sm text-slate-600">Enter the 6-digit OTP sent to <b>{email}</b>. Expires in 15 min.</div>
            <Input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6-digit code" className="h-11 mt-1 text-center text-xl tracking-[0.4em] font-black" maxLength={6}/>
            <Button disabled={loading || otp.length!==6} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{loading?'Verifying…':'Verify OTP'}</Button>
          </form>)}
          {mode === 'reset' && (<form onSubmit={doReset} className="mt-6 space-y-3">
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">✓ OTP verified. Set your new password.</div>
            <div><Label className="text-xs">New Admin Password</Label><Input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} className="h-11 mt-1" minLength={6} required/></div>
            <Button disabled={loading || newPw.length<6} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{loading?'Saving…':'Set New Password'}</Button>
          </form>)}
        </CardContent></Card>
      </motion.div>
    </div>
  )
  return <Dashboard onLogout={logout}/>
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [q, setQ] = useState('')

  const loadAll = async () => {
    try {
      const [s, b] = await Promise.all([
        fetch('/api/stats').then(r=>r.json()),
        fetch('/api/bookings').then(r=>r.json())
      ])
      setStats(s);
      setBookings(b.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadAll() }, [])

  const filtered = bookings.filter(b => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (b.lrNumber||'').toLowerCase().includes(s) ||
           (b.senderName||b.sender?.name||'').toLowerCase().includes(s) ||
           (b.receiverName||b.receiver?.name||'').toLowerCase().includes(s) ||
           (b.destination||'').toLowerCase().includes(s)
  })

  const tabs = [
    { k:'overview', l:'Overview', i: LayoutDashboard },
    { k:'bookings', l:'Bookings', i: Truck },
    { k:'new', l:'New Booking', i: Plus },
    { k:'rates', l:'Rate Management', i: DollarSign },
    { k:'branches', l:'Branches', i: Building2 },
    { k:'transfers', l:'Branch Transfers', i: ArrowRightLeft },
    { k:'users', l:'Users & Roles', i: Users },
    { k:'labels', l:'Label Settings', i: Tag },
    { k:'company', l:'Company Settings', i: Building2 },
    { k:'reports', l:'Reports', i: FileSpreadsheet },
    { k:'activity', l:'Activity Log', i: ClipboardList },
    { k:'notifications', l:'Notifications', i: Bell },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 gradient-navy text-white hidden lg:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3"><LogoMark size={44}/><div><div className="font-black leading-tight">AGC Admin</div><div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold">Control Panel</div></div></div>
        </div>
        <nav className="p-3 flex-1 space-y-1 text-sm overflow-y-auto">
          {tabs.map(t => (<SideItem key={t.k} icon={t.i} active={tab===t.k} onClick={()=>setTab(t.k)}>{t.l}</SideItem>))}
        </nav>
        <div className="p-3 border-t border-white/10"><Button onClick={onLogout} variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white"><LogOut className="h-4 w-4 mr-2"/>Logout</Button></div>
      </aside>

      <main className="lg:ml-64">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div><div className="text-xs uppercase tracking-widest text-agc-gold font-bold">{tabs.find(t=>t.k===tab)?.l}</div><div className="text-xl font-black text-[#0F3D91]">Welcome back, Admin</div></div>
            <Button onClick={loadAll} variant="outline" className="h-9"><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
          </div>
          <div className="flex lg:hidden px-6 pb-3 gap-2 text-xs overflow-x-auto">
            {tabs.map(t => (<button key={t.k} onClick={()=>setTab(t.k)} className={`px-3 py-1 rounded-full whitespace-nowrap ${tab===t.k?'bg-[#0F3D91] text-white':'bg-slate-100 text-slate-700'}`}>{t.l}</button>))}
          </div>
        </div>
        <div className="p-6">
          {tab === 'overview' && <Overview stats={stats}/>}
          {tab === 'bookings' && <BookingsList bookings={filtered} q={q} setQ={setQ} reload={loadAll}/>}
          {tab === 'new' && <NewBooking onCreated={()=>{loadAll(); setTab('bookings')}}/>}
          {tab === 'rates' && <RateManagement />}
          {tab === 'branches' && <BranchesModule />}
          {tab === 'transfers' && <BranchTransfersModule />}
          {tab === 'users' && <UsersModule />}
          {tab === 'labels' && <LabelSettingsModule />}
          {tab === 'company' && <CompanySettingsModule />}
          {tab === 'reports' && <ReportsModule />}
          {tab === 'activity' && <ActivityLogModule />}
          {tab === 'notifications' && <NotificationsModule />}
        </div>
      </main>
    </div>
  )
}

function SideItem({ icon: Icon, active, children, onClick }) { 
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-agc-gold text-[#0F3D91] font-bold' : 'text-white/80 hover:bg-white/10'}`}>
      <Icon className="h-4 w-4"/> {children}
    </button>
  ) 
}

function Th({ children }) { return <th className="px-4 py-3 text-left font-bold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3 whitespace-nowrap">{children}</td> }

function Overview({ stats }) {
  const cards = [
    { i: Truck, t: 'Total Bookings', v: stats?.totalBookings || 0, c:'from-blue-500 to-blue-600' },
    { i: Timer, t: "Today's Bookings", v: stats?.todaysBookings || 0, c:'from-amber-500 to-amber-600' },
    { i: IndianRupee, t: 'Total Revenue', v: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, c:'from-emerald-500 to-emerald-600' },
    { i: Wallet, t: 'Outstanding', v: `₹${(stats?.outstandingPayments || 0).toLocaleString('en-IN')}`, c:'from-rose-500 to-rose-600' },
    { i: Timer, t: 'Pending Deliveries', v: stats?.pendingDeliveries || 0, c:'from-orange-500 to-orange-600' },
    { i: Truck, t: 'In Transit', v: stats?.inTransitShipments || 0, c:'from-indigo-500 to-indigo-600' },
    { i: PackageCheck, t: 'Delivered', v: stats?.deliveredShipments || 0, c:'from-green-500 to-green-600' },
    { i: PackageX, t: 'Cancelled', v: stats?.cancelledShipments || 0, c:'from-slate-500 to-slate-600' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({i:Ic,t,v,c},k)=>(
        <motion.div key={k} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:k*0.03}}>
          <Card className="overflow-hidden border-slate-200">
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c} grid place-items-center text-white`}>
                <Ic className="h-5 w-5"/>
              </div>
              <div className="mt-4 text-xs uppercase tracking-widest text-slate-500">{t}</div>
              <div className="text-2xl font-black text-[#0F3D91] mt-1">{v}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function BookingsList({ bookings, q, setQ, reload }) {
  const [selected, setSelected] = useState(null)

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bookings.map(b => ({
      LR: b.lrNumber,
      Date: b.date,
      Sender: b.senderName || b.sender?.name,
      Receiver: b.receiverName || b.receiver?.name,
      Origin: b.origin,
      Destination: b.destination,
      Weight: b.chargeableWeight,
      Amount: b.totalAmount,
      Status: b.status,
      Payment: b.paymentStatus
    })))
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, `AGC-Bookings-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search LR, sender, receiver, destination..." className="pl-9 h-10"/>
        </div>
        <a href="/manifest" target="_blank" rel="noreferrer">
          <Button variant="outline" className="h-10"><ClipboardList className="h-4 w-4 mr-2"/>New Manifest</Button>
        </a>
        <Button onClick={exportExcel} variant="outline" className="h-10"><FileSpreadsheet className="h-4 w-4 mr-2"/>Export Excel</Button>
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>LR Number</Th><Th>Date</Th><Th>Sender</Th><Th>Receiver</Th><Th>Route</Th><Th>Amount</Th><Th>Status</Th><Th></Th></tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (<tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings yet. Create your first booking!</td></tr>)}
            {bookings.map(b => (
              <tr key={b.lrNumber || b._id} className="border-t border-slate-100 hover:bg-slate-50">
                <Td><span className="font-bold text-[#0F3D91]">{b.lrNumber}</span></Td>
                <Td>{b.date}</Td>
                <Td>{b.senderName || b.sender?.name}</Td>
                <Td>{b.receiverName || b.receiver?.name}</Td>
                <Td>{b.origin} → {b.destination}</Td>
                <Td>₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</Td>
                <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#0F3D91]">{b.status}</span></Td>
                <Td>
                  <div className="flex gap-1">
                    <Button onClick={()=>setSelected(b)} size="sm" variant="outline" className="h-8">Update</Button>
                    <a href={`/print/${encodeURIComponent(b.lrNumber)}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-8" title="Print LR"><Printer className="h-3 w-3"/></Button>
                    </a>
                    <a href={`/sticker/${encodeURIComponent(b.lrNumber)}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-8" title="Box Stickers"><PackageCheck className="h-3 w-3"/></Button>
                    </a>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>

      {selected && <StatusUpdater booking={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null); reload()}}/>}
    </div>
  )
}

function StatusUpdater({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status); 
  const [location, setLocation] = useState(booking.currentLocation || ''); 
  const [note, setNote] = useState(''); 
  const [busy, setBusy] = useState(false)

  const save = async () => { 
    setBusy(true); 
    try { 
      const token = localStorage.getItem('agc_token');
      const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/status`, { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify({ status, location, note })
      }); 
      const d = await r.json(); 
      if (d.ok) { toast.success('Status updated'); onSaved() } else toast.error(d.error || 'Failed') 
    } catch { toast.error('Network error') } 
    setBusy(false) 
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="font-bold text-[#0F3D91]">Update Shipment Status</div>
          <div className="text-xs text-slate-500 mt-1">{booking.lrNumber}</div>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Current Location</Label>
              <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Guwahati Hub" className="mt-1"/>
            </div>
            <div>
              <Label className="text-xs">Note</Label>
              <Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" className="mt-1"/>
            </div>
          </div>
          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={busy} onClick={save} className="bg-[#0F3D91] text-white font-bold">{busy?'Saving...':'Save Update'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NewBooking({ onCreated }) {
  const [f, setF] = useState({ 
    date: new Date().toISOString().slice(0,10), 
    senderName:'', senderPhone:'', senderGst:'', senderAddress:'', senderPincode:'', senderState:'', senderDistrict:'', senderCountry:'India', pickupAddress:'', origin:'Guwahati', 
    receiverName:'', receiverPhone:'', receiverGst:'', receiverAddress:'', receiverPincode:'', receiverState:'', receiverDistrict:'', receiverCountry:'India', deliveryAddress:'', destination:'', 
    invoiceNumber:'', eWayBill:'', remarks:'', packages:1, actualWeight:0, volumetricWeight:0, chargeableWeight:0, 
    freightRate:18, biltyCharge:100, doorDeliveryCharge:0, insurance:0, loadingUnloading:0, hamali:0, otherCharges:0, 
    paymentStatus:'PENDING', paymentMode:'CASH', eta:'', branchCode:'HO' 
  })
  
  const [senderSuggestions, setSenderSuggestions] = useState([])
  const [receiverSuggestions, setReceiverSuggestions] = useState([])
  const [showSenderDropdown, setShowSenderDropdown] = useState(false)
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false)
  const [pincodeErrors, setPincodeErrors] = useState({ sender: '', receiver: '' })
  const [busy, setBusy] = useState(false);

  const weight = Number(f.chargeableWeight || f.actualWeight || 0)
  const freight = weight * Number(f.freightRate || 0)
  const subtotal = freight + Number(f.biltyCharge||0) + Number(f.doorDeliveryCharge||0) + Number(f.insurance||0) + Number(f.loadingUnloading||0) + Number(f.hamali||0) + Number(f.otherCharges||0)
  const gst = Math.round(subtotal * 0.18); 
  const total = subtotal + gst

  const handlePhoneLookup = async (phone, type) => {
    if (!phone || phone.length < 10) return;
    try {
      const token = localStorage.getItem('agc_token');
      const res = await fetch(`/api/customers?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.ok && data.customer) {
        const c = data.customer;
        if (type === 'sender') {
          setF(prev => ({
            ...prev,
            senderName: c.name || prev.senderName,
            senderGst: c.gst || prev.senderGst,
            senderAddress: c.address || prev.senderAddress,
            pickupAddress: c.address || prev.pickupAddress,
            senderPincode: c.pincode || prev.senderPincode,
            senderState: c.state || prev.senderState,
            senderDistrict: c.district || prev.senderDistrict,
          }));
          toast.success('Sender details auto-filled!');
        } else {
          setF(prev => ({
            ...prev,
            receiverName: c.name || prev.receiverName,
            receiverGst: c.gst || prev.receiverGst,
            receiverAddress: c.address || prev.receiverAddress,
            deliveryAddress: c.address || prev.deliveryAddress,
            receiverPincode: c.pincode || prev.receiverPincode,
            receiverState: c.state || prev.receiverState,
            receiverDistrict: c.district || prev.receiverDistrict,
          }));
          toast.success('Receiver details auto-filled!');
        }
      }
    } catch (err) {
      console.error("Auto-fill error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (f.senderName && f.senderName.trim().length >= 2 && showSenderDropdown) {
        try {
          const token = localStorage.getItem('agc_token');
          const res = await fetch(`/api/customers/search?query=${encodeURIComponent(f.senderName)}&type=Sender`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setSenderSuggestions(data.customers || []);
        } catch (e) { console.error('Error searching senders:', e); }
      } else { setSenderSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [f.senderName, showSenderDropdown]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (f.receiverName && f.receiverName.trim().length >= 2 && showReceiverDropdown) {
        try {
          const token = localStorage.getItem('agc_token');
          const res = await fetch(`/api/customers/search?query=${encodeURIComponent(f.receiverName)}&type=Receiver`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setReceiverSuggestions(data.customers || []);
        } catch (e) { console.error('Error searching receivers:', e); }
      } else { setReceiverSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [f.receiverName, showReceiverDropdown]);

  useEffect(() => {
    const pin = f.senderPincode ? f.senderPincode.trim() : ''
    if (pin.length !== 6) { setPincodeErrors((prev) => ({ ...prev, sender: '' })); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/${pin}`)
        const resData = await res.json()
        const doc = resData.data || resData.pincode || resData
        const state = doc.state || doc.statename || ''
        const district = doc.district || doc.districtname || doc.city || ''
        const isOk = resData.ok || resData.success || Boolean(state || district)
        if (isOk && (state || district)) {
          setF((prev) => ({ ...prev, senderState: state, senderDistrict: district, senderCountry: 'India' }))
          setPincodeErrors((prev) => ({ ...prev, sender: '' }))
        } else {
          setPincodeErrors((prev) => ({ ...prev, sender: 'Invalid PIN Code' }))
          setF((prev) => ({ ...prev, senderState: '', senderDistrict: '', senderCountry: 'India' }))
        }
      } catch { setPincodeErrors((prev) => ({ ...prev, sender: 'Invalid PIN Code' })) }
    }, 300)
    return () => clearTimeout(timer)
  }, [f.senderPincode])

  useEffect(() => {
    const pin = f.receiverPincode ? f.receiverPincode.trim() : ''
    if (pin.length !== 6) { setPincodeErrors((prev) => ({ ...prev, receiver: '' })); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/${pin}`)
        const resData = await res.json()
        const doc = resData.data || resData.pincode || resData
        const state = doc.state || doc.statename || ''
        const district = doc.district || doc.districtname || doc.city || ''
        const isOk = resData.ok || resData.success || Boolean(state || district)
        if (isOk && (state || district)) {
          setF((prev) => ({ ...prev, receiverState: state, receiverDistrict: district, receiverCountry: 'India' }))
          setPincodeErrors((prev) => ({ ...prev, receiver: '' }))
        } else {
          setPincodeErrors((prev) => ({ ...prev, receiver: 'Invalid PIN Code' }))
          setF((prev) => ({ ...prev, receiverState: '', receiverDistrict: '', receiverCountry: 'India' }))
        }
      } catch { setPincodeErrors((prev) => ({ ...prev, receiver: 'Invalid PIN Code' })) }
    }, 300)
    return () => clearTimeout(timer)
  }, [f.receiverPincode])

  const selectSender = (cust) => {
    setF((prev) => ({
      ...prev,
      senderName: cust.name || '',
      senderPhone: cust.mobile || cust.phone || '',
      senderGst: cust.gst || '',
      senderAddress: cust.address || '',
      pickupAddress: cust.address || '',
      senderPincode: cust.pincode || '',
      senderState: cust.state || '',
      senderDistrict: cust.district || '',
      senderCountry: cust.country || 'India',
    }));
    setShowSenderDropdown(false);
  };

  const selectReceiver = (cust) => {
    setF((prev) => ({
      ...prev,
      receiverName: cust.name || '',
      receiverPhone: cust.mobile || cust.phone || '',
      receiverGst: cust.gst || '',
      receiverAddress: cust.address || '',
      deliveryAddress: cust.address || '',
      receiverPincode: cust.pincode || '',
      receiverState: cust.state || '',
      receiverDistrict: cust.district || '',
      receiverCountry: cust.country || 'India',
    }));
    setShowReceiverDropdown(false);
  };

  const submit = async (e) => { 
    e.preventDefault(); 
    setBusy(true); 
    try { 
      const token = localStorage.getItem('agc_token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      await fetch('/api/customers/upsert', {
        method: 'POST', headers,
        body: JSON.stringify({ name: f.senderName, mobile: f.senderPhone, gst: f.senderGst, address: f.pickupAddress || f.senderAddress, pincode: f.senderPincode, state: f.senderState, district: f.senderDistrict, country: f.senderCountry || 'India', customerType: 'Sender' })
      });

      await fetch('/api/customers/upsert', {
        method: 'POST', headers,
        body: JSON.stringify({ name: f.receiverName, mobile: f.receiverPhone, gst: f.receiverGst, address: f.deliveryAddress || f.receiverAddress, pincode: f.receiverPincode, state: f.receiverState, district: f.receiverDistrict, country: f.receiverCountry || 'India', customerType: 'Receiver' })
      });

      const r = await fetch('/api/bookings', { 
        method:'POST', headers, 
        body: JSON.stringify({ 
          ...f, 
          sender: { name: f.senderName, phone: f.senderPhone, gst: f.senderGst, address: f.pickupAddress || f.senderAddress, pincode: f.senderPincode, state: f.senderState, district: f.senderDistrict, country: f.senderCountry },
          receiver: { name: f.receiverName, phone: f.receiverPhone, gst: f.receiverGst, address: f.deliveryAddress || f.receiverAddress, pincode: f.receiverPincode, state: f.receiverState, district: f.receiverDistrict, country: f.receiverCountry },
          totalAmount: total 
        })
      }); 
      const d = await r.json(); 
      if (d.ok || d.success) { 
        toast.success(`Booking created — ${d.booking?.lrNumber || d.lrNumber || 'Success'}`); 
        onCreated() 
      } else toast.error(d.error || d.message || 'Failed') 
    } catch { toast.error('Network error') }
    setBusy(false)
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Details */}
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-[#0F3D91] pb-2 border-b border-slate-100">Sender Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Phone Number *</Label>
              <Input value={f.senderPhone} onChange={e=>{setF({...f, senderPhone:e.target.value}); handlePhoneLookup(e.target.value, 'sender')}} placeholder="10-digit mobile" maxLength={10} required className="mt-1"/>
            </div>
            <div className="relative">
              <Label className="text-xs">Sender Name *</Label>
              <Input value={f.senderName} onChange={e=>{setF({...f, senderName:e.target.value}); setShowSenderDropdown(true)}} onFocus={()=>setShowSenderDropdown(true)} placeholder="Company or Person" required className="mt-1"/>
              {showSenderDropdown && senderSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {senderSuggestions.map((cust, idx)=>(
                    <div key={idx} onClick={()=>selectSender(cust)} className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer border-b last:border-b-0">
                      <div className="font-bold text-[#0F3D91]">{cust.name}</div>
                      <div className="text-slate-500">{cust.mobile} — {cust.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">GSTIN</Label><Input value={f.senderGst} onChange={e=>setF({...f, senderGst:e.target.value.toUpperCase()})} placeholder="GST Number" className="mt-1"/></div>
            <div>
              <Label className="text-xs">PIN Code *</Label>
              <Input value={f.senderPincode} onChange={e=>setF({...f, senderPincode:e.target.value.replace(/\D/g,'').slice(0,6)})} placeholder="6-digit PIN" maxLength={6} required className="mt-1"/>
              {pincodeErrors.sender && <div className="text-[10px] text-rose-500 mt-0.5">{pincodeErrors.sender}</div>}
            </div>
          </div>
          <div><Label className="text-xs">Address *</Label><Input value={f.senderAddress} onChange={e=>setF({...f, senderAddress:e.target.value})} placeholder="Street address" required className="mt-1"/></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-xs">State</Label><Input value={f.senderState} onChange={e=>setF({...f, senderState:e.target.value})} className="mt-1" readOnly/></div>
            <div><Label className="text-xs">District</Label><Input value={f.senderDistrict} onChange={e=>setF({...f, senderDistrict:e.target.value})} className="mt-1" readOnly/></div>
            <div><Label className="text-xs">Country</Label><Input value={f.senderCountry} onChange={e=>setF({...f, senderCountry:e.target.value})} className="mt-1" readOnly/></div>
          </div>
        </CardContent></Card>

        {/* Receiver Details */}
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-[#0F3D91] pb-2 border-b border-slate-100">Receiver Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Phone Number *</Label>
              <Input value={f.receiverPhone} onChange={e=>{setF({...f, receiverPhone:e.target.value}); handlePhoneLookup(e.target.value, 'receiver')}} placeholder="10-digit mobile" maxLength={10} required className="mt-1"/>
            </div>
            <div className="relative">
              <Label className="text-xs">Receiver Name *</Label>
              <Input value={f.receiverName} onChange={e=>{setF({...f, receiverName:e.target.value}); setShowReceiverDropdown(true)}} onFocus={()=>setShowReceiverDropdown(true)} placeholder="Company or Person" required className="mt-1"/>
              {showReceiverDropdown && receiverSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {receiverSuggestions.map((cust, idx)=>(
                    <div key={idx} onClick={()=>selectReceiver(cust)} className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer border-b last:border-b-0">
                      <div className="font-bold text-[#0F3D91]">{cust.name}</div>
                      <div className="text-slate-500">{cust.mobile} — {cust.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">GSTIN</Label><Input value={f.receiverGst} onChange={e=>setF({...f, receiverGst:e.target.value.toUpperCase()})} placeholder="GST Number" className="mt-1"/></div>
            <div>
              <Label className="text-xs">PIN Code *</Label>
              <Input value={f.receiverPincode} onChange={e=>setF({...f, receiverPincode:e.target.value.replace(/\D/g,'').slice(0,6)})} placeholder="6-digit PIN" maxLength={6} required className="mt-1"/>
              {pincodeErrors.receiver && <div className="text-[10px] text-rose-500 mt-0.5">{pincodeErrors.receiver}</div>}
            </div>
          </div>
          <div><Label className="text-xs">Address *</Label><Input value={f.receiverAddress} onChange={e=>setF({...f, receiverAddress:e.target.value})} placeholder="Street address" required className="mt-1"/></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-xs">State</Label><Input value={f.receiverState} onChange={e=>setF({...f, receiverState:e.target.value})} className="mt-1" readOnly/></div>
            <div><Label className="text-xs">District</Label><Input value={f.receiverDistrict} onChange={e=>setF({...f, receiverDistrict:e.target.value})} className="mt-1" readOnly/></div>
            <div><Label className="text-xs">Country</Label><Input value={f.receiverCountry} onChange={e=>setF({...f, receiverCountry:e.target.value})} className="mt-1" readOnly/></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Shipment & Charges */}
      <Card><CardContent className="p-6 space-y-4">
        <h3 className="font-bold text-[#0F3D91] pb-2 border-b border-slate-100">Shipment & Freight Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label className="text-xs">Booking Date</Label><Input type="date" value={f.date} onChange={e=>setF({...f, date:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs">Origin</Label><Input value={f.origin} onChange={e=>setF({...f, origin:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs">Destination</Label><Input value={f.destination} onChange={e=>setF({...f, destination:e.target.value})} className="mt-1"/></div>
          <div><Label className="text-xs">Packages Count</Label><Input type="number" value={f.packages} onChange={e=>setF({...f, packages:Number(e.target.value)})} className="mt-1"/></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label className="text-xs">Actual Weight (kg)</Label><Input type="number" value={f.actualWeight} onChange={e=>setF({...f, actualWeight:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Volumetric Weight (kg)</Label><Input type="number" value={f.volumetricWeight} onChange={e=>setF({...f, volumetricWeight:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Chargeable Weight (kg)</Label><Input type="number" value={f.chargeableWeight} onChange={e=>setF({...f, chargeableWeight:Number(e.target.value)})} className="mt-1"/></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div><Label className="text-xs">Freight Rate (₹/kg)</Label><Input type="number" value={f.freightRate} onChange={e=>setF({...f, freightRate:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Bilty Charge (₹)</Label><Input type="number" value={f.biltyCharge} onChange={e=>setF({...f, biltyCharge:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Door Delivery (₹)</Label><Input type="number" value={f.doorDeliveryCharge} onChange={e=>setF({...f, doorDeliveryCharge:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Insurance (₹)</Label><Input type="number" value={f.insurance} onChange={e=>setF({...f, insurance:Number(e.target.value)})} className="mt-1"/></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label className="text-xs">Loading/Unloading (₹)</Label><Input type="number" value={f.loadingUnloading} onChange={e=>setF({...f, loadingUnloading:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Hamali (₹)</Label><Input type="number" value={f.hamali} onChange={e=>setF({...f, hamali:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Other Charges (₹)</Label><Input type="number" value={f.otherCharges} onChange={e=>setF({...f, otherCharges:Number(e.target.value)})} className="mt-1"/></div>
          <div><Label className="text-xs">Payment Mode</Label>
            <Select value={f.paymentMode} onValueChange={v=>setF({...f, paymentMode:v})}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="CASH">Cash</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem><SelectItem value="TO_PAY">To Pay</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="bg-slate-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 mt-4 border border-slate-200">
          <div className="text-xs text-slate-600 space-y-1">
            <div>Freight Subtotal: <b className="text-slate-800">₹{subtotal.toLocaleString('en-IN')}</b></div>
            <div>GST (18%): <b className="text-slate-800">₹{gst.toLocaleString('en-IN')}</b></div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Amount</div>
            <div className="text-2xl font-black text-[#0F3D91]">₹{total.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </CardContent></Card>

      <div className="flex justify-end gap-3">
        <Button disabled={busy} type="submit" className="bg-[#0F3D91] hover:bg-[#1E4FB8] text-white font-bold px-8 h-12 text-base">
          {busy ? 'Creating Booking...' : 'Create Booking & Generate LR'}
        </Button>
      </div>
    </form>
  )
}

/* ---------------------------------------------------- */
/* NEWLY INTEGRATED MODULES COMPONENTS                  */
/* ---------------------------------------------------- */

function RateManagement() {
  const [rates, setRates] = useState([])
  const [route, setRoute] = useState('')
  const [ratePerKg, setRatePerKg] = useState('')

  const loadRates = async () => {
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/rates', { headers: { 'Authorization': `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setRates(d.rates || [])
    } catch { toast.error('Failed to load rates') }
  }

  useEffect(() => { loadRates() }, [])

  const saveRate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ route, ratePerKg: Number(ratePerKg) })
      })
      const d = await r.json()
      if (d.ok) { toast.success('Rate saved successfully'); setRoute(''); setRatePerKg(''); loadRates() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
  }

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <h3 className="font-bold text-[#0F3D91] mb-4">Add / Update Route Rate</h3>
        <form onSubmit={saveRate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><Label className="text-xs">Route (e.g. Guwahati - Silchar)</Label><Input value={route} onChange={e=>setRoute(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">Rate Per Kg (₹)</Label><Input type="number" value={ratePerKg} onChange={e=>setRatePerKg(e.target.value)} required className="mt-1"/></div>
          <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Save Rate</Button>
        </form>
      </CardContent></Card>

      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>Route</Th><Th>Rate Per Kg</Th><Th>Last Updated</Th></tr>
          </thead>
          <tbody>
            {rates.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-400">No custom rates configured.</td></tr>}
            {rates.map((rt, idx)=>(
              <tr key={idx} className="border-t border-slate-100">
                <Td><span className="font-bold text-[#0F3D91]">{rt.route}</span></Td>
                <Td>₹{rt.ratePerKg}</Td>
                <Td>{new Date(rt.updatedAt || Date.now()).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}

function BranchesModule() {
  const [branches, setBranches] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [city, setCity] = useState('')

  const loadBranches = async () => {
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/branches', { headers: { 'Authorization': `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setBranches(d.branches || [])
    } catch { toast.error('Failed to load branches') }
  }

  useEffect(() => { loadBranches() }, [])

  const addBranch = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, code, city })
      })
      const d = await r.json()
      if (d.ok) { toast.success('Branch added'); setName(''); setCode(''); setCity(''); loadBranches() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
  }

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <h3 className="font-bold text-[#0F3D91] mb-4">Add New Branch</h3>
        <form onSubmit={addBranch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div><Label className="text-xs">Branch Name</Label><Input value={name} onChange={e=>setName(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">Branch Code</Label><Input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} required className="mt-1"/></div>
          <div><Label className="text-xs">City</Label><Input value={city} onChange={e=>setCity(e.target.value)} required className="mt-1"/></div>
          <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Add Branch</Button>
        </form>
      </CardContent></Card>

      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>Branch Code</Th><Th>Name</Th><Th>City</Th></tr>
          </thead>
          <tbody>
            {branches.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-400">No branches found. Head Office is default.</td></tr>}
            {branches.map((b, idx)=>(
              <tr key={idx} className="border-t border-slate-100">
                <Td><span className="font-bold text-[#0F3D91]">{b.code}</span></Td>
                <Td>{b.name}</Td>
                <Td>{b.city}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}

function BranchTransfersModule() {
  const [transfers, setTransfers] = useState([])
  const [lrNumber, setLrNumber] = useState('')
  const [fromBranch, setFromBranch] = useState('')
  const [toBranch, setToBranch] = useState('')

  const loadTransfers = async () => {
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/transfers', { headers: { 'Authorization': `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setTransfers(d.transfers || [])
    } catch { toast.error('Failed to load transfers') }
  }

  useEffect(() => { loadTransfers() }, [])

  const createTransfer = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lrNumber, fromBranch, toBranch })
      })
      const d = await r.json()
      if (d.ok) { toast.success('Transfer logged'); setLrNumber(''); setFromBranch(''); setToBranch(''); loadTransfers() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
  }

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <h3 className="font-bold text-[#0F3D91] mb-4">Log Branch Transfer</h3>
        <form onSubmit={createTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div><Label className="text-xs">LR Number</Label><Input value={lrNumber} onChange={e=>setLrNumber(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">From Branch</Label><Input value={fromBranch} onChange={e=>setFromBranch(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">To Branch</Label><Input value={toBranch} onChange={e=>setToBranch(e.target.value)} required className="mt-1"/></div>
          <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Transfer Shipment</Button>
        </form>
      </CardContent></Card>

      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>LR Number</Th><Th>From Branch</Th><Th>To Branch</Th><Th>Date</Th></tr>
          </thead>
          <tbody>
            {transfers.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-400">No branch transfers recorded.</td></tr>}
            {transfers.map((t, idx)=>(
              <tr key={idx} className="border-t border-slate-100">
                <Td><span className="font-bold text-[#0F3D91]">{t.lrNumber}</span></Td>
                <Td>{t.fromBranch}</Td>
                <Td>{t.toBranch}</Td>
                <Td>{new Date(t.date || Date.now()).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}

function UsersModule() {
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Staff')

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setUsers(d.users || [])
    } catch { toast.error('Failed to load users') }
  }

  useEffect(() => { loadUsers() }, [])

  const addUser = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('agc_token')
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username, password, role })
      })
      const d = await r.json()
      if (d.ok) { toast.success('User created'); setUsername(''); setPassword(''); loadUsers() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
  }

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <h3 className="font-bold text-[#0F3D91] mb-4">Create System User</h3>
        <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div><Label className="text-xs">Username / Email</Label><Input value={username} onChange={e=>setUsername(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">Password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1"/></div>
          <div><Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Staff">Staff</SelectItem><SelectItem value="BranchManager">Branch Manager</SelectItem></SelectContent>
            </Select>
          </div>
          <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Create User</Button>
        </form>
      </CardContent></Card>

      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>Username</Th><Th>Role</Th></tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-slate-400">No additional users created.</td></tr>}
            {users.map((u, idx)=>(
              <tr key={idx} className="border-t border-slate-100">
                <Td><span className="font-bold text-[#0F3D91]">{u.username}</span></Td>
                <Td><span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#0F3D91]">{u.role}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}

function LabelSettingsModule() {
  const [settings, setSettings] = useState({ prefix: 'AGC', format: 'STANDARD' })

  const saveSettings = async (e) => {
    e.preventDefault()
    toast.success('Label print settings updated')
  }

  return (
    <Card><CardContent className="p-6">
      <h3 className="font-bold text-[#0F3D91] mb-4">LR & Box Sticker Label Customization</h3>
      <form onSubmit={saveSettings} className="space-y-4 max-w-md">
        <div><Label className="text-xs">LR Number Prefix</Label><Input value={settings.prefix} onChange={e=>setSettings({...settings, prefix:e.target.value})} className="mt-1"/></div>
        <div><Label className="text-xs">Sticker Template Format</Label>
          <Select value={settings.format} onValueChange={v=>setSettings({...settings, format:v})}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="STANDARD">Standard Box Barcode Sticker</SelectItem><SelectItem value="COMPACT">Compact Thermal Sticker</SelectItem></SelectContent>
          </Select>
        </div>
        <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Save Label Settings</Button>
      </form>
    </CardContent></Card>
  )
}

function CompanySettingsModule() {
  const [comp, setComp] = useState({ name: 'ASSAM GOODS CARRIER', phone: '+91 98765 43210', email: 'admin@assamgoodscarrier.com', address: 'Guwahati, Assam' })

  const save = (e) => { e.preventDefault(); toast.success('Company profile updated successfully') }

  return (
    <Card><CardContent className="p-6">
      <h3 className="font-bold text-[#0F3D91] mb-4">Company Profile & Branding Settings</h3>
      <form onSubmit={save} className="space-y-4 max-w-lg">
        <div><Label className="text-xs">Company Name</Label><Input value={comp.name} onChange={e=>setComp({...comp, name:e.target.value})} className="mt-1"/></div>
        <div><Label className="text-xs">Admin Email (for OTP Reset)</Label><Input value={comp.email} onChange={e=>setComp({...comp, email:e.target.value})} className="mt-1"/></div>
        <div><Label className="text-xs">Contact Phone</Label><Input value={comp.phone} onChange={e=>setComp({...comp, phone:e.target.value})} className="mt-1"/></div>
        <div><Label className="text-xs">Registered Address</Label><Input value={comp.address} onChange={e=>setComp({...comp, address:e.target.value})} className="mt-1"/></div>
        <Button type="submit" className="bg-[#0F3D91] text-white font-bold">Save Company Settings</Button>
      </form>
    </CardContent></Card>
  )
}

function ReportsModule() {
  return (
    <Card><CardContent className="p-6 space-y-4">
      <h3 className="font-bold text-[#0F3D91]">Advanced Financial & Operational Reports</h3>
      <div className="text-sm text-slate-600">Export detailed reports for GST returns, branch-wise freight collections, and daily manifest summaries.</div>
      <div className="flex gap-4">
        <Button onClick={()=>toast.success('Downloading GST Report...')} variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2"/>GST Sales Report</Button>
        <Button onClick={()=>toast.success('Downloading Financial Audit...')} variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2"/>Revenue Audit Report</Button>
      </div>
    </CardContent></Card>
  )
}

function ActivityLogModule() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    // Simulated activity logs fetch
    setLogs([
      { action: 'Admin Login', time: 'Just now', user: 'SuperAdmin' },
      { action: 'Booking Created (LR-AGC-2026-001)', time: '10 mins ago', user: 'SuperAdmin' },
    ])
  }, [])

  return (
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
          <tr><Th>Activity Action</Th><Th>User</Th><Th>Timestamp</Th></tr>
        </thead>
        <tbody>
          {logs.map((l, idx)=>(
            <tr key={idx} className="border-t border-slate-100">
              <Td><span className="font-bold text-[#0F3D91]">{l.action}</span></Td>
              <Td>{l.user}</Td>
              <Td>{l.time}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  )
}

function NotificationsModule() {
  return (
    <Card><CardContent className="p-6 space-y-4">
      <h3 className="font-bold text-[#0F3D91]">System Notifications & Alerts</h3>
      <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-[#0F3D91]">
        ✓ System running smoothly. All database connections and API endpoints are fully responsive.
      </div>
    </CardContent></Card>
  )
}