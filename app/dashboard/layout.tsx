'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/courses', label: 'Courses', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/learning-paths', label: 'Learning Paths', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/compliance', label: 'Compliance', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/certificates', label: 'Certificates', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/announcements', label: 'Announcements', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/instructor', label: 'Instructor Panel', roles: ['INSTRUCTOR','ADMIN'] },
  { href: '/dashboard/manager', label: 'My Team', roles: ['MANAGER','ADMIN'] },
  { href: '/dashboard/admin', label: 'Admin', roles: ['ADMIN'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2D6A4F' }}></div>
    </div>
  );

  const filtered = navItems.filter(n => n.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside style={{ width: open ? 240 : 60, background: '#1B4332', minHeight: '100vh', transition: 'width 0.3s' }} className="flex flex-col text-white">
        <div className="flex items-center gap-3 p-4 border-b border-green-800">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F4A261' }}>
            <span className="text-white font-bold text-sm">CDL</span>
          </div>
          {open && <span className="font-bold text-lg">CDL LMS</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {filtered.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm"
              style={{ background: pathname === item.href ? '#2D6A4F' : 'transparent' }}>
              {open ? item.label : item.label.charAt(0)}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-green-800">
          {open && <div className="px-3 py-2 mb-2"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-green-300">{user.role}</p></div>}
          <button onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-red-300 hover:bg-red-900 transition-all text-sm">
            {open ? 'Logout' : 'X'}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-800 text-lg">☰</button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#2D6A4F' }}>
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}