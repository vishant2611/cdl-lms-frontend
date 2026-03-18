'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/company').then(r => setStats(r.data)).catch(() => {});
    api.get('/analytics/departments').then(r => setDeptStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Employees', value: stats.totalUsers },
            { label: 'Total Courses', value: stats.totalCourses },
            { label: 'Total Enrollments', value: stats.totalEnrollments },
            { label: 'Certificates', value: stats.totalCertificates },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Overall Completion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-4">
              <div className="h-4 rounded-full" style={{ width: stats.completionRate + '%', background: '#2D6A4F' }}></div>
            </div>
            <span className="font-bold text-lg" style={{ color: '#2D6A4F' }}>{stats.completionRate}%</span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b"><h2 className="font-semibold text-gray-800">Department Performance</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Department','Employees','Enrollments','Completed','Rate'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {deptStats.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{d.name}</td>
                <td className="px-5 py-3">{d.totalUsers}</td>
                <td className="px-5 py-3">{d.totalEnrollments}</td>
                <td className="px-5 py-3 text-green-600">{d.completedEnrollments}</td>
                <td className="px-5 py-3 font-medium" style={{ color: '#2D6A4F' }}>{d.completionRate}%</td>
              </tr>
            ))}
            {deptStats.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}