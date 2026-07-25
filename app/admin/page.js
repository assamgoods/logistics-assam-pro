'use client'
import { LogoMark } from '@/components/Logo'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lock, LayoutDashboard, Plus, Truck, IndianRupee, PackageCheck, PackageX, Timer, Wallet, LogOut, Printer, RefreshCw, Search, Bell, ClipboardList, Users, Building2, FileSpreadsheet, DollarSign, Trash2, ArrowRightLeft, Tag } from 'lucide-react'
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
          {tab === 'rates' && <RatesModule/>}
          {tab === 'branches' && <BranchesModule/>}
          {tab === 'transfers' && <TransfersModule/>}
          {tab === 'users' && <UsersModule/>}
          {tab === 'labels' && <LabelSizesModule/>}
          {tab === 'company' && <CompanySettingsModule/>}
          {tab === 'reports' && <ReportsModule/>}
          {tab === 'activity' && <ActivityModule/>}
          {tab === 'notifications' && <NotificationsModule/>}
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
                <Td><span className="tracking-number">{b.lrNumber}</span></Td>
                <Td>{b.date}</Td>
                <Td>{b.senderName || b.sender?.name}</Td>
                <Td>{b.receiverName || b.receiver?.name}</Td>
                <Td>{b.origin} → {b.destination}</Td>
                <Td>₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</Td>
                <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0F3D91]">{b.status}</span></Td>
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
      const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/status`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
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
  
  const set = (k,v)=>setF(x=>({...x,[k]:v}));

  const [senderSuggestions, setSenderSuggestions] = useState([])
  const [receiverSuggestions, setReceiverSuggestions] = useState([])
  const [showSenderDropdown, setShowSenderDropdown] = useState(false)
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false)
  const [pincodeErrors, setPincodeErrors] = useState({ sender: '', receiver: '' })

  const senderRef = useRef(null)
  const receiverRef = useRef(null)
  const [busy, setBusy] = useState(false);

  const weight = Number(f.chargeableWeight || f.actualWeight || 0)
  const freight = weight * Number(f.freightRate || 0)
  const subtotal = freight + Number(f.biltyCharge||0) + Number(f.doorDeliveryCharge||0) + Number(f.insurance||0) + Number(f.loadingUnloading||0) + Number(f.hamali||0) + Number(f.otherCharges||0)
  const gst = Math.round(subtotal * 0.18); 
  const total = subtotal + gst

  // Sender Autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (f.senderName && f.senderName.trim().length >= 2 && showSenderDropdown) {
        try {
          const res = await fetch(`/api/customers/search?query=${encodeURIComponent(f.senderName)}&type=Sender`);
          const data = await res.json();
          if (data.success) setSenderSuggestions(data.customers || []);
        } catch (e) {
          console.error('Error searching senders:', e);
        }
      } else {
        setSenderSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [f.senderName, showSenderDropdown]);

  // Receiver Autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (f.receiverName && f.receiverName.trim().length >= 2 && showReceiverDropdown) {
        try {
          const res = await fetch(`/api/customers/search?query=${encodeURIComponent(f.receiverName)}&type=Receiver`);
          const data = await res.json();
          if (data.success) setReceiverSuggestions(data.customers || []);
        } catch (e) {
          console.error('Error searching receivers:', e);
        }
      } else {
        setReceiverSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [f.receiverName, showReceiverDropdown]);

  // PIN Code Lookup - Sender (Debounced)
  useEffect(() => {
    const pin = f.senderPincode ? f.senderPincode.trim() : ''
    if (pin.length !== 6) {
      setPincodeErrors((prev) => ({ ...prev, sender: '' }))
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/${pin}`)
        const resData = await res.json()
        
        // Handles result whether returned from the 'pincodes' collection or API wrapper
        const doc = resData.data || resData.pincode || resData
        
        if (resData.success && doc && (doc.statename || doc.state)) {
          setF((prev) => ({
            ...prev,
            senderState: doc.statename || doc.state || '',
            senderDistrict: doc.districtname || doc.district || doc.city || '',
            senderCountry: 'India',
          }))
          setPincodeErrors((prev) => ({ ...prev, sender: '' }))
        } else {
          setPincodeErrors((prev) => ({ ...prev, sender: 'Invalid PIN Code' }))
          setF((prev) => ({ ...prev, senderState: '', senderDistrict: '', senderCountry: 'India' }))
        }
      } catch {
        setPincodeErrors((prev) => ({ ...prev, sender: 'Invalid PIN Code' }))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [f.senderPincode])

  // PIN Code Lookup - Receiver (Debounced)
  useEffect(() => {
    const pin = f.receiverPincode ? f.receiverPincode.trim() : ''
    if (pin.length !== 6) {
      setPincodeErrors((prev) => ({ ...prev, receiver: '' }))
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pincode/${pin}`)
        const resData = await res.json()

        const doc = resData.data || resData.pincode || resData

        if (resData.success && doc && (doc.statename || doc.state)) {
          setF((prev) => ({
            ...prev,
            receiverState: doc.statename || doc.state || '',
            receiverDistrict: doc.districtname || doc.district || doc.city || '',
            receiverCountry: 'India',
          }))
          setPincodeErrors((prev) => ({ ...prev, receiver: '' }))
        } else {
          setPincodeErrors((prev) => ({ ...prev, receiver: 'Invalid PIN Code' }))
          setF((prev) => ({ ...prev, receiverState: '', receiverDistrict: '', receiverCountry: 'India' }))
        }
      } catch {
        setPincodeErrors((prev) => ({ ...prev, receiver: 'Invalid PIN Code' }))
      }
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
      // Auto save / update Sender & Receiver in Customer Master
      await fetch('/api/customers/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.senderName,
          mobile: f.senderPhone,
          gst: f.senderGst,
          address: f.pickupAddress || f.senderAddress,
          pincode: f.senderPincode,
          state: f.senderState,
          district: f.senderDistrict,
          country: f.senderCountry || 'India',
          customerType: 'Sender',
        }),
      });

      await fetch('/api/customers/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.receiverName,
          mobile: f.receiverPhone,
          gst: f.receiverGst,
          address: f.deliveryAddress || f.receiverAddress,
          pincode: f.receiverPincode,
          state: f.receiverState,
          district: f.receiverDistrict,
          country: f.receiverCountry || 'India',
          customerType: 'Receiver',
        }),
      });

      const r = await fetch('/api/bookings', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          ...f, 
          sender: {
            name: f.senderName,
            phone: f.senderPhone,
            gst: f.senderGst,
            address: f.pickupAddress || f.senderAddress,
            pincode: f.senderPincode,
            state: f.senderState,
            district: f.senderDistrict,
            country: f.senderCountry
          },
          receiver: {
            name: f.receiverName,
            phone: f.receiverPhone,
            gst: f.receiverGst,
            address: f.deliveryAddress || f.receiverAddress,
            pincode: f.receiverPincode,
            state: f.receiverState,
            district: f.receiverDistrict,
            country: f.receiverCountry
          },
          totalAmount: total 
        })
      }); 
      const d = await r.json(); 
      if (d.ok || d.success) { 
        toast.success(`Booking created — ${d.booking?.lrNumber || d.lrNumber || 'Success'}`); 
        onCreated() 
      } else toast.error(d.error || d.message || 'Failed') 
    } catch { 
      toast.error('Network error') 
    } 
    setBusy(false) 
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Consignment">
        <Field label="Booking Date"><Input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></Field>
        <Field label="Invoice Number"><Input value={f.invoiceNumber} onChange={e=>set('invoiceNumber',e.target.value)}/></Field>
        <Field label="E-Way Bill No."><Input value={f.eWayBill} onChange={e=>set('eWayBill',e.target.value)}/></Field>
        <Field label="Origin City"><Input value={f.origin} onChange={e=>set('origin',e.target.value)}/></Field>
        <Field label="Destination City"><Input value={f.destination} onChange={e=>set('destination',e.target.value)}/></Field>
        <Field label="Remarks" wide><Input value={f.remarks} onChange={e=>set('remarks',e.target.value)} placeholder="Any special instructions"/></Field>
      </Section>
      
      <Section title="Sender">
        <Field label="Sender Name">
          <div className="relative" ref={senderRef}>
            <Input
              type="text"
              value={f.senderName}
              onChange={(e) => {
                set('senderName', e.target.value);
                setShowSenderDropdown(true);
              }}
              required
              autoComplete="off"
            />
            {showSenderDropdown && senderSuggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {senderSuggestions.map((cust) => (
                  <li
                    key={cust._id || cust.id}
                    onClick={() => selectSender(cust)}
                    className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b"
                  >
                    <div className="font-semibold text-gray-800">{cust.name}</div>
                    <div className="text-xs text-gray-500">{cust.mobile || cust.phone} | {cust.gst || 'No GST'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        <Field label="Sender Phone">
          <Input 
            type="text" 
            value={f.senderPhone} 
            onChange={e=>set('senderPhone', e.target.value)} 
            required
          />
        </Field>

        <Field label="Sender GST">
          <Input 
            type="text" 
            value={f.senderGst} 
            onChange={e=>set('senderGst', e.target.value.toUpperCase())} 
            className="uppercase"
          />
        </Field>

        <Field label="Pickup Address">
          <Input 
            type="text" 
            value={f.pickupAddress || f.senderAddress} 
            onChange={e=>{ set('pickupAddress', e.target.value); set('senderAddress', e.target.value); }} 
            required
          />
        </Field>

        <Field label="PIN Code">
          <Input 
            type="text" 
            maxLength={6} 
            value={f.senderPincode} 
            onChange={e=>set('senderPincode', e.target.value)} 
            required
          />
          {pincodeErrors.sender && <span className="text-xs text-red-500 mt-1 block">{pincodeErrors.sender}</span>}
        </Field>

        <Field label="City / District">
          <Input 
            type="text" 
            value={f.senderDistrict} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>

        <Field label="State">
          <Input 
            type="text" 
            value={f.senderState} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>

        <Field label="Country">
          <Input 
            type="text" 
            value={f.senderCountry || 'India'} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>
      </Section>

      <Section title="Receiver">
        <Field label="Receiver Name">
          <div className="relative" ref={receiverRef}>
            <Input
              type="text"
              value={f.receiverName}
              onChange={(e) => {
                set('receiverName', e.target.value);
                setShowReceiverDropdown(true);
              }}
              required
              autoComplete="off"
            />
            {showReceiverDropdown && receiverSuggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {receiverSuggestions.map((cust) => (
                  <li
                    key={cust._id || cust.id}
                    onClick={() => selectReceiver(cust)}
                    className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b"
                  >
                    <div className="font-semibold text-gray-800">{cust.name}</div>
                    <div className="text-xs text-gray-500">{cust.mobile || cust.phone} | {cust.gst || 'No GST'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        <Field label="Receiver Phone">
          <Input 
            type="text" 
            value={f.receiverPhone} 
            onChange={e=>set('receiverPhone', e.target.value)} 
            required
          />
        </Field>

        <Field label="Receiver GST">
          <Input 
            type="text" 
            value={f.receiverGst} 
            onChange={e=>set('receiverGst', e.target.value.toUpperCase())} 
            className="uppercase"
          />
        </Field>

        <Field label="Delivery Address">
          <Input 
            type="text" 
            value={f.deliveryAddress || f.receiverAddress} 
            onChange={e=>{ set('deliveryAddress', e.target.value); set('receiverAddress', e.target.value); }} 
            required
          />
        </Field>

        <Field label="PIN Code">
          <Input 
            type="text" 
            maxLength={6} 
            value={f.receiverPincode} 
            onChange={e=>set('receiverPincode', e.target.value)} 
            required
          />
          {pincodeErrors.receiver && <span className="text-xs text-red-500 mt-1 block">{pincodeErrors.receiver}</span>}
        </Field>

        <Field label="City / District">
          <Input 
            type="text" 
            value={f.receiverDistrict} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>

        <Field label="State">
          <Input 
            type="text" 
            value={f.receiverState} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>

        <Field label="Country">
          <Input 
            type="text" 
            value={f.receiverCountry || 'India'} 
            readOnly 
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </Field>
      </Section>
     
      <Section title="Packages & Weight">
        <Field label="Packages"><Input type="number" value={f.packages} onChange={e=>set('packages',e.target.value)}/></Field>
        <Field label="Actual Wt (kg)"><Input type="number" value={f.actualWeight} onChange={e=>set('actualWeight',e.target.value)}/></Field>
        <Field label="Volumetric Wt (kg)"><Input type="number" value={f.volumetricWeight} onChange={e=>set('volumetricWeight',e.target.value)}/></Field>
        <Field label="Chargeable Wt (kg)"><Input type="number" value={f.chargeableWeight} onChange={e=>set('chargeableWeight',e.target.value)}/></Field>
      </Section>

      <Section title="Charges">
        <Field label="Freight Rate (₹/kg)"><Input type="number" value={f.freightRate} onChange={e=>set('freightRate',e.target.value)}/></Field>
        <Field label="Bilty Charge"><Input type="number" value={f.biltyCharge} onChange={e=>set('biltyCharge',e.target.value)}/></Field>
        <Field label="Door Delivery"><Input type="number" value={f.doorDeliveryCharge} onChange={e=>set('doorDeliveryCharge',e.target.value)}/></Field>
        <Field label="Insurance"><Input type="number" value={f.insurance} onChange={e=>set('insurance',e.target.value)}/></Field>
        <Field label="Hamali (Labor)"><Input type="number" value={f.hamali} onChange={e=>set('hamali',e.target.value)}/></Field>
        <Field label="Load/Unload"><Input type="number" value={f.loadingUnloading} onChange={e=>set('loadingUnloading',e.target.value)}/></Field>
        <Field label="Other Charges"><Input type="number" value={f.otherCharges} onChange={e=>set('otherCharges',e.target.value)}/></Field>
      </Section>

      <Section title="Payment & Branch">
        <Field label="Payment Status">
          <Select value={f.paymentStatus} onValueChange={v=>set('paymentStatus',v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="TO_PAY">To Pay</SelectItem>
              <SelectItem value="TBB">TBB (To Be Billed)</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Mode">
          <Select value={f.paymentMode} onValueChange={v=>set('paymentMode',v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BANK">Bank</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Branch Code"><Input value={f.branchCode} onChange={e=>set('branchCode',e.target.value.toUpperCase())}/></Field>
        <Field label="ETA"><Input value={f.eta} onChange={e=>set('eta',e.target.value)} placeholder="3-4 days"/></Field>
      </Section>

      <Card className="border-2 border-agc-gold bg-amber-50">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Line label="Freight" value={`₹${freight.toLocaleString('en-IN')}`}/>
            <Line label="Sub Total" value={`₹${subtotal.toLocaleString('en-IN')}`}/>
            <Line label="GST 18%" value={`₹${gst.toLocaleString('en-IN')}`}/>
            <Line label="Total" value={`₹${total.toLocaleString('en-IN')}`} big/>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={busy} type="submit" className="h-12 px-8 bg-[#0F3D91] hover:bg-[#1E4FB8] text-white font-bold text-base">
          {busy ? 'Creating...' : 'Create Booking & Generate LR'}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }) { 
  return (
    <Card>
      <CardContent className="p-5">
        <div className="font-bold text-[#0F3D91] mb-4">{title}</div>
        <div className="grid md:grid-cols-4 gap-4">{children}</div>
      </CardContent>
    </Card>
  ) 
}

function Field({ label, wide, children }) { 
  return (
    <div className={wide ? 'md:col-span-4' : ''}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  ) 
}

function Line({ label, value, big }) { 
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`font-black text-[#0F3D91] ${big ? 'text-2xl' : 'text-lg'}`}>{value}</div>
    </div>
  ) 
}

function Th({ children }) { return <th className="text-left px-4 py-3 font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3">{children}</td> }

function RatesModule() {
  const [rates, setRates] = useState([])
  const [f, setF] = useState({ fromState:'Assam', toState:'', fromCity:'', toCity:'', ratePerKg:18, minBilty:550, biltyCharge:100, doorCharge:0, insurancePct:0, fuelSurcharge:0, gst:18 })
  const set = (k,v)=>setF(x=>({...x,[k]:v}))
  
  const load = () => fetch('/api/rates').then(r=>r.json()).then(d=>setRates(d.items||[]))
  useEffect(()=>{load()},[])

  const add = async (e) => { 
    e.preventDefault(); 
    const r = await fetch('/api/rates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)}); 
    if((await r.json()).ok){toast.success('Rate added'); load()} 
  }
  const del = async (id) => { await fetch(`/api/rates/${id}`, { method:'DELETE' }); load() }

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-5"><div className="font-bold text-[#0F3D91] mb-4">Add New Rate</div>
        <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><Label className="text-xs">From State</Label><Input value={f.fromState} onChange={e=>set('fromState',e.target.value)}/></div>
          <div><Label className="text-xs">To State</Label><Input value={f.toState} onChange={e=>set('toState',e.target.value)}/></div>
          <div><Label className="text-xs">From City</Label><Input value={f.fromCity} onChange={e=>set('fromCity',e.target.value)}/></div>
          <div><Label className="text-xs">To City</Label><Input value={f.toCity} onChange={e=>set('toCity',e.target.value)}/></div>
          <div><Label className="text-xs">Rate/kg</Label><Input type="number" value={f.ratePerKg} onChange={e=>set('ratePerKg',e.target.value)}/></div>
          <div><Label className="text-xs">Min Bilty</Label><Input type="number" value={f.minBilty} onChange={e=>set('minBilty',e.target.value)}/></div>
          <div><Label className="text-xs">Bilty Charge</Label><Input type="number" value={f.biltyCharge} onChange={e=>set('biltyCharge',e.target.value)}/></div>
          <div><Label className="text-xs">Door Charge</Label><Input type="number" value={f.doorCharge} onChange={e=>set('doorCharge',e.target.value)}/></div>
          <div><Label className="text-xs">Insurance %</Label><Input type="number" value={f.insurancePct} onChange={e=>set('insurancePct',e.target.value)}/></div>
          <div><Label className="text-xs">Fuel Surcharge %</Label><Input type="number" value={f.fuelSurcharge} onChange={e=>set('fuelSurcharge',e.target.value)}/></div>
          <div><Label className="text-xs">GST %</Label><Input type="number" value={f.gst} onChange={e=>set('gst',e.target.value)}/></div>
          <div className="flex items-end"><Button className="w-full bg-[#0F3D91] text-white font-bold">Add Rate</Button></div>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>From</Th><Th>To</Th><Th>₹/kg</Th><Th>Min</Th><Th>Bilty</Th><Th>Door</Th><Th>Ins%</Th><Th>Fuel%</Th><Th>GST%</Th><Th></Th></tr></thead><tbody>
        {rates.length===0 && <tr><td colSpan="10" className="p-8 text-center text-slate-400">No rates defined. Add your first route rate above.</td></tr>}
        {rates.map(r => (<tr key={r.id || r._id} className="border-t border-slate-100"><Td>{r.fromState}{r.fromCity?`, ${r.fromCity}`:''}</Td><Td>{r.toState}{r.toCity?`, ${r.toCity}`:''}</Td><Td>₹{r.ratePerKg}</Td><Td>₹{r.minBilty}</Td><Td>₹{r.biltyCharge}</Td><Td>₹{r.doorCharge}</Td><Td>{r.insurancePct}%</Td><Td>{r.fuelSurcharge}%</Td><Td>{r.gst}%</Td><Td><Button size="sm" variant="outline" onClick={()=>del(r.id || r._id)}><Trash2 className="h-3 w-3"/></Button></Td></tr>))}
      </tbody></table></CardContent></Card>
    </div>
  )
}

function BranchesModule() {
  const [items, setItems] = useState([]); 
  const [f, setF] = useState({ code:'', name:'', city:'', state:'Assam', phone:'', address:'' })

  const load = () => fetch('/api/branches').then(r=>r.json()).then(d=>setItems(d.items||[]))
  useEffect(()=>{ load() }, [])

  const add = async (e) => { 
    e.preventDefault(); 
    const r = await fetch('/api/branches', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)}); 
    if((await r.json()).ok){
      toast.success('Branch added'); 
      setF({ code:'', name:'', city:'', state:'Assam', phone:'', address:'' }); 
      load()
    } 
  }
  
  const del = async (id) => { await fetch(`/api/branches/${id}`, { method:'DELETE' }); load() }

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-5"><div className="font-bold text-[#0F3D91] mb-4">Add Branch</div>
        <form onSubmit={add} className="grid md:grid-cols-3 gap-3">
          <Input value={f.code} onChange={e=>setF(x=>({...x,code:e.target.value.toUpperCase()}))} placeholder="Branch Code (GHY01)" required/>
          <Input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Name" required/>
          <Input value={f.city} onChange={e=>setF(x=>({...x,city:e.target.value}))} placeholder="City" required/>
          <Input value={f.state} onChange={e=>setF(x=>({...x,state:e.target.value}))} placeholder="State"/>
          <Input value={f.phone} onChange={e=>setF(x=>({...x,phone:e.target.value}))} placeholder="Phone"/>
          <Input value={f.address} onChange={e=>setF(x=>({...x,address:e.target.value}))} placeholder="Address"/>
          <div className="md:col-span-3 flex justify-end"><Button className="bg-[#0F3D91] text-white font-bold">Add Branch</Button></div>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
            <tr><Th>Code</Th><Th>Name</Th><Th>City</Th><Th>Phone</Th><Th>Address</Th><Th></Th></tr>
          </thead>
          <tbody>
            {items.length===0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No branches added yet.</td></tr>}
            {items.map(b => (
              <tr key={b.id || b._id} className="border-t border-slate-100">
                <Td><span className="font-bold text-[#0F3D91]">{b.code}</span></Td>
                <Td>{b.name}</Td>
                <Td>{b.city}, {b.state}</Td>
                <Td>{b.phone}</Td>
                <Td>{b.address}</Td>
                <Td><Button size="sm" variant="outline" onClick={()=>del(b.id || b._id)}><Trash2 className="h-3 w-3"/></Button></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  )
}

function TransfersModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Branch Transfers Module</div>
      <p className="text-sm mt-1">Manage inter-branch cargo movements and manifest handovers.</p>
    </CardContent></Card>
  )
}

function UsersModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <Users className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Users & Roles Module</div>
      <p className="text-sm mt-1">Manage user access, role assignments, and permissions.</p>
    </CardContent></Card>
  )
}

function LabelSizesModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <Tag className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Label Settings Module</div>
      <p className="text-sm mt-1">Configure box sticker dimensions and thermal printer templates.</p>
    </CardContent></Card>
  )
}

function CompanySettingsModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <Building2 className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Company Settings Module</div>
      <p className="text-sm mt-1">Configure company name, GST, header branding, and admin notification emails.</p>
    </CardContent></Card>
  )
}

function ReportsModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Reports Module</div>
      <p className="text-sm mt-1">Generate comprehensive financial, shipment, and tax reports.</p>
    </CardContent></Card>
  )
}

function ActivityModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <ClipboardList className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Activity Log Module</div>
      <p className="text-sm mt-1">Track system audits, user logins, and LR state changes.</p>
    </CardContent></Card>
  )
}

function NotificationsModule() {
  return (
    <Card><CardContent className="p-6 text-center text-slate-500">
      <Bell className="h-10 w-10 mx-auto mb-2 text-[#0F3D91]"/>
      <div className="font-bold text-[#0F3D91]">Notifications Module</div>
      <p className="text-sm mt-1">Configure automated SMS, WhatsApp, and Email alerts for customers.</p>
    </CardContent></Card>
  )
}