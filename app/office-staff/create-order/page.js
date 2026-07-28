'use client';
import { useState } from 'react';
import React from 'react';

export default function AssamGoodsStaffDashboard() {
  // Active Tab: 'booking' or 'calculator'
  const [activeTab, setActiveTab] = useState('booking');
  
  // Staff & Wallet State
  const [staff] = useState({
    name: 'Rahul Sharma',
    branch: 'Guwahati Main Hub',
    balance: 45000 // Wallet Balance
  });

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    senderName: 'Assam Goods Carrier - Guwahati',
    senderPhone: '9876543210',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    destinationCity: '',
    pincode: '',
    weight: '',
    boxes: '1',
    invoiceNo: '',
    invoiceAmount: '',
    paymentMode: 'Prepaid'
  });

  // Rate Calculator State
  const [calcForm, setCalcForm] = useState({ destination: '', weight: '', mode: 'Surface' });
  const [calculatedRate, setCalculatedRate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Handle Booking Submit & Delhivery API Hit
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.receiverAddress || !bookingForm.invoiceAmount) {
      alert('Please fill all mandatory receiver and invoice details!');
      return;
    }

    const amount = Number(bookingForm.invoiceAmount);
    if (bookingForm.paymentMode === 'Prepaid' && staff.balance < amount) {
      alert('Insufficient wallet balance!');
      return;
    }

    setLoading(true);

    // Delhivery API Payload Structure
    const delhiveryPayload = {
      pickup_location: staff.branch,
      shipments: [
        {
          name: bookingForm.receiverName,
          phone: bookingForm.receiverPhone,
          add: bookingForm.receiverAddress,
          city: bookingForm.destinationCity,
          pincode: bookingForm.pincode,
          weight: bookingForm.weight,
          quantity: bookingForm.boxes,
          total_amount: amount,
          payment_mode: bookingForm.paymentMode,
          seller_invno: bookingForm.invoiceNo
        }
      ]
    };

    // Simulate API Call to Delhivery & LR Generation
    setTimeout(() => {
      setLoading(false);
      const generatedLR = 'AGC-DEL-' + Math.floor(10000000 + Math.random() * 90000000);
      setSuccessResult({
        lrNumber: generatedLR,
        date: new Date().toLocaleString(),
        ...bookingForm
      });
      alert(`Booking Successful! Delhivery LR/AWB Generated: ${generatedLR}`);
    }, 1200);
  };

  // Handle Rate Calculation
  const handleCalculateRate = (e) => {
    e.preventDefault();
    if (!calcForm.weight || !calcForm.destination) return;
    // Dummy calculation logic based on weight
    const rate = Number(calcForm.weight) * 45 + 150;
    setCalculatedRate(rate);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Inter, Arial, sans-serif', color: '#1e293b' }}>
      
      {/* 1. Left Side Menu */}
      <div style={{ width: '260px', background: '#0b192c', color: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ff7b00' }}>Assam Goods Carrier</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Staff Portal (Delhivery Linked)</span>
        </div>
        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => { setActiveTab('booking'); setSuccessResult(null); }} 
            style={{ textAlign: 'left', padding: '12px 15px', background: activeTab === 'booking' ? '#ff7b00' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            📦 Create Booking
          </button>
          <button 
            onClick={() => setActiveTab('calculator')} 
            style={{ textAlign: 'left', padding: '12px 15px', background: activeTab === 'calculator' ? '#ff7b00' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            🧮 Rate Calculator
          </button>
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#94a3b8' }}>
          Staff: <b>{staff.name}</b><br/>Branch: {staff.branch}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Header with Wallet Balance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 30px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
            {activeTab === 'booking' ? 'New B2B Booking & Delhivery Sync' : 'Shipping Rate Calculator'}
          </h3>
          <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Wallet Balance:</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>₹{staff.balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic Body Area */}
        <div style={{ padding: '30px' }}>
          
          {/* TAB 1: BOOKING PANEL */}
          {activeTab === 'booking' && !successResult && (
            <form onSubmit={handleCreateBooking} style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '900px', margin: '0 auto' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Consignee & Package Details</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Receiver Name / Company</label>
                  <input type="text" placeholder="Party Name" value={bookingForm.receiverName} onChange={e => setBookingForm({...bookingForm, receiverName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Receiver Phone</label>
                  <input type="text" placeholder="10-digit mobile" value={bookingForm.receiverPhone} onChange={e => setBookingForm({...bookingForm, receiverPhone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Receiver Full Address</label>
                <input type="text" placeholder="Street, Area, Landmark" value={bookingForm.receiverAddress} onChange={e => setBookingForm({...bookingForm, receiverAddress: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Destination City</label>
                  <input type="text" placeholder="City" value={bookingForm.destinationCity} onChange={e => setBookingForm({...bookingForm, destinationCity: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Pincode</label>
                  <input type="text" placeholder="6-digit pincode" value={bookingForm.pincode} onChange={e => setBookingForm({...bookingForm, pincode: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Weight (Kgs)</label>
                  <input type="number" placeholder="Weight" value={bookingForm.weight} onChange={e => setBookingForm({...bookingForm, weight: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Invoice No.</label>
                  <input type="text" placeholder="Invoice No" value={bookingForm.invoiceNo} onChange={e => setBookingForm({...bookingForm, invoiceNo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Invoice Amount (₹)</label>
                  <input type="number" placeholder="Amount" value={bookingForm.invoiceAmount} onChange={e => setBookingForm({...bookingForm, invoiceAmount: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: '#ff7b00', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Connecting Delhivery API...' : 'Book Order & Generate Bility'}
              </button>
            </form>
          )}

          {/* SUCCESS BILITY / LR RECEIPT VIEW */}
          {activeTab === 'booking' && successResult && (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '700px', margin: '0 auto', border: '2px dashed #ff7b00' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0b192c', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0b192c' }}>ASSAM GOODS CARRIER</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Official Bility / Shipping Receipt (Delhivery Powered)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
                <div><b>LR / AWB Number:</b> <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{successResult.lrNumber}</span></div>
                <div><b>Date:</b> {successResult.date}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 5px 0' }}><b>Sender:</b> {successResult.senderName}</p>
                <p style={{ margin: 0 }}><b>Receiver:</b> {successResult.receiverName} ({successResult.receiverAddress}, {successResult.destinationCity} - {successResult.pincode})</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '20px' }}>
                <div><b>Weight:</b> {successResult.weight} Kgs</div>
                <div><b>Amount:</b> ₹{successResult.invoiceAmount}</div>
                <div><b>Mode:</b> {successResult.paymentMode}</div>
              </div>
              <button onClick={() => setSuccessResult(null)} style={{ width: '100%', background: '#0b192c', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Create Another Booking
              </button>
            </div>
          )}

          {/* TAB 2: RATE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#2563eb' }}>Calculate Freight Charges</h4>
              <form onSubmit={handleCalculateRate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Destination City</label>
                  <input type="text" placeholder="Enter city name" value={calcForm.destination} onChange={e => setCalcForm({...calcForm, destination: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Total Weight (Kgs)</label>
                  <input type="number" placeholder="Enter weight in kgs" value={calcForm.weight} onChange={e => setCalcForm({...calcForm, weight: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                </div>
                <button type="submit" style={{ width: '100%', background: '#0b192c', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Calculate Rate
                </button>
              </form>

              {calculatedRate !== null && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#166534' }}>Estimated Freight Charges:</span>
                  <h3 style={{ margin: '5px 0 0 0', color: '#15803d' }}>₹{calculatedRate}</h3>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}