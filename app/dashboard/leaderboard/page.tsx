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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
            <h2 className="text-white font-semibold">Top Learners</h2>
          </div>
          <div className="divide-y">
            {leaders.map((l, i) => (
              <div key={l.userId} className="flex items-center gap-4 px-5 py-3" style={{ background: l.user?.id === user?.id ? '#2D6A4F10' : '' }}>
                <span className="text-xl w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#2D6A4F' }}>{l.user?.name?.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{l.user?.name}</p>
                  <p className="text-xs text-gray-400">{l.user?.department?.name || 'CDL'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#F4A261' }}>{l.points}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
            {leaders.length === 0 && <p className="text-center text-gray-400 py-8">No data yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">🏅 Badges</h2>
          <div className="space-y-3">
            {badges.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.pointsRequired} points</p>
                </div>
              </div>
            ))}
            {badges.length === 0 && <p className="text-gray-400 text-sm">No badges yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}