'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ManagerPage() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/my-team').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 My Team</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Employee','Enrolled','Completed','In Progress','Points'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {stats.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#2D6A4F' }}>{s.name.charAt(0)}</div>
                    <div><p className="font-medium text-gray-800">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3">{s.totalEnrollments}</td>
                <td className="px-5 py-3 text-green-600">{s.completed}</td>
                <td className="px-5 py-3 text-blue-600">{s.inProgress}</td>
                <td className="px-5 py-3 font-bold" style={{ color: '#F4A261' }}>{s.points}</td>
              </tr>
            ))}
            {stats.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No team members</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}