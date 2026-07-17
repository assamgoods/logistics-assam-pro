'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, LayoutDashboard, Plus, Truck, IndianRupee, PackageCheck, PackageX, Timer, Wallet, LogOut, Printer, RefreshCw, Search, Bell, ClipboardList, Users, Building2, FileSpreadsheet, DollarSign, Trash2, Download, ArrowRightLeft, CheckCircle2, History, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STAGES = [
  { key:'BOOKED', label:'Booking Received' },{ key:'PICKED_UP', label:'Picked Up' },{ key:'WAREHOUSE', label:'In Warehouse' },
  { key:'DISPATCHED', label:'Dispatched' },{ key:'IN_TRANSIT', label:'In Transit' },{ key:'ARRIVED', label:'Arrived at Destination' },
  { key:'OUT_FOR_DELIVERY', label:'Out for Delivery' },{ key:'DELIVERED', label:'Delivered' },{ key:'CANCELLED', label:'Cancelled' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (typeof window !== 'undefined' && localStorage.getItem('agc_token')) setAuthed(true) }, [])

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
  const logout = () => { localStorage.removeItem('agc_token'); setAuthed(false) }

  if (!authed) return (
    <div className="min-h-screen gradient-navy grid place-items-center p-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <Card className="border-0 shadow-2xl shadow-black/40"><CardContent className="p-8">
          <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div><div><div className="font-black text-[#0B2545]">ASSAM GOODS CARRIER</div><div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold font-semibold">Admin Portal</div></div></div>
          <div className="mt-6 font-bold text-[#0B2545] flex items-center gap-2"><Lock className="h-4 w-4"/> Secure Login</div>
          <form onSubmit={login} className="mt-4 space-y-3">
            <div><Label className="text-xs">Admin Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="mt-1 h-11"/></div>
            <Button disabled={loading} className="w-full h-11 bg-[#0B2545] hover:bg-[#13315C] font-bold">{loading ? 'Signing in...' : 'Sign In'}</Button>
            <div className="text-xs text-slate-500 text-center">Default password: <b>assam123</b></div>
          </form>
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
    const [s, b] = await Promise.all([ fetch('/api/stats').then(r=>r.json()), fetch('/api/bookings').then(r=>r.json()) ])
    setStats(s); setBookings(b.items || [])
  }
  useEffect(() => { loadAll() }, [])
  const filtered = bookings.filter(b => { if (!q) return true; const s=q.toLowerCase(); return (b.lrNumber||'').toLowerCase().includes(s)||(b.sender?.name||'').toLowerCase().includes(s)||(b.receiver?.name||'').toLowerCase().includes(s)||(b.destination||'').toLowerCase().includes(s) })

  const tabs = [
    { k:'overview', l:'Overview', i: LayoutDashboard },
    { k:'bookings', l:'Bookings', i: Truck },
    { k:'new', l:'New Booking', i: Plus },
    { k:'rates', l:'Rate Management', i: DollarSign },
    { k:'branches', l:'Branches', i: Building2 },
    { k:'transfers', l:'Branch Transfers', i: ArrowRightLeft },
    { k:'users', l:'Users & Roles', i: Users },
    { k:'reports', l:'Reports', i: FileSpreadsheet },
    { k:'activity', l:'Activity Log', i: ClipboardList },
    { k:'notifications', l:'Notifications', i: Bell },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 gradient-navy text-white hidden lg:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div><div><div className="font-black leading-tight">AGC Admin</div><div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold">Control Panel</div></div></div>
        </div>
        <nav className="p-3 flex-1 space-y-1 text-sm overflow-y-auto">
          {tabs.map(t => (<SideItem key={t.k} icon={t.i} active={tab===t.k} onClick={()=>setTab(t.k)}>{t.l}</SideItem>))}
        </nav>
        <div className="p-3 border-t border-white/10"><Button onClick={onLogout} variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white"><LogOut className="h-4 w-4 mr-2"/>Logout</Button></div>
      </aside>

      <main className="lg:ml-64">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div><div className="text-xs uppercase tracking-widest text-agc-gold font-bold">{tabs.find(t=>t.k===tab)?.l}</div><div className="text-xl font-black text-[#0B2545]">Welcome back, Admin</div></div>
            <Button onClick={loadAll} variant="outline" className="h-9"><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
          </div>
          <div className="flex lg:hidden px-6 pb-3 gap-2 text-xs overflow-x-auto">
            {tabs.map(t => (<button key={t.k} onClick={()=>setTab(t.k)} className={`px-3 py-1 rounded-full whitespace-nowrap ${tab===t.k?'bg-[#0B2545] text-white':'bg-slate-100 text-slate-700'}`}>{t.l}</button>))}
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
          {tab === 'reports' && <ReportsModule/>}
          {tab === 'activity' && <ActivityModule/>}
          {tab === 'notifications' && <NotificationsModule/>}
        </div>
      </main>
    </div>
  )
}

function SideItem({ icon: Icon, active, children, onClick }) { return (<button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-agc-gold text-[#0B2545] font-bold' : 'text-white/80 hover:bg-white/10'}`}><Icon className="h-4 w-4"/> {children}</button>) }

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
  return (<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(({i:Ic,t,v,c},k)=>(<motion.div key={k} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:k*0.03}}><Card className="overflow-hidden border-slate-200"><CardContent className="p-5"><div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c} grid place-items-center text-white`}><Ic className="h-5 w-5"/></div><div className="mt-4 text-xs uppercase tracking-widest text-slate-500">{t}</div><div className="text-2xl font-black text-[#0B2545] mt-1">{v}</div></CardContent></Card></motion.div>))}</div>)
}

function BookingsList({ bookings, q, setQ, reload }) {
  const [selected, setSelected] = useState(null)
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bookings.map(b => ({ LR:b.lrNumber, Date:b.date, Sender:b.sender?.name, Receiver:b.receiver?.name, Origin:b.origin, Destination:b.destination, Weight:b.chargeableWeight, Amount:b.totalAmount, Status:b.status, Payment:b.paymentStatus })))
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Bookings'); XLSX.writeFile(wb, `AGC-Bookings-${new Date().toISOString().slice(0,10)}.xlsx`)
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search LR, sender, receiver, destination..." className="pl-9 h-10"/></div>
        <a href="/manifest" target="_blank" rel="noreferrer"><Button variant="outline" className="h-10"><ClipboardList className="h-4 w-4 mr-2"/>New Manifest</Button></a>
        <Button onClick={exportExcel} variant="outline" className="h-10"><FileSpreadsheet className="h-4 w-4 mr-2"/>Export Excel</Button>
      </div>
      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>LR Number</Th><Th>Date</Th><Th>Sender</Th><Th>Receiver</Th><Th>Route</Th><Th>Amount</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>
            {bookings.length === 0 && (<tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings yet. Create your first booking!</td></tr>)}
            {bookings.map(b => (<tr key={b.lrNumber} className="border-t border-slate-100 hover:bg-slate-50"><Td><span className="font-mono font-bold text-[#0B2545]">{b.lrNumber}</span></Td><Td>{b.date}</Td><Td>{b.sender?.name}</Td><Td>{b.receiver?.name}</Td><Td>{b.origin} → {b.destination}</Td><Td>₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</Td><Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0B2545]">{b.status}</span></Td><Td><div className="flex gap-1"><Button onClick={()=>setSelected(b)} size="sm" variant="outline" className="h-8">Update</Button><a href={`/print/${encodeURIComponent(b.lrNumber)}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="h-8" title="Print LR"><Printer className="h-3 w-3"/></Button></a><a href={`/sticker/${encodeURIComponent(b.lrNumber)}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="h-8" title="Box Stickers"><PackageCheck className="h-3 w-3"/></Button></a></div></Td></tr>))}
          </tbody></table></div></CardContent></Card>
      {selected && <StatusUpdater booking={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null); reload()}}/>}
    </div>
  )
}

function StatusUpdater({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status); const [location, setLocation] = useState(booking.currentLocation || ''); const [note, setNote] = useState(''); const [busy, setBusy] = useState(false)
  const save = async () => { setBusy(true); try { const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, location, note })}); const d = await r.json(); if (d.ok) { toast.success('Status updated'); onSaved() } else toast.error(d.error || 'Failed') } catch { toast.error('Network error') } setBusy(false) }
  return (<div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}><Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}><CardContent className="p-6"><div className="font-bold text-[#0B2545]">Update Shipment Status</div><div className="text-xs text-slate-500 mt-1">{booking.lrNumber}</div><div className="mt-4 space-y-3"><div><Label className="text-xs">Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs">Current Location</Label><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Guwahati Hub" className="mt-1"/></div><div><Label className="text-xs">Note</Label><Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" className="mt-1"/></div></div><div className="mt-5 flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={save} className="bg-[#0B2545] text-white font-bold">{busy?'Saving...':'Save Update'}</Button></div></CardContent></Card></div>)
}

function NewBooking({ onCreated }) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0,10), senderName:'', senderPhone:'', senderGst:'', pickupAddress:'', origin:'Guwahati', receiverName:'', receiverPhone:'', receiverGst:'', deliveryAddress:'', destination:'', invoiceNumber:'', eWayBill:'', remarks:'', packages:1, actualWeight:0, volumetricWeight:0, chargeableWeight:0, freightRate:18, biltyCharge:100, doorDeliveryCharge:0, insurance:0, loadingUnloading:0, hamali:0, otherCharges:0, paymentStatus:'PENDING', paymentMode:'CASH', eta:'', branchCode:'HO' })
  const set = (k,v)=>setF(x=>({...x,[k]:v})); const [busy, setBusy] = useState(false)
  const weight = Number(f.chargeableWeight || f.actualWeight || 0)
  const freight = weight * Number(f.freightRate || 0)
  const subtotal = freight + Number(f.biltyCharge||0) + Number(f.doorDeliveryCharge||0) + Number(f.insurance||0) + Number(f.loadingUnloading||0) + Number(f.hamali||0) + Number(f.otherCharges||0)
  const gst = Math.round(subtotal * 0.18); const total = subtotal + gst
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const r = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, totalAmount: total })}); const d = await r.json(); if (d.ok) { toast.success(`Booking created — ${d.booking.lrNumber}`); onCreated() } else toast.error(d.error || 'Failed') } catch { toast.error('Network error') } setBusy(false) }
  return (<form onSubmit={submit} className="space-y-6">
    <Section title="Consignment"><Field label="Booking Date"><Input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></Field><Field label="Invoice Number"><Input value={f.invoiceNumber} onChange={e=>set('invoiceNumber',e.target.value)}/></Field><Field label="E-Way Bill No."><Input value={f.eWayBill} onChange={e=>set('eWayBill',e.target.value)}/></Field><Field label="Origin City"><Input value={f.origin} onChange={e=>set('origin',e.target.value)}/></Field><Field label="Destination City"><Input value={f.destination} onChange={e=>set('destination',e.target.value)}/></Field><Field label="Remarks" wide><Input value={f.remarks} onChange={e=>set('remarks',e.target.value)} placeholder="Any special instructions"/></Field></Section>
    <Section title="Sender"><Field label="Name"><Input value={f.senderName} onChange={e=>set('senderName',e.target.value)} required/></Field><Field label="Phone"><Input value={f.senderPhone} onChange={e=>set('senderPhone',e.target.value)}/></Field><Field label="GST"><Input value={f.senderGst} onChange={e=>set('senderGst',e.target.value)}/></Field><Field label="Pickup Address" wide><Input value={f.pickupAddress} onChange={e=>set('pickupAddress',e.target.value)}/></Field></Section>
    <Section title="Receiver"><Field label="Name"><Input value={f.receiverName} onChange={e=>set('receiverName',e.target.value)} required/></Field><Field label="Phone"><Input value={f.receiverPhone} onChange={e=>set('receiverPhone',e.target.value)}/></Field><Field label="GST"><Input value={f.receiverGst} onChange={e=>set('receiverGst',e.target.value)}/></Field><Field label="Delivery Address" wide><Input value={f.deliveryAddress} onChange={e=>set('deliveryAddress',e.target.value)}/></Field></Section>
    <Section title="Packages & Weight"><Field label="Packages"><Input type="number" value={f.packages} onChange={e=>set('packages',e.target.value)}/></Field><Field label="Actual Wt (kg)"><Input type="number" value={f.actualWeight} onChange={e=>set('actualWeight',e.target.value)}/></Field><Field label="Volumetric Wt (kg)"><Input type="number" value={f.volumetricWeight} onChange={e=>set('volumetricWeight',e.target.value)}/></Field><Field label="Chargeable Wt (kg)"><Input type="number" value={f.chargeableWeight} onChange={e=>set('chargeableWeight',e.target.value)}/></Field></Section>
    <Section title="Charges"><Field label="Freight Rate (₹/kg)"><Input type="number" value={f.freightRate} onChange={e=>set('freightRate',e.target.value)}/></Field><Field label="Bilty Charge"><Input type="number" value={f.biltyCharge} onChange={e=>set('biltyCharge',e.target.value)}/></Field><Field label="Door Delivery"><Input type="number" value={f.doorDeliveryCharge} onChange={e=>set('doorDeliveryCharge',e.target.value)}/></Field><Field label="Insurance"><Input type="number" value={f.insurance} onChange={e=>set('insurance',e.target.value)}/></Field><Field label="Hamali (Labor)"><Input type="number" value={f.hamali} onChange={e=>set('hamali',e.target.value)}/></Field><Field label="Load/Unload"><Input type="number" value={f.loadingUnloading} onChange={e=>set('loadingUnloading',e.target.value)}/></Field><Field label="Other Charges"><Input type="number" value={f.otherCharges} onChange={e=>set('otherCharges',e.target.value)}/></Field></Section>
    <Section title="Payment & Branch"><Field label="Payment Status"><Select value={f.paymentStatus} onValueChange={v=>set('paymentStatus',v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PAID">Paid</SelectItem><SelectItem value="TO_PAY">To Pay</SelectItem><SelectItem value="TBB">TBB (To Be Billed)</SelectItem><SelectItem value="PENDING">Pending</SelectItem></SelectContent></Select></Field><Field label="Mode"><Select value={f.paymentMode} onValueChange={v=>set('paymentMode',v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="CASH">Cash</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="BANK">Bank</SelectItem><SelectItem value="CREDIT">Credit</SelectItem></SelectContent></Select></Field><Field label="Branch Code"><Input value={f.branchCode} onChange={e=>set('branchCode',e.target.value.toUpperCase())}/></Field><Field label="ETA"><Input value={f.eta} onChange={e=>set('eta',e.target.value)} placeholder="3-4 days"/></Field></Section>
    <Card className="border-2 border-agc-gold bg-amber-50"><CardContent className="p-5"><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><Line label="Freight" value={`₹${freight.toLocaleString('en-IN')}`}/><Line label="Sub Total" value={`₹${subtotal.toLocaleString('en-IN')}`}/><Line label="GST 18%" value={`₹${gst.toLocaleString('en-IN')}`}/><Line label="Total" value={`₹${total.toLocaleString('en-IN')}`} big/></div></CardContent></Card>
    <div className="flex justify-end"><Button disabled={busy} type="submit" className="h-12 px-8 bg-[#0B2545] hover:bg-[#13315C] text-white font-bold text-base">{busy ? 'Creating...' : 'Create Booking & Generate LR'}</Button></div>
  </form>)
}
function Section({ title, children }) { return (<Card><CardContent className="p-5"><div className="font-bold text-[#0B2545] mb-4">{title}</div><div className="grid md:grid-cols-4 gap-4">{children}</div></CardContent></Card>) }
function Field({ label, wide, children }) { return (<div className={wide ? 'md:col-span-4' : ''}><Label className="text-xs">{label}</Label><div className="mt-1">{children}</div></div>) }
function Line({ label, value, big }) { return (<div><div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div><div className={`font-black text-[#0B2545] ${big ? 'text-2xl' : 'text-lg'}`}>{value}</div></div>) }
function Th({ children }) { return <th className="text-left px-4 py-3 font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3">{children}</td> }

// -------------- RATES ------------------
function RatesModule() {
  const [rates, setRates] = useState([])
  const [f, setF] = useState({ fromState:'Assam', toState:'', fromCity:'', toCity:'', ratePerKg:18, minBilty:550, biltyCharge:100, doorCharge:0, insurancePct:0, fuelSurcharge:0, gst:18 })
  const set = (k,v)=>setF(x=>({...x,[k]:v}))
  const load = () => fetch('/api/rates').then(r=>r.json()).then(d=>setRates(d.items||[]))
  useEffect(()=>{load()},[])
  const add = async (e) => { e.preventDefault(); const r = await fetch('/api/rates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)}); if((await r.json()).ok){toast.success('Rate added'); load()} }
  const del = async (id) => { await fetch(`/api/rates/${id}`, { method:'DELETE' }); load() }
  return (<div className="space-y-4">
    <Card><CardContent className="p-5"><div className="font-bold text-[#0B2545] mb-4">Add New Rate</div><form onSubmit={add} className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
      <div className="flex items-end"><Button className="w-full bg-[#0B2545] text-white font-bold">Add Rate</Button></div>
    </form></CardContent></Card>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>From</Th><Th>To</Th><Th>₹/kg</Th><Th>Min</Th><Th>Bilty</Th><Th>Door</Th><Th>Ins%</Th><Th>Fuel%</Th><Th>GST%</Th><Th></Th></tr></thead><tbody>
      {rates.length===0 && <tr><td colSpan="10" className="p-8 text-center text-slate-400">No rates defined. Add your first route rate above.</td></tr>}
      {rates.map(r => (<tr key={r.id} className="border-t border-slate-100"><Td>{r.fromState}{r.fromCity?`, ${r.fromCity}`:''}</Td><Td>{r.toState}{r.toCity?`, ${r.toCity}`:''}</Td><Td>₹{r.ratePerKg}</Td><Td>₹{r.minBilty}</Td><Td>₹{r.biltyCharge}</Td><Td>₹{r.doorCharge}</Td><Td>{r.insurancePct}%</Td><Td>{r.fuelSurcharge}%</Td><Td>{r.gst}%</Td><Td><Button size="sm" variant="outline" onClick={()=>del(r.id)}><Trash2 className="h-3 w-3"/></Button></Td></tr>))}
    </tbody></table></CardContent></Card>
  </div>)
}

// -------------- BRANCHES ------------------
function BranchesModule() {
  const [items, setItems] = useState([]); const [f, setF] = useState({ code:'', name:'', city:'', state:'Assam', phone:'', address:'' })
  const load = () => fetch('/api/branches').then(r=>r.json()).then(d=>setItems(d.items||[]))
  useEffect(()=>load(), [])
  const add = async (e) => { e.preventDefault(); const r = await fetch('/api/branches', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)}); if((await r.json()).ok){toast.success('Branch added'); setF({ code:'', name:'', city:'', state:'Assam', phone:'', address:'' }); load()} }
  const del = async (id) => { await fetch(`/api/branches/${id}`, { method:'DELETE' }); load() }
  return (<div className="space-y-4">
    <Card><CardContent className="p-5"><div className="font-bold text-[#0B2545] mb-4">Add Branch</div><form onSubmit={add} className="grid md:grid-cols-3 gap-3">
      <Input value={f.code} onChange={e=>setF(x=>({...x,code:e.target.value.toUpperCase()}))} placeholder="Branch Code (GHY01)" required/>
      <Input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Name" required/>
      <Input value={f.city} onChange={e=>setF(x=>({...x,city:e.target.value}))} placeholder="City" required/>
      <Input value={f.state} onChange={e=>setF(x=>({...x,state:e.target.value}))} placeholder="State"/>
      <Input value={f.phone} onChange={e=>setF(x=>({...x,phone:e.target.value}))} placeholder="Phone"/>
      <Input value={f.address} onChange={e=>setF(x=>({...x,address:e.target.value}))} placeholder="Address"/>
      <div className="md:col-span-3 flex justify-end"><Button className="bg-[#0B2545] text-white font-bold">Add Branch</Button></div>
    </form></CardContent></Card>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>Code</Th><Th>Name</Th><Th>City</Th><Th>Phone</Th><Th>Address</Th><Th></Th></tr></thead><tbody>{items.length===0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No branches.</td></tr>}{items.map(b => (<tr key={b.id} className="border-t border-slate-100"><Td><span className="font-mono font-bold">{b.code}</span></Td><Td>{b.name}</Td><Td>{b.city}, {b.state}</Td><Td>{b.phone}</Td><Td>{b.address}</Td><Td><Button size="sm" variant="outline" onClick={()=>del(b.id)}><Trash2 className="h-3 w-3"/></Button></Td></tr>))}</tbody></table></CardContent></Card>
  </div>)
}

// -------------- USERS ------------------
function UsersModule() {
  const [items, setItems] = useState([]); const [f, setF] = useState({ name:'', role:'branch', code:'', phone:'', password:'' })
  const load = () => fetch('/api/users').then(r=>r.json()).then(d=>setItems(d.items||[]))
  useEffect(()=>load(), [])
  const add = async (e) => { e.preventDefault(); const r = await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)}); if((await r.json()).ok){toast.success('User created'); setF({ name:'', role:'branch', code:'', phone:'', password:'' }); load()} }
  const del = async (id) => { await fetch(`/api/users/${id}`, { method:'DELETE' }); load() }
  return (<div className="space-y-4">
    <Card><CardContent className="p-5"><div className="font-bold text-[#0B2545] mb-4">Create User</div><form onSubmit={add} className="grid md:grid-cols-5 gap-3">
      <Input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Full Name" required/>
      <Select value={f.role} onValueChange={v=>setF(x=>({...x,role:v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="branch">Branch Staff</SelectItem><SelectItem value="driver">Driver</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
      <Input value={f.code} onChange={e=>setF(x=>({...x,code:e.target.value.toUpperCase()}))} placeholder="Branch Code (for branch)"/>
      <Input value={f.phone} onChange={e=>setF(x=>({...x,phone:e.target.value}))} placeholder="Phone (for driver)"/>
      <Input value={f.password} onChange={e=>setF(x=>({...x,password:e.target.value}))} placeholder="Password" required/>
      <div className="md:col-span-5 flex justify-end"><Button className="bg-[#0B2545] text-white font-bold">Create User</Button></div>
    </form></CardContent></Card>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>Name</Th><Th>Role</Th><Th>Login</Th><Th>Password</Th><Th></Th></tr></thead><tbody>{items.length===0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">No users yet.</td></tr>}{items.map(u => (<tr key={u.id} className="border-t border-slate-100"><Td>{u.name}</Td><Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200">{u.role}</span></Td><Td>{u.role==='branch' ? u.code : u.phone}</Td><Td className="font-mono">{u.password}</Td><Td><Button size="sm" variant="outline" onClick={()=>del(u.id)}><Trash2 className="h-3 w-3"/></Button></Td></tr>))}</tbody></table></CardContent></Card>
  </div>)
}

// -------------- REPORTS ------------------
function ReportsModule() {
  const [type, setType] = useState('daily')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [ym, setYm] = useState(new Date().toISOString().slice(0,7))
  const [data, setData] = useState(null)

  const run = async () => {
    let u = ''
    if (type==='daily') u = `/api/reports/daily?date=${date}`
    else if (type==='monthly') u = `/api/reports/monthly?ym=${ym}`
    else if (type==='outstanding') u = `/api/reports/outstanding`
    else if (type==='branch') u = `/api/reports/branch`
    else if (type==='customer') u = `/api/reports/customer`
    const d = await fetch(u).then(r=>r.json()); setData(d)
  }
  useEffect(()=>{run()}, [type, date, ym])

  const exportExcel = () => {
    if (!data) return
    const rows = data.items || []
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `AGC-Report-${type}-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const exportPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(16); doc.setTextColor(11,37,69); doc.text('ASSAM GOODS CARRIER', 14, 15)
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Report: ${type.toUpperCase()} | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22)
    const rows = data.items || []
    const columns = rows[0] ? Object.keys(rows[0]).slice(0, 8) : []
    autoTable(doc, { startY: 28, head: [columns], body: rows.map(r => columns.map(c => String(r[c] ?? ''))), styles: { fontSize: 8 }, headStyles: { fillColor: [11,37,69] } })
    doc.save(`AGC-Report-${type}.pdf`)
  }

  const rows = data?.items || []
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 8) : []

  return (<div className="space-y-4">
    <Card><CardContent className="p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div><Label className="text-xs">Report Type</Label><Select value={type} onValueChange={setType}><SelectTrigger className="w-56 mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="daily">Daily Booking</SelectItem><SelectItem value="monthly">Monthly Booking</SelectItem><SelectItem value="outstanding">Outstanding Payments</SelectItem><SelectItem value="branch">Branch Performance</SelectItem><SelectItem value="customer">Customer-wise</SelectItem></SelectContent></Select></div>
        {type==='daily' && <div><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1"/></div>}
        {type==='monthly' && <div><Label className="text-xs">Month</Label><Input type="month" value={ym} onChange={e=>setYm(e.target.value)} className="mt-1"/></div>}
        <div className="flex-1"/>
        <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-2"/>Export Excel</Button>
        <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4 mr-2"/>Export PDF</Button>
      </div>
      {data && (
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          {data.count !== undefined && <div><b>Count:</b> {data.count}</div>}
          {data.total !== undefined && <div><b>Total:</b> ₹{Number(data.total).toLocaleString('en-IN')}</div>}
          {data.date && <div><b>Date:</b> {data.date}</div>}
          {data.ym && <div><b>Month:</b> {data.ym}</div>}
        </div>
      )}
    </CardContent></Card>

    <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr>{columns.map(c => <Th key={c}>{c}</Th>)}</tr></thead>
      <tbody>{rows.length===0 && <tr><td className="p-8 text-center text-slate-400" colSpan={columns.length||1}>No data.</td></tr>}
        {rows.map((r,i) => (<tr key={i} className="border-t border-slate-100">{columns.map(c => <Td key={c}>{typeof r[c] === 'object' ? JSON.stringify(r[c]) : String(r[c]??'')}</Td>)}</tr>))}
      </tbody></table></div></CardContent></Card>
  </div>)
}

// -------------- ACTIVITY ------------------
function ActivityModule() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/activity').then(r=>r.json()).then(d=>setItems(d.items||[])) }, [])
  return (<Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>Time</Th><Th>Actor</Th><Th>Role</Th><Th>Action</Th><Th>Target</Th></tr></thead><tbody>{items.length===0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">No activity yet.</td></tr>}{items.map(a => (<tr key={a.at + a.action + a.target} className="border-t border-slate-100"><Td>{new Date(a.at).toLocaleString('en-IN')}</Td><Td className="font-mono text-xs">{a.actor}</Td><Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200">{a.role}</span></Td><Td>{a.action}</Td><Td className="font-mono text-xs">{a.target}</Td></tr>))}</tbody></table></CardContent></Card>)
}

// -------------- NOTIFICATIONS ------------------
function NotificationsModule() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/notifications').then(r=>r.json()).then(d=>setItems(d.items||[])) }, [])
  return (<div className="space-y-3">
    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900"><b>Note:</b> Notifications are recorded and delivered in MOCK mode by default. To send real WhatsApp messages, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM in <code>/app/.env</code> and restart.</div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>Time</Th><Th>LR</Th><Th>Event</Th><Th>Channel</Th><Th>Phone</Th><Th>Status</Th><Th>Message</Th></tr></thead><tbody>{items.length===0 && <tr><td colSpan="7" className="p-8 text-center text-slate-400">No notifications yet.</td></tr>}{items.map(n => (<tr key={n.id} className="border-t border-slate-100"><Td>{new Date(n.createdAt).toLocaleString('en-IN')}</Td><Td className="font-mono">{n.lrNumber}</Td><Td>{n.event}</Td><Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200">{n.channel}</span></Td><Td>{n.phone}</Td><Td><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${n.status==='SENT'?'bg-emerald-200 text-emerald-800':n.status==='FAILED'?'bg-red-200 text-red-800':'bg-amber-200 text-amber-900'}`}>{n.status}</span></Td><Td className="max-w-md truncate text-xs text-slate-600">{n.message}</Td></tr>))}</tbody></table></CardContent></Card>
  </div>)
}

// -------------- BRANCH TRANSFERS ------------------
function TransfersModule() {
  const [tab, setTab] = useState('list')
  const [transfers, setTransfers] = useState([])
  const [branches, setBranches] = useState([])
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState({ from:'', to:'', status:'', lr:'' })
  const [historyLR, setHistoryLR] = useState(null)
  const [historyItems, setHistoryItems] = useState([])
  const [receiving, setReceiving] = useState(null)

  const load = async () => {
    const q = new URLSearchParams(Object.entries(filter).filter(([,v])=>v)).toString()
    const [t, b, bk] = await Promise.all([
      fetch(`/api/transfers${q?'?'+q:''}`).then(r=>r.json()),
      fetch('/api/branches').then(r=>r.json()),
      fetch('/api/bookings').then(r=>r.json()),
    ])
    setTransfers(t.items||[]); setBranches(b.items||[]); setBookings(bk.items||[])
  }
  useEffect(()=>{ load() }, [filter])

  const openHistory = async (lr) => {
    setHistoryLR(lr)
    const r = await fetch(`/api/bookings/${encodeURIComponent(lr)}/transfers`).then(r=>r.json())
    setHistoryItems(r.items || [])
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200">
        {[['list','All Transfers'],['create','New Transfer']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 text-sm font-semibold border-b-2 ${tab===k ? 'border-agc-gold text-[#0B2545]' : 'border-transparent text-slate-500 hover:text-[#0B2545]'}`}>{l}</button>
        ))}
      </div>

      {tab === 'create' && <NewTransferForm branches={branches} bookings={bookings} onCreated={()=>{ setTab('list'); load() }}/>}

      {tab === 'list' && (
        <>
          <Card><CardContent className="p-4">
            <div className="grid md:grid-cols-5 gap-3">
              <Input value={filter.lr} onChange={e=>setFilter(f=>({...f,lr:e.target.value}))} placeholder="LR Number"/>
              <Select value={filter.from || 'ALL'} onValueChange={v=>setFilter(f=>({...f,from:v==='ALL'?'':v}))}><SelectTrigger><SelectValue placeholder="From Branch"/></SelectTrigger><SelectContent><SelectItem value="ALL">All From</SelectItem>{branches.map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filter.to || 'ALL'} onValueChange={v=>setFilter(f=>({...f,to:v==='ALL'?'':v}))}><SelectTrigger><SelectValue placeholder="To Branch"/></SelectTrigger><SelectContent><SelectItem value="ALL">All To</SelectItem>{branches.map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filter.status || 'ALL'} onValueChange={v=>setFilter(f=>({...f,status:v==='ALL'?'':v}))}><SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="IN_TRANSIT">In Transit</SelectItem><SelectItem value="RECEIVED">Received</SelectItem></SelectContent></Select>
              <Button variant="outline" onClick={()=>setFilter({ from:'', to:'', status:'', lr:'' })}>Reset</Button>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>Transfer ID</Th><Th>LR / Bilty</Th><Th>Route</Th><Th>Dispatched</Th><Th>Received</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {transfers.length===0 && <tr><td colSpan="7" className="p-8 text-center text-slate-400">No transfers yet. Create your first transfer!</td></tr>}
                {transfers.map(t => (
                  <tr key={t.transferId} className="border-t border-slate-100 hover:bg-slate-50">
                    <Td><span className="font-mono font-bold text-[#0B2545]">{t.transferId}</span></Td>
                    <Td><button onClick={()=>openHistory(t.lrNumber)} className="font-mono font-bold text-blue-600 hover:underline">{t.lrNumber}</button></Td>
                    <Td><span className="font-semibold text-[#0B2545]">{t.fromBranch}</span> <ChevronRight className="h-3 w-3 inline mx-1"/> <span className="font-semibold text-[#0B2545]">{t.toBranch}</span></Td>
                    <Td>{new Date(t.transferredAt).toLocaleString('en-IN')}<div className="text-[10px] text-slate-500">by {t.transferredBy}</div></Td>
                    <Td>{t.receivedAt ? <div>{new Date(t.receivedAt).toLocaleString('en-IN')}<div className="text-[10px] text-slate-500">by {t.receivedBy}</div></div> : <span className="text-slate-400">—</span>}</Td>
                    <Td><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status==='RECEIVED'?'bg-emerald-200 text-emerald-800':'bg-amber-200 text-amber-900'}`}>{t.status}</span></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8" onClick={()=>openHistory(t.lrNumber)}><History className="h-3 w-3 mr-1"/>History</Button>
                        {t.status==='IN_TRANSIT' && <Button size="sm" onClick={()=>setReceiving(t)} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle2 className="h-3 w-3 mr-1"/>Receive</Button>}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </>
      )}

      {historyLR && <HistoryModal lr={historyLR} items={historyItems} onClose={()=>{setHistoryLR(null); setHistoryItems([])}}/>}
      {receiving && <ReceiveTransferModal transfer={receiving} onClose={()=>setReceiving(null)} onSaved={()=>{setReceiving(null); load()}}/>}
    </div>
  )
}

function NewTransferForm({ branches, bookings, onCreated }) {
  const [f, setF] = useState({ lrNumber:'', fromBranch:'', toBranch:'', vehicleNumber:'', driverName:'', remarks:'' })
  const set = (k,v)=>setF(x=>({...x,[k]:v}))
  const [busy, setBusy] = useState(false)
  const [lrSearch, setLrSearch] = useState('')

  const filteredBookings = bookings.filter(b => !lrSearch || b.lrNumber.toLowerCase().includes(lrSearch.toLowerCase())).slice(0, 6)

  const submit = async (e) => {
    e.preventDefault()
    if (!f.lrNumber || !f.fromBranch || !f.toBranch) return toast.error('LR, From & To branches are required')
    if (f.fromBranch === f.toBranch) return toast.error('From and To must be different branches')
    setBusy(true)
    try {
      const r = await fetch('/api/transfers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)})
      const d = await r.json()
      if (d.ok) { toast.success(`Transfer created — ${d.transfer.transferId}`); onCreated() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
    setBusy(false)
  }

  return (
    <Card><CardContent className="p-6">
      <div className="font-bold text-[#0B2545] mb-4 flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-agc-gold"/>Create Branch-to-Branch Transfer</div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label className="text-xs">Select LR / Bilty Number</Label>
          <Input value={f.lrNumber || lrSearch} onChange={e=>{ set('lrNumber',''); setLrSearch(e.target.value) }} placeholder="Type LR number to search..." className="mt-1"/>
          {!f.lrNumber && lrSearch && (
            <div className="mt-1 border border-slate-200 rounded-md max-h-40 overflow-y-auto bg-white shadow-sm">
              {filteredBookings.length===0 && <div className="p-2 text-xs text-slate-400">No bookings match</div>}
              {filteredBookings.map(b => (
                <button type="button" key={b.lrNumber} onClick={()=>{ set('lrNumber', b.lrNumber); setLrSearch(''); set('fromBranch', b.branchCode || b.currentLocation || '') }} className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 text-sm">
                  <span className="font-mono font-bold text-[#0B2545]">{b.lrNumber}</span> — {b.sender?.name} → {b.receiver?.name} <span className="text-slate-500 text-xs">({b.origin}→{b.destination}, at {b.currentLocation})</span>
                </button>
              ))}
            </div>
          )}
          {f.lrNumber && <div className="text-xs text-emerald-700 mt-1">Selected: <b className="font-mono">{f.lrNumber}</b> <button type="button" onClick={()=>{ set('lrNumber',''); setLrSearch('') }} className="text-blue-600 underline ml-2">change</button></div>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">From Branch</Label>
            <Select value={f.fromBranch || 'NONE'} onValueChange={v=>set('fromBranch', v==='NONE'?'':v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select origin branch"/></SelectTrigger>
              <SelectContent>{branches.map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name} ({b.city})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">To Branch</Label>
            <Select value={f.toBranch || 'NONE'} onValueChange={v=>set('toBranch', v==='NONE'?'':v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination branch"/></SelectTrigger>
              <SelectContent>{branches.filter(b => b.code !== f.fromBranch).map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name} ({b.city})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Vehicle Number</Label><Input value={f.vehicleNumber} onChange={e=>set('vehicleNumber', e.target.value.toUpperCase())} placeholder="e.g. AS01AB1234" className="mt-1"/></div>
          <div><Label className="text-xs">Driver Name</Label><Input value={f.driverName} onChange={e=>set('driverName', e.target.value)} placeholder="Driver in-charge" className="mt-1"/></div>
        </div>
        <div><Label className="text-xs">Remarks</Label><Input value={f.remarks} onChange={e=>set('remarks', e.target.value)} placeholder="Optional notes about this transfer" className="mt-1"/></div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <b>Tip:</b> Once created, the transfer will appear on shipment tracking timeline. The destination branch can mark it as <b>Received</b>.
        </div>

        <div className="flex justify-end gap-2">
          <Button disabled={busy} type="submit" className="bg-[#0B2545] hover:bg-[#13315C] text-white font-bold h-11 px-6"><ArrowRightLeft className="h-4 w-4 mr-2"/>{busy ? 'Creating...' : 'Create Transfer'}</Button>
        </div>
      </form>
    </CardContent></Card>
  )
}

function ReceiveTransferModal({ transfer, onClose, onSaved }) {
  const [receivedBy, setReceivedBy] = useState('')
  const [remarks, setRemarks] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch(`/api/transfers/${transfer.transferId}/receive`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ receivedBy, remarks })})
      const d = await r.json(); if (d.ok) { toast.success('Marked received'); onSaved() } else toast.error(d.error)
    } catch { toast.error('Failed') }
    setBusy(false)
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}><CardContent className="p-6">
        <div className="font-bold text-[#0B2545] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600"/>Receive Transfer</div>
        <div className="text-xs text-slate-500 mt-1 font-mono">{transfer.transferId} · LR {transfer.lrNumber}</div>
        <div className="mt-3 text-sm p-3 rounded bg-slate-50 border border-slate-200">
          <div><b>Route:</b> {transfer.fromBranch} → {transfer.toBranch}</div>
          <div className="text-xs text-slate-500 mt-1">Dispatched: {new Date(transfer.transferredAt).toLocaleString('en-IN')}</div>
          {transfer.vehicleNumber && <div className="text-xs mt-1"><b>Vehicle:</b> {transfer.vehicleNumber} · <b>Driver:</b> {transfer.driverName}</div>}
        </div>
        <div className="mt-4 space-y-3">
          <div><Label className="text-xs">Received By</Label><Input value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} placeholder="Name / Signatory" className="mt-1"/></div>
          <div><Label className="text-xs">Received Remarks</Label><Input value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Condition, package count check, etc." className="mt-1"/></div>
        </div>
        <div className="mt-5 flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={save} className="bg-emerald-600 text-white font-bold">{busy?'Saving...':'Confirm Received'}</Button></div>
      </CardContent></Card>
    </div>
  )
}

function HistoryModal({ lr, items, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-2xl my-8" onClick={e=>e.stopPropagation()}><CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-[#0B2545] flex items-center gap-2"><History className="h-4 w-4 text-agc-gold"/>Movement History</div>
            <div className="text-xs text-slate-500 mt-1 font-mono">{lr}</div>
          </div>
          <a href={`/track/${lr}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">Open Tracking →</Button></a>
        </div>
        <div className="mt-5 relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-slate-200"/>
          {items.length===0 && <div className="text-sm text-slate-400 py-4">No transfers recorded for this shipment yet.</div>}
          {items.map((t, i) => (
            <div key={t.transferId} className="relative pb-6">
              <div className={`absolute -left-4 top-0 h-4 w-4 rounded-full grid place-items-center ${t.status==='RECEIVED'?'bg-emerald-500':'bg-agc-gold'}`}>
                <ArrowRightLeft className="h-2.5 w-2.5 text-white"/>
              </div>
              <div className="ml-2">
                <div className="font-bold text-[#0B2545] text-sm">{t.fromBranch} <ChevronRight className="h-3 w-3 inline"/> {t.toBranch} <span className="font-mono text-xs text-slate-500 ml-2">{t.transferId}</span></div>
                <div className="text-xs text-slate-500">Dispatched {new Date(t.transferredAt).toLocaleString('en-IN')} by {t.transferredBy}{t.vehicleNumber?` · Vehicle ${t.vehicleNumber}`:''}{t.driverName?` · Driver ${t.driverName}`:''}</div>
                {t.remarks && <div className="text-xs text-slate-600 mt-1">📝 {t.remarks}</div>}
                {t.status==='RECEIVED' ? (
                  <div className="text-xs text-emerald-700 mt-1">✓ Received on {new Date(t.receivedAt).toLocaleString('en-IN')} by {t.receivedBy}{t.receivedRemarks?` — ${t.receivedRemarks}`:''}</div>
                ) : (
                  <div className="text-xs text-amber-700 mt-1">⏱ Awaiting confirmation at {t.toBranch}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end"><Button variant="outline" onClick={onClose}>Close</Button></div>
      </CardContent></Card>
    </div>
  )
}

