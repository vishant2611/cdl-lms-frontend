'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🎓 My Certificates</h1>
      {certs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No certificates yet. Complete a course to earn one!</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
                <span className="text-5xl">🎓</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800">{c.course?.title}</p>
                <p className="text-xs text-gray-400 mt-1">Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}