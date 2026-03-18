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