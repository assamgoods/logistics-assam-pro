'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Printer, Truck, Eye, Download, Package } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

export default function StickerPage() {
  const { lr } = useParams()
  const [b, setB] = useState(null)
  const [count, setCount] = useState(null)
  const [layout, setLayout] = useState('thermal') // 'thermal' | 'a4'

  useEffect(() => {
    fetch(`/api/bookings/${encodeURIComponent(lr)}`).then(r=>r.json()).then(d => { if (d.ok) { setB(d.booking); setCount(d.booking.packages || 1) } })
  }, [lr])

  if (!b) return <div className="p-10 text-center text-slate-500">Loading...</div>

  const stickers = Array.from({ length: Number(count) || 1 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:py-0 print:bg-white">
      <div className="no-print max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-3 mb-4 px-4">
        <a href={`/print/${lr}`} className="text-sm text-slate-600 hover:text-[#0B2545]">← Back to LR</a>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2"><Label className="text-xs">Total Packages</Label><Input type="number" min="1" max="200" value={count || 1} onChange={e=>setCount(e.target.value)} className="w-24 h-9"/></div>
          <div className="flex items-center gap-2"><Label className="text-xs">Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="w-40 h-9"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="thermal">Thermal / A6 (100×150 mm)</SelectItem><SelectItem value="a4">A4 (2 per page)</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={()=>window.print()} className="bg-[#0B2545] text-white font-bold"><Printer className="h-4 w-4 mr-2"/>Print Stickers</Button>
          <Button onClick={()=>window.print()} className="bg-agc-gold text-[#0B2545] font-bold hover:brightness-110"><Download className="h-4 w-4 mr-2"/>Save as PDF</Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid gap-3 print:gap-0 justify-items-center">
        {stickers.map(n => (<Sticker key={n} b={b} pkgNo={n} total={stickers.length} layout={layout}/>))}
      </div>

      <style jsx global>{`
        @page { size: ${layout === 'thermal' ? '100mm 150mm' : 'A4 portrait'}; margin: ${layout === 'thermal' ? '3mm' : '5mm'}; }
        @media print {
          .no-print { display: none !important; }
          .sticker-card { page-break-inside: avoid; page-break-after: always; }
          .sticker-card:last-child { page-break-after: auto; }
        }
      `}</style>
    </div>
  )
}

function Sticker({ b, pkgNo, total, layout }) {
  const barcodeRef = useRef(null)
  const [qr, setQr] = useState('')
  useEffect(() => {
    const url = `${window.location.origin}/track/${b.lrNumber}`
    QRCode.toDataURL(url, { width: 180, margin: 0, color: { dark:'#0B2545', light:'#ffffff' } }).then(setQr)
    if (barcodeRef.current) {
      try { JsBarcode(barcodeRef.current, `${b.lrNumber}-${pkgNo}/${total}`, { format:'CODE128', displayValue:true, height:32, fontSize:10, background:'#ffffff', lineColor:'#0B2545', margin:0, width:1.4 }) } catch(e){}
    }
  }, [b.lrNumber, pkgNo, total])

  return (
    <div className="sticker-card bg-white border-2 border-[#0B2545] shadow-md print:shadow-none" style={{ width: '100mm', height: '150mm', padding: '3mm', boxSizing:'border-box', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b-2 border-agc-gold pb-1">
        <div className="h-8 w-8 rounded-md gradient-gold grid place-items-center flex-shrink-0"><Truck className="h-4 w-4 text-[#0B2545]" strokeWidth={2.5}/></div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black text-[#0B2545] leading-tight">ASSAM GOODS CARRIER</div>
          <div className="text-[6px] tracking-[0.25em] text-agc-gold font-bold">SAFE • FAST • RELIABLE</div>
        </div>
      </div>

      {/* Package Number BIG */}
      <div className="flex items-center justify-between mt-1 mb-0.5">
        <div className="text-[7px] uppercase tracking-widest text-slate-500">Package No.</div>
        <div className="text-[7px] text-slate-500">Date: <b>{b.date}</b></div>
      </div>
      <div className="flex items-baseline gap-1 border-b border-slate-300 pb-1">
        <div className="text-[42px] font-black text-[#0B2545] leading-none">{pkgNo}</div>
        <div className="text-[20px] font-black text-slate-400">/ {total}</div>
      </div>

      {/* Route */}
      <div className="mt-1.5 grid grid-cols-2 gap-1 text-[8px]">
        <div className="border border-slate-300 p-1"><div className="text-[6px] uppercase text-slate-500">FROM</div><div className="font-black text-[#0B2545] text-[11px] leading-tight">{b.origin}</div></div>
        <div className="border border-slate-300 p-1"><div className="text-[6px] uppercase text-slate-500">TO</div><div className="font-black text-agc-gold text-[11px] leading-tight">{b.destination}</div></div>
      </div>

      {/* Consignor / Consignee */}
      <div className="mt-1 space-y-0.5 text-[8px] leading-tight">
        <div><b>Consignor:</b> {b.sender?.name || '—'} • {b.sender?.phone || ''}</div>
        <div><b>Consignee:</b> {b.receiver?.name || '—'} • <b>{b.receiver?.phone || ''}</b></div>
        <div className="truncate"><b>Addr:</b> {b.receiver?.address || '—'}</div>
        <div><b>Weight:</b> {b.chargeableWeight || b.actualWeight || 0} kg • <b>Total Pkgs:</b> {total}</div>
      </div>

      {/* Barcode + QR */}
      <div className="mt-auto flex items-end justify-between gap-1 pt-1 border-t-2 border-agc-gold">
        <div className="flex-1 min-w-0">
          <div className="text-[7px] uppercase text-slate-500 leading-none">LR / Bilty No.</div>
          <div className="font-black text-[#0B2545] text-[13px] leading-tight">{b.lrNumber}</div>
          <svg ref={barcodeRef} style={{ width:'55mm', height:'11mm', marginTop:'1mm' }}/>
        </div>
        {qr && <img src={qr} alt="QR" style={{ width:'22mm', height:'22mm' }} className="border border-slate-400"/>}
      </div>
    </div>
  )
}
