'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

const STATUS_CFG: any = {
  COMPLETED: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: '✅', label: 'Completed' },
  OVERDUE: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: '🔴', label: 'Overdue' },
  PENDING: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '⏳', label: 'Pending' },
};

export default function CompliancePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/compliance/my').then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const completed = items.filter(i => i.status === 'COMPLETED').length;
  const overdue = items.filter(i => i.status === 'OVERDUE').length;
  const pending = items.filter(i => i.status === 'PENDING').length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🛡️ Compliance Training</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Mandatory training requirements for your role</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Completed', value: completed, ...STATUS_CFG.COMPLETED },
          { label: 'Pending', value: pending, ...STATUS_CFG.PENDING },
          { label: 'Overdue', value: overdue, ...STATUS_CFG.OVERDUE },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '18px', border: '1px solid ' + s.border, display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: s.color, fontWeight: '600', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>All clear!</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>No mandatory training assigned to you</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          {items.map((item: any, i: number) => {
            const cfg = STATUS_CFG[item.status] || STATUS_CFG.PENDING;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: i < items.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFDF5'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'white'}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, border: '1px solid ' + cfg.border }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '3px' }}>{item.course?.title}</p>
                  {item.deadline && <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>📅 Deadline: {new Date(item.deadline).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  {item.completedAt && <p style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', marginTop: '2px' }}>✅ Completed: {new Date(item.completedAt).toLocaleDateString()}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.border, padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{cfg.label}</span>
                  {item.status !== 'COMPLETED' && (
                    <a href="/dashboard/courses" style={{ fontSize: '12px', color: '#6C9604', fontWeight: '700', background: '#F4F7E8', padding: '5px 12px', borderRadius: '8px', display: 'inline-block' }}>Start Now →</a>
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