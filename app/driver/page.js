'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Truck, LogOut, Camera, PenLine, MapPin, CheckCircle2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function DriverPortal() {
  const [authed, setAuthed] = useState(false)
  const [session, setSession] = useState(null)
  const [phone, setPhone] = useState(''); const [pw, setPw] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('agc_driver_token'); const s = localStorage.getItem('agc_driver_session')
    if (t && s) { setSession(JSON.parse(s)); setAuthed(true) }
  }, [])

  const login = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/driver/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone, password: pw })})
    const d = await r.json()
    if (!d.ok) return toast.error(d.error || 'Login failed')
    localStorage.setItem('agc_driver_token', d.token); localStorage.setItem('agc_driver_session', JSON.stringify({...d, phone}))
    setSession({...d, phone}); setAuthed(true); toast.success('Welcome, driver')
  }
  const logout = () => { localStorage.removeItem('agc_driver_token'); localStorage.removeItem('agc_driver_session'); setAuthed(false) }

  if (!authed) {
    return (
      <div className="min-h-screen gradient-navy grid place-items-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div><div><div className="font-black text-[#0B2545]">Driver App</div><div className="text-[10px] tracking-[0.2em] text-agc-gold uppercase">Delivery Portal</div></div></div>
            <form onSubmit={login} className="mt-6 space-y-3">
              <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} maxLength={10} className="h-11 mt-1"/></div>
              <div><Label className="text-xs">Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="h-11 mt-1"/></div>
              <Button className="w-full h-11 bg-[#0B2545] font-bold">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <DriverDashboard session={session} onLogout={logout}/>
}

function DriverDashboard({ session, onLogout }) {
  const [bookings, setBookings] = useState([])
  const [active, setActive] = useState(null)

  const load = async () => {
    const r = await fetch(`/api/bookings`).then(r=>r.json())
    // driver sees IN_TRANSIT, OUT_FOR_DELIVERY, ARRIVED, DISPATCHED bookings
    setBookings((r.items||[]).filter(b => ['DISPATCHED','IN_TRANSIT','ARRIVED','OUT_FOR_DELIVERY','PICKED_UP','WAREHOUSE'].includes(b.status)))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="gradient-navy text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div><div><div className="font-black leading-tight">Driver: {session.name}</div><div className="text-[10px] tracking-[0.2em] text-agc-gold uppercase">{session.phone}</div></div></div>
          <div className="flex gap-2"><Button onClick={load} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4"/></Button><Button onClick={onLogout} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10"><LogOut className="h-4 w-4"/></Button></div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="font-bold text-[#0B2545] mb-4">Assigned Deliveries ({bookings.length})</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.length === 0 && <div className="col-span-full text-center text-slate-400 py-16">No pending deliveries.</div>}
          {bookings.map(b => (
            <Card key={b.lrNumber} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div><span className="tracking-number">{b.lrNumber}</span></div>
                    <div className="text-xs text-slate-500">{b.date}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0B2545]">{b.status}</span>
                </div>
                <div className="mt-3 text-sm space-y-1">
                  <div><b>To:</b> {b.receiver?.name}</div>
                  <div className="text-xs text-slate-600"><MapPin className="h-3 w-3 inline mr-1"/>{b.receiver?.address || b.destination}</div>
                  <div className="text-xs"><b>Phone:</b> <a href={`tel:${b.receiver?.phone}`} className="text-blue-600">{b.receiver?.phone}</a></div>
                  <div className="text-xs"><b>Packages:</b> {b.packages} • <b>Weight:</b> {b.chargeableWeight}kg</div>
                </div>
                <div className="mt-3"><Button onClick={()=>setActive(b)} className="w-full bg-[#0B2545] text-white h-9"><CheckCircle2 className="h-4 w-4 mr-2"/>Complete Delivery / POD</Button></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {active && <PODModal booking={active} onClose={()=>setActive(null)} onSaved={()=>{setActive(null); load()}}/>}
    </div>
  )
}

function PODModal({ booking, onClose, onSaved }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [receiverName, setReceiverName] = useState(booking.receiver?.name || '')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); ctx.strokeStyle = '#0B2545'; ctx.lineWidth = 2; ctx.lineCap = 'round'
    const pos = e => { const r = c.getBoundingClientRect(); const t = e.touches?.[0]; return { x: (t?.clientX||e.clientX)-r.left, y:(t?.clientY||e.clientY)-r.top } }
    const start = e => { e.preventDefault(); const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); setDrawing(true) }
    const move = e => { if (!drawing) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x,p.y); ctx.stroke() }
    const end = () => setDrawing(false)
    c.addEventListener('mousedown',start); c.addEventListener('mousemove',move); window.addEventListener('mouseup',end)
    c.addEventListener('touchstart',start); c.addEventListener('touchmove',move); c.addEventListener('touchend',end)
    return () => { c.removeEventListener('mousedown',start); c.removeEventListener('mousemove',move); window.removeEventListener('mouseup',end); c.removeEventListener('touchstart',start); c.removeEventListener('touchmove',move); c.removeEventListener('touchend',end) }
  }, [drawing])

  const clear = () => { const c=canvasRef.current; c.getContext('2d').clearRect(0,0,c.width,c.height) }
  const uploadPhoto = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader(); reader.onload = () => setPhoto(reader.result); reader.readAsDataURL(file)
  }

  const submit = async () => {
    setBusy(true)
    try {
      const c = canvasRef.current; const sig = c.toDataURL('image/png')
      const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/pod`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ photo, signature: sig, receiverName, location })})
      const d = await r.json(); if (d.ok) { toast.success('POD captured, shipment delivered!'); onSaved() } else toast.error(d.error)
    } catch { toast.error('Failed') }
    setBusy(false)
  }

  return (
    <div className="agc-modal-backdrop" onClick={onClose}>
      <Card className="w-full max-w-lg my-8" onClick={e=>e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="font-bold text-[#0B2545]">Proof of Delivery</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">{booking.lrNumber}</div>
          <div className="mt-4 space-y-3">
            <Input value={receiverName} onChange={e=>setReceiverName(e.target.value)} placeholder="Receiver name"/>
            <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Delivery location / address"/>
            <div><Label className="text-xs">Upload Photo (delivered goods)</Label><input type="file" accept="image/*" capture="environment" onChange={uploadPhoto} className="mt-1 block w-full text-sm"/>{photo && <img src={photo} className="mt-2 h-24 border rounded"/>}</div>
            <div>
              <Label className="text-xs">Receiver Signature</Label>
              <canvas ref={canvasRef} width={400} height={140} className="mt-1 w-full h-36 border-2 border-slate-300 rounded bg-white touch-none"/>
              <Button type="button" size="sm" variant="outline" onClick={clear} className="mt-1 h-7 text-xs">Clear</Button>
            </div>
          </div>
          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={busy} onClick={submit} className="bg-emerald-600 text-white font-bold">{busy?'Saving...':'Confirm Delivered'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
