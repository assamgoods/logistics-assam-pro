'use client';
import { useState } from 'react';

const zones = ['N1', 'N2', 'E', 'NE', 'W1', 'W2', 'S1', 'S2', 'Central'];

const rateMatrix = {
  N1: { N1: 4.5, N2: 5, E: 10, NE: 17.2, W1: 7, W2: 9, S1: 13.6, S2: 13.55, Central: 8.4 },
  N2: { N1: 6.8, N2: 5, E: 10.5, NE: 15, W1: 8.5, W2: 8.6, S1: 14, S2: 12, Central: 8.5 },
  E:  { N1: 8.5, N2: 9.5, E: 5, NE: 10, W1: 8.5, W2: 8.5, S1: 8.5, S2: 9.5, Central: 7 },
  NE: { N1: 8.5, N2: 11, E: 7, NE: 6, W1: 9.5, W2: 11, S1: 9.5, S2: 11, Central: 8.5 },
  W1: { N1: 7.5, N2: 8.5, E: 13, NE: 17, W1: 5, W2: 5, S1: 8.5, S2: 10, Central: 7.5 },
  W2: { N1: 8, N2: 9, E: 13, NE: 17, W1: 5, W2: 4.5, S1: 7, S2: 10, Central: 7 },
  S1: { N1: 8.5, N2: 10.5, E: 10.5, NE: 15, W1: 8.5, W2: 6.5, S1: 5, S2: 6.5, Central: 7 },
  S2: { N1: 10.5, N2: 13, E: 10.5, NE: 17, W1: 8.5, W2: 8.5, S1: 5, S2: 5, Central: 7 },
  Central: { N1: 7.5, N2: 8, E: 8.5, NE: 15, W1: 6, W2: 6.5, S1: 8, S2: 11, Central: 5 }
};

export default function AdvancedRateCalculator() {
  const [fromZone, setFromZone] = useState('N1');
  const [toZone, setToZone] = useState('N2');
  
  // Inputs
  const [actWeight, setActWeight] = useState(10); // Actual Weight in Kg
  const [length, setLength] = useState(0); // in cm
  const [breadth, setBreadth] = useState(0); // in cm
  const [height, setHeight] = useState(0); // in cm
  const [isOdA, setIsOdA] = useState(false); // Out of Delivery Area
  const [isToPay, setIsToPay] = useState(false); // To-Pay shipment
  const [invoiceValue, setInvoiceValue] = useState(0); // For Insurance
  const [hasInsurance, setHasInsurance] = useState(false);
  
  const [result, setResult] = useState(null);

  const calculateShipping = (e) => {
    e.preventDefault();

    // 1. Volumetric Weight Calculation (Standard courier formula: L x B x H / 5000)
    let volWeight = 0;
    if (length > 0 && breadth > 0 && height > 0) {
      volWeight = (length * breadth * height) / 5000;
    }

    // Chargeable weight is higher of Actual or Volumetric
    const chargeableWeight = Math.max(actWeight, volWeight, 1);

    let baseFreight = 0;

    // 2. Minimum Bilty Check (Up to 25kg is flat 550, above 25kg uses matrix rate)
    if (chargeableWeight <= 25) {
      baseFreight = 550; // Minimum bilty charge base
    } else {
      const ratePerKg = rateMatrix[fromZone][toZone] || 10;
      baseFreight = chargeableWeight * ratePerKg;
    }

    // Apply 20% Margin to Base Freight
    const freightWithMargin = baseFreight * 1.20;

    // 3. OD_A (Out of Delivery Area) Charges
    let odACharge = 0;
    if (isOdA) {
      if (chargeableWeight <= 100) {
        odACharge = 500;
      } else {
        odACharge = 500 + (chargeableWeight - 100) * 3;
      }
    }

    // 4. Processing / Bilty Charge
    const biltyCharge = 100;

    // 5. Fuel Surcharge (FSC) - 12% of Freight with Margin
    const fscCharge = freightWithMargin * 0.12;

    // 6. To-Pay Charge
    const toPayCharge = isToPay ? 100 : 0;

    // 7. Insurance Charge (0.4% of Invoice Value if opted)
    const insuranceCharge = hasInsurance ? (invoiceValue * 0.004) : 0;

    // Subtotal before GST
    const subtotal = freightWithMargin + odACharge + biltyCharge + fscCharge + toPayCharge + insuranceCharge;

    // 8. Final GST (18%)
    const gstAmount = subtotal * 0.18;
    const grandTotal = subtotal + gstAmount;

    setResult({
      chargeableWeight: chargeableWeight.toFixed(2),
      volWeight: volWeight.toFixed(2),
      freightWithMargin: freightWithMargin.toFixed(2),
      odACharge: odACharge.toFixed(2),
      biltyCharge,
      fscCharge: fscCharge.toFixed(2),
      toPayCharge,
      insuranceCharge: insuranceCharge.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '5px', textAlign: 'center' }}>Advanced Rate Calculator</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '25px' }}>Zone Matrix, 20% Margin, OD_A, Volumetric & GST</p>

        <form onSubmit={calculateShipping}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>From Zone</label>
              <select value={fromZone} onChange={(e) => setFromZone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>To Zone</label>
              <select value={toZone} onChange={(e) => setToZone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Actual Weight (Kg)</label>
            <input type="number" step="0.1" value={actWeight} onChange={(e) => setActWeight(parseFloat(e.target.value) || 0)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Length (cm)</label>
              <input type="number" placeholder="L" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Breadth (cm)</label>
              <input type="number" placeholder="B" value={breadth} onChange={(e) => setBreadth(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Height (cm)</label>
              <input type="number" placeholder="H" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isOdA} onChange={(e) => setIsOdA(e.target.checked)} /> OD_A Area (Remote)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isToPay} onChange={(e) => setIsToPay(e.target.checked)} /> To-Pay (+₹100)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" checked={hasInsurance} onChange={(e) => setHasInsurance(e.target.checked)} /> Insurance (0.4%)
            </label>
          </div>

          {hasInsurance && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Invoice Value (₹)</label>
              <input type="number" value={invoiceValue} onChange={(e) => setInvoiceValue(parseFloat(e.target.value) || 0)} placeholder="Enter package invoice value" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
            </div>
          )}

          <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Calculate Final Quote
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '25px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px' }}>Detailed Rate Breakdown:</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Chargeable Weight:</span>
              <span>{result.chargeableWeight} Kg {result.volWeight > 0 ? `(Vol: ${result.volWeight}kg)` : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Freight (incl. 20% margin / min bilty):</span>
              <span>₹{result.freightWithMargin}</span>
            </div>
            {isOdA && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#d97706' }}>
                <span>OD_A Remote Charge:</span>
                <span>₹{result.odACharge}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Processing / Bilty Charge:</span>
              <span>₹{result.biltyCharge}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Fuel Surcharge (FSC 12%):</span>
              <span>₹{result.fscCharge}</span>
            </div>
            {isToPay && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                <span>To-Pay Charge:</span>
                <span>₹{result.toPayCharge}</span>
              </div>
            )}
            {hasInsurance && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                <span>Insurance (0.4%):</span>
                <span>₹{result.insuranceCharge}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>₹{result.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>GST (18%):</span>
              <span>₹{result.gstAmount}</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid #cbd5e1', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
              <span>Grand Total:</span>
              <span>₹{result.grandTotal}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}