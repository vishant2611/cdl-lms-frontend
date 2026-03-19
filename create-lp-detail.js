const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const content = `
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

export default function LearningPathDetailPage() {
  const { pathId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [path, setPath] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/learning-paths/' + pathId),
      api.get('/learning-paths/my'),
      api.get('/enrollments/my'),
    ]).then(([p, my, enr]) => {
      setPath(p.data);
      const e = my.data.find((x: any) => x.learningPathId === pathId);
      setEnrollment(e);
      setMyEnrollments(enr.data);
    }).finally(() => setLoading(false));
  }, [pathId]);

  const handleEnroll = async () => {
    await api.post('/learning-paths/' + pathId + '/enroll', {});
    const my = await api.get('/learning-paths/my');
    const e = my.data.find((x: any) => x.learningPathId === pathId);
    setEnrollment(e);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  if (!path) return (
    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px' }}>
      <p style={{ fontSize: '48px' }}>🎯</p>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#10312B', marginTop: '12px' }}>Learning path not found</p>
      <Link href="/dashboard/learning-paths" style={{ color: '#6C9604', fontWeight: '700', marginTop: '12px', display: 'inline-block' }}>Back to Learning Paths</Link>
    </div>
  );

  const courses = path.pathCourses || [];
  const completedCourseIds = myEnrollments.filter((e: any) => e.status === 'COMPLETED').map((e: any) => e.courseId);
  const completedCount = courses.filter((pc: any) => completedCourseIds.includes(pc.courseId)).length;
  const progressPct = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0;

  const TYPE_ICONS: any = { SCORM: '🎮', PDF: '📄', VIDEO: '🎬', PPT: '📊' };
  const TYPE_COLORS: any = { SCORM: '#10B981', PDF: '#EF4444', VIDEO: '#F59E0B', PPT: '#8B5CF6' };

  return (
    <div className="fade-in">
      {/* Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/learning-paths"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', fontWeight: '600', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', textDecoration: 'none' }}>
          ← Back to Learning Paths
        </Link>
      </div>

      {/* Header Card */}
      <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', borderRadius: '16px', padding: '28px', marginBottom: '24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#AEBF66', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Learning Path</p>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{path.title}</h1>
            {path.description && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', lineHeight: '1.7' }}>{path.description}</p>}
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>📚 {courses.length} courses</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>👤 {path._count?.pathEnrollments || 0} enrolled</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>🎯 {progressPct}% complete</span>
            </div>
          </div>
          {!enrollment && (
            <button onClick={handleEnroll}
              style={{ background: 'white', color: '#10312B', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', flexShrink: 0 }}>
              🚀 Start Learning Path
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {enrollment && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Your Progress</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'white' }}>{completedCount}/{courses.length} courses completed</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#AEBF66', borderRadius: '4px', width: progressPct + '%', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Courses List */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#10312B' }}>📋 Course Curriculum</h2>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{completedCount} of {courses.length} completed</span>
        </div>

        {courses.map((pc: any, idx: number) => {
          const course = pc.course;
          const isCompleted = completedCourseIds.includes(pc.courseId);
          const isLocked = !enrollment && idx > 0;
          const prevCompleted = idx === 0 || completedCourseIds.includes(courses[idx - 1]?.courseId);
          const canStart = enrollment && prevCompleted;

          return (
            <div key={pc.id} style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '16px', background: isCompleted ? '#FAFDF5' : 'white', transition: 'background 0.2s' }}>
              {/* Step Number */}
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isCompleted ? '#6C9604' : isLocked ? '#F3F4F6' : '#F4F7E8', border: '2px solid', borderColor: isCompleted ? '#6C9604' : isLocked ? '#E5E7EB' : '#AEBF66' }}>
                {isCompleted ? (
                  <span style={{ color: 'white', fontSize: '18px' }}>✓</span>
                ) : (
                  <span style={{ fontWeight: '800', fontSize: '15px', color: isLocked ? '#9CA3AF' : '#6C9604' }}>{idx + 1}</span>
                )}
              </div>

              {/* Course Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: isLocked ? '#9CA3AF' : '#10312B' }}>{course?.title}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: TYPE_COLORS[course?.type] + '20', color: TYPE_COLORS[course?.type] }}>
                    {TYPE_ICONS[course?.type]} {course?.type}
                  </span>
                  {course?.quiz && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706' }}>Quiz</span>}
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {course?.duration ? course.duration + ' mins' : 'Self-paced'}
                  {isCompleted && ' · ✅ Completed'}
                </p>
              </div>

              {/* Action Button */}
              <div style={{ flexShrink: 0 }}>
                {isCompleted ? (
                  <Link href={'/dashboard/courses/' + pc.courseId}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#F4F7E8', color: '#6C9604', fontWeight: '700', fontSize: '12px', border: '1px solid #AEBF66', textDecoration: 'none', display: 'inline-block' }}>
                    Review ↗
                  </Link>
                ) : canStart ? (
                  <Link href={'/dashboard/courses/' + pc.courseId}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '12px', border: 'none', textDecoration: 'none', display: 'inline-block' }}>
                    {idx === 0 || completedCourseIds.includes(courses[idx-1]?.courseId) ? '▶ Start' : '🔒 Locked'}
                  </Link>
                ) : !enrollment ? (
                  <span style={{ padding: '8px 16px', borderRadius: '8px', background: '#F3F4F6', color: '#9CA3AF', fontWeight: '700', fontSize: '12px', display: 'inline-block' }}>
                    Enroll First
                  </span>
                ) : (
                  <span style={{ padding: '8px 16px', borderRadius: '8px', background: '#F3F4F6', color: '#9CA3AF', fontWeight: '700', fontSize: '12px', display: 'inline-block' }}>
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontWeight: '600' }}>No courses in this learning path yet</p>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {progressPct === 100 && (
        <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '14px', padding: '24px', textAlign: 'center', color: 'white' }}>
          <p style={{ fontSize: '36px', marginBottom: '8px' }}>🏆</p>
          <p style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Learning Path Completed!</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Congratulations! You have completed all courses in this learning path.</p>
        </div>
      )}
    </div>
  );
}
`;

const filePath = path.join(base, 'app', 'dashboard', 'learning-paths', '[pathId]', 'page.tsx');
const dir = path.dirname(filePath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(filePath, content.trim());
console.log('✅ Created: app/dashboard/learning-paths/[pathId]/page.tsx');