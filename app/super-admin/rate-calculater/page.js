'use client';
import { useState } from 'react';
import React from 'react';

export default function AdvancedRateCalculator() {
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');
  
  const [boxes, setBoxes] = useState([{ length: '', breadth: '', height: '', count: 1 }]);
  const [shipmentWeight, setShipmentWeight] = useState('');
  const [shipmentAmount, setShipmentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Prepaid');
  const [freightType, setFreightType] = useState('Freight on Pickup');
  const [insuranceType, setInsuranceType] = useState("Owner's Risk");
  const [result, setResult] = useState(null);

  const addBoxRow = () => {
    setBoxes([...boxes, { length: '', breadth: '', height: '', count: 1 }]);
  };

  const updateBox = (index, field, value) => {
    const newBoxes = [...boxes];
    newBoxes[index][field] = value;
    setBoxes(newBoxes);
  };

  const removeBox = (index) => {
    const newBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(newBoxes);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    let totalVolumetricWt = 0;
    boxes.forEach(b => {
      if(b.length && b.breadth && b.height) {
        const vol = (parseFloat(b.length) * parseFloat(b.breadth) * parseFloat(b.height) / 5000) * parseFloat(b.count || 1);
        totalVolumetricWt += vol;
      }
    });

    const finalWt = Math.max(parseFloat(shipmentWeight || 0), totalVolumetricWt, 1);
    const baseFreight = Math.round(finalWt * 16 + 120);
    const fuelHike = 10;
    const fuelSurcharge = Math.round(baseFreight * 0.1);
    const insuranceCharge = shipmentAmount ? Math.round(parseFloat(shipmentAmount) * 0.004) : 45;
    
    const subtotal = baseFreight + fuelHike + fuelSurcharge + insuranceCharge;
    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;

    setResult({
      totalWeight: finalWt.toFixed(2),
      baseFreight,
      fuelHike,
      fuelSurcharge,
      insuranceCharge,
      subtotal,
      gstAmount,
      totalAmount
    });
  };

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif', paddingBottom: '40px' }}>
      
      {/* 100% Matching Website Header */}
      <header style={{ background: '#113575', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        
        {/* Left: Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '34px', fontWeight: '900', color: '#f37021', fontStyle: 'italic', letterSpacing: '-1px', lineHeight: '1' }}>
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontWeight: '900', fontSize: '18px', color: '#ffffff', letterSpacing: '0.5px', lineHeight: '1.1' }}>
              ASSAM GOODS CARRIER
            </span>
            <span style={{ fontSize: '9px', color: '#f37021', fontWeight: '700', letterSpacing: '1.5px', marginTop: '2px' }}>
              SAFE • FAST • RELIABLE
            </span>
          </div>
        </div>

        {/* Center: Main Navigation */}
        <nav style={{ display: 'flex', gap: '25px', fontSize: '14px', fontWeight: '600' }}>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Track</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Services</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Coverage</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Contact</a>
        </nav>

        {/* Right: Sub Navigation & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', fontWeight: '600' }}>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Customer</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Branch</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Driver</a>
          <a href="/super-admin/dashboard" style={{ color: '#ffffff', textDecoration: 'none' }}>Admin</a>
          
          <a href="tel:8847428801" style={{ background: '#f37021', color: '#000000', padding: '8px 20px', borderRadius: '30px', fontSize: '14px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}>
            <span style={{ fontSize: '14px' }}>📞</span> 8847428801
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Main Grid Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '25px', background: '#ffffff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          {/* Left Form Section */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#113575', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              📍 Route & Pincode Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>FROM PINCODE</label>
                <input 
                  type="text" placeholder="e.g. 134113" value={fromPincode} onChange={(e) => setFromPincode(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>TO PINCODE</label>
                <input 
                  type="text" placeholder="e.g. 227405" value={toPincode} onChange={(e) => setToPincode(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#113575', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              📦 Package Dimensions & Quantities
            </h3>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              {boxes.map((box, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input 
                    type="number" placeholder="Qty" value={box.count} onChange={(e) => updateBox(idx, 'count', e.target.value)}
                    style={{ width: '65px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }} 
                  />
                  <input 
                    type="number" placeholder="Length (cm)" value={box.length} onChange={(e) => updateBox(idx, 'length', e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                  />
                  <input 
                    type="number" placeholder="Breadth (cm)" value={box.breadth} onChange={(e) => updateBox(idx, 'breadth', e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                  />
                  <input 
                    type="number" placeholder="Height (cm)" value={box.height} onChange={(e) => updateBox(idx, 'height', e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                  />
                  {boxes.length > 1 && (
                    <button type="button" onClick={() => removeBox(idx)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addBoxRow} style={{ background: 'transparent', border: 'none', color: '#f37021', cursor: 'pointer', fontWeight: '700', fontSize: '13px', marginTop: '6px' }}>
                + Add Another Box Size
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>TOTAL WEIGHT (KG)</label>
                <input 
                  type="number" placeholder="e.g. 20" value={shipmentWeight} onChange={(e) => setShipmentWeight(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>INVOICE AMOUNT (₹)</label>
                <input 
                  type="number" placeholder="e.g. 15000" value={shipmentAmount} onChange={(e) => setShipmentAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>PAYMENT MODE</label>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#334155' }}>
                <label style={{ cursor: 'pointer' }}><input type="radio" name="pay" checked={paymentMode === 'Prepaid'} onChange={() => setPaymentMode('Prepaid')} /> Prepaid</label>
                <label style={{ cursor: 'pointer' }}><input type="radio" name="pay" checked={paymentMode === 'COD'} onChange={() => setPaymentMode('COD')} /> Collect on Delivery (COD)</label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>FREIGHT TYPE</div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', cursor: 'pointer' }}><input type="radio" name="freight" checked={freightType === 'Freight on Pickup'} onChange={() => setFreightType('Freight on Pickup')} /> Freight on Pickup</label>
                <label style={{ display: 'block', fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="freight" checked={freightType === 'Freight on Delivery'} onChange={() => setFreightType('Freight on Delivery')} /> Freight on Delivery</label>
              </div>
              <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>INSURANCE OPTION</div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', cursor: 'pointer' }}><input type="radio" name="ins" checked={insuranceType === "Owner's Risk"} onChange={() => setInsuranceType("Owner's Risk")} /> Owner&apos;s Risk</label>
                <label style={{ display: 'block', fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="ins" checked={insuranceType === "Carrier's Insurance"} onChange={() => setInsuranceType("Carrier's Insurance")} /> Carrier&apos;s Insurance</label>
              </div>
            </div>

            <button onClick={handleCalculate} style={{ width: '100%', background: '#113575', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(17,53,117,0.2)' }}>
              Calculate Final Quote
            </button>
          </div>

          {/* Right Summary / Breakdown Section */}
          <div>
            {result ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '10px', position: 'sticky', top: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#113575' }}>Surface Express</span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#113575' }}>₹{result.totalAmount}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
                  Estimated Delivery in 3-4 days • Total Weight: {result.totalWeight} kg
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #cbd5e1', marginBottom: '15px' }} />

                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: '#1e293b' }}>
                  <span>Freight Breakdown</span>
                  <span>₹{result.subtotal}</span>
                </div>

                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Base freight charges</span>
                  <span>₹{result.baseFreight}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Fuel hike charges</span>
                  <span>₹{result.fuelHike}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Fuel surcharges</span>
                  <span>₹{result.fuelSurcharge}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Insurance ROV</span>
                  <span>₹{result.insuranceCharge}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <span>GST at 18%</span>
                  <span>₹{result.gstAmount}</span>
                </div>

                <button style={{ width: '100%', background: '#f37021', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(243,112,33,0.3)' }}>
                  Create Order & Generate Bilty
                </button>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '50px 20px', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧮</div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#334155' }}>Ready to Calculate</div>
                <p style={{ fontSize: '13px', margin: '5px 0 0 0' }}>Enter pincodes, dimensions & click calculate to generate price breakdown.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}