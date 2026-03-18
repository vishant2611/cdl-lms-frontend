'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const testAccounts = [
  { label: 'Admin', name: 'Vishant Bhatia', email: 'vishant@cropdefenders.com', pass: 'Admin@123', role: 'ADMIN', color: '#10312B' },
  { label: 'Instructor', name: 'Sarah Ahmed', email: 'sarah@cropdefenders.com', pass: 'Test@123', role: 'INSTRUCTOR', color: '#6C9604' },
  { label: 'Manager', name: 'James Wilson', email: 'james@cropdefenders.com', pass: 'Test@123', role: 'MANAGER', color: '#AEBF66' },
  { label: 'Employee', name: 'Ali Hassan', email: 'ali@cropdefenders.com', pass: 'Test@123', role: 'EMPLOYEE', color: '#3B82F6' },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      router.push('/dashboard');
    } catch { setError('Invalid email or password. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Left — Brand Panel */}
      <div style={{ flex: 1, background: 'linear-gradient(160deg, #10312B 0%, #1a4a3a 40%, #6C9604 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(108,150,4,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(174,191,102,0.1)' }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="30" r="14" stroke="#AEBF66" strokeWidth="2.5"/>
                <path d="M20 20 Q25 8 30 20" stroke="#6C9604" strokeWidth="2.5" fill="none"/>
                <path d="M25 8 L28 14 L22 14 Z" fill="#6C9604"/>
              </svg>
            </div>
            <div>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>CROP<span style={{ color: '#AEBF66' }}>DEFENDERS</span></span>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Learning Portal</p>
            </div>
          </div>

          <h1 style={{ color: 'white', fontSize: '40px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px', position: 'relative' }}>
            We Protect.<br />
            <span style={{ color: '#AEBF66' }}>You Grow.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: '1.8', maxWidth: '380px' }}>
            Access world-class training programs, earn industry certifications, and track your professional development at Crop Defenders Ltd.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '40px', position: 'relative' }}>
          {[['7', 'Departments'], ['50+', 'Courses'], ['100%', 'On-Brand']].map(([v, l]) => (
            <div key={l}>
              <p style={{ color: '#AEBF66', fontSize: '30px', fontWeight: '800', lineHeight: 1 }}>{v}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div style={{ width: '500px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#10312B', marginBottom: '6px' }}>Sign in to your account</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Enter your CDL credentials to continue</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #EF4444', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="firstname@cropdefenders.com" required />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #10312B 0%, #6C9604 100%)',
            color: 'white', fontWeight: '700', fontSize: '15px', fontFamily: 'Montserrat, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px'
          }}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Test Accounts */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Quick Access — Test Accounts</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {testAccounts.map(u => (
              <button key={u.label} onClick={() => { setEmail(u.email); setPassword(u.pass); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: 'Montserrat, sans-serif' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = u.color; (e.currentTarget as HTMLButtonElement).style.background = '#FAFDF5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>{u.label[0]}</span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#10312B' }}>{u.label}</p>
                  <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>{u.name.split(' ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#D1D5DB', fontSize: '11px', marginTop: '32px' }}>
          © 2026 Crop Defenders Ltd · We Protect. You Grow.
        </p>
      </div>
    </div>
  );
}