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