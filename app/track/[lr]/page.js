'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Truck, ArrowLeft, MapPin, Clock, Package, CheckCircle2, Circle, Loader2, Phone, MessageCircle, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LogoMark } from '@/components/Logo'

const PHONE = '8847428801'

export default function TrackPage() {
  const { lr } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState(lr || '')

  useEffect(() => {
    let m = true
    setLoading(true); setError('')
    fetch(`/api/track/${encodeURIComponent(lr)}`).then(r => r.json()).then(d => {
      if (!m) return
      if (d.ok) setData(d); else setError(d.error || 'Not found')
      setLoading(false)
    }).catch(() => { if (m) { setError('Network error'); setLoading(false) } })
    return () => { m = false }
  }, [lr])

  const currentIdx = data ? (data.stages || []).findIndex(s => s.key === data.status) : -1

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="gradient-navy text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/90 hover:text-agc-orange text-sm font-semibold">
            <ArrowLeft className="h-4 w-4"/> Back to Home
          </button>
          <div className="flex items-center gap-2.5"><LogoMark size={32}/><div className="font-black tracking-tight">ASSAM GOODS CARRIER</div></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={(e)=>{e.preventDefault(); if(q.trim()) router.push(`/track/${encodeURIComponent(q.trim())}`)}} className="flex gap-2 max-w-2xl">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="LR / Bilty number" className="h-11"/>
          <Button className="bg-[#0F3D91] hover:bg-[#1E4FB8] text-white h-11 px-6 font-bold">Track</Button>
        </form>

        {loading && (<div className="mt-10 flex items-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin"/> Fetching shipment...</div>)}

        {error && !loading && (
          <Card className="mt-8 border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700">
              <div className="font-bold">Shipment Not Found</div>
              <div className="text-sm mt-1">{error}</div>
              <div className="text-sm mt-2">Need help? Call <a className="underline" href={`tel:${PHONE}`}>{PHONE}</a> or WhatsApp us.</div>
            </CardContent>
          </Card>
        )}

        {data && !loading && (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500">LR / Bilty Number</div>
                    <div className="mt-1"><span className="tracking-number-lg">{data.lrNumber}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-agc-gold text-[#0F3D91]">{(data.stages.find(s=>s.key===data.status)?.label) || data.status}</span>
                    <a href={`/print/${encodeURIComponent(data.lrNumber)}`} target="_blank" rel="noreferrer"><Button variant="outline" className="h-9"><Printer className="h-4 w-4 mr-2"/>LR Copy</Button></a>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Info label="Origin" value={data.origin || '—'}/>
                  <Info label="Destination" value={data.destination || '—'}/>
                  <Info label="Current Location" value={data.currentLocation || '—'}/>
                  <Info label="ETA" value={data.eta || 'Calculating'}/>
                  <Info label="Sender" value={data.sender?.name || '—'}/>
                  <Info label="Receiver" value={data.receiver?.name || '—'}/>
                  <Info label="Packages" value={String(data.packages || 0)}/>
                  <Info label="Chargeable Wt" value={`${data.chargeableWeight || 0} kg`}/>
                </div>

                <div className="mt-8">
                  <div className="font-bold text-[#0F3D91] mb-4">Shipment Timeline</div>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-slate-200"/>
                    {data.stages.map((stg, i) => {
                      const done = i <= currentIdx
                      const active = i === currentIdx
                      const evt = (data.timeline || []).slice().reverse().find(t => t.key === stg.key)
                      return (
                        <div key={stg.key} className="relative pb-6">
                          <div className={`absolute -left-4 top-0 h-4 w-4 rounded-full grid place-items-center ${done? 'bg-agc-gold' : 'bg-slate-200'}`}>
                            {done ? <CheckCircle2 className="h-3 w-3 text-[#0F3D91]"/> : <Circle className="h-2 w-2 text-slate-400"/>}
                          </div>
                          <div className={`ml-2 ${active ? 'font-bold text-[#0F3D91]' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                            {stg.label}
                          </div>
                          {evt && (
                            <div className="ml-2 text-xs text-slate-500 mt-0.5">
                              {new Date(evt.at).toLocaleString('en-IN')} {evt.location && `• ${evt.location}`} {evt.note && `• ${evt.note}`}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="gradient-navy text-white border-0">
                <CardContent className="p-6">
                  <div className="font-bold text-agc-gold">Need Help?</div>
                  <div className="text-sm text-white/80 mt-1">Talk to our support team for updates.</div>
                  <a href={`tel:${PHONE}`}><Button className="mt-4 w-full bg-agc-gold text-[#0F3D91] font-bold hover:brightness-110"><Phone className="h-4 w-4 mr-2"/>Call {PHONE}</Button></a>
                  <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noreferrer"><Button className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white"><MessageCircle className="h-4 w-4 mr-2"/>WhatsApp Us</Button></a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="font-bold text-[#0F3D91] flex items-center gap-2"><Truck className="h-4 w-4 text-agc-gold"/> Last Updated</div>
                  <div className="text-sm text-slate-600 mt-1">{data.updatedAt ? new Date(data.updatedAt).toLocaleString('en-IN') : '—'}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-[#0F3D91] mt-0.5">{value}</div>
    </div>
  )
}
