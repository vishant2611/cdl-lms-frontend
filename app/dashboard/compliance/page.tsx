'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function CompliancePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/compliance/my').then(r => setItems(r.data)).catch(() => {});
  }, []);

  const colors: any = { COMPLETED: '#38A169', OVERDUE: '#E53E3E', PENDING: '#DD6B20' };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛡️ Compliance Training</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No mandatory training assigned</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.course?.title}</p>
                {item.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: colors[item.status] || '#888' }}>{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}