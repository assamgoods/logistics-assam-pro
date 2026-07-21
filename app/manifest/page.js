'use client'
import { LogoMark } from '@/components/Logo'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, Truck, Download, ListChecks } from 'lucide-react'

const COMPANY = { name: 'ASSAM GOODS CARRIER', tagline: 'SAFE • FAST • RELIABLE', mobile: '8847428801', gst: '18AABCA1234A1Z5', address: 'G.S. Road, Guwahati, Assam - 781005' }

export default function ManifestPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
 const [lrs, setLrs] = useState([])
  const [vehicle, setVehicle] = useState("")
  const [driver, setDriver] = useState("")
  const [route, setRoute] = useState("")
 const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [manifestNo, setManifestNo] = useState(sp.get('manifestNo') || `MAN-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`)

  useEffect(() => { fetch('/api/bookings').then(r=>r.json()).then(d=>setBookings(d.items||[])) }, [])

  const selected = bookings.filter(b => lrs.includes(b.lrNumber))
  const totals = selected.reduce((acc, b) => ({ packages: acc.packages + Number(b.packages||0), weight: acc.weight + Number(b.chargeableWeight||b.actualWeight||0), freight: acc.freight + Number(b.totalAmount||0) }), { packages:0, weight:0, freight:0 })

  const toggle = (lr) => setLrs(x => x.includes(lr) ? x.filter(l=>l!==lr) : [...x, lr])

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:py-0 print:bg-white">
      <div className="no-print print-toolbar sticky top-0 max-w-5xl mx-auto px-4 pt-3 pb-4 mb-4 space-y-3 rounded-b-xl border-b border-slate-200 bg-slate-50" style={{ zIndex: 100 }}>
        <div className="flex justify-between items-center">
          <a href="/admin" className="text-sm text-slate-600 hover:text-[#0F3D91]">← Back to Admin</a>
          <div className="flex gap-2">
            <Button onClick={()=>window.print()} className="bg-[#0F3D91] text-white font-bold"><Printer className="h-4 w-4 mr-2"/>Print Manifest</Button>
            <Button onClick={()=>window.print()} className="bg-agc-gold text-[#0F3D91] font-bold hover:brightness-110"><Download className="h-4 w-4 mr-2"/>Save as PDF</Button>
          </div>
        </div>
        <Card><CardContent className="p-5">
          <div className="font-bold text-[#0F3D91] mb-3 flex items-center gap-2"><ListChecks className="h-4 w-4 text-agc-gold"/>Vehicle Loading Manifest — Setup</div>
          <div className="grid md:grid-cols-4 gap-3">
            <div><Label className="text-xs">Manifest No.</Label><Input value={manifestNo} onChange={e=>setManifestNo(e.target.value)} className="mt-1"/></div>
            <div><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1"/></div>
            <div><Label className="text-xs">Vehicle No.</Label><Input value={vehicle} onChange={e=>setVehicle(e.target.value.toUpperCase())} placeholder="e.g. AS01AB1234" className="mt-1"/></div>
            <div><Label className="text-xs">Driver Name</Label><Input value={driver} onChange={e=>setDriver(e.target.value)} className="mt-1"/></div>
            <div className="md:col-span-4"><Label className="text-xs">Route</Label><Input value={route} onChange={e=>setRoute(e.target.value)} placeholder="e.g. Guwahati → Dibrugarh → Tinsukia" className="mt-1"/></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-0"><div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0 text-slate-600 uppercase text-[10px] tracking-widest"><tr><th className="px-3 py-2 text-left">Select</th><th className="px-3 py-2 text-left">LR</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Route</th><th className="px-3 py-2 text-left">Pkgs</th><th className="px-3 py-2 text-left">Weight</th><th className="px-3 py-2 text-right">Freight</th></tr></thead>
            <tbody>{bookings.slice(0,80).map(b => (<tr key={b.lrNumber} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-3 py-2"><input type="checkbox" checked={lrs.includes(b.lrNumber)} onChange={()=>toggle(b.lrNumber)}/></td><td className="px-3 py-2"><span className="tracking-number">{b.lrNumber}</span></td><td className="px-3 py-2">{b.date}</td><td className="px-3 py-2">{b.origin} → {b.destination}</td><td className="px-3 py-2">{b.packages}</td><td className="px-3 py-2">{b.chargeableWeight||b.actualWeight}kg</td><td className="px-3 py-2 text-right">₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</td></tr>))}</tbody>
          </table>
        </div></CardContent></Card>
        <div className="text-xs text-slate-600">Selected: <b>{selected.length}</b> LRs • Total pkgs: <b>{totals.packages}</b> • Total weight: <b>{totals.weight} kg</b> • Total freight: <b>₹{totals.freight.toLocaleString('en-IN')}</b></div>
      </div>

      {/* PRINTABLE MANIFEST */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print-canvas" style={{ padding:'10mm', boxSizing:'border-box', minHeight:'297mm' }}>
        <div className="flex items-start justify-between border-b-[3px] border-agc-gold pb-3">
          <div className="flex items-center gap-3">
            <LogoMark size={44}/>
            <div>
              <div className="text-xl font-black text-[#0F3D91]">{COMPANY.name}</div>
              <div className="text-[10px] tracking-[0.3em] text-agc-gold font-bold">{COMPANY.tagline}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{COMPANY.address} • Mob: {COMPANY.mobile} • GST: {COMPANY.gst}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Manifest No.</div>
            <div className="text-lg font-black text-[#0F3D91]">{manifestNo}</div>
            <div className="text-[10px] text-slate-500">Date: <b>{date}</b></div>
          </div>
        </div>
        <div className="text-center mt-2 py-1 bg-[#0F3D91] text-white font-black tracking-[0.3em] text-sm">VEHICLE LOADING SHEET</div>
        <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
          <ManCell k="Vehicle Number" v={vehicle || '—'}/>
          <ManCell k="Driver Name" v={driver || '—'}/>
          <ManCell k="Route" v={route || '—'}/>
        </div>

        <table className="w-full mt-4 border border-slate-500 text-[10px]">
          <thead className="bg-[#0F3D91] text-white">
            <tr>
              <th className="border border-slate-500 px-1.5 py-1.5">SL</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-left">LR / Bilty</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-left">Date</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-left">Consignor</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-left">Consignee</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-left">Route</th>
              <th className="border border-slate-500 px-1.5 py-1.5">Pkgs</th>
              <th className="border border-slate-500 px-1.5 py-1.5">Weight</th>
              <th className="border border-slate-500 px-1.5 py-1.5 text-right">Freight (₹)</th>
              <th className="border border-slate-500 px-1.5 py-1.5">Payment</th>
            </tr>
          </thead>
          <tbody>
            {selected.length === 0 && (<tr><td colSpan="10" className="border border-slate-500 p-6 text-center text-slate-400">No LRs selected. Use the checklist above to add LRs to this manifest.</td></tr>)}
            {selected.map((b, i) => (
              <tr key={b.lrNumber} className="even:bg-slate-50">
                <td className="border border-slate-400 px-1.5 py-1 text-center">{i+1}</td>
                <td className="border border-slate-400 px-1.5 py-1 font-mono font-bold text-[#0F3D91]">{b.lrNumber}</td>
                <td className="border border-slate-400 px-1.5 py-1">{b.date}</td>
                <td className="border border-slate-400 px-1.5 py-1">{b.sender?.name}</td>
                <td className="border border-slate-400 px-1.5 py-1">{b.receiver?.name}</td>
                <td className="border border-slate-400 px-1.5 py-1">{b.origin} → {b.destination}</td>
                <td className="border border-slate-400 px-1.5 py-1 text-center">{b.packages}</td>
                <td className="border border-slate-400 px-1.5 py-1 text-center">{b.chargeableWeight||b.actualWeight}kg</td>
                <td className="border border-slate-400 px-1.5 py-1 text-right">{Number(b.totalAmount||0).toLocaleString('en-IN')}</td>
                <td className="border border-slate-400 px-1.5 py-1 text-center">{b.paymentStatus}</td>
              </tr>
            ))}
            {selected.length > 0 && (
              <tr className="bg-agc-gold/30 font-black text-[#0F3D91]">
                <td colSpan="6" className="border border-slate-500 px-1.5 py-1.5 text-right">TOTALS</td>
                <td className="border border-slate-500 px-1.5 py-1.5 text-center">{totals.packages}</td>
                <td className="border border-slate-500 px-1.5 py-1.5 text-center">{totals.weight} kg</td>
                <td className="border border-slate-500 px-1.5 py-1.5 text-right">₹{totals.freight.toLocaleString('en-IN')}</td>
                <td className="border border-slate-500 px-1.5 py-1.5"></td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 text-[10px] text-slate-600">
          <b>Declaration:</b> I hereby confirm that I have received the above listed consignments in good condition and quantity for delivery as per the routes and terms of {COMPANY.name}. Any damage or shortage noticed shall be reported before departure.
        </div>

        <div className="grid grid-cols-3 gap-4 mt-14 text-xs">
          <div className="border-t-2 border-slate-500 pt-1 text-center"><b>Loading Supervisor</b><div className="text-[9px] text-slate-500">(Booking Office)</div></div>
          <div className="border-t-2 border-slate-500 pt-1 text-center"><b>Driver Signature</b><div className="text-[9px] text-slate-500">(Vehicle In-charge)</div></div>
          <div className="border-t-2 border-slate-500 pt-1 text-center"><b>Branch Manager</b><div className="text-[9px] text-slate-500">(For {COMPANY.name})</div></div>
        </div>
      </div>

      <style jsx global>{`
        @page { size: A4 portrait; margin: 0; }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  )
}

function ManCell({ k, v }) {
  return (<div className="border border-slate-400 rounded p-2"><div className="text-[8px] uppercase tracking-widest text-slate-500">{k}</div><div className="font-bold text-[#0F3D91]">{v}</div></div>)
}
