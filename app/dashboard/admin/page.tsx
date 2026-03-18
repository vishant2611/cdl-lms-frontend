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