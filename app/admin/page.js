'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, LayoutDashboard, Plus, Truck, IndianRupee, PackageCheck, PackageX, Timer, Wallet, LogOut, Printer, RefreshCw, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STAGES = [
  { key: 'BOOKED', label: 'Booking Received' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'WAREHOUSE', label: 'In Warehouse' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'ARRIVED', label: 'Arrived at Destination' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)

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

  const logout = () => { localStorage.removeItem('agc_token'); setAuthed(false) }

  if (!authed) {
    return (
      <div className="min-h-screen gradient-navy grid place-items-center p-4">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
          <Card className="border-0 shadow-2xl shadow-black/40">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div>
                <div>
                  <div className="font-black text-[#0B2545]">ASSAM GOODS CARRIER</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold font-semibold">Admin Portal</div>
                </div>
              </div>
              <div className="mt-6 font-bold text-[#0B2545] flex items-center gap-2"><Lock className="h-4 w-4"/> Secure Login</div>
              <form onSubmit={login} className="mt-4 space-y-3">
                <div>
                  <Label className="text-xs">Admin Password</Label>
                  <Input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter password" className="mt-1 h-11"/>
                </div>
                <Button disabled={loading} className="w-full h-11 bg-[#0B2545] hover:bg-[#13315C] font-bold">{loading ? 'Signing in...' : 'Sign In'}</Button>
                <div className="text-xs text-slate-500 text-center">Default password: <b>assam123</b> (change in production)</div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <Dashboard onLogout={logout}/>
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [q, setQ] = useState('')

  const loadAll = async () => {
    const [s, b] = await Promise.all([
      fetch('/api/stats').then(r=>r.json()),
      fetch('/api/bookings').then(r=>r.json()),
    ])
    setStats(s); setBookings(b.items || [])
  }

  useEffect(() => { loadAll() }, [])

  const filtered = bookings.filter(b => {
    if (!q) return true
    const s = q.toLowerCase()
    return (b.lrNumber||'').toLowerCase().includes(s) || (b.sender?.name||'').toLowerCase().includes(s) || (b.receiver?.name||'').toLowerCase().includes(s) || (b.destination||'').toLowerCase().includes(s)
  })

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 gradient-navy text-white hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div>
            <div>
              <div className="font-black leading-tight">AGC Admin</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold">Control Panel</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1 text-sm">
          <SideItem icon={LayoutDashboard} active={tab==='overview'} onClick={()=>setTab('overview')}>Overview</SideItem>
          <SideItem icon={Truck} active={tab==='bookings'} onClick={()=>setTab('bookings')}>Bookings</SideItem>
          <SideItem icon={Plus} active={tab==='new'} onClick={()=>setTab('new')}>New Booking</SideItem>
        </nav>
        <div className="p-3 border-t border-white/10">
          <Button onClick={onLogout} variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white"><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
        </div>
      </aside>

      <main className="md:ml-64">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-agc-gold font-bold">{tab === 'overview' ? 'Dashboard' : tab === 'new' ? 'Create Booking' : 'All Bookings'}</div>
              <div className="text-xl font-black text-[#0B2545]">Welcome back, Admin</div>
            </div>
            <Button onClick={loadAll} variant="outline" className="h-9"><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
          </div>
          <div className="flex md:hidden px-6 pb-3 gap-2 text-xs">
            {['overview','bookings','new'].map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded-full ${tab===t?'bg-[#0B2545] text-white':'bg-slate-100 text-slate-700'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === 'overview' && <Overview stats={stats}/>}
          {tab === 'bookings' && <BookingsList bookings={filtered} q={q} setQ={setQ} reload={loadAll}/>}
          {tab === 'new' && <NewBooking onCreated={() => { loadAll(); setTab('bookings') }}/>}
        </div>
      </main>
    </div>
  )
}

function SideItem({ icon: Icon, active, children, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-agc-gold text-[#0B2545] font-bold' : 'text-white/80 hover:bg-white/10'}`}>
      <Icon className="h-4 w-4"/> {children}
    </button>
  )
}

function Overview({ stats }) {
  const cards = [
    { i: Truck, t: 'Total Bookings', v: stats?.totalBookings || 0, c: 'from-blue-500 to-blue-600' },
    { i: Timer, t: "Today's Bookings", v: stats?.todaysBookings || 0, c: 'from-amber-500 to-amber-600' },
    { i: IndianRupee, t: 'Total Revenue', v: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, c: 'from-emerald-500 to-emerald-600' },
    { i: Wallet, t: 'Outstanding', v: `₹${(stats?.outstandingPayments || 0).toLocaleString('en-IN')}`, c: 'from-rose-500 to-rose-600' },
    { i: Timer, t: 'Pending Deliveries', v: stats?.pendingDeliveries || 0, c: 'from-orange-500 to-orange-600' },
    { i: Truck, t: 'In Transit', v: stats?.inTransitShipments || 0, c: 'from-indigo-500 to-indigo-600' },
    { i: PackageCheck, t: 'Delivered', v: stats?.deliveredShipments || 0, c: 'from-green-500 to-green-600' },
    { i: PackageX, t: 'Cancelled', v: stats?.cancelledShipments || 0, c: 'from-slate-500 to-slate-600' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({i:Ic,t,v,c},k)=>(
        <motion.div key={k} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:k*0.03}}>
          <Card className="overflow-hidden border-slate-200">
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${c} grid place-items-center text-white`}><Ic className="h-5 w-5"/></div>
              <div className="mt-4 text-xs uppercase tracking-widest text-slate-500">{t}</div>
              <div className="text-2xl font-black text-[#0B2545] mt-1">{v}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function BookingsList({ bookings, q, setQ, reload }) {
  const [selected, setSelected] = useState(null)
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by LR, sender, receiver, destination..." className="pl-9 h-10"/>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
                <tr>
                  <Th>LR Number</Th><Th>Date</Th><Th>Sender</Th><Th>Receiver</Th><Th>Route</Th><Th>Amount</Th><Th>Status</Th><Th></Th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (<tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings yet. Create your first booking!</td></tr>)}
                {bookings.map(b => (
                  <tr key={b.lrNumber} className="border-t border-slate-100 hover:bg-slate-50">
                    <Td><span className="font-mono font-bold text-[#0B2545]">{b.lrNumber}</span></Td>
                    <Td>{b.date}</Td>
                    <Td>{b.sender?.name}</Td>
                    <Td>{b.receiver?.name}</Td>
                    <Td>{b.origin} → {b.destination}</Td>
                    <Td>₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</Td>
                    <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0B2545]">{b.status}</span></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button onClick={()=>setSelected(b)} size="sm" variant="outline" className="h-8">Update</Button>
                        <a href={`/print/${encodeURIComponent(b.lrNumber)}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="h-8"><Printer className="h-3 w-3"/></Button></a>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {selected && <StatusUpdater booking={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null); reload()}}/>}
    </div>
  )
}

function Th({ children }) { return <th className="text-left px-4 py-3 font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3">{children}</td> }

function StatusUpdater({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status)
  const [location, setLocation] = useState(booking.currentLocation || '')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/status`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status, location, note })
      })
      const d = await r.json()
      if (d.ok) { toast.success('Status updated'); onSaved() } else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="font-bold text-[#0B2545]">Update Shipment Status</div>
          <div className="text-xs text-slate-500 mt-1">{booking.lrNumber}</div>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
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
            <Button disabled={busy} onClick={save} className="bg-[#0B2545] text-white font-bold">{busy?'Saving...':'Save Update'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NewBooking({ onCreated }) {
  const [f, setF] = useState({
    date: new Date().toISOString().slice(0,10),
    senderName:'', senderPhone:'', senderGst:'', pickupAddress:'', origin:'Guwahati',
    receiverName:'', receiverPhone:'', receiverGst:'', deliveryAddress:'', destination:'',
    invoiceNumber:'', packages:1, actualWeight:0, volumetricWeight:0, chargeableWeight:0,
    freightRate:18, biltyCharge:100, doorDeliveryCharge:0, insurance:0, loadingUnloading:0, otherCharges:0,
    paymentStatus:'PENDING', paymentMode:'CASH', eta:''
  })
  const set = (k,v)=>setF(x=>({...x,[k]:v}))
  const [busy, setBusy] = useState(false)

  const weight = Number(f.chargeableWeight || f.actualWeight || 0)
  const freight = weight * Number(f.freightRate || 0)
  const subtotal = freight + Number(f.biltyCharge||0) + Number(f.doorDeliveryCharge||0) + Number(f.insurance||0) + Number(f.loadingUnloading||0) + Number(f.otherCharges||0)
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, totalAmount: total })})
      const d = await r.json()
      if (d.ok) { toast.success(`Booking created — ${d.booking.lrNumber}`); onCreated() }
      else toast.error(d.error || 'Failed')
    } catch { toast.error('Network error') }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Consignment">
        <Field label="Booking Date"><Input type="date" value={f.date} onChange={e=>set('date',e.target.value)}/></Field>
        <Field label="Invoice Number"><Input value={f.invoiceNumber} onChange={e=>set('invoiceNumber',e.target.value)} placeholder="INV-1234"/></Field>
        <Field label="Origin City"><Input value={f.origin} onChange={e=>set('origin',e.target.value)}/></Field>
        <Field label="Destination City"><Input value={f.destination} onChange={e=>set('destination',e.target.value)} placeholder="e.g. Dibrugarh"/></Field>
      </Section>

      <Section title="Sender Details">
        <Field label="Sender Name"><Input value={f.senderName} onChange={e=>set('senderName',e.target.value)} required/></Field>
        <Field label="Sender Phone"><Input value={f.senderPhone} onChange={e=>set('senderPhone',e.target.value)}/></Field>
        <Field label="Sender GST"><Input value={f.senderGst} onChange={e=>set('senderGst',e.target.value)}/></Field>
        <Field label="Pickup Address" wide><Input value={f.pickupAddress} onChange={e=>set('pickupAddress',e.target.value)}/></Field>
      </Section>

      <Section title="Receiver Details">
        <Field label="Receiver Name"><Input value={f.receiverName} onChange={e=>set('receiverName',e.target.value)} required/></Field>
        <Field label="Receiver Phone"><Input value={f.receiverPhone} onChange={e=>set('receiverPhone',e.target.value)}/></Field>
        <Field label="Receiver GST"><Input value={f.receiverGst} onChange={e=>set('receiverGst',e.target.value)}/></Field>
        <Field label="Delivery Address" wide><Input value={f.deliveryAddress} onChange={e=>set('deliveryAddress',e.target.value)}/></Field>
      </Section>

      <Section title="Packages & Weight">
        <Field label="Packages"><Input type="number" value={f.packages} onChange={e=>set('packages',e.target.value)}/></Field>
        <Field label="Actual Weight (kg)"><Input type="number" value={f.actualWeight} onChange={e=>set('actualWeight',e.target.value)}/></Field>
        <Field label="Volumetric Weight (kg)"><Input type="number" value={f.volumetricWeight} onChange={e=>set('volumetricWeight',e.target.value)}/></Field>
        <Field label="Chargeable Weight (kg)"><Input type="number" value={f.chargeableWeight} onChange={e=>set('chargeableWeight',e.target.value)}/></Field>
      </Section>

      <Section title="Charges">
        <Field label="Freight Rate (₹/kg)"><Input type="number" value={f.freightRate} onChange={e=>set('freightRate',e.target.value)}/></Field>
        <Field label="Bilty Charge (₹)"><Input type="number" value={f.biltyCharge} onChange={e=>set('biltyCharge',e.target.value)}/></Field>
        <Field label="Door Delivery (₹)"><Input type="number" value={f.doorDeliveryCharge} onChange={e=>set('doorDeliveryCharge',e.target.value)}/></Field>
        <Field label="Insurance (₹)"><Input type="number" value={f.insurance} onChange={e=>set('insurance',e.target.value)}/></Field>
        <Field label="Loading/Unloading (₹)"><Input type="number" value={f.loadingUnloading} onChange={e=>set('loadingUnloading',e.target.value)}/></Field>
        <Field label="Other Charges (₹)"><Input type="number" value={f.otherCharges} onChange={e=>set('otherCharges',e.target.value)}/></Field>
      </Section>

      <Section title="Payment">
        <Field label="Payment Status">
          <Select value={f.paymentStatus} onValueChange={v=>set('paymentStatus',v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="TO_PAY">To Pay</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Payment Mode">
          <Select value={f.paymentMode} onValueChange={v=>set('paymentMode',v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BANK">Bank Transfer</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="ETA"><Input value={f.eta} onChange={e=>set('eta',e.target.value)} placeholder="e.g. 3-4 days"/></Field>
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
        <Button disabled={busy} type="submit" className="h-12 px-8 bg-[#0B2545] hover:bg-[#13315C] text-white font-bold text-base">{busy ? 'Creating...' : 'Create Booking & Generate LR'}</Button>
      </div>
    </form>
  )
}

function Section({ title, children }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="font-bold text-[#0B2545] mb-4">{title}</div>
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
      <div className={`font-black text-[#0B2545] ${big ? 'text-2xl' : 'text-lg'}`}>{value}</div>
    </div>
  )
}
