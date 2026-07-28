'use client';
import { useState } from 'react';
import React from 'react';

export default function AdvancedRateCalculator() {
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');
  const [boxes, setBoxes] = useState([{ length: '', breadth: '', height: '', count: 1 }]);
  const [shipmentWeight, setShipmentWeight] = useState('');
  const [shipmentAmount, setShipmentAmount] = useState('');
  const [result, setResult] = useState(null);

  const addBoxRow = () => setBoxes([...boxes, { length: '', breadth: '', height: '', count: 1 }]);
  const updateBox = (index, field, value) => {
    const newBoxes = [...boxes];
    newBoxes[index][field] = value;
    setBoxes(newBoxes);
  };
  const removeBox = (index) => setBoxes(boxes.filter((_, i) => i !== index));

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!fromPincode || !toPincode) {
      alert('Please enter From and To Pincodes');
      return;
    }

    let totalVolumetricWt = 0;
    boxes.forEach(b => {
      if (b.length && b.breadth && b.height) {
        const vol = (parseFloat(b.length) * parseFloat(b.breadth) * parseFloat(b.height) / 5000) * parseFloat(b.count || 1);
        totalVolumetricWt += vol;
      }
    });

    const finalWt = Math.max(parseFloat(shipmentWeight || 0), totalVolumetricWt, 1);
    const baseFreight = Math.round(finalWt * 18 + 150);
    const fuelSurcharge = Math.round(baseFreight * 0.12);
    const insuranceCharge = shipmentAmount ? Math.round(parseFloat(shipmentAmount) * 0.004) : 50;
    
    const subtotal = baseFreight + 15 + fuelSurcharge + insuranceCharge;
    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;

    setResult({
      totalWeight: finalWt.toFixed(2),
      baseFreight,
      fuelSurcharge,
      insuranceCharge,
      gstAmount,
      totalAmount,
      estimatedDelivery: '3-4 Business Days'
    });
  };

  return (
    <div style={{ background: '#0b192c', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif', paddingBottom: '40px', color: '#fff' }}>
      
      {/* Header */}
      <header style={{ background: '#08121e', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ff7b00', fontStyle: 'italic', lineHeight: '1' }}>A</div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '16px', color: '#ffffff', letterSpacing: '0.5px', display: 'block' }}>ASSAM GOODS CARRIER</span>
            <span style={{ fontSize: '9px', color: '#ff7b00', fontWeight: '700', letterSpacing: '1.5px' }}>SAFE • FAST • RELIABLE</span>
          </div>
        </div>
        <a href="/super-admin/dashboard" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>← Back to Dashboard</a>
      </header>

      {/* Calculator Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '25px', background: '#102238', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          {/* Left Form */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>📍 Route & Pincode Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>FROM PINCODE</label>
                <input type="text" placeholder="e.g. 134113" value={fromPincode} onChange={(e) => setFromPincode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>TO PINCODE</label>
                <input type="text" placeholder="e.g. 227405" value={toPincode} onChange={(e) => setToPincode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff', fontSize: '14px' }} />
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>📦 Package Dimensions</h3>
            <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              {boxes.map((box, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input type="number" placeholder="Qty" value={box.count} onChange={(e) => updateBox(idx, 'count', e.target.value)} style={{ width: '65px', padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', textAlign: 'center' }} />
                  <input type="number" placeholder="Length (cm)" value={box.length} onChange={(e) => updateBox(idx, 'length', e.target.value)} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                  <input type="number" placeholder="Breadth (cm)" value={box.breadth} onChange={(e) => updateBox(idx, 'breadth', e.target.value)} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                  <input type="number" placeholder="Height (cm)" value={box.height} onChange={(e) => updateBox(idx, 'height', e.target.value)} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                  {boxes.length > 1 && <button type="button" onClick={() => removeBox(idx)} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer' }}>✕</button>}
                </div>
              ))}
              <button type="button" onClick={addBoxRow} style={{ background: 'transparent', border: 'none', color: '#ff7b00', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>+ Add Another Box Size</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>TOTAL WEIGHT (KG)</label>
                <input type="number" placeholder="e.g. 20" value={shipmentWeight} onChange={(e) => setShipmentWeight(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>INVOICE AMOUNT (₹)</label>
                <input type="number" placeholder="e.g. 15000" value={shipmentAmount} onChange={(e) => setShipmentAmount(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff' }} />
              </div>
            </div>

            <button onClick={handleCalculate} style={{ width: '100%', background: '#ff7b00', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
              Calculate Final Quote
            </button>
          </div>

          {/* Right Result Summary */}
          <div>
            {result ? (
              <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.1)', padding: '25px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Surface Express</span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#ff7b00' }}>₹{result.totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Delivery in {result.estimatedDelivery} • Chargeable Weight: {result.totalWeight} kg</div>
                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }} />
                <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Base freight</span><span>₹{result.baseFreight}</span></div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Fuel surcharges</span><span>₹{result.fuelSurcharge}</span></div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Insurance & Handling</span><span>₹{result.insuranceCharge}</span></div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><span>GST (18%)</span><span>₹{result.gstAmount}</span></div>
                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }} />
                <button style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Book Shipment Now
                </button>
              </div>
            ) : (
              <div style={{ background: '#0b192c', border: '2px dashed rgba(255,255,255,0.15)', padding: '60px 20px', borderRadius: '10px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧮</div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#ffffff' }}>Ready to Calculate</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>Enter pincodes and box dimensions on left to view instant freight quote.</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}