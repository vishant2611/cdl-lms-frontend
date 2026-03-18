const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

'app/globals.css': `@import "tailwindcss";
:root {
  --cdl-green: #2D6A4F;
  --cdl-green-light: #40916C;
  --cdl-green-dark: #1B4332;
  --cdl-gold: #F4A261;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; background: #F8FAF9; color: #1a1a1a; }`,

'app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CDL LMS — Crop Defenders Ltd',
  description: 'Employee Learning Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`,

'app/providers.tsx': `'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}`,

'app/page.tsx': `import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/login');
}`,

'app/login/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#2D6A4F' }}>
            <span className="text-white text-2xl font-bold">CDL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crop Defenders Ltd</h1>
          <p className="text-gray-500 mt-1">Learning Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              placeholder="your@cropdefenders.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-lg transition-all"
            style={{ background: loading ? '#ccc' : '#2D6A4F' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">CDL Employee Portal v1.0</p>
      </div>
    </div>
  );
}`,

'app/dashboard/layout.tsx': `'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
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
}`,

'app/dashboard/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).catch(() => {});
    api.get('/compliance/my').then(r => setCompliance(r.data)).catch(() => {});
    if (user) api.get('/gamification/points/' + user.id).then(r => setPoints(r.data?.points || 0)).catch(() => {});
  }, [user]);

  const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
  const overdue = compliance.filter(c => c.status === 'OVERDUE').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here is your learning summary</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Enrolled', value: enrollments.length, color: '#2D6A4F' },
          { label: 'Completed', value: completed, color: '#40916C' },
          { label: 'My Points', value: points, color: '#F4A261' },
          { label: 'Overdue', value: overdue, color: overdue > 0 ? '#e53e3e' : '#40916C' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Continue Learning</h2>
          <Link href="/dashboard/courses" className="text-sm font-medium" style={{ color: '#2D6A4F' }}>View all</Link>
        </div>
        {enrollments.filter(e => e.status === 'IN_PROGRESS').length === 0 ? (
          <p className="text-gray-400 text-sm">No courses in progress. <Link href="/dashboard/courses" style={{ color: '#2D6A4F' }}>Browse courses</Link></p>
        ) : (
          <div className="space-y-3">
            {enrollments.filter(e => e.status === 'IN_PROGRESS').slice(0, 3).map((e: any) => (
              <div key={e.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{e.course.title}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: e.progressPct + '%', background: '#2D6A4F' }}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{e.progressPct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium">You have {overdue} overdue mandatory training(s)</p>
          <Link href="/dashboard/compliance" className="text-red-600 text-sm underline mt-1 inline-block">View compliance</Link>
        </div>
      )}
    </div>
  );
}`,

'app/dashboard/courses/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([api.get('/courses?published=true'), api.get('/enrollments/my')])
      .then(([c, e]) => { setCourses(c.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const getEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId);
  const handleEnroll = async (courseId: string) => {
    await api.post('/enrollments/enroll', { courseId });
    const { data } = await api.get('/enrollments/my');
    setEnrollments(data);
  };

  const typeColors: any = { SCORM: '#2D6A4F', PDF: '#E53E3E', VIDEO: '#DD6B20', PPT: '#6B46C1' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#2D6A4F' }}></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Course Catalogue</h1>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No courses available yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => {
            const enrollment = getEnrollment(course.id);
            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 flex items-center justify-center" style={{ background: (typeColors[course.type] || '#2D6A4F') + '15' }}>
                  <span className="text-4xl">📚</span>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: (typeColors[course.type] || '#2D6A4F') + '20', color: typeColors[course.type] || '#2D6A4F' }}>{course.type}</span>
                  <h3 className="font-semibold text-gray-800 mt-2 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{course.description}</p>
                  {enrollment ? (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{enrollment.status.replace('_', ' ')}</span>
                        <span>{enrollment.progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <div className="h-1.5 rounded-full" style={{ width: enrollment.progressPct + '%', background: '#2D6A4F' }}></div>
                      </div>
                      <button onClick={() => router.push('/dashboard/courses/' + course.id)}
                        className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>
                        {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEnroll(course.id)}
                      className="w-full py-2 rounded-lg text-sm font-medium border-2"
                      style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
                      Enrol Now
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
}`,

'app/dashboard/leaderboard/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/gamification/leaderboard').then(r => setLeaders(r.data)).catch(() => {});
    api.get('/gamification/badges').then(r => setBadges(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
            <h2 className="text-white font-semibold">Top Learners</h2>
          </div>
          <div className="divide-y">
            {leaders.map((l, i) => (
              <div key={l.userId} className="flex items-center gap-4 px-5 py-3" style={{ background: l.user?.id === user?.id ? '#2D6A4F10' : '' }}>
                <span className="text-xl w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#2D6A4F' }}>{l.user?.name?.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{l.user?.name}</p>
                  <p className="text-xs text-gray-400">{l.user?.department?.name || 'CDL'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#F4A261' }}>{l.points}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
            {leaders.length === 0 && <p className="text-center text-gray-400 py-8">No data yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">🏅 Badges</h2>
          <div className="space-y-3">
            {badges.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.pointsRequired} points</p>
                </div>
              </div>
            ))}
            {badges.length === 0 && <p className="text-gray-400 text-sm">No badges yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}`,

'app/dashboard/compliance/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function CompliancePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/compliance/my').then(r => setItems(r.data)).catch(() => {});
  }, []);

  const colors: any = { COMPLETED: '#38A169', OVERDUE: '#E53E3E', PENDING: '#DD6B20' };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛡️ Compliance Training</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No mandatory training assigned</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.course?.title}</p>
                {item.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: colors[item.status] || '#888' }}>{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

'app/dashboard/certificates/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🎓 My Certificates</h1>
      {certs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No certificates yet. Complete a course to earn one!</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
                <span className="text-5xl">🎓</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800">{c.course?.title}</p>
                <p className="text-xs text-gray-400 mt-1">Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

'app/dashboard/announcements/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📢 Announcements</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No announcements yet</p></div>
      ) : (
        <div className="space-y-4">
          {items.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{a.body}</p>
              <p className="text-xs text-gray-400 mt-2">By {a.createdBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

'app/dashboard/learning-paths/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);

  useEffect(() => {
    api.get('/learning-paths').then(r => setPaths(r.data)).catch(() => {});
    api.get('/learning-paths/my').then(r => setMyPaths(r.data)).catch(() => {});
  }, []);

  const enroll = async (id: string) => {
    await api.post('/learning-paths/' + id + '/enroll', {});
    const r = await api.get('/learning-paths/my');
    setMyPaths(r.data);
  };

  const isEnrolled = (id: string) => myPaths.some((p: any) => p.learningPathId === id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Learning Paths</h1>
      {paths.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No learning paths available yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paths.map((path: any) => (
            <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-2">{path.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{path.pathCourses?.length} courses</p>
              {isEnrolled(path.id) ? (
                <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#40916C' }}>Enrolled ✓</button>
              ) : (
                <button onClick={() => enroll(path.id)} className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#2D6A4F' }}>Start Path</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

'app/dashboard/instructor/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function InstructorPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/courses', { ...form, duration: form.duration ? parseInt(form.duration) : undefined });
    const r = await api.get('/courses');
    setCourses(r.data);
    setShowForm(false);
    setForm({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
  };

  const handlePublish = async (id: string) => {
    await api.patch('/courses/' + id + '/publish', {});
    const r = await api.get('/courses');
    setCourses(r.data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Instructor Panel</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>+ New Course</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Course Title" required className="px-4 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-2 border rounded-lg text-sm">
              {['PDF','VIDEO','SCORM','PPT'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} placeholder="File URL" required className="px-4 py-2 border rounded-lg text-sm" />
            <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="Duration (minutes)" type="number" className="px-4 py-2 border rounded-lg text-sm" />
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-4 py-2 border rounded-lg text-sm md:col-span-2" rows={3} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg text-sm border border-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Title','Type','Status','Enrollments','Action'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{c.title}</td>
                <td className="px-5 py-3">{c.type}</td>
                <td className="px-5 py-3">{c.isPublished ? '✅ Published' : '📝 Draft'}</td>
                <td className="px-5 py-3">{c._count?.enrollments || 0}</td>
                <td className="px-5 py-3">{!c.isPublished && <button onClick={() => handlePublish(c.id)} className="text-xs px-3 py-1 rounded text-white" style={{ background: '#2D6A4F' }}>Publish</button>}</td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No courses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,

'app/dashboard/manager/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function ManagerPage() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/my-team').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 My Team</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Employee','Enrolled','Completed','In Progress','Points'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {stats.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#2D6A4F' }}>{s.name.charAt(0)}</div>
                    <div><p className="font-medium text-gray-800">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3">{s.totalEnrollments}</td>
                <td className="px-5 py-3 text-green-600">{s.completed}</td>
                <td className="px-5 py-3 text-blue-600">{s.inProgress}</td>
                <td className="px-5 py-3 font-bold" style={{ color: '#F4A261' }}>{s.points}</td>
              </tr>
            ))}
            {stats.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No team members</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,

'app/dashboard/admin/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/company').then(r => setStats(r.data)).catch(() => {});
    api.get('/analytics/departments').then(r => setDeptStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Employees', value: stats.totalUsers },
            { label: 'Total Courses', value: stats.totalCourses },
            { label: 'Total Enrollments', value: stats.totalEnrollments },
            { label: 'Certificates', value: stats.totalCertificates },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Overall Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-4">
              <div className="h-4 rounded-full" style={{ width: stats.completionRate + '%', background: '#2D6A4F' }}></div>
            </div>
            <span className="font-bold text-lg" style={{ color: '#2D6A4F' }}>{stats.completionRate}%</span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h2 className="font-semibold text-gray-800">Department Performance</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Department','Employees','Enrollments','Completed','Rate'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {deptStats.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{d.name}</td>
                <td className="px-5 py-3">{d.totalUsers}</td>
                <td className="px-5 py-3">{d.totalEnrollments}</td>
                <td className="px-5 py-3 text-green-600">{d.completedEnrollments}</td>
                <td className="px-5 py-3 font-medium" style={{ color: '#2D6A4F' }}>{d.completionRate}%</td>
              </tr>
            ))}
            {deptStats.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,

'lib/api.ts': `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cdl_token');
    if (token) config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cdl_token');
      localStorage.removeItem('cdl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;`,

'store/authStore.ts': `import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'INSTRUCTOR' | 'MANAGER' | 'ADMIN';
  departmentId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('cdl_token', token);
    localStorage.setItem('cdl_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('cdl_token');
    localStorage.removeItem('cdl_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cdl_token');
      const userStr = localStorage.getItem('cdl_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem('cdl_token');
          localStorage.removeItem('cdl_user');
        }
      }
    }
  },
}));`,

};

let created = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(base, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
  console.log('Created: ' + filePath);
  created++;
}
console.log('\nDone! Created ' + created + ' files.');