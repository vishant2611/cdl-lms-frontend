'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import Link from 'next/link';

export default function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [allCourses, setAllCourses] = useState<any[]>([]);

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

  const enrolledCourseIds = user.enrollments?.map((e: any) => e.courseId) || [];
  const unenrolledCourses = allCourses.filter((c: any) => !enrolledCourseIds.includes(c.id));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/admin/users" style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'inline-block' }}>← Back to Users</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '24px' }}>{user.name.charAt(0)}</span>
            </div>
            <p style={{ color: 'white', fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{user.name}</p>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{user.role}</span>
          </div>
          <div style={{ padding: '20px' }}>
            {[
              { label: 'Email', value: user.email },
              { label: 'Department', value: user.department?.name || '—' },
              { label: 'Manager', value: user.manager?.name || '—' },
              { label: 'Points', value: user.userPoints?.points || 0 },
              { label: 'Badges', value: user.userBadges?.length || 0 },
              { label: 'Courses', value: user.enrollments?.length || 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10312B' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Assign Course */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>➕ Assign Course</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                <option value="">— Select a course to assign —</option>
                {unenrolledCourses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
              </select>
              <button onClick={handleAssign} disabled={!selectedCourse || assigning}
                style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
                {assigning ? 'Assigning...' : 'Assign →'}
              </button>
            </div>
          </div>

          {/* Learning Progress */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>📚 Learning Progress ({user.enrollments?.length || 0} courses)</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['COMPLETED','IN_PROGRESS','NOT_STARTED'].map(s => {
                  const count = user.enrollments?.filter((e: any) => e.status === s).length || 0;
                  const cfg = STATUS_CFG[s];
                  return <span key={s} style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{count} {s.replace('_',' ')}</span>;
                })}
              </div>
            </div>
            {user.enrollments?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📚</p>
                <p>No courses assigned yet</p>
              </div>
            ) : (
              <div>
                {user.enrollments?.map((e: any) => {
                  const cfg = STATUS_CFG[e.status] || STATUS_CFG.NOT_STARTED;
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {e.course?.type === 'VIDEO' ? '🎬' : e.course?.type === 'SCORM' ? '🎮' : e.course?.type === 'PPT' ? '📊' : '📄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>{e.course?.title}</p>
                        <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: e.status === 'COMPLETED' ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: e.progressPct + '%', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{cfg.label}</span>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{e.progressPct}% done</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}