'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    api.get('/learning-paths').then(r => setPaths(r.data)).catch(() => {});
    api.get('/learning-paths/my').then(r => setMyPaths(r.data)).catch(() => {});
  }, []);

  const enroll = async (id: string) => {
    setEnrolling(id);
    await api.post('/learning-paths/' + id + '/enroll', {});
    const r = await api.get('/learning-paths/my');
    setMyPaths(r.data);
    setEnrolling(null);
  };

  const isEnrolled = (id: string) => myPaths.some((p: any) => p.learningPathId === id);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🗺️ Learning Paths</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Structured learning journeys for your development</p>
      </div>

      {paths.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No learning paths yet</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Your instructors will create structured paths for you</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {paths.map((path: any) => {
            const enrolled = isEnrolled(path.id);
            return (
              <div key={path.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 28px rgba(16,49,43,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
                <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🗺️</div>
                  <div>
                    <p style={{ color: 'white', fontSize: '15px', fontWeight: '800', marginBottom: '3px' }}>{path.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{path.pathCourses?.length} courses in this path</p>
                  </div>
                </div>

                <div style={{ padding: '18px 22px' }}>
                  {path.description && <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.6' }}>{path.description}</p>}

                  {/* Course List */}
                  <div style={{ marginBottom: '16px' }}>
                    {path.pathCourses?.slice(0, 4).map((pc: any, idx: number) => (
                      <div key={pc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: idx < Math.min(3, path.pathCourses.length - 1) ? '1px solid #F3F4F6' : 'none' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: '800' }}>{idx + 1}</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.course?.title}</span>
                      </div>
                    ))}
                    {path.pathCourses?.length > 4 && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px', fontWeight: '600' }}>+ {path.pathCourses.length - 4} more courses</p>
                    )}
                  </div>

                  {enrolled ? (
                    <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '11px', textAlign: 'center', border: '1px solid #AEBF66' }}>
                      <p style={{ color: '#6C9604', fontWeight: '800', fontSize: '14px' }}>✅ Enrolled in this path</p>
                    </div>
                  ) : (
                    <button onClick={() => enroll(path.id)} disabled={enrolling === path.id}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', background: enrolling === path.id ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: enrolling === path.id ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '13px', border: 'none', cursor: enrolling === path.id ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                      {enrolling === path.id ? '⏳ Enrolling...' : '🚀 Start Learning Path'}
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