'use client';
import { useState } from 'react';
import React from 'react';

export default function SuperAdminDashboard() {
  const [orders, setOrders] = useState([
    { lrNumber: 'AGC312438', date: '28 Jul, 2026', route: 'Chandigarh → Mathabhanga', client: 'Mehek Medical Store', amount: '₹10,076', boxes: 5, user: 'Branch Admin (CHD)', status: 'Manifested' },
    { lrNumber: 'AGC312414', date: '28 Jul, 2026', route: 'Chandigarh → Jeypore', client: 'Lakshmi Agencies', amount: '₹4,536', boxes: 3, user: 'Super Admin', status: 'Manifested' },
    { lrNumber: 'AGC312405', date: '28 Jul, 2026', route: 'Mandya → Kurnool', client: 'Royal Enterprises', amount: '₹3,188', boxes: 2, user: 'Branch Admin (BLR)', status: 'In Transit' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const [boxes, setBoxes] = useState('');

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!clientName || !route || !amount) return;

    const newOrder = {
      lrNumber: 'AGC' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      route,
      client: clientName,
      amount: '₹' + parseInt(amount).toLocaleString(),
      boxes: parseInt(boxes || 1),
      user: 'Super Admin',
      status: 'Manifested'
    };

    setOrders([newOrder, ...orders]);
    setClientName('');
    setRoute('');
    setAmount('');
    setBoxes('');
    setShowModal(false);
  };

  const totalBookings = orders.length;
  const totalRevenue = orders.reduce((acc, curr) => acc + parseInt(curr.amount.replace('₹', '').replace(/,/g, '')), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b192c', fontFamily: 'Inter, Arial, sans-serif', color: '#fff' }}>
      
      {/* Left Sidebar Menu */}
      <aside style={{ width: '260px', background: '#08121e', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ff7b00', fontStyle: 'italic', lineHeight: '1' }}>A</div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '14px', color: '#ffffff', letterSpacing: '0.5px', display: 'block' }}>ASSAM GOODS CARRIER</span>
            <span style={{ fontSize: '8px', color: '#ff7b00', fontWeight: '700', letterSpacing: '1px' }}>SAFE • FAST • RELIABLE</span>
          </div>
        </div>

        <nav style={{ padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          <a href="/super-admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: '#ff7b00', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>📦 B2B Orders & Bookings</a>
          <a href="/super-admin/rate-calculater" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>🧮 Rate Calculator</a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>🏢 Branch & Users Ledger</a>
        </nav>

        <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          📞 Support: 8847428801
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '25px 35px' }}>
        
        {/* Top Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
          <div style={{ background: '#102238', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>TOTAL BOOKINGS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{totalBookings} Shipments</div>
          </div>
          <div style={{ background: '#102238', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#ff7b00' }}>₹{totalRevenue.toLocaleString()}</div>
          </div>
          <div style={{ background: '#102238', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>ACTIVE PANEL</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#60a5fa' }}>Super Admin</div>
          </div>
        </div>

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#102238', padding: '15px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'block' }}>Manifested Bookings & User Activity</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Track total bookings made by each branch and user</span>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
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
            <div>BOXES</div>
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
              <div style={{ color: '#fff', fontWeight: '700' }}>{order.amount}</div>
              <div style={{ color: '#fff' }}>{order.boxes} Box</div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Creating New Order */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#102238', padding: '30px', borderRadius: '12px', width: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ marginBottom: '20px', color: '#ff7b00', fontSize: '16px' }}>📦 Create New B2B Shipment</h3>
              <form onSubmit={handleCreateOrder}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Client / Consignee Name</label>
                  <input type="text" placeholder="e.g. Sharma Medicals" value={clientName} onChange={e => setClientName(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Route (Origin → Destination)</label>
                  <input type="text" placeholder="e.g. Delhi → Patna" value={route} onChange={e => setRoute(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Invoice Amount (₹)</label>
                    <input type="number" placeholder="e.g. 15000" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Box Count</label>
                    <input type="number" placeholder="e.g. 3" value={boxes} onChange={e => setBoxes(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                  </div>
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