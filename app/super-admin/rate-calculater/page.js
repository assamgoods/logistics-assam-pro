'use client';
import React from 'react';

export default function SuperAdminDashboard() {
  return (
    <div style={{ background: '#0b192c', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif', paddingBottom: '40px', color: '#fff' }}>
      
      {/* Clean Admin Header */}
      <header style={{ background: '#08121e', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ff7b00', fontStyle: 'italic', lineHeight: '1' }}>
            A
          </div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '16px', color: '#ffffff', letterSpacing: '0.5px', display: 'block' }}>
              ASSAM GOODS CARRIER
            </span>
            <span style={{ fontSize: '9px', color: '#ff7b00', fontWeight: '700', letterSpacing: '1.5px' }}>
              SAFE • FAST • RELIABLE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/super-admin/rate-calculater" style={{ background: '#ff7b00', color: '#ffffff', padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
            🧮 Rate Calculator
          </a>
          
          <div style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', padding: '8px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)' }}>
            📞 8847428801
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Grid: Live Shipment Actions & Quick Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '25px' }}>
          
          {/* Live Shipment Actions Box */}
          <div style={{ background: '#102238', border: '1px solid rgba(255,255,255,0.08)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚚 Live Shipment Actions
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              
              <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>5</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Awaiting Pickup</div>
                <a href="#" style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '700', textDecoration: 'none' }}>View →</a>
              </div>

              <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>9</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>In Transit</div>
                <a href="#" style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '700', textDecoration: 'none' }}>View →</a>
              </div>

              <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>0</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Exceptions</div>
                <a href="#" style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', textDecoration: 'none' }}>Act Now →</a>
              </div>

            </div>
          </div>

          {/* Side Shortcuts (Knowledge Base & Rate Calculator) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: '#102238', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>📖</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>Knowledge Base</div>
              <a href="#" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Read guides & policies</a>
            </div>

            <a href="/super-admin/rate-calculater" style={{ background: '#102238', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>🧮</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff7b00', marginBottom: '4px' }}>Rate Calculator</div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Calculate shipment pricing</span>
            </a>
          </div>

        </div>

        {/* Quick Shortcuts Section */}
        <div style={{ background: '#102238', border: '1px solid rgba(255,255,255,0.08)', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ff7b00', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Quick Shortcuts
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', background: 'rgba(255,123,0,0.1)', padding: '12px', borderRadius: '8px' }}>📦</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Create New Order</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Book a fresh shipment</div>
              </div>
            </div>

            <div style={{ background: '#0b192c', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', background: 'rgba(255,123,0,0.1)', padding: '12px', borderRadius: '8px' }}>🚚</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Create New Pickup</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Schedule vendor pickup</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Pickups Section */}
        <div style={{ background: '#102238', border: '1px solid rgba(255,255,255,0.08)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>Upcoming Pickups</h3>
            <button style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,123,0,0.3)' }}>
              + Create New Pickup
            </button>
          </div>

          <div style={{ background: '#0b192c', border: '2px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>No upcoming pickups.</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Your upcoming pickup requests appear here</div>
          </div>
        </div>

      </div>
    </div>
  );
}