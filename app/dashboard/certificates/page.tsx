'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🎓 My Certificates</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>{certs.length} certificate{certs.length !== 1 ? 's' : ''} earned</p>
      </div>

      {certs.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '52px', marginBottom: '14px' }}>🎓</p>
          <p style={{ fontSize: '18px', fontWeight: '800', color: '#10312B', marginBottom: '6px' }}>No certificates yet</p>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Complete courses and pass quizzes to earn your first certificate</p>
          <a href="/dashboard/courses" style={{ background: '#6C9604', color: 'white', padding: '11px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>Browse Courses →</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
          {certs.map((c: any) => (
            <div key={c.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(16,49,43,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(16,49,43,0.06)'; }}>
              {/* Certificate Visual */}
              <div style={{ background: 'linear-gradient(135deg, #10312B 0%, #1a4a3a 50%, #6C9604 100%)', padding: '28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(174,191,102,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(108,150,4,0.15)' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#AEBF66', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '3px solid rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: '28px' }}>🎓</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Certificate of Completion</p>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '800' }}>{user?.name}</p>
              </div>

              <div style={{ padding: '18px' }}>
                <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '14px', marginBottom: '14px', borderLeft: '4px solid #6C9604' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#6C9604', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Course Completed</p>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#10312B', lineHeight: '1.3' }}>{c.course?.title}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>
                    📅 {new Date(c.issuedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <button style={{ background: '#6C9604', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ⬇ Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}