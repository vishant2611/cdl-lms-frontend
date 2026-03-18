'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([api.get('/courses?published=true'), api.get('/enrollments/my')])
      .then(([c, e]) => { setCourses(c.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const getEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId);
  const handleEnroll = async (courseId: string) => {
    await api.post('/enrollments/enroll', { courseId });
    const { data } = await api.get('/enrollments/my');
    setEnrollments(data);
  };

  const typeColors: any = { SCORM: '#2D6A4F', PDF: '#E53E3E', VIDEO: '#DD6B20', PPT: '#6B46C1' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#2D6A4F' }}></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Course Catalogue</h1>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No courses available yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => {
            const enrollment = getEnrollment(course.id);
            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 flex items-center justify-center" style={{ background: (typeColors[course.type] || '#2D6A4F') + '15' }}>
                  <span className="text-4xl">📚</span>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: (typeColors[course.type] || '#2D6A4F') + '20', color: typeColors[course.type] || '#2D6A4F' }}>{course.type}</span>
                  <h3 className="font-semibold text-gray-800 mt-2 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{course.description}</p>
                  {enrollment ? (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{enrollment.status.replace('_', ' ')}</span>
                        <span>{enrollment.progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <div className="h-1.5 rounded-full" style={{ width: enrollment.progressPct + '%', background: '#2D6A4F' }}></div>
                      </div>
                      <button onClick={() => router.push('/dashboard/courses/' + course.id)}
                        className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>
                        {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEnroll(course.id)}
                      className="w-full py-2 rounded-lg text-sm font-medium border-2"
                      style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
                      Enrol Now
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