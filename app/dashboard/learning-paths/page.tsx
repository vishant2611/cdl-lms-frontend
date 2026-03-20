'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

const COLORS = ['#10312B','#6C9604','#AEBF66','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#06B6D4'];

export default function LearningPathsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isCreator = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const [paths, setPaths] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', courseIds: [] as string[],
    deadline: '', departmentId: '', userIds: [] as string[],
  });

  const [assignForm, setAssignForm] = useState({
    departmentId: '', userIds: [] as string[], deadline: '',
  });

  useEffect(() => { setMounted(true); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = isCreator ? '/learning-paths/manage' : '/learning-paths';
      const [pathsRes, myRes] = await Promise.all([
        api.get(endpoint),
        api.get('/learning-paths/my'),
      ]);
      setPaths(pathsRes.data);
      setMyPaths(myRes.data);
      if (isCreator) {
        const [coursesRes, deptsRes, usersRes] = await Promise.all([
          api.get('/courses'),
          api.get('/departments'),
          api.get('/users'),
        ]);
        setCourses(coursesRes.data);
        setDepartments(deptsRes.data);
        setUsers(usersRes.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const isEnrolled = (id: string) => myPaths.some((p: any) => p.learningPathId === id);

  const toggleCourse = (id: string) => {
    setForm(f => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter(c => c !== id) : [...f.courseIds, id],
    }));
  };

  const toggleUser = (id: string, target: 'form' | 'assign') => {
    if (target === 'form') {
      setForm(f => ({ ...f, userIds: f.userIds.includes(id) ? f.userIds.filter(u => u !== id) : [...f.userIds, id] }));
    } else {
      setAssignForm(f => ({ ...f, userIds: f.userIds.includes(id) ? f.userIds.filter(u => u !== id) : [...f.userIds, id] }));
    }
  };

  const handleCreate = async () => {
    if (!form.title || form.courseIds.length === 0) return;
    setSaving(true);
    try {
      await api.post('/learning-paths', form);
      setSuccessMsg('Learning path created successfully!');
      setShowCreate(false);
      setForm({ title: '', description: '', courseIds: [], deadline: '', departmentId: '', userIds: [] });
      await fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {}
    setSaving(false);
  };

  const handlePublish = async (id: string, current: boolean) => {
    await api.patch('/learning-paths/' + id + '/publish', { isPublished: !current });
    await fetchData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Delete "' + title + '"? This cannot be undone.')) return;
    await api.delete('/learning-paths/' + id);
    await fetchData();
  };

  const handleAssign = async () => {
    if (!showAssign) return;
    setAssigning(true);
    try {
      const res = await api.post('/learning-paths/' + showAssign.id + '/assign', assignForm);
      setSuccessMsg('Assigned to ' + res.data.enrolled + ' new employee(s)!');
      setShowAssign(null);
      setAssignForm({ departmentId: '', userIds: [], deadline: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {}
    setAssigning(false);
  };

  const enroll = async (id: string) => {
    await api.post('/learning-paths/' + id + '/enroll', {});
    await fetchData();
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const modalStyle = { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 99999, overflowY: 'auto' as const };
  const modalInner = { display: 'flex', justifyContent: 'center', padding: '40px 20px' };
  const modalBox600 = { background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
  const modalBox500 = { background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };

  const createModal = (
    <div style={modalStyle}>
      <div style={modalInner}>
        <div style={modalBox600}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10312B', marginBottom: '20px' }}>+ Create Learning Path</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Path Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Employee Onboarding" style={inp} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this learning path..." rows={3} style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div>
              <label style={lbl}>Deadline (optional)</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Select Courses * ({form.courseIds.length} selected)</label>
              {courses.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No courses available.</p>
              ) : (
                <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {courses.map((c: any) => (
                    <div key={c.id} onClick={() => toggleCourse(c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', background: form.courseIds.includes(c.id) ? '#F4F7E8' : 'white' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', borderColor: form.courseIds.includes(c.id) ? '#6C9604' : '#D1D5DB', background: form.courseIds.includes(c.id) ? '#6C9604' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {form.courseIds.includes(c.id) && <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#10312B' }}>{c.title}</p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{c.type} · {c.duration || '?'} mins</p>
                      </div>
                      {form.courseIds.includes(c.id) && <span style={{ fontSize: '11px', fontWeight: '800', color: '#6C9604' }}>#{form.courseIds.indexOf(c.id) + 1}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>Assign to Department (optional)</label>
              <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} style={inp}>
                <option value="">— No Department —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Assign to Individual Employees (optional)</label>
              <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {users.filter((u: any) => u.role === 'EMPLOYEE').map((u: any) => (
                  <div key={u.id} onClick={() => toggleUser(u.id, 'form')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', background: form.userIds.includes(u.id) ? '#F4F7E8' : 'white' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', borderColor: form.userIds.includes(u.id) ? '#6C9604' : '#D1D5DB', background: form.userIds.includes(u.id) ? '#6C9604' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {form.userIds.includes(u.id) && <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#10312B' }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{u.department?.name || 'No dept'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving || !form.title || form.courseIds.length === 0}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', background: (!form.title || form.courseIds.length === 0) ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: (!form.title || form.courseIds.length === 0) ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              {saving ? 'Creating...' : '✓ Create Learning Path'}
            </button>
            <button onClick={() => setShowCreate(false)}
              style={{ padding: '12px 20px', borderRadius: '10px', background: 'white', color: '#6B7280', fontWeight: '600', fontSize: '14px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const assignModal = (
    <div style={modalStyle}>
      <div style={modalInner}>
        <div style={modalBox500}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10312B', marginBottom: '6px' }}>👥 Assign Learning Path</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>"{showAssign?.title}"</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Assign to Department</label>
              <select value={assignForm.departmentId} onChange={e => setAssignForm(f => ({ ...f, departmentId: e.target.value }))} style={inp}>
                <option value="">— No Department —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Assign to Individual Employees</label>
              <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {users.filter((u: any) => u.role === 'EMPLOYEE').map((u: any) => (
                  <div key={u.id} onClick={() => toggleUser(u.id, 'assign')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', background: assignForm.userIds.includes(u.id) ? '#F4F7E8' : 'white' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', borderColor: assignForm.userIds.includes(u.id) ? '#6C9604' : '#D1D5DB', background: assignForm.userIds.includes(u.id) ? '#6C9604' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {assignForm.userIds.includes(u.id) && <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#10312B' }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{u.department?.name || 'No dept'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Deadline (optional)</label>
              <input type="date" value={assignForm.deadline} onChange={e => setAssignForm(f => ({ ...f, deadline: e.target.value }))} style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAssign} disabled={assigning || (!assignForm.departmentId && assignForm.userIds.length === 0)}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', background: (!assignForm.departmentId && assignForm.userIds.length === 0) ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: (!assignForm.departmentId && assignForm.userIds.length === 0) ? '#9CA3AF' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              {assigning ? 'Assigning...' : '✓ Assign Now'}
            </button>
            <button onClick={() => setShowAssign(null)}
              style={{ padding: '12px 20px', borderRadius: '10px', background: 'white', color: '#6B7280', fontWeight: '600', fontSize: '14px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fade-in">
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>🎯 Learning Paths</h1>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>{paths.length} learning path{paths.length !== 1 ? 's' : ''} available</p>
          </div>
          {isCreator && (
            <button onClick={() => setShowCreate(true)}
              style={{ padding: '11px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              + Create Learning Path
            </button>
          )}
        </div>

        {successMsg && (
          <div style={{ background: '#F4F7E8', border: '1px solid #AEBF66', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#6C9604', fontWeight: '600', fontSize: '14px' }}>
            ✅ {successMsg}
          </div>
        )}

        {paths.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#10312B', marginBottom: '4px' }}>No learning paths yet</p>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>
              {isCreator ? 'Click "Create Learning Path" to get started' : 'Your instructors will create structured paths for you'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {paths.map((p: any, idx: number) => {
              const enrolled = isEnrolled(p.id);
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)', cursor: 'pointer' }}
                  onClick={() => router.push('/dashboard/learning-paths/' + p.id)}>
                  <div style={{ background: 'linear-gradient(135deg, ' + color + ', #6C9604)', padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: 'white', fontSize: '15px', fontWeight: '800', marginBottom: '3px' }}>{p.title}</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{p.pathCourses?.length || 0} courses · {p._count?.pathEnrollments || 0} enrolled</p>
                      </div>
                      {isCreator && (
                        <span style={{ background: p.isPublished ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                          {p.isPublished ? '✅ Published' : '📝 Draft'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '18px 22px' }}>
                    {p.description && <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>{p.description}</p>}
                    <div style={{ marginBottom: '16px' }}>
                      {p.pathCourses?.slice(0, 4).map((pc: any, i: number) => (
                        <div key={pc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontSize: '10px', fontWeight: '800' }}>{i + 1}</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.course?.title}</span>
                        </div>
                      ))}
                    </div>
                    {isCreator ? (
                      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setShowAssign(p); setAssignForm({ departmentId: '', userIds: [], deadline: '' }); }}
                          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                          👥 Assign
                        </button>
                        <button onClick={() => handlePublish(p.id, p.isPublished)}
                          style={{ padding: '9px 14px', borderRadius: '8px', background: '#F4F7E8', color: '#6C9604', fontWeight: '700', fontSize: '12px', border: '1px solid #AEBF66', cursor: 'pointer' }}>
                          {p.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        {canDelete && <button onClick={() => handleDelete(p.id, p.title)}
                          style={{ padding: '9px 12px', borderRadius: '8px', background: '#FEF2F2', color: '#EF4444', fontWeight: '700', fontSize: '12px', border: '1px solid #FECACA', cursor: 'pointer' }}>
                          🗑
                        </button>}
                      </div>
                    ) : enrolled ? (
                      <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '11px', textAlign: 'center', border: '1px solid #AEBF66' }}>
                        <p style={{ color: '#6C9604', fontWeight: '800', fontSize: '14px' }}>✅ Enrolled</p>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); enroll(p.id); }}
                        style={{ width: '100%', padding: '11px', borderRadius: '10px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                        🚀 Start Learning Path
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mounted && showCreate && createPortal(createModal, document.body)}
      {mounted && showAssign && createPortal(assignModal, document.body)}
    </>
  );
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B',
  marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '8px',
  padding: '10px 14px', fontSize: '14px', outline: 'none',
  background: 'white', fontFamily: 'Montserrat, sans-serif', boxSizing: 'border-box',
};