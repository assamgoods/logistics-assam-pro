'use client';
import { useState } from 'node_modules/@types/react'; // Agar react import standard hai toh 'react' use karein
import React from 'react';

export default function AdvancedRateCalculator() {
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');
  
  // Multiple boxes state
  const [boxes, setBoxes] = useState([{ length: '', breadth: '', height: '', count: 1 }]);
  
  const [shipmentWeight, setShipmentWeight] = useState('');
  const [shipmentAmount, setShipmentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Prepaid');
  const [freightType, setFreightType] = useState('Freight on Pickup');
  const [insuranceType, setInsuranceType] = useState("Owner's Risk");
  const [selfDrop, setSelfDrop] = useState('No, Pickup from me');

  const [result, setResult] = useState(null);

  // Add box row
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
    
    // Dummy calculation logic (Aap apne Zone/Matrix ke hisab se ise customize kar sakte hain)
    let totalVolumetricWt = 0;
    boxes.forEach(b => {
      if(b.length && b.breadth && b.height) {
        const vol = (parseFloat(b.length) * parseFloat(b.breadth) * parseFloat(b.height) / 5000) * parseFloat(b.count || 1);
        totalVolumetricWt += vol;
      }
    });

    const finalWt = Math.max(parseFloat(shipmentWeight || 0), totalVolumetricWt, 1);
    const baseFreight = Math.round(finalWt * 15 + 100);
    const fuelHike = 5;
    const fuelSurcharge = Math.round(baseFreight * 0.1);
    const insuranceCharge = shipmentAmount ? Math.round(parseFloat(shipmentAmount) * 0.004) : 40;
    
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
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
        
        {/* Left Form Section */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          
          {/* Pincode Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>From Pincode</label>
              <input 
                type="text" 
                placeholder="e.g. 134113" 
                value={fromPincode}
                onChange={(e) => setFromPincode(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>To Pincode</label>
              <input 
                type="text" 
                placeholder="e.g. 227405" 
                value={toPincode}
                onChange={(e) => setToPincode(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          {/* Boxes Section */}
          <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '20px', background: '#fafafa' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Boxes Dimension</div>
            
            {boxes.map((box, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input 
                  type="number" placeholder="Qty" value={box.count} 
                  onChange={(e) => updateBox(idx, 'count', e.target.value)}
                  style={{ width: '60px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                <input 
                  type="number" placeholder="L (cm)" value={box.length} 
                  onChange={(e) => updateBox(idx, 'length', e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                <input 
                  type="number" placeholder="B (cm)" value={box.breadth} 
                  onChange={(e) => updateBox(idx, 'breadth', e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                <input 
                  type="number" placeholder="H (cm)" value={box.height} 
                  onChange={(e) => updateBox(idx, 'height', e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                {boxes.length > 1 && (
                  <button type="button" onClick={() => removeBox(idx)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                )}
              </div>
            ))}

            <button type="button" onClick={addBoxRow} style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginTop: '5px' }}>
              + Add Another Box Size
            </button>
          </div>

          {/* Weight & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Shipment Weight (Kg)</label>
              <input 
                type="number" 
                placeholder="Weight in Kg" 
                value={shipmentWeight}
                onChange={(e) => setShipmentWeight(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Shipment Amount (₹)</label>
              <input 
                type="number" 
                placeholder="Invoice Value" 
                value={shipmentAmount}
                onChange={(e) => setShipmentAmount(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Payment Mode</label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label><input type="radio" name="pay" checked={paymentMode === 'Prepaid'} onChange={() => setPaymentMode('Prepaid')} /> Prepaid</label>
              <label><input type="radio" name="pay" checked={paymentMode === 'COD'} onChange={() => setPaymentMode('COD')} /> Collect on Delivery (COD)</label>
            </div>
          </div>

          {/* Sub options row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Freight</div>
              <label style={{ display: 'block', fontSize: '13px' }}><input type="radio" name="freight" checked={freightType === 'Freight on Pickup'} onChange={() => setFreightType('Freight on Pickup')} /> Freight on Pickup</label>
              <label style={{ display: 'block', fontSize: '13px' }}><input type="radio" name="freight" checked={freightType === 'Freight on Delivery'} onChange={() => setFreightType('Freight on Delivery')} /> Freight on Delivery</label>
            </div>
            <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Insurance</div>
              <label style={{ display: 'block', fontSize: '13px' }}><input type="radio" name="ins" checked={insuranceType === "Owner's Risk"} onChange={() => setInsuranceType("Owner's Risk")} /> Owner&apos;s Risk</label>
              <label style={{ display: 'block', fontSize: '13px' }}><input type="radio" name="ins" checked={insuranceType === "Carrier's Insurance"} onChange={() => setInsuranceType("Carrier's Insurance")} /> Carrier&apos;s Insurance</label>
            </div>
          </div>

          <button onClick={handleCalculate} style={{ width: '100%', background: '#111', color: '#fff', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Calculate Rates
          </button>
        </div>

        {/* Right Breakdown Card Section */}
        <div>
          {result ? (
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Surface</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>₹{result.totalAmount}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
                Delivery in 3 days • Total Weight: {result.totalWeight} kg
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '15px' }} />

              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Freight Charges</span>
                <span>₹{result.subtotal}</span>
              </div>

              <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Base freight charges</span>
                <span>₹{result.baseFreight}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Fuel hike charges</span>
                <span>₹{result.fuelHike}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Fuel surcharges</span>
                <span>₹{result.fuelSurcharge}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Insurance ROV</span>
                <span>₹{result.insuranceCharge}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span>GST at 18%</span>
                <span>₹{result.gstAmount}</span>
              </div>

              <button style={{ width: '100%', background: '#fff', color: '#111', border: '1px solid #111', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Create Order
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#888', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              Enter details and click &quot;Calculate Rates&quot; to see the pricing breakdown here.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}