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