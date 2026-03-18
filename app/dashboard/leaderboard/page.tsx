'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/gamification/leaderboard').then(r => setLeaders(r.data)).catch(() => {});
    api.get('/gamification/badges').then(r => setBadges(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🏆 Leaderboard</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Top performers at Crop Defenders Ltd</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #10312B, #6C9604)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>Top Learners</h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}>{leaders.length} participants</span>
          </div>

          {/* Top 3 */}
          {leaders.length >= 3 && (
            <div style={{ padding: '28px 24px 20px', background: '#FAFDF5', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '24px' }}>
              {[1, 0, 2].map(idx => {
                const l = leaders[idx];
                const podium = [{ medal: '🥇', h: 100, color: '#F59E0B' }, { medal: '🥈', h: 80, color: '#94A3B8' }, { medal: '🥉', h: 65, color: '#CD7C2F' }];
                const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                const p = podium[rank];
                return (
                  <div key={l?.userId} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '22px', marginBottom: '6px' }}>{p.medal}</span>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', border: '3px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                      <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{l?.user?.name?.charAt(0)}</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '3px' }}>{l?.user?.name?.split(' ')[0]}</p>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: p.color }}>{l?.points}</p>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '8px' }}>pts</p>
                    <div style={{ width: '56px', height: p.h + 'px', background: p.color, borderRadius: '6px 6px 0 0', opacity: 0.2 }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          {leaders.map((l, i) => (
            <div key={l.userId} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F3F4F6', background: l.user?.id === user?.id ? '#F4F7E8' : 'white', transition: 'background 0.15s' }}>
              <div style={{ width: '32px', textAlign: 'center' }}>
                {i < 3 ? <span style={{ fontSize: '18px' }}>{['🥇','🥈','🥉'][i]}</span> : <span style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF' }}>#{i + 1}</span>}
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: i < 3 ? ['#F59E0B','#94A3B8','#CD7C2F'][i] : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: i < 3 ? 'white' : '#6B7280', fontWeight: '800', fontSize: '14px' }}>{l.user?.name?.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B' }}>{l.user?.name} {l.user?.id === user?.id ? <span style={{ color: '#6C9604', fontSize: '11px' }}>(You)</span> : ''}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>{l.user?.department?.name || 'Crop Defenders Ltd'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#6C9604' }}>{l.points}</p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>points</p>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
              <p style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>No data yet</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Complete courses to earn points!</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div>
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>🏅 Badges</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Earn by collecting points</p>
            </div>
            <div style={{ padding: '14px' }}>
              {badges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏅</p>
                  <p style={{ fontSize: '13px' }}>No badges configured yet</p>
                </div>
              ) : badges.map((b: any) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '8px', background: '#FAFDF5', transition: 'all 0.15s' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{b.icon}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#10312B' }}>{b.name}</p>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{b.description}</p>
                    <p style={{ fontSize: '11px', color: '#6C9604', fontWeight: '700', marginTop: '4px' }}>⭐ {b.pointsRequired} points required</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}