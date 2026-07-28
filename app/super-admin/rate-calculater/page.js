'use client';
import { useState } from 'react';
import React from 'react';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  // Dummy data for bookings / shipments tracking per user/branch
  const bookingsData = [
    { lrNumber: '312438499', date: '28 Jul, 2026 07:46 PM', route: 'Chandigarh (134109) → Mathabhanga (736158)', client: 'MEHEK MEDICAL STORE', amount: '₹10076.00', mode: 'Pre-paid', freight: 'FOD', boxes: 5, status: 'Manifested' },
    { lrNumber: '312414449', date: '28 Jul, 2026 03:35 PM', route: 'Chandigarh (134109) → Jeypore (764001)', client: 'LAKSHMI MEDICAL AGENCIES', amount: '₹4536.00', mode: 'COD', freight: 'FOD', boxes: 3, status: 'Manifested' },
    { lrNumber: '312405951', date: '28 Jul, 2026 01:58 PM', route: 'Mandya (571401) → Kurnool (518002)', client: 'ROYAL ENTERPRISES', amount: '₹3188.00', mode: 'Pre-paid', freight: 'FOP-Paid', boxes: 2, status: 'In Transit' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b192c', fontFamily: 'Inter, Arial, sans-serif', color: '#fff' }}>
      
      {/* Left Sidebar Menu */}
      <aside style={{ width: '260px', background: '#08121e', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        
        {/* Brand Logo Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ff7b00', fontStyle: 'italic', lineHeight: '1' }}>
            A
          </div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '14px', color: '#ffffff', letterSpacing: '0.5px', display: 'block' }}>
              ASSAM GOODS CARRIER
            </span>
            <span style={{ fontSize: '8px', color: '#ff7b00', fontWeight: '700', letterSpacing: '1px' }}>
              SAFE • FAST • RELIABLE
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav style={{ padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            📊 Dashboard
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', background: '#ff7b00', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
            📦 B2B Orders / Bookings
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            🚚 Pickup Requests
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            ⚠️ Delivery Exceptions
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            💰 Finances & Ledger
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            🏢 Branch & Users
          </a>
          <a href="/super-admin/rate-calculater" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            🧮 Rate Calculator
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            ⚙️ Settings
          </a>
        </nav>

        {/* Sidebar Footer Support */}
        <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          📞 Support: 8847428801
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '25px 35px' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#102238', padding: '15px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Manifested Bookings</span>
            <span style={{ background: 'rgba(255,123,0,0.15)', color: '#ff7b00', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Total: 3 Bookings</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input 
              type="text" placeholder="Search LRN / Client..." 
              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b192c', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' }}
            />
            <button style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
              + Create New Order
            </button>
          </div>
        </div>

        {/* Bookings / Shipments Table List */}
        <div style={{ background: '#102238', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.8fr 1.2fr 0.8fr 0.6fr 0.8fr', padding: '15px 20px', background: '#08121e', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
            <div>LR NUMBER & MWB</div>
            <div>MANIFESTED ON</div>
            <div>PICKUP & DELIVERY ADDRESS</div>
            <div>PRODUCT DETAILS</div>
            <div>FREIGHT MODE</div>
            <div>BOXES</div>
            <div style={{ textAlign: 'right' }}>ACTION</div>
          </div>

          {/* Table Rows */}
          {bookingsData.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.8fr 1.2fr 0.8fr 0.6fr 0.8fr', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', fontSize: '13px' }}>
              
              {/* LR Number */}
              <div>
                <div style={{ color: '#60a5fa', fontWeight: '700', cursor: 'pointer' }}>{item.lrNumber}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.lrNumber.replace('31', '309024')}</div>
              </div>

              {/* Date */}
              <div style={{ color: '#cbd5e1', fontSize: '12px' }}>
                {item.date}
              </div>

              {/* Route & Client */}
              <div>
                <div style={{ fontWeight: '600', color: '#fff', fontSize: '12px' }}>{item.route}</div>
                <div style={{ fontSize: '11px', color: '#ff7b00', fontWeight: '600', marginTop: '2px' }}>{item.client}</div>
              </div>

              {/* Product Details */}
              <div>
                <div style={{ color: '#fff', fontWeight: '600' }}>1 Invoice</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.amount} | {item.mode}</div>
              </div>

              {/* Freight Mode */}
              <div>
                <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {item.freight}
                </span>
              </div>

              {/* Boxes */}
              <div style={{ fontWeight: '700', color: '#fff' }}>
                {item.boxes} Box
              </div>

              {/* Action Button */}
              <div style={{ textAlign: 'right' }}>
                <button style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                  Print Label
                </button>
              </div>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}