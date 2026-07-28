'use client';
import { useState } from 'react';
import React from 'react';

export default function SuperAdminMasterPanel() {
  const [activeTab, setActiveTab] = useState('ledger');

  // Orders Ledger State
  const [orders, setOrders] = useState([
    { lrNumber: 'AGC312438', date: '28 Jul, 2026', route: 'Chandigarh → Mathabhanga', client: 'Mehek Medical Store', amount: 10076, boxes: 5, user: 'Branch Admin (CHD)', paymentType: 'Prepaid', status: 'Manifested' },
    { lrNumber: 'AGC312414', date: '28 Jul, 2026', route: 'Chandigarh → Jeypore', client: 'Lakshmi Agencies', amount: 4536, boxes: 3, user: 'Super Admin', paymentType: 'COD', status: 'Manifested' },
    { lrNumber: 'AGC312405', date: '28 Jul, 2026', route: 'Mandya → Kurnool', client: 'Royal Enterprises', amount: 3188, boxes: 2, user: 'Branch Admin (BLR)', paymentType: 'COD', status: 'In Transit' }
  ]);

  // Branch Users State
  const [users, setUsers] = useState([
    { id: 1, name: 'Chandigarh Branch', username: 'chd_admin', role: 'Branch User', totalBookings: 45, revenue: 125000, status: 'Active' },
    { id: 2, name: 'Silchar Hub', username: 'silchar_ops', role: 'Hub Manager', totalBookings: 82, revenue: 310000, status: 'Active' },
    { id: 3, name: 'Guwahati Main', username: 'Ghy_staff', role: 'Branch User', totalBookings: 110, revenue: 450000, status: 'Active' }
  ]);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // New Order Form Inputs
  const [clientName, setClientName] = useState('');
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const [boxes, setBoxes] = useState('');
  const [paymentType, setPaymentType] = useState('Prepaid');

  // New User Form Inputs
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userRole, setUserRole] = useState('Branch User');

  // Rate Calculator Inputs
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');
  const [calcBoxes, setCalcBoxes] = useState([{ length: '', breadth: '', height: '', count: 1 }]);
  const [shipmentWeight, setShipmentWeight] = useState('');
  const [shipmentAmount, setShipmentAmount] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  // Handlers
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
      user: 'Super Admin 👑',
      paymentType,
      status: 'Manifested'
    };
    setOrders([newOrder, ...orders]);
    setClientName(''); setRoute(''); setAmount(''); setBoxes(''); setShowOrderModal(false);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!userName || !userUsername) return;
    const newUser = {
      id: users.length + 1,
      name: userName,
      username: userUsername,
      role: userRole,
      totalBookings: 0,
      revenue: 0,
      status: 'Active'
    };
    setUsers([newUser, ...users]);
    setUserName(''); setUserUsername(''); setShowUserModal(false);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!fromPincode || !toPincode) { alert('Enter Pincodes'); return; }
    let totalVolWt = 0;
    calcBoxes.forEach(b => {
      if (b.length && b.breadth && b.height) {
        totalVolWt += (parseFloat(b.length) * parseFloat(b.breadth) * parseFloat(b.height) / 5000) * parseFloat(b.count || 1);
      }
    });
    const finalWt = Math.max(parseFloat(shipmentWeight || 0), totalVolWt, 1);
    const baseFreight = Math.round(finalWt * 18 + 150);
    const fuelSurcharge = Math.round(baseFreight * 0.12);
    const insuranceCharge = shipmentAmount ? Math.round(parseFloat(shipmentAmount) * 0.004) : 50;
    const subtotal = baseFreight + 15 + fuelSurcharge + insuranceCharge;
    const gstAmount = Math.round(subtotal * 0.18);
    setCalcResult({
      totalWeight: finalWt.toFixed(2),
      baseFreight, fuelSurcharge, insuranceCharge, gstAmount,
      totalAmount: subtotal + gstAmount,
      estimatedDelivery: '3-4 Business Days'
    });
  };

  // Financial Metrics Calculations
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.amount, 0);
  const prepaidOrders = orders.filter(o => o.paymentType === 'Prepaid');
  const codOrders = orders.filter(o => o.paymentType === 'COD');
  const totalPrepaidAmount = prepaidOrders.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCodAmount = codOrders.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b192c', fontFamily: 'Inter, Arial, sans-serif', color: '#fff' }}>
      
      {/* Sidebar with Ditto AGC Branding */}
      <aside style={{ width: '260px', background: '#08121e', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        
        <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: '#ff7b00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#08121e', boxShadow: '0 4px 10px rgba(255,123,0,0.3)' }}>A</div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#ffffff', letterSpacing: '0.8px', lineHeight: '1.2' }}>ASSAM GOODS</div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#ffffff', letterSpacing: '0.8px', lineHeight: '1.2' }}>CARRIER</div>
            <div style={{ fontSize: '7.5px', color: '#ff7b00', fontWeight: '800', letterSpacing: '1.4px', marginTop: '3px' }}>SUPER ADMIN MASTER</div>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setActiveTab('ledger')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: activeTab === 'ledger' ? '#ff7b00' : 'transparent', color: activeTab === 'ledger' ? '#ffffff' : '#cbd5e1', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'ledger' ? '700' : '600', textAlign: 'left', boxShadow: activeTab === 'ledger' ? '0 4px 12px rgba(255,123,0,0.3)' : 'none' }}>
            📊 Financial Ledger & Orders
          </button>
          
          <button onClick={() => setActiveTab('users')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: activeTab === 'users' ? '#ff7b00' : 'transparent', color: activeTab === 'users' ? '#ffffff' : '#cbd5e1', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'users' ? '700' : '600', textAlign: 'left', boxShadow: activeTab === 'users' ? '0 4px 12px rgba(255,123,0,0.3)' : 'none' }}>
            👥 Manage Users & Branches
          </button>
          
          <button onClick={() => setActiveTab('calculator')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: activeTab === 'calculator' ? '#ff7b00' : 'transparent', color: activeTab === 'calculator' ? '#ffffff' : '#cbd5e1', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === 'calculator' ? '700' : '600', textAlign: 'left', boxShadow: activeTab === 'calculator' ? '0 4px 12px rgba(255,123,0,0.3)' : 'none' }}>
            🧮 Rate Calculator
          </button>
        </nav>

        <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
          📞 AGC Support: 8847428801
        </div>
      </aside>

      {/* Main Panel Content */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '30px 40px' }}>
        
        {/* TAB 1: FINANCIAL LEDGER & MASTER BOOKINGS */}
        {activeTab === 'ledger' && (
          <div>
            {/* Top Power Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>TOTAL REVENUE</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>₹{totalRevenue.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>{orders.length} Total Shipments</div>
              </div>

              <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>PREPAID BOOKINGS</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>₹{totalPrepaidAmount.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{prepaidOrders.length} Shipments Paid</div>
              </div>

              <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>TODAY COD COLLECTION</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#ff7b00' }}>₹{totalCodAmount.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{codOrders.length} COD Shipments</div>
              </div>

              <div style={{ background: '#102238', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>MASTER ACCESS</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>Super Admin 👑</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Full Network Control</div>
              </div>
            </div>

            {/* Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#102238', padding: '18px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff', display: 'block' }}>All Branch Bookings & Payment Ledger</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Monitor staff bookings, COD amounts and shipment statuses across all branches</span>
              </div>
              <button onClick={() => setShowOrderModal(true)} style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
                + Create Master Order
              </button>
            </div>

            {/* Ledger Table */}
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
          </div>
        )}

        {/* TAB 2: MANAGE USERS & BRANCHES */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#102238', padding: '20px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Branch Users & Staff Control</h1>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Create user credentials, assign roles and monitor individual staff performance and revenues</p>
              </div>
              <button onClick={() => setShowUserModal(true)} style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
                + Create New User/Branch
              </button>
            </div>

            <div style={{ background: '#102238', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', padding: '15px 20px', background: '#08121e', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>
                <div>NAME / BRANCH</div>
                <div>USERNAME</div>
                <div>ROLE</div>
                <div>TOTAL BOOKINGS</div>
                <div>TOTAL REVENUE</div>
                <div style={{ textAlign: 'right' }}>STATUS</div>
              </div>

              {users.map((u) => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ fontWeight: '700', color: '#fff' }}>{u.name}</div>
                  <div style={{ color: '#60a5fa', fontSize: '12px' }}>{u.username}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '12px' }}>{u.role}</div>
                  <div style={{ color: '#ff7b00', fontWeight: '700' }}>{u.totalBookings} Shipments</div>
                  <div style={{ color: '#22c55e', fontWeight: '700' }}>₹{u.revenue.toLocaleString()}</div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RATE CALCULATOR */}
        {activeTab === 'calculator' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '25px', background: '#102238', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>📍 Route & Pincode Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>FROM PINCODE</label>
                    <input type="text" placeholder="e.g. 781001" value={fromPincode} onChange={(e) => setFromPincode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>TO PINCODE</label>
                    <input type="text" placeholder="e.g. 788001" value={toPincode} onChange={(e) => setToPincode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff', fontSize: '14px' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>📦 Package Dimensions</h3>
                <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  {calcBoxes.map((box, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <input type="number" placeholder="Qty" value={box.count} onChange={(e) => { const nb = [...calcBoxes]; nb[idx].count = e.target.value; setCalcBoxes(nb); }} style={{ width: '65px', padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', textAlign: 'center' }} />
                      <input type="number" placeholder="Length (cm)" value={box.length} onChange={(e) => { const nb = [...calcBoxes]; nb[idx].length = e.target.value; setCalcBoxes(nb); }} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                      <input type="number" placeholder="Breadth (cm)" value={box.breadth} onChange={(e) => { const nb = [...calcBoxes]; nb[idx].breadth = e.target.value; setCalcBoxes(nb); }} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                      <input type="number" placeholder="Height (cm)" value={box.height} onChange={(e) => { const nb = [...calcBoxes]; nb[idx].height = e.target.value; setCalcBoxes(nb); }} style={{ flex: 1, padding: '8px', background: '#102238', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setCalcBoxes([...calcBoxes, { length: '', breadth: '', height: '', count: 1 }])} style={{ background: 'transparent', border: 'none', color: '#ff7b00', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>+ Add Another Box Size</button>
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

              <div>
                {calcResult ? (
                  <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.1)', padding: '25px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>AGC Surface Express</span>
                      <span style={{ fontSize: '26px', fontWeight: '800', color: '#ff7b00' }}>₹{calcResult.totalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Delivery in {calcResult.estimatedDelivery} • Chargeable Weight: {calcResult.totalWeight} kg</div>
                    <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '15px' }} />
                    <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Base freight</span><span>₹{calcResult.baseFreight}</span></div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Fuel surcharges</span><span>₹{calcResult.fuelSurcharge}</span></div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Insurance & Handling</span><span>₹{calcResult.insuranceCharge}</span></div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><span>GST (18%)</span><span>₹{calcResult.gstAmount}</span></div>
                  </div>
                ) : (
                  <div style={{ background: '#0b192c', border: '2px dashed rgba(255,255,255,0.15)', padding: '60px 20px', borderRadius: '10px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧮</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#ffffff' }}>Ready to Calculate</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>Enter pincodes and box dimensions on left to view instant AGC freight quote.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE MASTER ORDER */}
        {showOrderModal && (
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
                  <button type="button" onClick={() => setShowOrderModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE USER */}
        {showUserModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#102238', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ marginBottom: '20px', color: '#ff7b00', fontSize: '16px' }}>Create Branch User Account</h3>
              <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Branch / User Full Name</label>
                  <input type="text" placeholder="e.g. Patna Hub" value={userName} onChange={e => setUserName(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Username / Login ID</label>
                  <input type="text" placeholder="e.g. patna_ops" value={userUsername} onChange={e => setUserUsername(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Role</label>
                  <select value={userRole} onChange={e => setUserRole(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0b192c', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
                    <option value="Branch User">Branch User</option>
                    <option value="Hub Manager">Hub Manager</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, background: '#ff7b00', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Create User</button>
                  <button type="button" onClick={() => setShowUserModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}