'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>📢 Announcements</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Company-wide communications from CDL leadership</p>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📢</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No announcements yet</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Check back later for updates from the CDL team</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((a: any, i: number) => (
            <div key={a.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ width: '5px', background: i === 0 ? '#6C9604' : '#AEBF66', flexShrink: 0 }} />
                <div style={{ padding: '20px 24px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>{a.title}</h3>
                    {i === 0 && <span style={{ background: '#F4F7E8', color: '#6C9604', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid #AEBF66', flexShrink: 0, marginLeft: '12px' }}>Latest</span>}
                  </div>
                  <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.7', marginBottom: '14px' }}>{a.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>{a.createdBy?.name?.charAt(0)}</span>
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>{a.createdBy?.name}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>·</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>📅 {new Date(a.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {a.department && <span style={{ background: '#F4F7E8', color: '#6C9604', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>🏢 {a.department.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}