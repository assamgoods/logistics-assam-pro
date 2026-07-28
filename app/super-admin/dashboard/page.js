'use client';
import { useState } from 'react';
import React from 'react';

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: '40px' }}>
      
      {/* Top Navbar Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <span style={{ fontWeight: '800', fontSize: '18px', color: '#0b2545', letterSpacing: '0.5px' }}>ASSAM GOODS CARRIER</span>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', width: '320px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', marginRight: '10px', borderRight: '1px solid #cbd5e1', paddingRight: '10px', fontWeight: '600' }}>LRN ▼</span>
            <input 
              type="text" placeholder="Search upto 25 LRNs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
            />
            <span style={{ fontSize: '12px', color: '#0b2545', fontWeight: '600', cursor: 'pointer' }}>Search</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#f1f5f9', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ Quick Actions
          </div>
          <div style={{ background: '#0b2545', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            AG
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0b2545', marginBottom: '25px' }}>
          Hi, Assam Goods Admin
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
          
          {/* Left Column (Actions & Shortcuts) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Actions Card */}
            <div style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚚 Live Shipment Actions
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#0b2545' }}>5</div>
                  <div style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 10px 0' }}>Awaiting Pickup</div>
                  <a href="#" style={{ fontSize: '12px', color: '#0b2545', fontWeight: '700', textDecoration: 'none' }}>View</a>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#0b2545' }}>9</div>
                  <div style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 10px 0' }}>In Transit</div>
                  <a href="#" style={{ fontSize: '12px', color: '#0b2545', fontWeight: '700', textDecoration: 'none' }}>View</a>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626' }}>0</div>
                  <div style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 10px 0' }}>Exceptions</div>
                  <a href="#" style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>Act Now</a>
                </div>
              </div>
            </div>

            {/* Shortcuts Card */}
            <div style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
                ⚡ Quick Shortcuts
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ border: '1px solid #cbd5e1', padding: '18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#fafafa' }}>
                  <span style={{ fontSize: '20px' }}>📦</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0b2545' }}>Create New Order</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Book a fresh shipment</div>
                  </div>
                </div>

                <div style={{ border: '1px solid #cbd5e1', padding: '18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#fafafa' }}>
                  <span style={{ fontSize: '20px' }}>🚛</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0b2545' }}>Create New Pickup</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Schedule vendor pickup</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Tools / Rate Calculator Shortcut) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📖</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b2545' }}>Knowledge Base</div>
              </div>

              <a href="/super-admin/rate-calculater" style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧮</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b2545' }}>Rate Calculator</div>
              </a>
            </div>
          </div>

        </div>

        {/* Upcoming Pickups Section */}
        <div style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', marginTop: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Upcoming Pickups</span>
            <span style={{ fontSize: '13px', color: '#0b2545', fontWeight: '700', cursor: 'pointer' }}>+ Create New Pickup</span>
          </div>

          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '8px' }}>
            No upcoming pickups.<br/>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Your upcoming pickup requests appear here</span>
          </div>
        </div>

      </div>
    </div>
  );
}