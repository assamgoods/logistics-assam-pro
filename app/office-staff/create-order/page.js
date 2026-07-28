'use client';
import { useState } from 'react';
import React from 'react';

export default function ProfessionalOrderPanel() {
  const [staffInfo] = useState({ name: 'Rahul Sharma', branch: 'Chandigarh Main', balance: 44580 });

  // Form states matching the professional UI
  const [lrType, setLrType] = useState('Manual');
  const [lrNumber, setLrNumber] = useState('');
  const [pickup, setPickup] = useState('Chandigarh Main Hub');
  const [drop, setDrop] = useState('');
  const [description, setDesc] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [refId, setRefId] = useState('');
  const [boxes, setBoxes] = useState('');
  const [paymentMode, setPaymentMode] = useState('Prepaid');
  const [eWayBill, setEWayBill] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [amount, setAmount] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!drop || !amount) {
      alert('Please fill mandatory details!');
      return;
    }
    const freight = Number(amount);
    if (paymentMode === 'Prepaid' && staffInfo.balance < freight) {
      alert('Insufficient wallet balance!');
      return;
    }
    alert('Order created successfully and wallet updated!');
  };

  return (
    <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, Arial, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#fff', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create New Order</h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Staff: <b>{staffInfo.name}</b> | Branch: <b>{staffInfo.branch}</b></span>
        </div>
        <div style={{ background: '#f8fafc', padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Wallet Balance</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>₹{staffInfo.balance.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* LR Details Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>🚚 LR Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>LR creation</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="lr" checked={lrType === 'Manual'} onChange={() => setLrType('Manual')} /> Manual</label>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="lr" checked={lrType === 'Automatic'} onChange={() => setLrType('Automatic')} /> Automatic</label>
                </div>
              </div>
              {lrType === 'Manual' && (
                <div>
                  <input type="text" placeholder="Enter LR number" value={lrNumber} onChange={e => setLrNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              )}
            </div>

            {/* Order Details Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>📦 Order Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Description</label>
                <input type="text" placeholder="Enter order description" value={description} onChange={e => setDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>PO Number</label>
                  <input type="text" placeholder="Enter Your PO number" value={poNumber} onChange={e => setPoNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Your reference ID / order ID</label>
                  <input type="text" placeholder="Enter reference ID" value={refId} onChange={e => setRefId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>
            </div>

            {/* Invoice Details Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>📄 Invoice Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>Payment Mode</label>
                <div style={{ display: 'flex', gap: '25px' }}>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="pay" checked={paymentMode === 'Prepaid'} onChange={() => setPaymentMode('Prepaid')} /> Prepaid (Wallet)</label>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}><input type="radio" name="pay" checked={paymentMode === 'ToPay'} onChange={() => setPaymentMode('ToPay')} /> Collect on delivery / ToPay</label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>E-Way Bill Number</label>
                  <input type="text" placeholder="E-Way Bill" value={eWayBill} onChange={e => setEWayBill(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Invoice Number</label>
                  <input type="text" placeholder="Invoice no." value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                  <input type="number" placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Delivery Details Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>📍 Delivery Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Pickup Location</label>
                <select value={pickup} onChange={e => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}>
                  <option value="Chandigarh Main Hub">Chandigarh Main Hub</option>
                  <option value="Guwahati Hub">Guwahati Hub</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Drop Location / Destination</label>
                <input type="text" placeholder="Enter drop city or hub" value={drop} onChange={e => setDrop(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
            </div>

            {/* Weights & Dimensions Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>⚖️ Weights & Dimensions</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>No. of boxes</label>
                <input type="number" placeholder="0" value={boxes} onChange={e => setBoxes(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
            </div>

            {/* Submit Action */}
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              Create New Order
            </button>

          </div>

        </div>
      </form>
    </div>
  );
}