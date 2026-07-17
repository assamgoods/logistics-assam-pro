'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Printer, Truck, Eye, Package, FileText, Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

const COMPANY = { name: 'ASSAM GOODS CARRIER', tagline: 'SAFE • FAST • RELIABLE', mobile: '8847428801', gst: '18AABCA1234A1Z5', address: 'Head Office: G.S. Road, Guwahati, Assam - 781005', email: 'bookings@assamgoodscarrier.in' }

export default function PrintLR() {
  const { lr } = useParams()
  const searchParams = useSearchParams()
  const [b, setB] = useState(null)
  const [copies, setCopies] = useState(Number(searchParams.get('copies') || 2))
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${encodeURIComponent(lr)}`).then(r=>r.json()).then(d => { if (d.ok) setB(d.booking) })
  }, [lr])

  if (!b) return <div className="p-10 text-center text-slate-500">Loading LR...</div>

  const copiesArr = Array.from({ length: copies }, (_, i) => i)

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:py-0 print:bg-white">
      <div className="no-print print-toolbar sticky top-0 max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-3 mb-4 px-4 py-3 rounded-b-xl border-b border-slate-200 bg-white" style={{ zIndex: 100 }}>
        <div className="flex items-center gap-2">
          <a href={`/admin`} className="text-sm text-slate-600 hover:text-[#0B2545]">← Back to Admin</a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">No. of Copies</Label>
            <Select value={String(copies)} onValueChange={v=>setCopies(Number(v))}>
              <SelectTrigger className="w-28 h-9"><SelectValue/></SelectTrigger>
              <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} {n===1?'Copy':'Copies'}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={()=>setPreview(p=>!p)}><Eye className="h-4 w-4 mr-2"/>{preview?'Exit Preview':'Print Preview'}</Button>
          <a href={`/sticker/${lr}`} target="_blank" rel="noreferrer"><Button variant="outline"><Package className="h-4 w-4 mr-2"/>Box Stickers</Button></a>
          <Button onClick={()=>window.print()} className="bg-[#0B2545] hover:bg-[#13315C] text-white font-bold"><Printer className="h-4 w-4 mr-2"/>Print LR</Button>
          <Button onClick={()=>window.print()} className="bg-agc-gold text-[#0B2545] hover:brightness-110 font-bold"><Download className="h-4 w-4 mr-2"/>Save as PDF</Button>
        </div>
      </div>

      <div className={`max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none print-canvas ${preview ? 'ring-2 ring-agc-gold' : ''}`}>
        {copiesArr.map(i => (<LRCopy key={i} b={b} copyIndex={i} totalCopies={copies}/>))}
      </div>

      <style jsx global>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .lr-copy { page-break-inside: avoid; }
          .lr-copy:not(:nth-child(2n)) { border-bottom: 1px dashed #64748b; }
        }
      `}</style>
    </div>
  )
}

function LRCopy({ b, copyIndex, totalCopies }) {
  const barcodeRef = useRef(null)
  const [qr, setQr] = useState('')

  useEffect(() => {
    const trackUrl = `${window.location.origin}/track/${b.lrNumber}`
    QRCode.toDataURL(trackUrl, { width: 140, margin: 0, color: { dark:'#0B2545', light:'#ffffff' } }).then(setQr)
    if (barcodeRef.current) {
      try { JsBarcode(barcodeRef.current, b.lrNumber, { format:'CODE128', displayValue:false, height:36, background:'#ffffff', lineColor:'#0B2545', margin:0, width:1.4 }) } catch(e){}
    }
  }, [b.lrNumber])

  const freight = Number((b.chargeableWeight || b.actualWeight || 0) * b.freightRate) || 0
  const rows = [
    ['Freight', freight],
    ['Bilty Charge', b.biltyCharge || 0],
    ['Hamali', b.hamali || 0],
    ['Door Delivery', b.doorDeliveryCharge || 0],
    ['Loading/Unloading', b.loadingUnloading || 0],
    ['Insurance', b.insurance || 0],
    ['Other Charges', b.otherCharges || 0],
  ]
  const sub = rows.reduce((a,[,v])=>a+Number(v||0),0)
  const gst = Math.round(sub * 0.18)
  const total = b.totalAmount || (sub + gst)
  const isFirstHalf = copyIndex % 2 === 0
  const showCutLine = totalCopies > 1 && isFirstHalf && copyIndex + 1 < totalCopies

  const paymentBadge = { PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300', PENDING: 'bg-amber-100 text-amber-900 border-amber-300', TO_PAY: 'bg-blue-100 text-blue-800 border-blue-300', TBB: 'bg-purple-100 text-purple-800 border-purple-300' }[b.paymentStatus] || 'bg-slate-100 text-slate-700 border-slate-300'

  return (
    <div className="lr-copy relative" style={{ width: '210mm', height: '148.5mm', boxSizing: 'border-box', padding: '5mm 6mm', pageBreakInside: 'avoid', overflow: 'hidden' }}>
      {/* Watermark */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none opacity-[0.04]"><Truck className="h-64 w-64 text-[#0B2545]"/></div>

      {/* Header */}
      <div className="relative flex items-start justify-between border-b-[3px] border-agc-gold pb-1.5">
        <div className="flex items-center gap-2">
          <div className="h-11 w-11 rounded-md gradient-gold grid place-items-center"><Truck className="h-6 w-6 text-[#0B2545]" strokeWidth={2.5}/></div>
          <div>
            <div className="text-[16px] font-black text-[#0B2545] leading-tight">{COMPANY.name}</div>
            <div className="text-[7px] tracking-[0.3em] text-agc-gold font-bold">{COMPANY.tagline}</div>
            <div className="text-[8px] text-slate-600 leading-tight mt-0.5">{COMPANY.address}</div>
            <div className="text-[8px] text-slate-600">Mob: <b>{COMPANY.mobile}</b> • GSTIN: <b>{COMPANY.gst}</b> • {COMPANY.email}</div>
          </div>
        </div>
        <div className="text-right flex items-start gap-2">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500">LR / Bilty No.</div>
            <div className="text-[15px] font-black text-[#0B2545] leading-tight">{b.lrNumber}</div>
            <svg ref={barcodeRef} style={{ height: '10mm', width: '40mm' }}/>
            <div className="text-[8px] text-slate-500">Date: <b>{b.date}</b></div>
          </div>
          {qr && <img src={qr} alt="QR" style={{ width: '18mm', height: '18mm' }} className="border border-slate-300"/>}
        </div>
      </div>

      {/* Copy label */}
      <div className="relative flex justify-between items-center mt-1">
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Consignment Note / Lorry Receipt</div>
        <div className={`text-[8px] font-bold px-2 py-0.5 rounded border ${paymentBadge}`}>{b.paymentStatus === 'TBB' ? 'TO BE BILLED' : b.paymentStatus?.replace('_',' ')} ({b.paymentMode})</div>
      </div>

      {/* Sender/Receiver */}
      <div className="relative grid grid-cols-2 gap-2 mt-1">
        <PartyBox title="CONSIGNOR (SENDER)" name={b.sender?.name} phone={b.sender?.phone} gst={b.sender?.gst} address={b.sender?.address}/>
        <PartyBox title="CONSIGNEE (RECEIVER)" name={b.receiver?.name} phone={b.receiver?.phone} gst={b.receiver?.gst} address={b.receiver?.address}/>
      </div>

      {/* Shipment Details */}
      <div className="relative grid grid-cols-6 gap-1 mt-1.5 text-[9px]">
        <MiniCell k="From" v={b.origin}/>
        <MiniCell k="To" v={b.destination}/>
        <MiniCell k="Packages" v={b.packages}/>
        <MiniCell k="Actual Wt" v={`${b.actualWeight || 0} kg`}/>
        <MiniCell k="Chargeable Wt" v={`${b.chargeableWeight || 0} kg`}/>
        <MiniCell k="Rate" v={`₹${b.freightRate}/kg`}/>
        <MiniCell k="Invoice No." v={b.invoiceNumber || '—'}/>
        <MiniCell k="E-Way Bill" v={b.eWayBill || '—'}/>
        <MiniCell k="ETA" v={b.eta || '—'}/>
        <MiniCell k="Branch" v={b.branchCode || 'HO'}/>
        <MiniCell k="Status" v={b.status}/>
        <MiniCell k="Volumetric" v={`${b.volumetricWeight || 0} kg`}/>
      </div>

      {/* Charges + Terms side by side */}
      <div className="relative grid grid-cols-2 gap-2 mt-1.5">
        <div className="border border-slate-400 text-[8.5px]">
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-400 font-bold text-[#0B2545]"><div className="px-1.5 py-1">DESCRIPTION</div><div className="px-1.5 py-1 text-right border-l border-slate-400">AMOUNT (₹)</div></div>
          {rows.map(([k,v]) => (<div key={k} className="grid grid-cols-2 border-b border-slate-200 last:border-b-0"><div className="px-1.5 py-0.5">{k}</div><div className="px-1.5 py-0.5 text-right border-l border-slate-200">{Number(v||0).toLocaleString('en-IN')}</div></div>))}
          <div className="grid grid-cols-2 border-t border-slate-400 font-semibold"><div className="px-1.5 py-0.5">Sub Total</div><div className="px-1.5 py-0.5 text-right border-l border-slate-400">{sub.toLocaleString('en-IN')}</div></div>
          <div className="grid grid-cols-2 border-t border-slate-200"><div className="px-1.5 py-0.5">GST @ 18%</div><div className="px-1.5 py-0.5 text-right border-l border-slate-200">{gst.toLocaleString('en-IN')}</div></div>
          <div className="grid grid-cols-2 bg-agc-gold/30 border-t border-slate-400 font-black text-[#0B2545] text-[10px]"><div className="px-1.5 py-1">GRAND TOTAL</div><div className="px-1.5 py-1 text-right border-l border-slate-400">₹{Number(total).toLocaleString('en-IN')}</div></div>
        </div>
        <div className="border border-slate-400 text-[7.5px] p-1.5">
          <div className="font-bold text-[#0B2545] text-[8.5px] mb-0.5">TERMS & CONDITIONS</div>
          <ol className="list-decimal pl-3 space-y-0.5 leading-tight">
            <li>Goods once dispatched will not be taken back.</li>
            <li>Company is not responsible for damage in transit due to Act of God, war, riot, strike or natural calamity.</li>
            <li>All claims must be reported within 24 hours of delivery in writing.</li>
            <li>Insurance liability limited to declared value only. Uninsured goods carried at owner's risk.</li>
            <li>Weight is subject to physical verification. Freight is charged as per chargeable weight.</li>
            <li>Freight/charges are payable in advance unless specified as 'To Pay' or 'TBB'.</li>
            <li>Subject to Guwahati jurisdiction. Any dispute settled here only.</li>
          </ol>
          {b.remarks && (<div className="mt-1 pt-1 border-t border-slate-300"><b className="text-[8px] text-[#0B2545]">Remarks:</b> <span className="text-[8px]">{b.remarks}</span></div>)}
        </div>
      </div>

      {/* Signatures */}
      <div className="relative grid grid-cols-3 gap-2 mt-1.5 text-[8px]">
        <div className="border-t border-slate-500 pt-0.5 text-center"><b>Consignor Signature</b><div className="text-[7px] text-slate-500">(Booking Party)</div></div>
        <div className="border-t border-slate-500 pt-0.5 text-center"><b>For {COMPANY.name}</b><div className="text-[7px] text-slate-500">(Booking Clerk)</div></div>
        <div className="border-t border-slate-500 pt-0.5 text-center"><b>Receiver Signature</b><div className="text-[7px] text-slate-500">(At Delivery)</div></div>
      </div>

      {/* Cut line */}
      {showCutLine && (<div className="absolute left-0 right-0 bottom-0 border-t-2 border-dashed border-slate-500 pt-0.5"><div className="text-center text-[7px] text-slate-500 uppercase tracking-widest">✂ Cut Here ✂</div></div>)}
    </div>
  )
}

function PartyBox({ title, name, phone, gst, address }) {
  return (
    <div className="border border-slate-400 text-[9px] leading-tight">
      <div className="bg-slate-100 border-b border-slate-400 px-1.5 py-0.5 font-bold text-[#0B2545] text-[8px] uppercase tracking-wider">{title}</div>
      <div className="px-1.5 py-1 space-y-0.5">
        <div><b>Name:</b> {name || '—'}</div>
        <div><b>Mobile:</b> {phone || '—'} {gst && <span className="ml-2"><b>GSTIN:</b> {gst}</span>}</div>
        <div><b>Address:</b> {address || '—'}</div>
      </div>
    </div>
  )
}

function MiniCell({ k, v }) {
  return (
    <div className="border border-slate-300 px-1 py-0.5">
      <div className="text-[6.5px] uppercase tracking-widest text-slate-500 leading-none">{k}</div>
      <div className="font-semibold text-[#0B2545] leading-tight">{v || '—'}</div>
    </div>
  )
}
