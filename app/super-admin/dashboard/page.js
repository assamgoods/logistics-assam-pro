'use client';
import { useState } from 'react';
import React from 'react';

export default function OfficeStaffDashboard() {
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Rahul Sharma', branch: 'Chandigarh Main', role: 'Booking Staff', balance: 45000 },
    { id: 2, name: 'Amit Das', branch: 'Guwahati Hub', role: 'Booking Staff', balance: 85000 },
  ]);

  const [bookings] = useState([
    { awb: 'AGC101', staff: 'Rahul Sharma', branch: 'Chandigarh Main', client: 'Mehek Medical', freight: 420, payType: 'Prepaid', status: 'In Transit' },
    { awb: 'AGC102', staff: 'Amit Das', branch: 'Guwahati Hub', client: 'Lakshmi Agencies', freight: 1200, payType: 'ToPay', status: 'Delivered' },
    { awb: 'AGC103', staff: 'Rahul Sharma', branch: 'Chandigarh Main', client: 'Royal Ent.', freight: 750, payType: 'Prepaid', status: 'Manifested' },
  ]);

  const [selectedStaff, setSelectedStaff] = useState('');
  const [amount, setAmount] = useState('');
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState('');

  // Handle Recharge
  const handleRecharge = (e) => {
    e.preventDefault();
    if (!selectedStaff || !amount) return;
    setStaffList(staffList.map(s => s.name === selectedStaff ? { ...s, balance: s.balance + Number(amount) } : s));
    setSelectedStaff('');
    setAmount('');
  };

  // Handle Add Office Staff
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newName || !newBranch) return;
    setStaffList([...staffList, { id: staffList.length + 1, name: newName, branch: newBranch, role: 'Booking Staff', balance: 0 }]);
    setNewName('');
    setNewBranch('');
  };

  const totalPrepaid = bookings.filter(b => b.payType === 'Prepaid').reduce((acc, curr) => acc + curr.freight, 0);
  const totalToPay = bookings.filter(b => b.payType === 'ToPay').reduce((acc, curr) => acc + curr.freight, 0);

  return (
    <div style={{ padding: '30px', background: '#0b192c', minHeight: '100vh', color: '#fff', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#ff7b00', marginBottom: '20px' }}>⚡ Super Admin - Office Staff Panel</h2>

      {/* Quick Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#102238', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Total Prepaid Bookings</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', marginTop: '5px' }}>₹{totalPrepaid}</div>
        </div>
        <div style={{ background: '#102238', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Total ToPay Bookings</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginTop: '5px' }}>₹{totalToPay}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Add Office Staff */}
        <div style={{ background: '#102238', padding: '20px', borderRadius: '8px' }}>
          <h3>Add Office Staff & Assign Branch</h3>
          <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <input type="text" placeholder="Staff Name" value={newName} onChange={e => setNewName(e.target.value)} required style={{ padding: '8px', background: '#08121e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            <input type="text" placeholder="Branch Name (e.g. Silchar Hub)" value={newBranch} onChange={e => setNewBranch(e.target.value)} required style={{ padding: '8px', background: '#08121e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add Staff</button>
          </form>
        </div>

        {/* Recharge Wallet */}
        <div style={{ background: '#102238', padding: '20px', borderRadius: '8px' }}>
          <h3>Recharge Staff Wallet</h3>
          <form onSubmit={handleRecharge} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} required style={{ padding: '8px', background: '#08121e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
              <option value="">Select Staff</option>
              {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.branch})</option>)}
            </select>
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required style={{ padding: '8px', background: '#08121e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            <button type="submit" style={{ background: '#ff7b00', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add Funds</button>
          </form>
        </div>

      </div>

      {/* Staff List */}
      <h3 style={{ marginBottom: '10px' }}>Office Staff & Wallets</h3>
      <table style={{ width: '100%', background: '#102238', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#08121e', color: '#aaa', textAlign: 'left', fontSize: '13px' }}>
            <th style={{ padding: '12px' }}>Staff Name</th>
            <th style={{ padding: '12px' }}>Branch</th>
            <th style={{ padding: '12px' }}>Wallet Balance</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map(s => (
            <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.name}</td>
              <td style={{ padding: '12px', color: '#60a5fa' }}>{s.branch}</td>
              <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>₹{s.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bookings Ledger */}
      <h3 style={{ marginBottom: '10px' }}>All Staff Bookings (Prepaid & ToPay)</h3>
      <table style={{ width: '100%', background: '#102238', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#08121e', color: '#aaa', textAlign: 'left', fontSize: '13px' }}>
            <th style={{ padding: '12px' }}>AWB</th>
            <th style={{ padding: '12px' }}>Staff Name</th>
            <th style={{ padding: '12px' }}>Branch</th>
            <th style={{ padding: '12px' }}>Client</th>
            <th style={{ padding: '12px' }}>Freight</th>
            <th style={{ padding: '12px' }}>Payment Mode</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
              <td style={{ padding: '12px', color: '#60a5fa' }}>{b.awb}</td>
              <td style={{ padding: '12px' }}>{b.staff}</td>
              <td style={{ padding: '12px' }}>{b.branch}</td>
              <td style={{ padding: '12px' }}>{b.client}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{b.freight}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  background: b.payType === 'Prepaid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', 
                  color: b.payType === 'Prepaid' ? '#22c55e' : '#f59e0b', 
                  padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                }}>
                  {b.payType}
                </span>
              </td>
              <td style={{ padding: '12px', color: '#60a5fa' }}>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}