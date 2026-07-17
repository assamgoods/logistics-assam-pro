'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Truck, Phone, LogOut, Download, Package, MapPin, ExternalLink, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomerPortal() {
  const [phone, setPhone] = useState('')
  const [authed, setAuthed] = useState(false)
  const [me, setMe] = useState(null)
  const [bookings, setBookings] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('agc_customer_token')
    const p = localStorage.getItem('agc_customer_phone')
    if (t && p) { setPhone(p); setAuthed(true); load(p) }
  }, [])

  const load = async (p) => {
    const r = await fetch(`/api/customer/bookings?phone=${encodeURIComponent(p)}`).then(r=>r.json())
    setBookings(r.items || [])
  }

  const login = async (e) => {
    e.preventDefault()
    if (phone.length < 10) return toast.error('Enter 10-digit phone')
    const r = await fetch('/api/customer/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone })})
    const d = await r.json()
    if (!d.ok) return toast.error(d.error || 'Login failed')
    localStorage.setItem('agc_customer_token', d.token)
    localStorage.setItem('agc_customer_phone', phone)
    setMe(d); setAuthed(true); load(phone)
    toast.success('Welcome back!')
  }

  const logout = () => { localStorage.removeItem('agc_customer_token'); localStorage.removeItem('agc_customer_phone'); setAuthed(false); setBookings([]); setPhone('') }

  if (!authed) {
    return (
      <div className="min-h-screen gradient-navy grid place-items-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl shadow-black/40">
          <CardContent className="p-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div>
              <div>
                <div className="font-black text-[#0B2545]">Customer Portal</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold font-semibold">Assam Goods Carrier</div>
              </div>
            </div>
            <form onSubmit={login} className="mt-6 space-y-3">
              <Label className="text-xs">Registered Phone Number</Label>
              <Input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} placeholder="10-digit mobile" className="h-11" maxLength={10}/>
              <Button className="w-full h-11 bg-[#0B2545] hover:bg-[#13315C] font-bold">Continue <Phone className="h-4 w-4 ml-2"/></Button>
              <div className="text-xs text-slate-500 text-center">Use the phone number linked to your bookings</div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="gradient-navy text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-gold grid place-items-center"><Truck className="h-5 w-5 text-[#0B2545]"/></div>
            <div><div className="font-black leading-tight">Customer Portal</div><div className="text-[10px] tracking-[0.2em] text-agc-gold uppercase">{phone}</div></div>
          </div>
          <Button onClick={logout} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10"><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[{t:'Total Bookings',v:bookings.length},{t:'Delivered',v:bookings.filter(b=>b.status==='DELIVERED').length},{t:'In Transit',v:bookings.filter(b=>['DISPATCHED','IN_TRANSIT','ARRIVED','OUT_FOR_DELIVERY'].includes(b.status)).length},{t:'Total Spent',v:`₹${bookings.reduce((a,b)=>a+Number(b.totalAmount||0),0).toLocaleString('en-IN')}`}].map((s,k)=>(
            <Card key={k}><CardContent className="p-4"><div className="text-xs uppercase tracking-widest text-slate-500">{s.t}</div><div className="text-2xl font-black text-[#0B2545] mt-1">{s.v}</div></CardContent></Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-slate-200 font-bold text-[#0B2545]">Your Booking History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest">
                  <tr><Th>LR Number</Th><Th>Date</Th><Th>Route</Th><Th>Status</Th><Th>Amount</Th><Th>Actions</Th></tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No bookings found for this phone number.</td></tr>}
                  {bookings.map(b => (
                    <tr key={b.lrNumber} className="border-t border-slate-100 hover:bg-slate-50">
                      <Td><span className="font-mono font-bold text-[#0B2545]">{b.lrNumber}</span></Td>
                      <Td>{b.date}</Td>
                      <Td>{b.origin} → {b.destination}</Td>
                      <Td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-agc-gold text-[#0B2545]">{b.status}</span></Td>
                      <Td>₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</Td>
                      <Td>
                        <div className="flex gap-2">
                          <a href={`/track/${b.lrNumber}`}><Button size="sm" variant="outline" className="h-8"><MapPin className="h-3 w-3 mr-1"/>Track</Button></a>
                          <a href={`/print/${b.lrNumber}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="h-8"><Download className="h-3 w-3 mr-1"/>Invoice</Button></a>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Th({ children }) { return <th className="text-left px-4 py-3 font-semibold">{children}</th> }
function Td({ children }) { return <td className="px-4 py-3">{children}</td> }
