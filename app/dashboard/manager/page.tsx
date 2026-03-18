'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';

export default function ManagerPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/my-team'),
      api.get('/courses?published=true'),
    ]).then(([s, c]) => {
      setStats(s.data);
      setCourses(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const assignToTeam = async () => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await api.post('/enrollments/assign/team', { courseId: selectedCourse });
      alert('Course assigned to entire team!');
      setSelectedCourse('');
    } finally { setAssigning(false); }
  };

  const total = stats.length;
  const totalEnrolled = stats.reduce((s, u) => s + u.totalEnrollments, 0);
  const totalCompleted = stats.reduce((s, u) => s + u.completed, 0);
  const avgRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>👥 My Team</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Track and support your team learning · Click any employee to view details</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Team Size', value: total, icon: '👥', color: '#6C9604' },
          { label: 'Total Enrolled', value: totalEnrolled, icon: '📚', color: '#3B82F6' },
          { label: 'Completions', value: totalCompleted, icon: '✅', color: '#10B981' },
          { label: 'Avg Completion', value: avgRate + '%', icon: '📊', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#10312B', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Assign to whole team */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>📢 Assign Course to Entire Team</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">— Select course to assign to all team members —</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
          <button onClick={assignToTeam} disabled={!selectedCourse || assigning}
            style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
            {assigning ? 'Assigning...' : 'Assign to All →'}
          </button>
        </div>
      </div>

      {/* Team Table - clickable rows */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Team Members — Click to view details</h3>
        </div>
        {stats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
            <p>No team members assigned yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Employee','Enrolled','Completed','In Progress','Points','Completion','Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s: any) => {
                const rate = s.totalEnrollments > 0 ? Math.round((s.completed / s.totalEnrollments) * 100) : 0;
                const rateColor = rate >= 70 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFDF5'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'white'}>
                    <td style={{ padding: '14px 16px' }}>
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
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#10312B' }}>{s.totalEnrollments}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#10B981', fontWeight: '700' }}>{s.completed}</span></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#3B82F6', fontWeight: '700' }}>{s.inProgress}</span></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#F59E0B', fontWeight: '800' }}>⭐ {s.points}</span></td>
                    <td style={{ padding: '14px 16px', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: rateColor, width: rate + '%' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: rateColor, minWidth: '32px' }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={'/dashboard/manager/team/' + s.id}
                        style={{ padding: '6px 14px', borderRadius: '8px', background: '#F4F7E8', color: '#6C9604', border: '1px solid #AEBF66', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
                        View →
                      </Link>
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