'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import Image from 'next/image';

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
  { href: '/dashboard/admin/users', label: 'User Management', icon: '👤', roles: ['ADMIN'] },
  { href: '/dashboard/admin/departments', label: 'Departments', icon: '🏢', roles: ['ADMIN'] },

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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', position: 'relative' }}>
      {/* Sidebar */}
      <aside style={{ width: W, background: '#10312B', minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, transition: 'width 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '16px 14px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#6C9604', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/cdl-logo.png" alt="CDL" width={36} height={36} style={{ objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                CROP<span style={{ color: '#AEBF66' }}>DEFENDERS</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>Learning Portal</p>
            </div>
          )}
        </div>

        {/* Nav Label */}
        {!collapsed && <p style={{ padding: '14px 20px 6px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Main Menu</p>}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: collapsed ? '8px' : '8px 12px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', marginBottom: '2px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '11px' : '10px 14px', borderRadius: '10px',
                  background: active ? '#6C9604' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s', cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  {active && !collapsed && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'white', opacity: 0.7 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{user.name.charAt(0)}</span>
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: ROLE_COLORS[user.role], color: 'white', display: 'inline-block', marginTop: '3px' }}>{user.role}</span>
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

      {/* Main Content */}
      <div style={{ marginLeft: W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>
        {/* Topbar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: '72px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6B7280' }}>
            {collapsed ? '☰' : '✕'}
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
              CDL LMS &rsaquo; <span style={{ color: '#10312B', fontWeight: '700' }}>
                {NAV.find(n => n.href === pathname)?.label || 'Dashboard'}
              </span>
            </p>
          </div>
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

        <main style={{ flex: 1, padding: '28px', background: '#F5F7F2' }}>{children}</main>

        <footer style={{ padding: '14px 28px', borderTop: '1px solid #E5E7EB', background: 'white' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
            © 2026 Crop Defenders Ltd · We Protect. You Grow. · LMS v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}