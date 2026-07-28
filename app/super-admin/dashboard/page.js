'use client';
import { useState } from 'react';
import React from 'react';

export default function SuperAdminDashboard() {
  const [orders, setOrders] = useState([
    { lrNumber: 'AGC312438', date: '28 Jul, 2026', route: 'Chandigarh → Mathabhanga', client: 'Mehek Medical Store', amount: 10076, boxes: 5, user: 'Branch Admin (CHD)', paymentType: 'Prepaid', status: 'Manifested' },
    { lrNumber: 'AGC312414', date: '28 Jul, 2026', route: 'Chandigarh → Jeypore', client: 'Lakshmi Agencies', amount: 4536, boxes: 3, user: 'Super Admin', paymentType: 'COD', status: 'Manifested' },
    { lrNumber: 'AGC312405', date: '28 Jul, 2026', route: 'Mandya → Kurnool', client: 'Royal Enterprises', amount: 3188, boxes: 2, user: 'Branch Admin (BLR)', paymentType: 'COD', status: 'In Transit' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const [boxes, setBoxes] = useState('');
  const [paymentType, setPaymentType] = useState('Prepaid');

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!clientName || !route || !amount) return;

    const newOrder = {
      lrNumber: 'AGC' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      route,
      client: clientName,
      amount: parseInt(amount),
      boxes: parseInt(boxes || 1),
      user: 'Super Admin',
      paymentType,
      status: 'Manifested'
    };

    setOrders([newOrder, ...orders]);
    setClientName('');
    setRoute('');
    setAmount('');
    setBoxes('');
    setPaymentType('Prepaid');
    setShowModal(false);
  };

  // Calculations for Super Admin Power Panel
  const totalBookings = orders.length;
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.amount, 0);
  
  const prepaidOrders = orders.filter(o => o.paymentType === 'Prepaid');
  const codOrders = orders.filter(o => o.paymentType === 'COD');

  const totalPrepaidAmount = prepaidOrders.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCodAmount = codOrders.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b192c', fontFamily: 'Inter, Arial, sans-serif', color: '#fff' }}>
      
      {/* Left Sidebar Menu */}
      <aside style={{ width: '260px', background: '#08121e', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        
        <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: '#ff7b00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#08121e', boxShadow: '0 4px 10px rgba(255,123,0,0.3)' }}>A</div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#ffffff', letterSpacing: '0.8px', lineHeight: '1.2' }}>ASSAM GOODS</div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#ffffff', letterSpacing: '0.8px', lineHeight: '1.2' }}>CARRIER</div>
            <div style={{ fontSize: '7.5px', color: '#ff7b00', fontWeight: '800', letterSpacing: '1.4px', marginTop: '3px' }}>SAFE • FAST • RELIABLE</div>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <a href="/super-admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: '#ff7b00', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>📦 Super Admin Ledger</a>
          <a href="/super-admin/rate-calculater" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>🧮 Rate Calculator</a>
        </nav>

        <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          📞 AGC Support: 8847428801
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '30px 40px' }}>
        
        {/* Top Summary Metrics for Super Admin Powers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
          <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>₹{totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>{totalBookings} Total Shipments</div>
          </div>

          <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>PREPAID BOOKINGS</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>₹{totalPrepaidAmount.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{prepaidOrders.length} Shipments Paid</div>
          </div>

          <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>TODAY COD COLLECTION</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ff7b00' }}>₹{totalCodAmount.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{codOrders.length} COD Shipments</div>
          </div>

          <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>ACTIVE PANEL</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>Super Admin 👑</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Full Network Access</div>
          </div>
        </div>

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#102238', padding: '18px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff', display: 'block' }}>All Branch Bookings & Payment Ledger</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Monitor staff bookings, COD amounts and shipment statuses</span>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
            + Create New Order
          </button>
        </div>

        {/* Orders Table */}
        <div style={{ background: '#102238', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1.2fr 0.8fr 0.8fr 0.8fr', padding: '15px 20px', background: '#08121e', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>
            <div>LR NUMBER</div>
            <div>DATE</div>
            <div>ROUTE & CLIENT</div>
            <div>BOOKED BY</div>
            <div>AMOUNT</div>
            <div>PAYMENT</div>
            <div style={{ textAlign: 'right' }}>STATUS</div>
          </div>

          {orders.map((order, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1.2fr 0.8fr 0.8fr 0.8fr', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '700' }}>{order.lrNumber}</div>
              <div style={{ color: '#cbd5e1', fontSize: '12px' }}>{order.date}</div>
              <div>
                <div style={{ fontWeight: '600', color: '#fff', fontSize: '12px' }}>{order.route}</div>
                <div style={{ fontSize: '11px', color: '#ff7b00', fontWeight: '600' }}>{order.client}</div>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600' }}>{order.user}</div>
              <div style={{ color: '#fff', fontWeight: '700' }}>₹{order.amount.toLocaleString()}</div>
              <div>
                <span style={{ 
                  background: order.paymentType === 'Prepaid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', 
                  color: order.paymentType === 'Prepaid' ? '#22c55e' : '#f59e0b', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' 
                }}>
                  {order.paymentType}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Creating New Order with Payment Selection */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#102238', padding: '30px', borderRadius: '12px', width: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ marginBottom: '20px', color: '#ff7b00', fontSize: '16px' }}>📦 Super Admin - New Shipment Booking</h3>
              <form onSubmit={handleCreateOrder}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Client / Consignee Name</label>
                  <input type="text" placeholder="e.g. Sharma Medicals" value={clientName} onChange={e => setClientName(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Route (Origin → Destination)</label>
                  <input type="text" placeholder="e.g. Guwahati → Silchar" value={route} onChange={e => setRoute(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
                    <input type="number" placeholder="e.g. 15000" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Payment Mode</label>
                    <select value={paymentType} onChange={e => setPaymentType(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
                      <option value="Prepaid">Prepaid</option>
                      <option value="COD">COD</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Box Count</label>
                  <input type="number" placeholder="e.g. 3" value={boxes} onChange={e => setBoxes(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, background: '#ff7b00', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Save & Generate LR</button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}