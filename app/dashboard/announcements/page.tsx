'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📢 Announcements</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No announcements yet</p></div>
      ) : (
        <div className="space-y-4">
          {items.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{a.body}</p>
              <p className="text-xs text-gray-400 mt-2">By {a.createdBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}