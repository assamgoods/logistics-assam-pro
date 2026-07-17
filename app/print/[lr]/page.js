'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Printer, Truck, Download } from 'lucide-react'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

export default function PrintLR() {
  const { lr } = useParams()
  const [b, setB] = useState(null)
  const [qr, setQr] = useState('')
  const barcodeRef = useRef(null)

  useEffect(() => {
    fetch(`/api/bookings/${encodeURIComponent(lr)}`).then(r=>r.json()).then(d => { if (d.ok) setB(d.booking) })
  }, [lr])

  useEffect(() => {
    if (!b) return
    const trackUrl = `${window.location.origin}/track/${b.lrNumber}`
    QRCode.toDataURL(trackUrl, { width: 180, margin: 1, color: { dark:'#0B2545', light:'#ffffff' } }).then(setQr)
    if (barcodeRef.current) {
      try { JsBarcode(barcodeRef.current, b.lrNumber, { format:'CODE128', displayValue:true, height:50, fontSize:12, background:'#ffffff', lineColor:'#0B2545', margin:0 }) } catch(e){}
    }
  }, [b])

  if (!b) return <div className="p-10 text-center text-slate-500">Loading LR...</div>

  const rows = [
    ['Freight', b.chargeableWeight * b.freightRate],
    ['Bilty Charge', b.biltyCharge], ['Door Delivery', b.doorDeliveryCharge],
    ['Insurance', b.insurance], ['Loading/Unloading', b.loadingUnloading], ['Other', b.otherCharges],
  ]
  const sub = rows.reduce((a,[,v])=>a+Number(v||0),0)
  const gst = Math.round(sub * 0.18)
  const total = b.totalAmount || (sub + gst)

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="no-print max-w-4xl mx-auto flex justify-end gap-2 mb-4 px-4">
        <Button onClick={()=>window.print()} className="bg-[#0B2545] text-white"><Printer className="h-4 w-4 mr-2"/>Print LR / Save PDF</Button>
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-xl p-8 print:shadow-none print:p-6">
        <div className="flex items-start justify-between border-b-4 border-agc-gold pb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-lg gradient-gold grid place-items-center"><Truck className="h-7 w-7 text-[#0B2545]"/></div>
            <div>
              <div className="text-2xl font-black text-[#0B2545]">ASSAM GOODS CARRIER</div>
              <div className="text-xs tracking-[0.3em] text-agc-gold font-semibold">SAFE • FAST • RELIABLE</div>
              <div className="text-xs text-slate-600 mt-1">Head Office: Guwahati, Assam • Mob: 8847428801</div>
            </div>
          </div>
          <div className="text-right flex items-start gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">LR / Bilty No.</div>
              <div className="text-xl font-black text-[#0B2545]">{b.lrNumber}</div>
              <div className="text-xs text-slate-500 mt-1">Date: {b.date}</div>
              <svg ref={barcodeRef} className="mt-2"/>
            </div>
            {qr && <img src={qr} alt="QR" className="w-24 h-24 border border-slate-300"/>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-5">
          <Box title="Consignor (Sender)">
            <Row k="Name" v={b.sender?.name}/><Row k="Phone" v={b.sender?.phone}/><Row k="GSTIN" v={b.sender?.gst}/><Row k="Pickup Address" v={b.sender?.address}/>
          </Box>
          <Box title="Consignee (Receiver)">
            <Row k="Name" v={b.receiver?.name}/><Row k="Phone" v={b.receiver?.phone}/><Row k="GSTIN" v={b.receiver?.gst}/><Row k="Delivery Address" v={b.receiver?.address}/>
          </Box>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
          <Cell k="Origin" v={b.origin}/><Cell k="Destination" v={b.destination}/>
          <Cell k="Invoice No." v={b.invoiceNumber}/><Cell k="Packages" v={b.packages}/>
          <Cell k="Actual Wt" v={`${b.actualWeight} kg`}/><Cell k="Volumetric Wt" v={`${b.volumetricWeight} kg`}/>
          <Cell k="Chargeable Wt" v={`${b.chargeableWeight} kg`}/><Cell k="Freight Rate" v={`₹${b.freightRate}/kg`}/>
        </div>

        <table className="w-full mt-5 border border-slate-300 text-sm">
          <thead className="bg-slate-100"><tr><th className="text-left p-2 border-b border-slate-300">Description</th><th className="text-right p-2 border-b border-slate-300">Amount (₹)</th></tr></thead>
          <tbody>
            {rows.map(([k,v])=>(<tr key={k}><td className="p-2 border-b border-slate-200">{k}</td><td className="p-2 text-right border-b border-slate-200">{Number(v||0).toLocaleString('en-IN')}</td></tr>))}
            <tr><td className="p-2 font-semibold">Sub Total</td><td className="p-2 text-right font-semibold">{sub.toLocaleString('en-IN')}</td></tr>
            <tr><td className="p-2">GST @ 18%</td><td className="p-2 text-right">{gst.toLocaleString('en-IN')}</td></tr>
            <tr className="bg-agc-gold/20"><td className="p-2 font-black text-[#0B2545]">TOTAL</td><td className="p-2 text-right font-black text-[#0B2545]">₹{Number(total).toLocaleString('en-IN')}</td></tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-4 mt-6 text-xs">
          <div><b>Payment:</b> {b.paymentStatus} ({b.paymentMode})</div>
          <div><b>Status:</b> {b.status}</div>
          <div><b>ETA:</b> {b.eta || '—'}</div>
        </div>

        {b.pod && (
          <div className="mt-4 border border-emerald-300 bg-emerald-50 rounded p-3 text-xs">
            <b className="text-emerald-800">Proof of Delivery</b> — received by {b.pod.receiverName || 'receiver'} on {new Date(b.pod.receivedAt).toLocaleString('en-IN')}
            {b.pod.signature && <img src={b.pod.signature} alt="signature" className="h-16 mt-2 bg-white border"/>}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mt-10 text-xs">
          <div className="border-t border-slate-400 pt-2 text-center">Consignor Signature</div>
          <div className="border-t border-slate-400 pt-2 text-center">For Assam Goods Carrier</div>
          <div className="border-t border-slate-400 pt-2 text-center">Receiver Signature</div>
        </div>

        <div className="mt-6 text-[10px] text-slate-500 border-t border-slate-200 pt-3">
          Terms: Goods once dispatched will not be taken back. Complaints must be reported within 24 hours of delivery. Insurance liability limited to declared value. Subject to Guwahati jurisdiction.
        </div>
      </div>
    </div>
  )
}

function Box({ title, children }) { return (<div className="border border-slate-300 rounded p-3"><div className="font-bold text-[#0B2545] text-xs uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">{title}</div><div className="space-y-1">{children}</div></div>) }
function Row({ k, v }) { return (<div className="text-sm grid grid-cols-3 gap-2"><div className="text-slate-500">{k}</div><div className="col-span-2 font-medium text-slate-800">{v || '—'}</div></div>) }
function Cell({ k, v }) { return (<div className="border border-slate-200 rounded p-2"><div className="text-[10px] uppercase tracking-widest text-slate-500">{k}</div><div className="font-semibold text-[#0B2545]">{v || '—'}</div></div>) }
