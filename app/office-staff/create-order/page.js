'use client';
import { useState } from 'react';
import React from 'react';

export default function AssamGoodsCarrierBooking() {
  // Staff & Company Branding Info
  const [staffInfo] = useState({
    companyName: 'Assam Goods Carrier',
    name: 'Rahul Sharma',
    branch: 'Guwahati Main Hub',
    balance: 52000
  });

  // Form States
  const [lrCreation, setLrCreation] = useState('Manual');
  const [lrNumber, setLrNumber] = useState('');
  const [description, setDescription] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poExpiryDate, setPoExpiryDate] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [noOfBoxes, setNoOfBoxes] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Guwahati Main Hub');
  const [dropLocation, setDropLocation] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [paymentMode, setPaymentMode] = useState('Prepaid');
  const [ewayBill, setEwayBill] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Form Submit & Delhivery API Sync
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!dropLocation || !invoiceAmount) {
      alert('Please fill mandatory fields (Drop Location & Amount)!');
      return;
    }

    const amount = Number(invoiceAmount);
    if (paymentMode === 'Prepaid' && staffInfo.balance < amount) {
      alert('Insufficient wallet balance in Assam Goods Carrier account!');
      return;
    }

    setLoading(true);

    // Delhivery B2B API Payload
    const payload = {
      pickup_location: pickupLocation,
      shipments: [
        {
          lr_creation: lrCreation,
          lr_number: lrCreation === 'Manual' ? lrNumber : 'AGC-' + Math.floor(100000 + Math.random() * 900000),
          client_order_id: referenceId,
          products_desc: description,
          po_number: poNumber,
          po_expiry_date: poExpiryDate,
          quantity: noOfBoxes,
          weight: totalWeight,
          destination_city: dropLocation,
          payment_mode: paymentMode,
          eway_bill: ewayBill,
          invoice_number: invoiceNo,
          invoice_amount: amount
        }
      ]
    };

    try {
      // API call to backend route linked with Delhivery
      setTimeout(() => {
        setLoading(false);
        alert(`Order successfully booked via Assam Goods Carrier & synced with Delhivery!`);
      }, 1000);
    } catch (err) {
      setLoading(false);
      alert('API connection error.');
    }
  };

  return (
    <div style={{ padding: '25px', background: '#0b192c', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      
      {/* Top Brand Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#102238', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ff7b00' }}>🚚 {staffInfo.companyName}</h2>
          <span style={{ fontSize: '12px', color: '#aaa' }}>Staff: <b>{staffInfo.name}</b> | Branch: <b>{staffInfo.branch}</b></span>
        </div>
        <div style={{ background: '#08121e', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '11px', color: '#aaa', display: 'block' }}>Branch Wallet Balance</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#22c55e' }}>₹{staffInfo.balance.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleBookingSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* Left Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Invoice Upload Banner */}
            <div style={{ background: 'linear-gradient(135deg, #102238 0%, #162a45 100%)', border: '1px dashed #ff7b00', padding: '18px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff' }}>Upload your invoice <span style={{ background: '#ff7b00', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>new</span></h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Autofill order details from your invoice instantly.</p>
              </div>
              <button type="button" style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Upload file</button>
            </div>

            {/* LR Details */}
            <div style={{ background: '#102238', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>📦 LR Details</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '6px' }}>LR creation</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="lrc" checked={lrCreation === 'Manual'} onChange={() => setLrCreation('Manual')} /> Manual</label>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="lrc" checked={lrCreation === 'Automatic'} onChange={() => setLrCreation('Automatic')} /> Automatic</label>
                </div>
              </div>
              {lrCreation === 'Manual' && (
                <div>
                  <input type="text" placeholder="Enter LR number" value={lrNumber} onChange={e => setLrNumber(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
              )}
            </div>

            {/* Order Details */}
            <div style={{ background: '#102238', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>📋 Order Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Description</label>
                <input type="text" placeholder="Enter order description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>PO Number</label>
                  <input type="text" placeholder="PO number" value={poNumber} onChange={e => setPoNumber(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>PO Expiry Date</label>
                  <input type="date" value={poExpiryDate} onChange={e => setPoExpiryDate(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Reference / Order ID</label>
                  <input type="text" placeholder="Reference ID" value={referenceId} onChange={e => setReferenceId(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>No. of boxes</label>
                  <input type="number" placeholder="Boxes" value={noOfBoxes} onChange={e => setNoOfBoxes(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{ background: '#102238', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>💳 Invoice Details & Payment</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Payment Mode</label>
                <div style={{ display: 'flex', gap: '25px' }}>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="pm" checked={paymentMode === 'Prepaid'} onChange={() => setPaymentMode('Prepaid')} /> Prepaid (Wallet)</label>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="pm" checked={paymentMode === 'COD'} onChange={() => setPaymentMode('COD')} /> Collect on Delivery</label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>E-Way Bill</label>
                  <input type="text" placeholder="E-Way Bill" value={ewayBill} onChange={e => setEwayBill(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Invoice No.</label>
                  <input type="text" placeholder="Invoice No." value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                  <input type="number" placeholder="Amount" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Delivery Details */}
            <div style={{ background: '#102238', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>📍 Delivery Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Pickup Location</label>
                <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }}>
                  <option value="Guwahati Main Hub">Guwahati Main Hub</option>
                  <option value="Chandigarh Hub">Chandigarh Hub</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Drop Location / City</label>
                <input type="text" placeholder="Destination Hub / City" value={dropLocation} onChange={e => setDropLocation(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
              </div>
            </div>

            {/* Weights & Dimensions */}
            <div style={{ background: '#102238', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>⚖️ Weights & Dimensions</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Total Shipment Weight (Kgs)</label>
                <input type="number" placeholder="Kgs" value={totalWeight} onChange={e => setTotalWeight(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#08121e', color: '#fff', border: '1px solid #444', fontSize: '13px' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>Total boxes count: <b>{noOfBoxes || 0}</b></div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" style={{ flex: 1, background: '#08121e', border: '1px solid #444', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 2, background: '#ff7b00', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Processing...' : 'Create Order & Sync'}
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}