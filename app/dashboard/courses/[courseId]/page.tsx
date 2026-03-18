'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import Link from 'next/link';

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/courses/' + courseId),
      api.get('/enrollments/my'),
    ]).then(([c, e]) => {
      setCourse(c.data);
      const enroll = e.data.find((en: any) => en.courseId === courseId);
      setEnrollment(enroll);
      setProgress(enroll?.progressPct || 0);
    }).finally(() => setLoading(false));
  }, [courseId]);

  const updateProgress = async (pct: number) => {
    setSaving(true);
    try {
      await api.patch('/enrollments/progress', { courseId, progressPct: pct });
      setProgress(pct);
      if (pct >= 100) {
        await api.post('/certificates/issue', { userId: user?.id, courseId });
      }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  if (!course) return (
    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>❌</p>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#10312B' }}>Course not found</p>
      <Link href="/dashboard/courses" style={{ color: '#6C9604', fontWeight: '700', marginTop: '12px', display: 'inline-block' }}>Back to Courses</Link>
    </div>
  );

  const TYPE_CFG: any = {
    SCORM: { color: '#10B981', bg: '#ECFDF5', icon: '🎮', label: 'Interactive SCORM' },
    PDF: { color: '#EF4444', bg: '#FEF2F2', icon: '📄', label: 'PDF Document' },
    VIDEO: { color: '#F59E0B', bg: '#FFFBEB', icon: '🎬', label: 'Video Course' },
    PPT: { color: '#8B5CF6', bg: '#F5F3FF', icon: '📊', label: 'Presentation' },
  };
  const cfg = TYPE_CFG[course.type] || TYPE_CFG.PDF;
  const completed = enrollment?.status === 'COMPLETED';

  const renderContent = () => {
    if (course.type === 'SCORM') {
      return (
        <div>
          <div style={{ background: '#0a0e1a', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>🎮 SCORM Interactive Course</span>
            <a href={'/scorm-player/' + courseId} target="_blank" rel="noopener noreferrer"
              style={{ color: '#6C9604', fontSize: '12px', fontWeight: '700', background: '#F4F7E8', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none' }}>
              Open Full Screen ↗
            </a>
          </div>
          <div style={{ padding: '48px 40px', textAlign: 'center', background: '#0a0e1a', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '56px', marginBottom: '20px' }}>🎮</p>
            <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>SCORM Interactive Course</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '28px', maxWidth: '420px', lineHeight: '1.8' }}>
              This interactive SCORM course opens in a dedicated player window for the best learning experience with full progress tracking.
            </p>
            <a href={'/scorm-player/' + courseId} target="_blank" rel="noopener noreferrer"
              style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', display: 'inline-block', textDecoration: 'none', marginBottom: '12px' }}>
              🚀 Launch Course
            </a>
            <p style={{ color: '#64748B', fontSize: '12px' }}>Opens in a new tab</p>
          </div>
        </div>
      );
    }

    if (course.type === 'VIDEO') {
      return (
        <video controls style={{ width: '100%', maxHeight: '500px', background: '#000', display: 'block' }}>
          <source src={course.fileUrl} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (course.type === 'PDF') {
      return (
        <div>
          <iframe src={course.fileUrl} style={{ width: '100%', height: '600px', border: 'none', display: 'block' }} title={course.title} />
          <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Can't view the PDF?</span>
            <a href={course.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6C9604', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>Open directly ↗</a>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>{cfg.icon}</p>
        <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '8px' }}>{course.title}</p>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>This content type opens in a new window</p>
        <a href={course.fileUrl} target="_blank" rel="noopener noreferrer"
          style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', display: 'inline-block', textDecoration: 'none' }}>
          Open Course Content ↗
        </a>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard/courses"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', fontWeight: '600', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', textDecoration: 'none' }}>
          ← Back to Courses
        </Link>
        <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '11px' }}>{cfg.icon} {cfg.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', padding: '20px 24px' }}>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>{course.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>{course.description}</p>
            {course.duration && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '6px' }}>⏱️ {course.duration} minutes</p>}
          </div>
          {renderContent()}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Progress */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#10312B', marginBottom: '16px' }}>Your Progress</h3>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '6px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', background: completed ? '#ECFDF5' : 'white', borderColor: completed ? '#10B981' : progress > 0 ? '#6C9604' : '#E5E7EB' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: completed ? '#10B981' : '#6C9604' }}>{progress}%</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: completed ? '#10B981' : '#6B7280' }}>
                {completed ? '✅ Completed!' : progress > 0 ? 'In Progress' : 'Not Started'}
              </p>
            </div>
            <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: completed ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: progress + '%', transition: 'width 0.5s ease' }} />
            </div>
            {!completed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Update Progress</p>
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => updateProgress(pct)} disabled={saving || progress >= pct}
                    style={{ padding: '9px', borderRadius: '8px', border: '1.5px solid', fontSize: '13px', fontWeight: '700', cursor: progress >= pct ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s',
                      borderColor: progress >= pct ? '#E5E7EB' : pct === 100 ? '#6C9604' : '#E5E7EB',
                      background: progress >= pct ? '#F9FAFB' : pct === 100 ? 'linear-gradient(135deg, #10312B, #6C9604)' : 'white',
                      color: progress >= pct ? '#9CA3AF' : pct === 100 ? 'white' : '#10312B',
                    }}>
                    {pct === 100 ? '🎉 Mark Complete (100%)' : pct + '% Complete'}
                  </button>
                ))}
              </div>
            )}
            {completed && (
              <div style={{ background: '#ECFDF5', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #A7F3D0' }}>
                <p style={{ fontSize: '24px', marginBottom: '6px' }}>🎓</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>Certificate Earned!</p>
                <Link href="/dashboard/certificates" style={{ fontSize: '12px', color: '#6C9604', fontWeight: '700', marginTop: '6px', display: 'inline-block', textDecoration: 'none' }}>View Certificate →</Link>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>Course Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Type', value: course.type, icon: cfg.icon },
                { label: 'Duration', value: course.duration ? course.duration + ' min' : 'Self-paced', icon: '⏱️' },
                { label: 'Instructor', value: course.createdBy?.name || 'CDL Team', icon: '👨‍🏫' },
                { label: 'Enrollments', value: course._count?.enrollments || 0, icon: '👥' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}><span>{item.icon}</span>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10312B' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz */}
          {course.quiz && (
            <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', borderRadius: '14px', padding: '20px', color: 'white' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#AEBF66', marginBottom: '8px' }}>Assessment</p>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{course.quiz.questions?.length || 0} Questions</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>Pass mark: {course.quiz.passMark}%</p>
              <Link href={'/dashboard/courses/' + courseId + '/quiz'}
                style={{ display: 'block', background: '#AEBF66', color: '#10312B', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: '800', textDecoration: 'none' }}>
                Take Quiz →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}