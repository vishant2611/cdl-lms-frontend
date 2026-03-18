'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import Link from 'next/link';

export default function ManagerUserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/users/' + userId),
      api.get('/courses?published=true'),
    ]).then(([u, c]) => {
      setUser(u.data);
      setAllCourses(c.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleAssign = async () => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await api.post('/enrollments/assign/user', { userId, courseId: selectedCourse });
      const { data } = await api.get('/users/' + userId);
      setUser(data);
      setSelectedCourse('');
    } finally { setAssigning(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;
  if (!user) return <div>User not found</div>;

  const STATUS_CFG: any = {
    COMPLETED: { color: '#10B981', bg: '#ECFDF5', label: '✅ Completed' },
    IN_PROGRESS: { color: '#3B82F6', bg: '#EFF6FF', label: '▶ In Progress' },
    NOT_STARTED: { color: '#9CA3AF', bg: '#F9FAFB', label: '⭕ Not Started' },
    FAILED: { color: '#EF4444', bg: '#FEF2F2', label: '❌ Failed' },
  };

  const enrolledIds = user.enrollments?.map((e: any) => e.courseId) || [];
  const unenrolled = allCourses.filter((c: any) => !enrolledIds.includes(c.id));
  const completed = user.enrollments?.filter((e: any) => e.status === 'COMPLETED').length || 0;
  const total = user.enrollments?.length || 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/manager" style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'inline-block' }}>← Back to Team</Link>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '22px' }}>{user.name.charAt(0)}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{user.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>{user.email} · {user.department?.name || 'No department'}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total Courses', value: total },
            { label: 'Completed', value: completed },
            { label: 'Completion Rate', value: rate + '%' },
            { label: 'Points', value: user.userPoints?.points || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ color: '#AEBF66', fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px', whiteSpace: 'nowrap' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Course */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>➕ Assign Course to {user.name.split(' ')[0]}</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">— Select a course to assign —</option>
            {unenrolled.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
          <button onClick={handleAssign} disabled={!selectedCourse || assigning}
            style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
            {assigning ? 'Assigning...' : 'Assign →'}
          </button>
        </div>
      </div>

      {/* Learning Progress */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>📚 Learning Progress</h3>
        </div>
        {user.enrollments?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📚</p>
            <p>No courses assigned yet. Use the form above to assign courses.</p>
          </div>
        ) : (
          user.enrollments?.map((e: any) => {
            const cfg = STATUS_CFG[e.status] || STATUS_CFG.NOT_STARTED;
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {e.course?.type === 'VIDEO' ? '🎬' : e.course?.type === 'SCORM' ? '🎮' : e.course?.type === 'PPT' ? '📊' : '📄'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>{e.course?.title}</p>
                  <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: e.status === 'COMPLETED' ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: e.progressPct + '%' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{cfg.label}</span>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{e.progressPct}% · {e.completedAt ? 'Done ' + new Date(e.completedAt).toLocaleDateString() : 'In progress'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}