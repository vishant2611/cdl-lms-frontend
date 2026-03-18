const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

// ─── ADMIN USERS PAGE ──────────────────────────────────────
'app/dashboard/admin/users/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import Link from 'next/link';

const ROLES = ['EMPLOYEE', 'INSTRUCTOR', 'MANAGER', 'ADMIN'];
const ROLE_COLORS: any = { ADMIN: '#10312B', INSTRUCTOR: '#6C9604', MANAGER: '#AEBF66', EMPLOYEE: '#3B82F6' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/departments'),
    ]).then(([u, d]) => {
      setUsers(u.data);
      setDepartments(d.data);
      setManagers(u.data.filter((x: any) => x.role === 'MANAGER' || x.role === 'ADMIN'));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.patch('/users/' + editUser.id, {
        role: editUser.role,
        departmentId: editUser.departmentId || null,
        managerId: editUser.managerId || null,
      });
      const { data } = await api.get('/users');
      setUsers(data);
      setManagers(data.filter((x: any) => x.role === 'MANAGER' || x.role === 'ADMIN'));
      setEditUser(null);
    } finally { setSaving(false); }
  };

  const filtered = users.filter(u => {
    const s = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const r = filterRole === 'ALL' || u.role === filterRole;
    return s && r;
  });

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>👥 User Management</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Assign roles, departments and managers to employees</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '14px 18px', border: '1px solid #E5E7EB', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..."
          style={{ flex: 1, minWidth: '200px', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', outline: 'none', fontFamily: 'Montserrat, sans-serif' }} />
        {['ALL', ...ROLES].map(r => (
          <button key={r} onClick={() => setFilterRole(r)}
            style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
              borderColor: filterRole === r ? '#6C9604' : '#E5E7EB',
              background: filterRole === r ? '#6C9604' : 'white',
              color: filterRole === r ? 'white' : '#6B7280' }}>
            {r}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Employee','Role','Department','Manager','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ROLE_COLORS[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>{u.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>{u.name}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: ROLE_COLORS[u.role] + '20', color: ROLE_COLORS[u.role], padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6B7280' }}>{u.department?.name || '—'}</td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#6B7280' }}>{u.manager?.name || '—'}</td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditUser({ ...u })}
                      style={{ padding: '6px 14px', borderRadius: '8px', background: '#F4F7E8', color: '#6C9604', border: '1px solid #AEBF66', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                      ✏️ Edit
                    </button>
                    <Link href={'/dashboard/admin/users/' + u.id}
                      style={{ padding: '6px 14px', borderRadius: '8px', background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
                      👁 View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10312B', marginBottom: '20px' }}>Edit User — {editUser.name}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</label>
                <select value={editUser.departmentId || ''} onChange={e => setEditUser({ ...editUser, departmentId: e.target.value || null })}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                  <option value="">— No Department —</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager</label>
                <select value={editUser.managerId || ''} onChange={e => setEditUser({ ...editUser, managerId: e.target.value || null })}
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                  <option value="">— No Manager —</option>
                  {managers.filter((m: any) => m.id !== editUser.id).map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
              <button onClick={() => setEditUser(null)}
                style={{ padding: '12px 20px', borderRadius: '10px', background: 'white', color: '#6B7280', fontWeight: '600', fontSize: '14px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`,

// ─── ADMIN USER DETAIL PAGE ────────────────────────────────
'app/dashboard/admin/users/[userId]/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import Link from 'next/link';

export default function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [allCourses, setAllCourses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/users/' + userId),
      api.get('/courses?published=true'),
    ]).then(([u, c]) => {
      setUser(u.data);
      setAllCourses(c.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleAssign = async () => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await api.post('/enrollments/assign/user', { userId, courseId: selectedCourse });
      const { data } = await api.get('/users/' + userId);
      setUser(data);
      setSelectedCourse('');
    } finally { setAssigning(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;
  if (!user) return <div>User not found</div>;

  const STATUS_CFG: any = {
    COMPLETED: { color: '#10B981', bg: '#ECFDF5', label: '✅ Completed' },
    IN_PROGRESS: { color: '#3B82F6', bg: '#EFF6FF', label: '▶ In Progress' },
    NOT_STARTED: { color: '#9CA3AF', bg: '#F9FAFB', label: '⭕ Not Started' },
    FAILED: { color: '#EF4444', bg: '#FEF2F2', label: '❌ Failed' },
  };

  const enrolledCourseIds = user.enrollments?.map((e: any) => e.courseId) || [];
  const unenrolledCourses = allCourses.filter((c: any) => !enrolledCourseIds.includes(c.id));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/admin/users" style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'inline-block' }}>← Back to Users</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.3)' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '24px' }}>{user.name.charAt(0)}</span>
            </div>
            <p style={{ color: 'white', fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{user.name}</p>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{user.role}</span>
          </div>
          <div style={{ padding: '20px' }}>
            {[
              { label: 'Email', value: user.email },
              { label: 'Department', value: user.department?.name || '—' },
              { label: 'Manager', value: user.manager?.name || '—' },
              { label: 'Points', value: user.userPoints?.points || 0 },
              { label: 'Badges', value: user.userBadges?.length || 0 },
              { label: 'Courses', value: user.enrollments?.length || 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10312B' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Assign Course */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>➕ Assign Course</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                <option value="">— Select a course to assign —</option>
                {unenrolledCourses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
              </select>
              <button onClick={handleAssign} disabled={!selectedCourse || assigning}
                style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
                {assigning ? 'Assigning...' : 'Assign →'}
              </button>
            </div>
          </div>

          {/* Learning Progress */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>📚 Learning Progress ({user.enrollments?.length || 0} courses)</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['COMPLETED','IN_PROGRESS','NOT_STARTED'].map(s => {
                  const count = user.enrollments?.filter((e: any) => e.status === s).length || 0;
                  const cfg = STATUS_CFG[s];
                  return <span key={s} style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{count} {s.replace('_',' ')}</span>;
                })}
              </div>
            </div>
            {user.enrollments?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📚</p>
                <p>No courses assigned yet</p>
              </div>
            ) : (
              <div>
                {user.enrollments?.map((e: any) => {
                  const cfg = STATUS_CFG[e.status] || STATUS_CFG.NOT_STARTED;
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {e.course?.type === 'VIDEO' ? '🎬' : e.course?.type === 'SCORM' ? '🎮' : e.course?.type === 'PPT' ? '📊' : '📄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>{e.course?.title}</p>
                        <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: e.status === 'COMPLETED' ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: e.progressPct + '%', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{cfg.label}</span>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{e.progressPct}% done</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`,

// ─── MANAGER USER DETAIL PAGE ──────────────────────────────
'app/dashboard/manager/team/[userId]/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import Link from 'next/link';

export default function ManagerUserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/users/' + userId),
      api.get('/courses?published=true'),
    ]).then(([u, c]) => {
      setUser(u.data);
      setAllCourses(c.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleAssign = async () => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await api.post('/enrollments/assign/user', { userId, courseId: selectedCourse });
      const { data } = await api.get('/users/' + userId);
      setUser(data);
      setSelectedCourse('');
    } finally { setAssigning(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;
  if (!user) return <div>User not found</div>;

  const STATUS_CFG: any = {
    COMPLETED: { color: '#10B981', bg: '#ECFDF5', label: '✅ Completed' },
    IN_PROGRESS: { color: '#3B82F6', bg: '#EFF6FF', label: '▶ In Progress' },
    NOT_STARTED: { color: '#9CA3AF', bg: '#F9FAFB', label: '⭕ Not Started' },
    FAILED: { color: '#EF4444', bg: '#FEF2F2', label: '❌ Failed' },
  };

  const enrolledIds = user.enrollments?.map((e: any) => e.courseId) || [];
  const unenrolled = allCourses.filter((c: any) => !enrolledIds.includes(c.id));
  const completed = user.enrollments?.filter((e: any) => e.status === 'COMPLETED').length || 0;
  const total = user.enrollments?.length || 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/manager" style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'inline-block' }}>← Back to Team</Link>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '22px' }}>{user.name.charAt(0)}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{user.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>{user.email} · {user.department?.name || 'No department'}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total Courses', value: total },
            { label: 'Completed', value: completed },
            { label: 'Completion Rate', value: rate + '%' },
            { label: 'Points', value: user.userPoints?.points || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ color: '#AEBF66', fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px', whiteSpace: 'nowrap' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Course */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>➕ Assign Course to {user.name.split(' ')[0]}</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">— Select a course to assign —</option>
            {unenrolled.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
          <button onClick={handleAssign} disabled={!selectedCourse || assigning}
            style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
            {assigning ? 'Assigning...' : 'Assign →'}
          </button>
        </div>
      </div>

      {/* Learning Progress */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>📚 Learning Progress</h3>
        </div>
        {user.enrollments?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📚</p>
            <p>No courses assigned yet. Use the form above to assign courses.</p>
          </div>
        ) : (
          user.enrollments?.map((e: any) => {
            const cfg = STATUS_CFG[e.status] || STATUS_CFG.NOT_STARTED;
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {e.course?.type === 'VIDEO' ? '🎬' : e.course?.type === 'SCORM' ? '🎮' : e.course?.type === 'PPT' ? '📊' : '📄'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>{e.course?.title}</p>
                  <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: e.status === 'COMPLETED' ? '#10B981' : 'linear-gradient(90deg, #10312B, #6C9604)', width: e.progressPct + '%' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{cfg.label}</span>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{e.progressPct}% · {e.completedAt ? 'Done ' + new Date(e.completedAt).toLocaleDateString() : 'In progress'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
`,

// ─── UPDATE MANAGER PAGE to have clickable employees ────────
'app/dashboard/manager/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Link from 'next/link';

export default function ManagerPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/my-team'),
      api.get('/courses?published=true'),
    ]).then(([s, c]) => {
      setStats(s.data);
      setCourses(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const assignToTeam = async () => {
    if (!selectedCourse) return;
    setAssigning(true);
    try {
      await api.post('/enrollments/assign/team', { courseId: selectedCourse });
      alert('Course assigned to entire team!');
      setSelectedCourse('');
    } finally { setAssigning(false); }
  };

  const total = stats.length;
  const totalEnrolled = stats.reduce((s, u) => s + u.totalEnrollments, 0);
  const totalCompleted = stats.reduce((s, u) => s + u.completed, 0);
  const avgRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>👥 My Team</h1>
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Track and support your team learning · Click any employee to view details</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Team Size', value: total, icon: '👥', color: '#6C9604' },
          { label: 'Total Enrolled', value: totalEnrolled, icon: '📚', color: '#3B82F6' },
          { label: 'Completions', value: totalCompleted, icon: '✅', color: '#10B981' },
          { label: 'Avg Completion', value: avgRate + '%', icon: '📊', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#10312B', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Assign to whole team */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B', marginBottom: '14px' }}>📢 Assign Course to Entire Team</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: 'white', fontFamily: 'Montserrat, sans-serif' }}>
            <option value="">— Select course to assign to all team members —</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
          </select>
          <button onClick={assignToTeam} disabled={!selectedCourse || assigning}
            style={{ padding: '10px 20px', borderRadius: '8px', background: !selectedCourse ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: !selectedCourse ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: !selectedCourse ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
            {assigning ? 'Assigning...' : 'Assign to All →'}
          </button>
        </div>
      </div>

      {/* Team Table - clickable rows */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>Team Members — Click to view details</h3>
        </div>
        {stats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
            <p>No team members assigned yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Employee','Enrolled','Completed','In Progress','Points','Completion','Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s: any) => {
                const rate = s.totalEnrollments > 0 ? Math.round((s.completed / s.totalEnrollments) * 100) : 0;
                const rateColor = rate >= 70 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFDF5'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'white'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10312B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>{s.name}</p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#10312B' }}>{s.totalEnrollments}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#10B981', fontWeight: '700' }}>{s.completed}</span></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#3B82F6', fontWeight: '700' }}>{s.inProgress}</span></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ color: '#F59E0B', fontWeight: '800' }}>⭐ {s.points}</span></td>
                    <td style={{ padding: '14px 16px', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: rateColor, width: rate + '%' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: rateColor, minWidth: '32px' }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={'/dashboard/manager/team/' + s.id}
                        style={{ padding: '6px 14px', borderRadius: '8px', background: '#F4F7E8', color: '#6C9604', border: '1px solid #AEBF66', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
`,

};

let created = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(base, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
  console.log('Created: ' + filePath);
  created++;
}
console.log('Done! Created ' + created + ' files.');