const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

// ─── GLOBALS ───────────────────────────────────────────────
'app/globals.css': `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
@import "tailwindcss";

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cdl-primary: #6C9604;
  --cdl-primary-dark: #10312B;
  --cdl-primary-light: #AEBF66;
  --cdl-primary-bg: #F4F7E8;
  --cdl-white: #FFFFFF;
  --cdl-bg: #F5F7F2;
  --cdl-sidebar: #10312B;
  --cdl-sidebar-hover: #1a4a3a;
  --cdl-sidebar-active: #6C9604;
  --cdl-text: #10312B;
  --cdl-text-muted: #6B7280;
  --cdl-text-light: #9CA3AF;
  --cdl-border: #E5E7EB;
  --cdl-card: #FFFFFF;
  --cdl-success: #6C9604;
  --cdl-warning: #F59E0B;
  --cdl-danger: #EF4444;
  --cdl-info: #3B82F6;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 1px 3px rgba(16,49,43,0.08), 0 1px 2px rgba(16,49,43,0.06);
  --shadow-md: 0 4px 16px rgba(16,49,43,0.1);
  --shadow-lg: 0 10px 40px rgba(16,49,43,0.12);
}

body {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--cdl-bg);
  color: var(--cdl-text);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}

a { text-decoration: none; color: inherit; }

input, select, textarea {
  font-family: 'Montserrat', sans-serif;
  border: 1.5px solid var(--cdl-border);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
  color: var(--cdl-text);
}

input:focus, select:focus, textarea:focus {
  border-color: var(--cdl-primary);
  box-shadow: 0 0 0 3px rgba(108,150,4,0.12);
}

button { font-family: 'Montserrat', sans-serif; cursor: pointer; }

table { width: 100%; border-collapse: collapse; }
th {
  font-size: 11px; font-weight: 700; color: var(--cdl-text-muted);
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 12px 18px; text-align: left;
  background: #F9FAFB; border-bottom: 1px solid var(--cdl-border);
}
td { padding: 14px 18px; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #FAFDF5; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 0.3s ease forwards; }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--cdl-primary-light); }
`,

// ─── LAYOUT ────────────────────────────────────────────────
'app/layout.tsx': `
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CDL LMS — Crop Defenders Ltd',
  description: 'We Protect. You Grow. — Employee Learning Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
`,

'app/providers.tsx': `
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
`,

'app/page.tsx': `
import { redirect } from 'next/navigation';
export default function Home() { redirect('/login'); }
`,

// ─── LOGIN ─────────────────────────────────────────────────
'app/login/page.tsx': `
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
`,

// ─── DASHBOARD LAYOUT ──────────────────────────────────────
'app/dashboard/layout.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/courses', label: 'Courses', icon: '📚', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/learning-paths', label: 'Learning Paths', icon: '🗺️', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/compliance', label: 'Compliance', icon: '🛡️', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/certificates', label: 'Certificates', icon: '🎓', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/announcements', label: 'Announcements', icon: '📢', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/instructor', label: 'Instructor Panel', icon: '✏️', roles: ['INSTRUCTOR','ADMIN'] },
  { href: '/dashboard/manager', label: 'My Team', icon: '👥', roles: ['MANAGER','ADMIN'] },
  { href: '/dashboard/admin', label: 'Admin Console', icon: '⚙️', roles: ['ADMIN'] },
];

const ROLE_COLORS: any = { ADMIN: '#10312B', INSTRUCTOR: '#6C9604', MANAGER: '#AEBF66', EMPLOYEE: '#3B82F6' };
const ROLE_BG: any = { ADMIN: '#E8F0EC', INSTRUCTOR: '#F4F7E8', MANAGER: '#F6F8EC', EMPLOYEE: '#EFF6FF' };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7F2', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Loading CDL LMS...</p>
      </div>
    </div>
  );

  const navItems = NAV.filter(n => n.roles.includes(user.role));
  const W = collapsed ? 68 : 256;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: W, background: '#10312B', minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, transition: 'width 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 14px' : '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#6C9604', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="30" r="13" stroke="white" strokeWidth="3"/>
              <path d="M21 21 Q25 10 29 21" stroke="white" strokeWidth="2.5" fill="none"/>
              <path d="M25 10 L28 17 L22 17 Z" fill="white"/>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '14px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                CROP<span style={{ color: '#AEBF66' }}>DEFENDERS</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>Learning Portal</p>
            </div>
          )}
        </div>

        {/* Nav Section */}
        {!collapsed && <p style={{ padding: '16px 20px 6px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Main Menu</p>}

        <nav style={{ flex: 1, padding: collapsed ? '8px 8px' : '8px 12px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', marginBottom: '2px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '11px' : '10px 14px',
                  borderRadius: '10px',
                  background: active ? '#6C9604' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  {active && !collapsed && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'white', opacity: 0.7 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{user.name.charAt(0)}</span>
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: ROLE_COLORS[user.role], color: 'white', display: 'inline-block', marginTop: '3px', letterSpacing: '0.5px' }}>{user.role}</span>
              </div>
            </div>
          )}
          <button onClick={() => { logout(); router.push('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: collapsed ? '10px' : '10px 14px', borderRadius: '10px', width: '100%', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>
        {/* Topbar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: '72px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6B7280', transition: 'all 0.2s' }}>
            {collapsed ? '☰' : '✕'}
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
              CDL LMS &rsaquo; <span style={{ color: '#10312B', fontWeight: '700' }}>
                {NAV.find(n => n.href === pathname)?.label || 'Dashboard'}
              </span>
            </p>
          </div>

          {/* User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: ROLE_BG[user.role], borderRadius: '40px', border: '1px solid', borderColor: ROLE_COLORS[user.role] + '40' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>{user.name.charAt(0)}</span>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#10312B', lineHeight: 1 }}>{user.name}</p>
              <p style={{ fontSize: '10px', color: ROLE_COLORS[user.role], fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{user.role}</p>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', background: '#F5F7F2' }}>
          {children}
        </main>

        <footer style={{ padding: '16px 28px', borderTop: '1px solid #E5E7EB', background: 'white' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
            © 2026 Crop Defenders Ltd · We Protect. You Grow. · LMS v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
`,

// ─── DASHBOARD HOME ────────────────────────────────────────
'app/dashboard/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import Link from 'next/link';

const ROLE_COLORS: any = { ADMIN: '#10312B', INSTRUCTOR: '#6C9604', MANAGER: '#AEBF66', EMPLOYEE: '#3B82F6' };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).catch(() => {});
    api.get('/compliance/my').then(r => setCompliance(r.data)).catch(() => {});
    api.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
    if (user) api.get('/gamification/points/' + user.id).then(r => setPoints(r.data?.points || 0)).catch(() => {});
  }, [user]);

  const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
  const inProgress = enrollments.filter(e => e.status === 'IN_PROGRESS').length;
  const overdue = compliance.filter(c => c.status === 'OVERDUE').length;

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div style={{ background: 'linear-gradient(135deg, #10312B 0%, #6C9604 100%)', borderRadius: '16px', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '0', top: '0', width: '250px', height: '100%', background: 'rgba(174,191,102,0.1)', clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome back</p>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>{user?.name} 👋</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>Ready to continue your learning journey today?</p>
        </div>
        <div style={{ position: 'relative', textAlign: 'right' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 24px', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#AEBF66', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Your Role</p>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdue > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #EF4444', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#DC2626', fontWeight: '700', fontSize: '14px' }}>Action Required: {overdue} Overdue Training(s)</p>
            <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '2px' }}>Please complete mandatory training to maintain compliance</p>
          </div>
          <Link href="/dashboard/compliance" style={{ background: '#DC2626', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'inline-block' }}>View Now →</Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Enrolled Courses', value: enrollments.length, icon: '📚', color: '#6C9604', bg: '#F4F7E8', sub: 'Total assigned' },
          { label: 'Completed', value: completed, icon: '✅', color: '#10B981', bg: '#ECFDF5', sub: 'Keep it up!' },
          { label: 'In Progress', value: inProgress, icon: '⏳', color: '#F59E0B', bg: '#FFFBEB', sub: 'Almost there!' },
          { label: 'Points Earned', value: points, icon: '⭐', color: '#6C9604', bg: '#F4F7E8', sub: 'Earn more!' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(16,49,43,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{s.icon}</div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginTop: '4px' }} />
            </div>
            <p style={{ fontSize: '34px', fontWeight: '800', color: '#10312B', lineHeight: 1, marginBottom: '6px' }}>{s.value}</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '2px' }}>{s.label}</p>
            <p style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        {/* Continue Learning */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Continue Learning</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Pick up where you left off</p>
            </div>
            <Link href="/dashboard/courses" style={{ fontSize: '12px', color: '#6C9604', fontWeight: '700', background: '#F4F7E8', padding: '6px 14px', borderRadius: '20px', display: 'inline-block' }}>View All →</Link>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {enrollments.filter(e => e.status === 'IN_PROGRESS').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
                <p style={{ fontSize: '36px', marginBottom: '10px' }}>📚</p>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>No courses in progress</p>
                <Link href="/dashboard/courses" style={{ color: '#6C9604', fontWeight: '700', fontSize: '13px', background: '#F4F7E8', padding: '8px 18px', borderRadius: '8px', display: 'inline-block' }}>Browse Courses →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {enrollments.filter(e => e.status === 'IN_PROGRESS').slice(0, 4).map((e: any) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#F9FAFB', borderRadius: '10px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📖</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>{e.course?.title}</p>
                      <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #10312B, #6C9604)', width: e.progressPct + '%', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#6C9604', minWidth: '38px', textAlign: 'right' }}>{e.progressPct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Links */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Browse Courses', href: '/dashboard/courses', icon: '📚', color: '#6C9604' },
                { label: 'View Leaderboard', href: '/dashboard/leaderboard', icon: '🏆', color: '#F59E0B' },
                { label: 'Check Compliance', href: '/dashboard/compliance', icon: '🛡️', color: '#EF4444' },
                { label: 'My Certificates', href: '/dashboard/certificates', icon: '🎓', color: '#8B5CF6' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: '#F9FAFB', border: '1px solid #F3F4F6', transition: 'all 0.15s', color: '#10312B' }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.background = '#F4F7E8'; e.currentTarget.style.borderColor = '#6C9604' + '40'; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#F3F4F6'; }}>
                  <span style={{ fontSize: '16px' }}>{a.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{a.label}</span>
                  <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: '12px' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Announcement */}
          <div style={{ background: 'linear-gradient(135deg, #10312B, #1a4a3a)', borderRadius: '14px', padding: '20px', color: 'white' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#AEBF66', marginBottom: '10px' }}>Latest Announcement</p>
            {announcements.length > 0 ? (
              <>
                <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>{announcements[0].title}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{announcements[0].body?.substring(0, 80)}...</p>
                <Link href="/dashboard/announcements" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', fontWeight: '700', color: '#AEBF66' }}>Read more →</Link>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>No announcements yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`,

// ─── COURSES PAGE ──────────────────────────────────────────
'app/dashboard/courses/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';

const TYPE_CFG: any = {
  SCORM: { color: '#10B981', bg: '#ECFDF5', icon: '🎮', label: 'Interactive' },
  PDF: { color: '#EF4444', bg: '#FEF2F2', icon: '📄', label: 'Document' },
  VIDEO: { color: '#F59E0B', bg: '#FFFBEB', icon: '🎬', label: 'Video' },
  PPT: { color: '#8B5CF6', bg: '#F5F3FF', icon: '📊', label: 'Presentation' },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([api.get('/courses?published=true'), api.get('/enrollments/my')])
      .then(([c, e]) => { setCourses(c.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const getEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    await api.post('/enrollments/enroll', { courseId });
    const { data } = await api.get('/enrollments/my');
    setEnrollments(data);
    setEnrolling(null);
  };

  const filtered = courses.filter(c => {
    const s = c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const f = filter === 'ALL' || c.type === filter;
    return s && f;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>Course Catalogue</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>{courses.length} courses · {enrollments.length} enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL','PDF','VIDEO','SCORM','PPT'].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '7px 16px', borderRadius: '8px', border: '1.5px solid',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Montserrat, sans-serif',
              borderColor: filter === t ? '#6C9604' : '#E5E7EB',
              background: filter === t ? '#6C9604' : 'white',
              color: filter === t ? 'white' : '#6B7280',
            }}>{t === 'ALL' ? 'All Types' : t}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '14px 18px', border: '1px solid #E5E7EB', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '16px', color: '#9CA3AF' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses by title or description..."
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', fontFamily: 'Montserrat, sans-serif', color: '#10312B', background: 'transparent', padding: 0, width: 'auto' }} />
        {search && <button onClick={() => setSearch('')} style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📚</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No courses found</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Try adjusting your search or type filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
          {filtered.map((course: any) => {
            const enrollment = getEnrollment(course.id);
            const cfg = TYPE_CFG[course.type] || TYPE_CFG.PDF;
            const isEnrolling = enrolling === course.id;
            return (
              <div key={course.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(16,49,43,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
                {/* Header */}
                <div style={{ height: '130px', background: 'linear-gradient(135deg, #10312B 0%, #1a4a3a 60%, #6C9604 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '48px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{cfg.icon}</span>
                  {enrollment?.status === 'COMPLETED' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10B981', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', color: 'white' }}>✓ Done</div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '6px', lineHeight: '1.4' }}>{course.title}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'No description available for this course.'}
                  </p>

                  {course.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '14px' }}>
                      <span>⏱️</span><span>{course.duration} minutes</span>
                      <span style={{ margin: '0 4px' }}>·</span>
                      <span>{Math.ceil(course.duration / 60 * 10) / 10} hrs</span>
                    </div>
                  )}

                  {enrollment ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{enrollment.status.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#6C9604' }}>{enrollment.progressPct}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '3px', background: enrollment.status === 'COMPLETED' ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: enrollment.progressPct + '%', transition: 'width 1s ease' }} />
                      </div>
                      <button onClick={() => router.push('/dashboard/courses/' + course.id)}
                        style={{ width: '100%', padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                        {enrollment.status === 'COMPLETED' ? '📖 Review Course' : '▶ Continue Learning'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleEnroll(course.id)} disabled={isEnrolling}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', background: isEnrolling ? '#E5E7EB' : 'white', color: isEnrolling ? '#9CA3AF' : '#6C9604', fontWeight: '700', fontSize: '13px', border: '2px solid', borderColor: isEnrolling ? '#E5E7EB' : '#6C9604', cursor: isEnrolling ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Montserrat, sans-serif' }}
                      onMouseEnter={e => { if (!isEnrolling) { (e.currentTarget as HTMLButtonElement).style.background = '#6C9604'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; } }}
                      onMouseLeave={e => { if (!isEnrolling) { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.color = '#6C9604'; } }}>
                      {isEnrolling ? '⏳ Enrolling...' : '+ Enrol in Course'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`,

// ─── LEADERBOARD ───────────────────────────────────────────
'app/dashboard/leaderboard/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/gamification/leaderboard').then(r => setLeaders(r.data)).catch(() => {});
    api.get('/gamification/badges').then(r => setBadges(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🏆 Leaderboard</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Top performers at Crop Defenders Ltd</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #10312B, #6C9604)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>Top Learners</h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}>{leaders.length} participants</span>
          </div>

          {/* Top 3 */}
          {leaders.length >= 3 && (
            <div style={{ padding: '28px 24px 20px', background: '#FAFDF5', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '24px' }}>
              {[1, 0, 2].map(idx => {
                const l = leaders[idx];
                const podium = [{ medal: '🥇', h: 100, color: '#F59E0B' }, { medal: '🥈', h: 80, color: '#94A3B8' }, { medal: '🥉', h: 65, color: '#CD7C2F' }];
                const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                const p = podium[rank];
                return (
                  <div key={l?.userId} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '22px', marginBottom: '6px' }}>{p.medal}</span>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', border: '3px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                      <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{l?.user?.name?.charAt(0)}</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '3px' }}>{l?.user?.name?.split(' ')[0]}</p>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: p.color }}>{l?.points}</p>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '8px' }}>pts</p>
                    <div style={{ width: '56px', height: p.h + 'px', background: p.color, borderRadius: '6px 6px 0 0', opacity: 0.2 }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          {leaders.map((l, i) => (
            <div key={l.userId} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F3F4F6', background: l.user?.id === user?.id ? '#F4F7E8' : 'white', transition: 'background 0.15s' }}>
              <div style={{ width: '32px', textAlign: 'center' }}>
                {i < 3 ? <span style={{ fontSize: '18px' }}>{['🥇','🥈','🥉'][i]}</span> : <span style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF' }}>#{i + 1}</span>}
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: i < 3 ? ['#F59E0B','#94A3B8','#CD7C2F'][i] : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: i < 3 ? 'white' : '#6B7280', fontWeight: '800', fontSize: '14px' }}>{l.user?.name?.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B' }}>{l.user?.name} {l.user?.id === user?.id ? <span style={{ color: '#6C9604', fontSize: '11px' }}>(You)</span> : ''}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>{l.user?.department?.name || 'Crop Defenders Ltd'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#6C9604' }}>{l.points}</p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>points</p>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
              <p style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>No data yet</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Complete courses to earn points!</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div>
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>🏅 Badges</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Earn by collecting points</p>
            </div>
            <div style={{ padding: '14px' }}>
              {badges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏅</p>
                  <p style={{ fontSize: '13px' }}>No badges configured yet</p>
                </div>
              ) : badges.map((b: any) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '8px', background: '#FAFDF5', transition: 'all 0.15s' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{b.icon}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#10312B' }}>{b.name}</p>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{b.description}</p>
                    <p style={{ fontSize: '11px', color: '#6C9604', fontWeight: '700', marginTop: '4px' }}>⭐ {b.pointsRequired} points required</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,

// ─── COMPLIANCE ────────────────────────────────────────────
'app/dashboard/compliance/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

const STATUS_CFG: any = {
  COMPLETED: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: '✅', label: 'Completed' },
  OVERDUE: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: '🔴', label: 'Overdue' },
  PENDING: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '⏳', label: 'Pending' },
};

export default function CompliancePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/compliance/my').then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const completed = items.filter(i => i.status === 'COMPLETED').length;
  const overdue = items.filter(i => i.status === 'OVERDUE').length;
  const pending = items.filter(i => i.status === 'PENDING').length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🛡️ Compliance Training</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Mandatory training requirements for your role</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Completed', value: completed, ...STATUS_CFG.COMPLETED },
          { label: 'Pending', value: pending, ...STATUS_CFG.PENDING },
          { label: 'Overdue', value: overdue, ...STATUS_CFG.OVERDUE },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '18px', border: '1px solid ' + s.border, display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: s.color, fontWeight: '600', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>All clear!</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>No mandatory training assigned to you</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          {items.map((item: any, i: number) => {
            const cfg = STATUS_CFG[item.status] || STATUS_CFG.PENDING;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: i < items.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFDF5'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'white'}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, border: '1px solid ' + cfg.border }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '3px' }}>{item.course?.title}</p>
                  {item.deadline && <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>📅 Deadline: {new Date(item.deadline).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  {item.completedAt && <p style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>✅ Completed: {new Date(item.completedAt).toLocaleDateString()}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.border, padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{cfg.label}</span>
                  {item.status !== 'COMPLETED' && (
                    <a href="/dashboard/courses" style={{ fontSize: '12px', color: '#6C9604', fontWeight: '700', background: '#F4F7E8', padding: '5px 12px', borderRadius: '8px', display: 'inline-block' }}>Start Now →</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`,

// ─── CERTIFICATES ──────────────────────────────────────────
'app/dashboard/certificates/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🎓 My Certificates</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>{certs.length} certificate{certs.length !== 1 ? 's' : ''} earned</p>
      </div>

      {certs.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '52px', marginBottom: '14px' }}>🎓</p>
          <p style={{ fontSize: '18px', fontWeight: '800', color: '#10312B', marginBottom: '6px' }}>No certificates yet</p>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Complete courses and pass quizzes to earn your first certificate</p>
          <a href="/dashboard/courses" style={{ background: '#6C9604', color: 'white', padding: '11px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>Browse Courses →</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
          {certs.map((c: any) => (
            <div key={c.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(16,49,43,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
              {/* Certificate Visual */}
              <div style={{ background: 'linear-gradient(135deg, #10312B 0%, #1a4a3a 50%, #6C9604 100%)', padding: '28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(174,191,102,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(108,150,4,0.15)' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#AEBF66', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '3px solid rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: '28px' }}>🎓</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Certificate of Completion</p>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '800' }}>{user?.name}</p>
              </div>

              <div style={{ padding: '18px' }}>
                <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '14px', marginBottom: '14px', borderLeft: '4px solid #6C9604' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#6C9604', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Course Completed</p>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#10312B', lineHeight: '1.3' }}>{c.course?.title}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>
                    📅 {new Date(c.issuedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <button style={{ background: '#6C9604', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ⬇ Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`,

// ─── ANNOUNCEMENTS ─────────────────────────────────────────
'app/dashboard/announcements/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>📢 Announcements</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Company-wide communications from CDL leadership</p>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📢</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No announcements yet</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Check back later for updates from the CDL team</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((a: any, i: number) => (
            <div key={a.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ width: '5px', background: i === 0 ? '#6C9604' : '#AEBF66', flexShrink: 0 }} />
                <div style={{ padding: '20px 24px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>{a.title}</h3>
                    {i === 0 && <span style={{ background: '#F4F7E8', color: '#6C9604', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid #AEBF66', flexShrink: 0, marginLeft: '12px' }}>Latest</span>}
                  </div>
                  <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.7', marginBottom: '14px' }}>{a.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>{a.createdBy?.name?.charAt(0)}</span>
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>{a.createdBy?.name}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>·</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>📅 {new Date(a.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {a.department && <span style={{ background: '#F4F7E8', color: '#6C9604', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>🏢 {a.department.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`,

// ─── LEARNING PATHS ────────────────────────────────────────
'app/dashboard/learning-paths/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    api.get('/learning-paths').then(r => setPaths(r.data)).catch(() => {});
    api.get('/learning-paths/my').then(r => setMyPaths(r.data)).catch(() => {});
  }, []);

  const enroll = async (id: string) => {
    setEnrolling(id);
    await api.post('/learning-paths/' + id + '/enroll', {});
    const r = await api.get('/learning-paths/my');
    setMyPaths(r.data);
    setEnrolling(null);
  };

  const isEnrolled = (id: string) => myPaths.some((p: any) => p.learningPathId === id);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🗺️ Learning Paths</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Structured learning journeys for your development</p>
      </div>

      {paths.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No learning paths yet</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Your instructors will create structured paths for you</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {paths.map((path: any) => {
            const enrolled = isEnrolled(path.id);
            return (
              <div key={path.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 28px rgba(16,49,43,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
                <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🗺️</div>
                  <div>
                    <p style={{ color: 'white', fontSize: '15px', fontWeight: '800', marginBottom: '3px' }}>{path.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{path.pathCourses?.length} courses in this path</p>
                  </div>
                </div>

                <div style={{ padding: '18px 22px' }}>
                  {path.description && <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.6' }}>{path.description}</p>}

                  {/* Course List */}
                  <div style={{ marginBottom: '16px' }}>
                    {path.pathCourses?.slice(0, 4).map((pc: any, idx: number) => (
                      <div key={pc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: idx < Math.min(3, path.pathCourses.length - 1) ? '1px solid #F3F4F6' : 'none' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: '800' }}>{idx + 1}</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.course?.title}</span>
                      </div>
                    ))}
                    {path.pathCourses?.length > 4 && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px', fontWeight: '600' }}>+ {path.pathCourses.length - 4} more courses</p>
                    )}
                  </div>

                  {enrolled ? (
                    <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '11px', textAlign: 'center', border: '1px solid #AEBF66' }}>
                      <p style={{ color: '#6C9604', fontWeight: '800', fontSize: '14px' }}>✅ Enrolled in this path</p>
                    </div>
                  ) : (
                    <button onClick={() => enroll(path.id)} disabled={enrolling === path.id}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', background: enrolling === path.id ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: enrolling === path.id ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '13px', border: 'none', cursor: enrolling === path.id ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                      {enrolling === path.id ? '⏳ Enrolling...' : '🚀 Start Learning Path'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`,

// ─── INSTRUCTOR ────────────────────────────────────────────
'app/dashboard/instructor/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

const TYPE_CFG: any = {
  SCORM: { color: '#10B981', bg: '#ECFDF5', icon: '🎮' },
  PDF: { color: '#EF4444', bg: '#FEF2F2', icon: '📄' },
  VIDEO: { color: '#F59E0B', bg: '#FFFBEB', icon: '🎬' },
  PPT: { color: '#8B5CF6', bg: '#F5F3FF', icon: '📊' },
};

export default function InstructorPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses', { ...form, duration: form.duration ? parseInt(form.duration) : undefined });
      const r = await api.get('/courses');
      setCourses(r.data);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
    } finally { setLoading(false); }
  };

  const handlePublish = async (id: string) => {
    await api.patch('/courses/' + id + '/publish', {});
    const r = await api.get('/courses');
    setCourses(r.data);
  };

  const published = courses.filter(c => c.isPublished).length;
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>✏️ Instructor Panel</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Create and manage your course content</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '11px 20px', borderRadius: '10px', background: showForm ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: showForm ? '#6B7280' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showForm ? '✕ Cancel' : '+ Create New Course'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Courses', value: courses.length, icon: '📚', color: '#6C9604', bg: '#F4F7E8' },
          { label: 'Published', value: published, icon: '✅', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Total Enrollments', value: totalEnrollments, icon: '👥', color: '#3B82F6', bg: '#EFF6FF' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '26px', fontWeight: '800', color: '#10312B', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(16,49,43,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#10312B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📝 New Course Details</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Pesticide Safety Training Level 1" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Type *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ background: 'white' }}>
                  {['PDF','VIDEO','SCORM','PPT'].map(t => <option key={t} value={t}>{TYPE_CFG[t]?.icon} {t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>File URL *</label>
                <input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} placeholder="https://drive.google.com/..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration (minutes)</label>
                <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 45" type="number" min="1" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What will employees learn from this course? Include key learning objectives..." rows={3} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
              <button type="submit" disabled={loading}
                style={{ padding: '12px 24px', borderRadius: '10px', background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                {loading ? '⏳ Creating...' : '✓ Create Course'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: '12px 20px', borderRadius: '10px', background: 'white', color: '#6B7280', fontWeight: '600', fontSize: '14px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Table */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>All Courses ({courses.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              {['Course','Type','Status','Enrollments','Created','Action'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {courses.map((c: any) => {
              const cfg = TYPE_CFG[c.type] || TYPE_CFG.PDF;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{cfg.icon}</div>
                      <div>
                        <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>{c.title}</p>
                        {c.duration && <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>⏱️ {c.duration} min</p>}
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{c.type}</span></td>
                  <td><span style={{ background: c.isPublished ? '#ECFDF5' : '#FFFBEB', color: c.isPublished ? '#10B981' : '#F59E0B', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid', borderColor: c.isPublished ? '#A7F3D0' : '#FDE68A' }}>{c.isPublished ? '✅ Live' : '📝 Draft'}</span></td>
                  <td><span style={{ fontWeight: '700', fontSize: '14px', color: '#10312B' }}>{c._count?.enrollments || 0}</span></td>
                  <td style={{ color: '#9CA3AF', fontSize: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!c.isPublished && (
                      <button onClick={() => handlePublish(c.id)}
                        style={{ padding: '7px 14px', borderRadius: '8px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                        Publish →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📝</p>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#6B7280' }}>No courses yet</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Create New Course" to get started</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,

// ─── MANAGER ───────────────────────────────────────────────
'app/dashboard/manager/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ManagerPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/my-team').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const total = stats.length;
  const totalEnrolled = stats.reduce((s, u) => s + u.totalEnrollments, 0);
  const totalCompleted = stats.reduce((s, u) => s + u.completed, 0);
  const avgRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>👥 My Team</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Track and support your team's learning progress</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Team Size', value: total, icon: '👥', color: '#6C9604', bg: '#F4F7E8' },
          { label: 'Total Enrolled', value: totalEnrolled, icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Completions', value: totalCompleted, icon: '✅', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Avg Completion', value: avgRate + '%', icon: '📊', color: '#F59E0B', bg: '#FFFBEB' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#10312B', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Team Progress Report</h2>
        </div>

        {stats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '36px', marginBottom: '10px' }}>👥</p>
            <p style={{ fontWeight: '600', fontSize: '14px', color: '#6B7280' }}>No team members assigned</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Contact your admin to assign team members</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>{['Employee','Enrolled','Completed','In Progress','Certificates','Points','Completion'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {stats.map((s: any) => {
                const rate = s.totalEnrollments > 0 ? Math.round((s.completed / s.totalEnrollments) * 100) : 0;
                const rateColor = rate >= 70 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>{s.name}</p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '700', color: '#10312B' }}>{s.totalEnrollments}</td>
                    <td><span style={{ color: '#10B981', fontWeight: '700' }}>{s.completed}</span></td>
                    <td><span style={{ color: '#3B82F6', fontWeight: '700' }}>{s.inProgress}</span></td>
                    <td><span style={{ color: '#8B5CF6', fontWeight: '700' }}>{s.certificates}</span></td>
                    <td><span style={{ color: '#F59E0B', fontWeight: '800' }}>⭐ {s.points}</span></td>
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: rateColor, width: rate + '%', transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: rateColor, minWidth: '32px' }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
`,

// ─── ADMIN ─────────────────────────────────────────────────
'app/dashboard/admin/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

const ROLE_COLORS: any = { ADMIN: '#10312B', INSTRUCTOR: '#6C9604', MANAGER: '#AEBF66', EMPLOYEE: '#3B82F6' };
const ROLE_BG: any = { ADMIN: '#E8F0EC', INSTRUCTOR: '#F4F7E8', MANAGER: '#F6F8EC', EMPLOYEE: '#EFF6FF' };

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/company').then(r => setStats(r.data)).catch(() => {});
    api.get('/analytics/departments').then(r => setDeptStats(r.data)).catch(() => {});
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>⚙️ Admin Console</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Company-wide learning analytics and management</p>
      </div>

      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Active Employees', value: stats.totalUsers, icon: '👥', color: '#6C9604', bg: '#F4F7E8' },
              { label: 'Published Courses', value: stats.totalCourses, icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Total Enrollments', value: stats.totalEnrollments, icon: '📊', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Certificates Issued', value: stats.totalCertificates, icon: '🎓', color: '#8B5CF6', bg: '#F5F3FF' },
            ].map(c => (
              <div key={c.label} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '20px' }}>{c.icon}</div>
                <p style={{ fontSize: '32px', fontWeight: '800', color: '#10312B', lineHeight: 1, marginBottom: '6px' }}>{c.value}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{c.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '14px', padding: '22px 24px', border: '1px solid #E5E7EB', marginBottom: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Overall Completion Rate</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{stats.completedEnrollments} of {stats.totalEnrollments} enrollments completed</p>
              </div>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#6C9604' }}>{stats.completionRate}%</span>
            </div>
            <div style={{ height: '10px', background: '#E5E7EB', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '5px', background: 'linear-gradient(90deg, #10312B, #6C9604, #AEBF66)', width: stats.completionRate + '%', transition: 'width 1.2s ease' }} />
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Department Performance */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Department Performance</h2>
          </div>
          <div style={{ padding: '16px' }}>
            {deptStats.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px', fontSize: '13px' }}>No departments configured</p>
            ) : deptStats.map((d: any) => (
              <div key={d.id} style={{ padding: '12px 14px', marginBottom: '8px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#FAFDF5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B' }}>{d.name}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{d.totalUsers} employees · {d.totalEnrollments} enrollments</p>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: d.completionRate >= 70 ? '#6C9604' : d.completionRate >= 40 ? '#F59E0B' : '#EF4444' }}>{d.completionRate}%</span>
                </div>
                <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: d.completionRate >= 70 ? 'linear-gradient(90deg, #10312B, #6C9604)' : d.completionRate >= 40 ? '#F59E0B' : '#EF4444', width: d.completionRate + '%', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Management */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Employees ({users.length})</h2>
          </div>
          <div style={{ padding: '8px', maxHeight: '380px', overflowY: 'auto' }}>
            {users.map((u: any) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFDF5'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ROLE_COLORS[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>{u.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#10312B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', background: ROLE_BG[u.role], color: ROLE_COLORS[u.role], flexShrink: 0 }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`,

};

let created = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(base, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
  console.log('✅ ' + filePath);
  created++;
}
console.log('\n🎉 CDL Brand UI complete! Created ' + created + ' files.');