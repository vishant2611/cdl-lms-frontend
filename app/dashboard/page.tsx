'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).catch(() => {});
    api.get('/compliance/my').then(r => setCompliance(r.data)).catch(() => {});
    if (user) api.get('/gamification/points/' + user.id).then(r => setPoints(r.data?.points || 0)).catch(() => {});
  }, [user]);

  const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
  const overdue = compliance.filter(c => c.status === 'OVERDUE').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here is your learning summary</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Enrolled', value: enrollments.length, color: '#2D6A4F' },
          { label: 'Completed', value: completed, color: '#40916C' },
          { label: 'My Points', value: points, color: '#F4A261' },
          { label: 'Overdue', value: overdue, color: overdue > 0 ? '#e53e3e' : '#40916C' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Continue Learning</h2>
          <Link href="/dashboard/courses" className="text-sm font-medium" style={{ color: '#2D6A4F' }}>View all</Link>
        </div>
        {enrollments.filter(e => e.status === 'IN_PROGRESS').length === 0 ? (
          <p className="text-gray-400 text-sm">No courses in progress. <Link href="/dashboard/courses" style={{ color: '#2D6A4F' }}>Browse courses</Link></p>
        ) : (
          <div className="space-y-3">
            {enrollments.filter(e => e.status === 'IN_PROGRESS').slice(0, 3).map((e: any) => (
              <div key={e.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{e.course.title}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: e.progressPct + '%', background: '#2D6A4F' }}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{e.progressPct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium">You have {overdue} overdue mandatory training(s)</p>
          <Link href="/dashboard/compliance" className="text-red-600 text-sm underline mt-1 inline-block">View compliance</Link>
        </div>
      )}
    </div>
  );
}