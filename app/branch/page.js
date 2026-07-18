'use client'
import { LogoMark } from '@/components/Logo'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Truck, Building2, LogOut, Package, Printer, RefreshCw, ArrowRightLeft, CheckCircle2, ChevronRight, History } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STAGES = [
  { key:'PICKED_UP', label:'Picked Up' },{ key:'WAREHOUSE', label:'In Warehouse' },
  { key:'DISPATCHED', label:'Dispatched' },{ key:'IN_TRANSIT', label:'In Transit' },
  { key:'ARRIVED', label:'Arrived at Destination' },{ key:'OUT_FOR_DELIVERY', label:'Out for Delivery' },{ key:'DELIVERED', label:'Delivered' },
]

export default function BranchPortal() {
  const [authed, setAuthed] = useState(false)
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState('login')  // login | forgot | otp | reset
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPw, setNewPw] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('agc_branch_token'); const s = localStorage.getItem('agc_branch_session')
    if (t && s) { setSession(JSON.parse(s)); setAuthed(true) }
  }, [])

  const login = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/branch/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pw })})
      const d = await r.json()
      if (!d.ok) { toast.error(d.error || 'Login failed'); setBusy(false); return }
      localStorage.setItem('agc_branch_token', d.token)
      localStorage.setItem('agc_branch_session', JSON.stringify(d))
      setSession(d); setAuthed(true); toast.success(`Welcome, ${d.name}`)
      if (d.mustChangePassword) toast.warning('Please change your password from settings.')
    } catch { toast.error('Network error') }
    setBusy(false)
  }
  const forgot = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })})
      const d = await r.json()
      if (d.ok) { toast.success(d.message || 'OTP sent'); setMode('otp') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setBusy(false)
  }
  const verifyOtp = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp })})
      const d = await r.json()
      if (d.ok) { setResetToken(d.resetToken); setMode('reset'); toast.success('OTP verified') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setBusy(false)
  }
  const doReset = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ resetToken, newPassword: newPw })})
      const d = await r.json()
      if (d.ok) { toast.success('Password reset. Please login.'); setMode('login'); setPw(newPw); setOtp(''); setResetToken(''); setNewPw('') } else toast.error(d.error)
    } catch { toast.error('Network error') }
    setBusy(false)
  }
  const logout = () => { localStorage.removeItem('agc_branch_token'); localStorage.removeItem('agc_branch_session'); setAuthed(false); setSession(null) }

  if (!authed) {
    return (
      <div className="min-h-screen gradient-navy grid place-items-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3">
              <LogoMark size={44}/>
              <div><div className="font-black text-[#0F3D91]">Branch Portal</div><div className="text-[10px] tracking-[0.2em] text-agc-orange font-semibold uppercase">AGC Branch Login</div></div>
            </div>

            {mode === 'login' && (<form onSubmit={login} className="mt-6 space-y-3">
              <div><Label className="text-xs">Registered Email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value.toLowerCase())} placeholder="you@company.com" className="h-11 mt-1" required/></div>
              <div><Label className="text-xs">Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="h-11 mt-1" required/></div>
              <Button disabled={busy} className="w-full h-11 bg-[#0F3D91] hover:bg-[#1E4FB8] text-white font-bold">{busy?'Signing in…':'Login'}</Button>
              <div className="text-center"><button type="button" onClick={()=>setMode('forgot')} className="text-xs text-[#0F3D91] hover:text-agc-orange font-semibold hover:underline">Forgot Password?</button></div>
            </form>)}

            {mode === 'forgot' && (<form onSubmit={forgot} className="mt-6 space-y-3">
              <div className="text-sm text-slate-600">Enter your registered email and we'll send you an OTP to reset your password.</div>
              <div><Label className="text-xs">Registered Email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value.toLowerCase())} className="h-11 mt-1" required/></div>
              <Button disabled={busy} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{busy?'Sending…':'Send OTP'}</Button>
              <div className="text-center"><button type="button" onClick={()=>setMode('login')} className="text-xs text-slate-600 hover:text-[#0F3D91]">← Back to Login</button></div>
            </form>)}

            {mode === 'otp' && (<form onSubmit={verifyOtp} className="mt-6 space-y-3">
              <div className="text-sm text-slate-600">Enter the 6-digit OTP sent to <b>{email}</b>. It expires in 15 minutes.</div>
              <div><Label className="text-xs">OTP</Label><Input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6-digit code" className="h-11 mt-1 text-center text-xl tracking-[0.4em] font-black" maxLength={6} required/></div>
              <Button disabled={busy || otp.length!==6} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{busy?'Verifying…':'Verify OTP'}</Button>
              <div className="flex justify-between text-xs"><button type="button" onClick={()=>setMode('forgot')} className="text-slate-600">← Resend</button><button type="button" onClick={()=>setMode('login')} className="text-slate-600">Back to Login</button></div>
            </form>)}

            {mode === 'reset' && (<form onSubmit={doReset} className="mt-6 space-y-3">
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">✓ OTP verified. Set your new password below.</div>
              <div><Label className="text-xs">New Password</Label><Input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="At least 6 characters" className="h-11 mt-1" minLength={6} required/></div>
              <Button disabled={busy || newPw.length<6} className="w-full h-11 bg-[#0F3D91] text-white font-bold">{busy?'Saving…':'Set New Password'}</Button>
            </form>)}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <BranchDashboard session={session} onLogout={logout}/>
}

function BranchDashboard({ session, onLogout }) {
  const [bookings, setBookings] = useState([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('shipments')

  const load = async () => {
    const r = await fetch(`/api/bookings?branch=${encodeURIComponent(session.code)}`).then(r=>r.json())
    setBookings(r.items || [])
  }
  useEffect(() => { load() }, [])

  const filtered = bookings.filter(b => !q || (b.lrNumber||'').toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="gradient-navy text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <LogoMark size={44}/>
            <div><div className="font-black leading-tight">Branch: {session.code}</div><div className="text-[10px] tracking-[0.2em] text-agc-gold uppercase">{session.name}</div></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
            <Button onClick={onLogout} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10"><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
          </div>
        </div>
        <div className="container mx-auto px-4 flex gap-1 text-xs">
          {[['shipments','Shipments', Package],['transfers','Branch Transfers', ArrowRightLeft]].map(([k,l,Ic]) => (
            <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 flex items-center gap-1.5 border-b-2 font-semibold ${tab===k?'border-agc-gold text-agc-gold':'border-transparent text-white/70 hover:text-white'}`}><Ic className="h-3.5 w-3.5"/>{l}</button>
          ))}
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        {tab === 'shipments' && (<>
          <div className="mb-4"><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search LR number..." className="max-w-md"/></div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"><tr><Th>LR</Th><Th>Date</Th><Th>Receiver</Th><Th>Destination</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
                  <tbody>
                    {filtered.length===0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No shipments for this branch.</td></tr>}
                    {filtered.map(b => (
                      <tr key={b.lrNumber} className="border-t border-slate-100 hover:bg-slate-50">
                        <Td><span className="tracking-number">{b.lrNumber}</span></Td>
                        <Td>{b.date}</Td><Td>{b.receiver?.name}</Td><Td>{b.destination}</Td>
                        <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0F3D91]">{b.status}</span></Td>
                        <Td>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={()=>setSelected(b)} variant="outline" className="h-8">Update</Button>
                            <a href={`/print/${b.lrNumber}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="h-8"><Printer className="h-3 w-3"/></Button></a>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>)}
        {tab === 'transfers' && <BranchTransfers session={session} bookings={bookings}/>}
      </div>
      {selected && <StatusUpdater booking={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null); load()}}/>}
    </div>
  )
}

function BranchTransfers({ session, bookings }) {
  const [transfers, setTransfers] = useState([])
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [receiving, setReceiving] = useState(null)

  const load = async () => {
    const [t1, t2, br] = await Promise.all([
      fetch(`/api/transfers?from=${encodeURIComponent(session.code)}`).then(r=>r.json()),
      fetch(`/api/transfers?to=${encodeURIComponent(session.code)}`).then(r=>r.json()),
      fetch('/api/branches').then(r=>r.json()),
    ])
    const merged = [...(t1.items||[]), ...(t2.items||[])]
    const uniq = Array.from(new Map(merged.map(x => [x.transferId, x])).values())
      .sort((a,b)=> new Date(b.transferredAt) - new Date(a.transferredAt))
    setTransfers(uniq); setBranches(br.items||[])
  }
  useEffect(()=>{ load() }, [])

  const incoming = transfers.filter(t => t.toBranch === session.code)
  const outgoing = transfers.filter(t => t.fromBranch === session.code)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">Manage transfers from and to your branch <b className="font-mono text-[#0F3D91]">{session.code}</b></div>
        <Button onClick={()=>setShowForm(true)} className="bg-[#0F3D91] text-white font-bold"><ArrowRightLeft className="h-4 w-4 mr-2"/>New Transfer</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-[#0F3D91] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600"/>Incoming ({incoming.length})</div>
            <div className="mt-3 space-y-2">
              {incoming.length===0 && <div className="text-xs text-slate-400 py-4">No incoming transfers.</div>}
              {incoming.map(t => (
                <div key={t.transferId} className="p-3 rounded-lg border border-slate-200 hover:border-agc-gold text-sm">
                  <div className="flex items-center justify-between">
                    <div><span className="tracking-number">{t.transferId}</span></div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status==='RECEIVED'?'bg-emerald-200 text-emerald-800':'bg-amber-200 text-amber-900'}`}>{t.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">LR: <b className="font-mono text-slate-700">{t.lrNumber}</b> · From <b>{t.fromBranch}</b> · {new Date(t.transferredAt).toLocaleString('en-IN')}</div>
                  {t.status==='IN_TRANSIT' && <Button size="sm" className="mt-2 h-8 bg-emerald-600 text-white" onClick={()=>setReceiving(t)}><CheckCircle2 className="h-3 w-3 mr-1"/>Mark Received</Button>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-[#0F3D91] flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-agc-gold"/>Outgoing ({outgoing.length})</div>
            <div className="mt-3 space-y-2">
              {outgoing.length===0 && <div className="text-xs text-slate-400 py-4">No outgoing transfers.</div>}
              {outgoing.map(t => (
                <div key={t.transferId} className="p-3 rounded-lg border border-slate-200 text-sm">
                  <div className="flex items-center justify-between">
                    <div><span className="tracking-number">{t.transferId}</span></div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status==='RECEIVED'?'bg-emerald-200 text-emerald-800':'bg-amber-200 text-amber-900'}`}>{t.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">LR: <b className="font-mono text-slate-700">{t.lrNumber}</b> → <b>{t.toBranch}</b> · {new Date(t.transferredAt).toLocaleString('en-IN')}</div>
                  {t.receivedAt && <div className="text-xs text-emerald-700 mt-1">✓ Received by {t.receivedBy}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && <BranchNewTransfer session={session} branches={branches} bookings={bookings} onClose={()=>setShowForm(false)} onCreated={()=>{setShowForm(false); load()}}/>}
      {receiving && <BranchReceiveModal transfer={receiving} session={session} onClose={()=>setReceiving(null)} onSaved={()=>{setReceiving(null); load()}}/>}
    </div>
  )
}

function BranchNewTransfer({ session, branches, bookings, onClose, onCreated }) {
  const [f, setF] = useState({ lrNumber:'', fromBranch: session.code, toBranch:'', vehicleNumber:'', driverName:'', remarks:'' })
  const set = (k,v)=>setF(x=>({...x,[k]:v}))
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); if (!f.lrNumber || !f.toBranch) return toast.error('LR and To branch required')
    setBusy(true)
    try {
      const r = await fetch('/api/transfers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f)})
      const d = await r.json(); if (d.ok) { toast.success(`Transfer ${d.transfer.transferId} created`); onCreated() } else toast.error(d.error)
    } catch { toast.error('Failed') }
    setBusy(false)
  }
  return (
    <div className="agc-modal-backdrop" onClick={onClose}>
      <Card className="w-full max-w-lg my-8" onClick={e=>e.stopPropagation()}><CardContent className="p-6">
        <div className="font-bold text-[#0F3D91] flex items-center gap-2"><ArrowRightLeft className="h-4 w-4"/>New Transfer from {session.code}</div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div><Label className="text-xs">LR / Bilty Number</Label>
            <Select value={f.lrNumber || 'NONE'} onValueChange={v=>set('lrNumber', v==='NONE'?'':v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select LR"/></SelectTrigger>
              <SelectContent>{bookings.slice(0,50).map(b => <SelectItem key={b.lrNumber} value={b.lrNumber}>{b.lrNumber} — {b.destination}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">To Branch</Label>
            <Select value={f.toBranch || 'NONE'} onValueChange={v=>set('toBranch', v==='NONE'?'':v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Destination branch"/></SelectTrigger>
              <SelectContent>{branches.filter(b => b.code !== session.code).map(b => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name} ({b.city})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Vehicle No.</Label><Input value={f.vehicleNumber} onChange={e=>set('vehicleNumber', e.target.value.toUpperCase())} className="mt-1"/></div>
            <div><Label className="text-xs">Driver</Label><Input value={f.driverName} onChange={e=>set('driverName', e.target.value)} className="mt-1"/></div>
          </div>
          <div><Label className="text-xs">Remarks</Label><Input value={f.remarks} onChange={e=>set('remarks', e.target.value)} className="mt-1"/></div>
          <div className="flex gap-2 justify-end pt-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} className="bg-[#0F3D91] text-white font-bold">{busy?'Creating...':'Create Transfer'}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  )
}

function BranchReceiveModal({ transfer, session, onClose, onSaved }) {
  const [receivedBy, setReceivedBy] = useState(session.name || '')
  const [remarks, setRemarks] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch(`/api/transfers/${transfer.transferId}/receive`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ receivedBy, remarks })})
      const d = await r.json(); if (d.ok) { toast.success('Received'); onSaved() } else toast.error(d.error)
    } catch { toast.error('Failed') }
    setBusy(false)
  }
  return (
    <div className="agc-modal-backdrop" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}><CardContent className="p-6">
        <div className="font-bold text-[#0F3D91] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600"/>Receive Transfer</div>
        <div className="text-xs text-slate-500 mt-1 font-mono">{transfer.transferId} · LR {transfer.lrNumber}</div>
        <div className="mt-3 text-sm p-3 rounded bg-slate-50 border border-slate-200">
          <div>{transfer.fromBranch} → <b>{transfer.toBranch}</b></div>
          {transfer.vehicleNumber && <div className="text-xs mt-1">Vehicle: {transfer.vehicleNumber} · Driver: {transfer.driverName}</div>}
        </div>
        <div className="mt-4 space-y-3">
          <div><Label className="text-xs">Received By</Label><Input value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} className="mt-1"/></div>
          <div><Label className="text-xs">Remarks</Label><Input value={remarks} onChange={e=>setRemarks(e.target.value)} className="mt-1"/></div>
        </div>
        <div className="mt-5 flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={save} className="bg-emerald-600 text-white font-bold">{busy?'Saving...':'Confirm Received'}</Button></div>
      </CardContent></Card>
    </div>
  )
}

function StatusUpdater({ booking, onClose, onSaved }) {
  const [status, setStatus] = useState(booking.status)
  const [location, setLocation] = useState(booking.currentLocation || '')
  const [note, setNote] = useState('')
  const save = async () => {
    const r = await fetch(`/api/bookings/${encodeURIComponent(booking.lrNumber)}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, location, note })})
    const d = await r.json(); if (d.ok) { toast.success('Updated'); onSaved() } else toast.error(d.error)
  }
  return (
    <div className="agc-modal-backdrop" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="font-bold text-[#0F3D91]">Update Status</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">{booking.lrNumber}</div>
          <div className="mt-4 space-y-3">
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STAGES.map(s=><SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select>
            <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location"/>
            <Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note"/>
          </div>
          <div className="mt-5 flex gap-2 justify-end"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} className="bg-[#0F3D91] text-white font-bold">Save</Button></div>
        </CardContent>
      </Card>
    </div>
  )
}

function Th({ children }) { return <th className="text-left px-4 py-3 font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3">{children}</td> }
