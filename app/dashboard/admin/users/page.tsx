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