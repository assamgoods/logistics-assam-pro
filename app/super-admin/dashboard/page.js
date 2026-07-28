'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiName, setApiName] = useState('Delhivery');
  const [savedMessage, setSavedMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('isSuperAdmin');
    if (!auth) {
      router.push('/super-admin/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleSaveApi = (e) => {
    e.preventDefault();
    localStorage.setItem('aggregator_api_key', apiKey);
    localStorage.setItem('aggregator_name', apiName);
    setSavedMessage('API Credentials successfully save ho gaye hain!');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isSuperAdmin');
    router.push('/super-admin/login');
  };

  if (!isAuth) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Super Admin Aggregator Panel</h2>
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>

        <p style={{ color: '#4b5563', marginBottom: '20px' }}>
          Yahan se aap third-party courier (jaise Delhivery) ki API configure kar sakte hain. Iska aapke purane admin ya branch data se koi lena-dena nahi hai.
        </p>

        {savedMessage && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', fontWeight: '500' }}>
            {savedMessage}
          </div>
        )}

        <form onSubmit={handleSaveApi} style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#374151' }}>Configure Courier API</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Select Aggregator</label>
            <select 
              value={apiName} 
              onChange={(e) => setApiName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="Delhivery">Delhivery</option>
              <option value="Xpressbees" disabled>Xpressbees (Coming Soon)</option>
              <option value="Bluedart" disabled>Bluedart (Coming Soon)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>API Key / Token</label>
            <input 
              type="text" 
              placeholder="Apni Delhivery API key yahan daalein" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit"
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Save API Settings
          </button>
        </form>

      </div>
    </div>
  );
}