'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Printer, Truck, Eye, Download, Package, Settings } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

export default function StickerPage() {
  const { lr } = useParams()
  const [b, setB] = useState(null)
  const [count, setCount] = useState(1)
  const [sizes, setSizes] = useState([])
  const [selectedSizeId, setSelectedSizeId] = useState('')
  const [custom, setCustom] = useState({ width: 100, height: 150 })
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${encodeURIComponent(lr)}`).then(r=>r.json()).then(d => { if (d.ok) { setB(d.booking); setCount(d.booking.packages || 1) } })
    fetch('/api/label-sizes').then(r=>r.json()).then(d => { setSizes(d.items || []); const def = (d.items||[]).find(s => s.width===100 && s.height===150) || (d.items||[])[0]; if (def) setSelectedSizeId(def.id) })
  }, [lr])

  if (!b) return <div className="p-10 text-center text-slate-500">Loading...</div>

  const selected = selectedSizeId === 'CUSTOM' ? { name: `${custom.width} × ${custom.height} mm (Custom)`, width: Number(custom.width) || 100, height: Number(custom.height) || 150 } : (sizes.find(s => s.id === selectedSizeId) || { name: '100 × 150 mm', width: 100, height: 150 })

  const stickers = Array.from({ length: Math.max(1, Number(count) || 1) }, (_, i) => i + 1)

  return (
    <div className={`min-h-screen ${preview ? 'bg-slate-800' : 'bg-slate-200'} py-6 print:py-0 print:bg-white`}>
      <div className="no-print print-toolbar sticky top-0 max-w-6xl mx-auto px-4 pt-4 pb-4 mb-4 space-y-3 rounded-b-xl border-b border-slate-200" style={{ zIndex: 100 }}>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <a href={`/print/${lr}`} className="text-sm text-slate-600 hover:text-[#0B2545]">← Back to LR</a>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={()=>setPreview(p=>!p)}><Eye className="h-4 w-4 mr-2"/>{preview?'Exit Preview':'Print Preview'}</Button>
            <Button onClick={()=>window.print()} className="bg-[#0B2545] hover:bg-[#13315C] text-white font-bold"><Printer className="h-4 w-4 mr-2"/>Print Labels</Button>
            <Button onClick={()=>window.print()} className="bg-agc-gold text-[#0B2545] font-bold hover:brightness-110"><Download className="h-4 w-4 mr-2"/>Save as PDF</Button>
          </div>
        </div>
        <Card><CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <Label className="text-xs">Total Packages</Label>
              <Input type="number" min="1" max="500" value={count} onChange={e=>setCount(e.target.value)} className="mt-1 h-10"/>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Select Label Size</Label>
              <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                <SelectTrigger className="mt-1 h-10"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {sizes.map(s => <SelectItem key={s.id} value={s.id}>{s.isDefault ? '★ ' : ''}{s.name}</SelectItem>)}
                  <SelectItem value="CUSTOM">✎ Custom Size…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <a href="/admin" target="_blank" rel="noreferrer"><Button variant="outline" className="h-10"><Settings className="h-4 w-4 mr-2"/>Manage Sizes</Button></a>
            </div>
          </div>
          {selectedSizeId === 'CUSTOM' && (
            <div className="mt-3 grid md:grid-cols-3 gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div><Label className="text-xs">Width (mm)</Label><Input type="number" min="10" max="300" value={custom.width} onChange={e=>setCustom(c=>({...c, width: e.target.value}))} className="mt-1 h-9"/></div>
              <div><Label className="text-xs">Height (mm)</Label><Input type="number" min="10" max="300" value={custom.height} onChange={e=>setCustom(c=>({...c, height: e.target.value}))} className="mt-1 h-9"/></div>
              <div className="flex items-end text-xs text-amber-900">Content auto-scales to fit. To save this size, use Admin → Label Settings.</div>
            </div>
          )}
          <div className="mt-3 text-xs text-slate-500">
            Printing <b>{stickers.length}</b> label{stickers.length>1?'s':''} · Size: <b>{selected.width} × {selected.height} mm</b> · Compatible with TSC, Zebra, TVS, XPrinter and any Windows thermal printer via the browser print dialog.
          </div>
        </CardContent></Card>
      </div>

      <div className={`max-w-6xl mx-auto grid gap-3 print:gap-0 ${preview ? 'p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} justify-items-center print-canvas`}>
        {stickers.map(n => (<Sticker key={n} b={b} pkgNo={n} total={stickers.length} size={selected}/>))}
      </div>

      <style jsx global>{`
        @page { size: ${selected.width}mm ${selected.height}mm; margin: 0; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .sticker-card { page-break-inside: avoid; page-break-after: always; margin: 0 !important; box-shadow: none !important; }
          .sticker-card:last-child { page-break-after: auto; }
        }
      `}</style>
    </div>
  )
}

function Sticker({ b, pkgNo, total, size }) {
  const barcodeRef = useRef(null)
  const [qr, setQr] = useState('')
  const w = Number(size.width); const h = Number(size.height)
  const isTiny = w <= 60 || h <= 30   // 50×25, 60×25 etc
  const isSmall = !isTiny && (w * h < 60 * 60)  // 75×50 range
  const isLandscape = w > h * 1.4
  // Compute unit for adaptive typography (mm-based)
  const u = Math.min(w, h) / 40

  useEffect(() => {
    const url = `${window.location.origin}/track/${b.lrNumber}`
    const qrSize = Math.max(80, Math.round(u * 24 * 3.78))
    QRCode.toDataURL(url, { width: qrSize, margin: 0, color: { dark:'#0B2545', light:'#ffffff' } }).then(setQr)
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, b.lrNumber, {
          format:'CODE128',
          displayValue: !isTiny,
          height: Math.max(18, Math.round(u * 5)),
          fontSize: Math.max(6, Math.round(u * 2.4)),
          background:'#ffffff',
          lineColor:'#0B2545',
          margin:0,
          width: Math.max(1, u * 0.35)
        })
      } catch(e){}
    }
  }, [b.lrNumber, pkgNo, total, w, h])

  const containerStyle = {
    width: `${w}mm`,
    height: `${h}mm`,
    padding: isTiny ? '1mm' : isSmall ? '1.5mm' : '2mm',
    boxSizing: 'border-box',
    fontSize: `${u * 2.4}mm`,
    color: '#0B2545',
    background: '#fff',
    display: 'flex',
    flexDirection: isLandscape ? 'row' : 'column',
    overflow: 'hidden',
  }

  // -------- TINY LAYOUT (50×25, 2×1) --------
  if (isTiny) {
    return (
      <div className="sticker-card border-2 border-[#0B2545] shadow-md print:shadow-none" style={containerStyle}>
        <div style={{ flex: '1 1 auto', display:'flex', flexDirection:'column', justifyContent:'center', minWidth:0, paddingRight:'1mm' }}>
          <div style={{ fontWeight:900, fontSize: `${u*2.4}mm`, lineHeight:1, letterSpacing:'-0.02em' }}>AGC {b.lrNumber.replace('AGC-','')}</div>
          <svg ref={barcodeRef} style={{ height:`${u*5}mm`, width:'100%', maxWidth:`${w*0.55}mm`, marginTop:'0.5mm' }}/>
          <div style={{ fontSize: `${u*2}mm`, fontWeight:800, marginTop:'0.3mm' }}>{pkgNo}/{total} · {b.destination}</div>
        </div>
        {qr && <img src={qr} alt="QR" style={{ width:`${u*8}mm`, height:`${u*8}mm`, alignSelf:'center' }}/>}
      </div>
    )
  }

  // -------- LANDSCAPE LAYOUT (100×50, 100×75) --------
  if (isLandscape) {
    return (
      <div className="sticker-card border-2 border-[#0B2545] shadow-md print:shadow-none" style={containerStyle}>
        <div style={{ flex: '1 1 60%', display:'flex', flexDirection:'column', minWidth:0, paddingRight:'2mm', borderRight:'1px solid #cbd5e1' }}>
          <div style={{ display:'flex', alignItems:'center', gap:`${u*0.5}mm`, borderBottom:`${u*0.4}mm solid #C9A227`, paddingBottom:`${u*0.4}mm` }}>
            <div style={{ width:`${u*4}mm`, height:`${u*4}mm`, background:'linear-gradient(135deg,#C9A227,#E8C55A)', borderRadius:`${u*0.6}mm`, display:'grid', placeItems:'center', flexShrink:0 }}><Truck style={{ width:`${u*2.4}mm`, height:`${u*2.4}mm`, color:'#0B2545' }} strokeWidth={2.5}/></div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:900, fontSize:`${u*2.8}mm`, lineHeight:1 }}>ASSAM GOODS CARRIER</div>
              <div style={{ fontSize:`${u*1.4}mm`, letterSpacing:'0.2em', color:'#C9A227', fontWeight:700 }}>SAFE • FAST • RELIABLE</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:'1mm', marginTop:`${u*0.5}mm` }}>
            <div style={{ fontSize:`${u*7}mm`, fontWeight:900, lineHeight:1 }}>{pkgNo}</div>
            <div style={{ fontSize:`${u*3.5}mm`, fontWeight:900, color:'#94a3b8' }}>/ {total}</div>
            <div style={{ marginLeft:'auto', fontSize:`${u*1.8}mm` }}>{b.date}</div>
          </div>
          <div style={{ fontSize:`${u*2.2}mm`, marginTop:`${u*0.5}mm`, lineHeight:1.25 }}>
            <div><b>{b.origin}</b> → <b style={{ color:'#C9A227' }}>{b.destination}</b></div>
            <div>{b.receiver?.name} · <b>{b.receiver?.phone || ''}</b></div>
            <div style={{ fontSize:`${u*1.8}mm`, color:'#475569' }}>Wt: {b.chargeableWeight || b.actualWeight || 0}kg</div>
          </div>
        </div>
        <div style={{ flex:'0 0 auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingLeft:'2mm' }}>
          <div style={{ fontWeight:900, fontSize:`${u*2.5}mm`, textAlign:'center' }}>{b.lrNumber}</div>
          <svg ref={barcodeRef} style={{ height:`${u*5}mm`, width:`${Math.min(w*0.35, 40)}mm`, marginTop:'0.5mm' }}/>
          {qr && <img src={qr} alt="QR" style={{ width:`${u*8}mm`, height:`${u*8}mm`, marginTop:'1mm', border:'1px solid #94a3b8' }}/>}
        </div>
      </div>
    )
  }

  // -------- PORTRAIT LAYOUT (100×150, 100×100, 75×50 portrait, small squares) --------
  return (
    <div className="sticker-card border-2 border-[#0B2545] shadow-md print:shadow-none" style={containerStyle}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:`${u*0.5}mm`, borderBottom:`${u*0.5}mm solid #C9A227`, paddingBottom:`${u*0.4}mm` }}>
        <div style={{ width:`${u*4}mm`, height:`${u*4}mm`, background:'linear-gradient(135deg,#C9A227,#E8C55A)', borderRadius:`${u*0.6}mm`, display:'grid', placeItems:'center', flexShrink:0 }}><Truck style={{ width:`${u*2.4}mm`, height:`${u*2.4}mm`, color:'#0B2545' }} strokeWidth={2.5}/></div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontWeight:900, fontSize:`${u*2.8}mm`, lineHeight:1 }}>ASSAM GOODS CARRIER</div>
          <div style={{ fontSize:`${u*1.4}mm`, letterSpacing:'0.2em', color:'#C9A227', fontWeight:700 }}>SAFE • FAST • RELIABLE</div>
        </div>
      </div>

      {/* Package # */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:`${u*0.4}mm` }}>
        <div style={{ fontSize:`${u*1.6}mm`, letterSpacing:'0.2em', color:'#64748b', textTransform:'uppercase' }}>Package No.</div>
        <div style={{ fontSize:`${u*1.6}mm`, color:'#64748b' }}>Date: <b style={{ color:'#0B2545' }}>{b.date}</b></div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:'1mm', borderBottom:'1px solid #cbd5e1', paddingBottom:`${u*0.3}mm` }}>
        <div style={{ fontSize:`${u*10}mm`, fontWeight:900, lineHeight:1 }}>{pkgNo}</div>
        <div style={{ fontSize:`${u*5}mm`, fontWeight:900, color:'#94a3b8' }}>/ {total}</div>
      </div>

      {/* Route */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:`${u*0.4}mm`, marginTop:`${u*0.5}mm` }}>
        <div style={{ border:'1px solid #cbd5e1', padding:`${u*0.4}mm` }}><div style={{ fontSize:`${u*1.4}mm`, color:'#64748b', textTransform:'uppercase' }}>From</div><div style={{ fontWeight:900, fontSize:`${u*2.6}mm`, lineHeight:1.1 }}>{b.origin}</div></div>
        <div style={{ border:'1px solid #cbd5e1', padding:`${u*0.4}mm` }}><div style={{ fontSize:`${u*1.4}mm`, color:'#64748b', textTransform:'uppercase' }}>To</div><div style={{ fontWeight:900, fontSize:`${u*2.6}mm`, color:'#C9A227', lineHeight:1.1 }}>{b.destination}</div></div>
      </div>

      {/* Consignor/Consignee - only on medium+ */}
      {!isSmall && (
        <div style={{ marginTop:`${u*0.5}mm`, fontSize:`${u*2}mm`, lineHeight:1.3 }}>
          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}><b>Consignor:</b> {b.sender?.name || '—'}</div>
          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}><b>Consignee:</b> {b.receiver?.name || '—'} <b>{b.receiver?.phone || ''}</b></div>
          <div style={{ fontSize:`${u*1.7}mm` }}><b>Wt:</b> {b.chargeableWeight || b.actualWeight || 0} kg · <b>Total Pkgs:</b> {total}</div>
        </div>
      )}
      {isSmall && (
        <div style={{ marginTop:`${u*0.4}mm`, fontSize:`${u*1.8}mm`, lineHeight:1.2 }}>
          <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>To: <b>{b.receiver?.name || '—'}</b> · {b.receiver?.phone || ''}</div>
        </div>
      )}

      {/* Barcode + QR footer */}
      <div style={{ marginTop:'auto', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:`${u*0.5}mm`, paddingTop:`${u*0.4}mm`, borderTop:`${u*0.5}mm solid #C9A227` }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:`${u*1.4}mm`, color:'#64748b', textTransform:'uppercase', lineHeight:1 }}>LR / Bilty No.</div>
          <div style={{ fontWeight:900, fontSize:`${u*3}mm`, lineHeight:1.1 }}>{b.lrNumber}</div>
          <svg ref={barcodeRef} style={{ width:`${Math.min(w*0.55, 55)}mm`, height:`${u*5}mm`, marginTop:'0.5mm' }}/>
        </div>
        {qr && <img src={qr} alt="QR" style={{ width:`${u*8.5}mm`, height:`${u*8.5}mm`, border:'1px solid #94a3b8', flexShrink:0 }}/>}
      </div>
    </div>
  )
}
