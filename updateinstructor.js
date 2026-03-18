const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

'app/dashboard/instructor/page.tsx': `
'use client';
import { useEffect, useState, useRef } from 'react';
import api from '../../../lib/api';

const TYPE_CFG: any = {
  SCORM: { color: '#10B981', bg: '#ECFDF5', icon: '🎮' },
  PDF: { color: '#EF4444', bg: '#FEF2F2', icon: '📄' },
  VIDEO: { color: '#F59E0B', bg: '#FFFBEB', icon: '🎬' },
  PPT: { color: '#8B5CF6', bg: '#F5F3FF', icon: '📊' },
};

const ACCEPT = '.pdf,.mp4,.avi,.mov,.mkv,.webm,.ppt,.pptx,.zip,.doc,.docx';

export default function InstructorPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 90));
      }, 200);

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') + '/upload/file',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + localStorage.getItem('cdl_token') },
          body: formData,
        }
      );

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      setUploadedFile(data);
      setForm(f => ({ ...f, fileUrl: data.fileUrl, type: data.fileType }));
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileUrl) { alert('Please upload a file or enter a file URL'); return; }
    setLoading(true);
    try {
      await api.post('/courses', { ...form, duration: form.duration ? parseInt(form.duration) : undefined });
      const r = await api.get('/courses');
      setCourses(r.data);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
      setUploadedFile(null);
      setUploadProgress(0);
    } finally { setLoading(false); }
  };

  const handlePublish = async (id: string) => {
    await api.patch('/courses/' + id + '/publish', {});
    const r = await api.get('/courses');
    setCourses(r.data);
  };

  const published = courses.filter(c => c.isPublished).length;
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>✏️ Instructor Panel</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Create and manage your course content</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '11px 20px', borderRadius: '10px', background: showForm ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: showForm ? '#6B7280' : 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
          {showForm ? '✕ Cancel' : '+ Create New Course'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Courses', value: courses.length, icon: '📚', color: '#6C9604', bg: '#F4F7E8' },
          { label: 'Published', value: published, icon: '✅', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Total Enrollments', value: totalEnrollments, icon: '👥', color: '#3B82F6', bg: '#EFF6FF' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '26px', fontWeight: '800', color: '#10312B', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(16,49,43,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#10312B', marginBottom: '24px' }}>📝 New Course Details</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Pesticide Safety Training Level 1" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration (minutes)</label>
                <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 45" type="number" min="1" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What will employees learn from this course? Include key learning objectives..." rows={3} style={{ resize: 'vertical' }} />
              </div>
            </div>

            {/* File Upload Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Content *</label>

              {/* Upload Mode Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{ key: 'file', label: '📁 Upload from Computer' }, { key: 'url', label: '🔗 Paste URL (Drive/Dropbox)' }].map(m => (
                  <button key={m.key} type="button" onClick={() => setUploadMode(m.key as any)}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s',
                      borderColor: uploadMode === m.key ? '#6C9604' : '#E5E7EB',
                      background: uploadMode === m.key ? '#F4F7E8' : 'white',
                      color: uploadMode === m.key ? '#6C9604' : '#6B7280' }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {uploadMode === 'file' ? (
                <>
                  {/* Drag & Drop Zone */}
                  {!uploadedFile && !uploading && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: '2px dashed', borderColor: dragOver ? '#6C9604' : '#D1D5DB',
                        borderRadius: '12px', padding: '40px 24px', textAlign: 'center',
                        background: dragOver ? '#F4F7E8' : '#FAFAFA',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      <p style={{ fontSize: '36px', marginBottom: '12px' }}>📁</p>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#10312B', marginBottom: '6px' }}>Drag & drop your file here</p>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>or click to browse from your computer</p>
                      <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', padding: '10px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>Browse Files</div>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '14px' }}>Supported: PDF, MP4, AVI, MOV, PPT, PPTX, SCORM (ZIP), DOC, DOCX · Max 500MB</p>
                      <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                    </div>
                  )}

                  {/* Uploading Progress */}
                  {uploading && (
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FAFAFA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F4F7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⏳</div>
                        <div>
                          <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>Uploading to CDL Storage...</p>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>Please wait, do not close this page</p>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10312B, #6C9604)', width: uploadProgress + '%', transition: 'width 0.3s ease' }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#6C9604', fontWeight: '700', marginTop: '8px', textAlign: 'right' }}>{uploadProgress}%</p>
                    </div>
                  )}

                  {/* Upload Success */}
                  {uploadedFile && !uploading && (
                    <div style={{ border: '1px solid #A7F3D0', borderRadius: '12px', padding: '16px 20px', background: '#ECFDF5', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        {TYPE_CFG[uploadedFile.fileType]?.icon || '📄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px', marginBottom: '2px' }}>{uploadedFile.fileName}</p>
                        <p style={{ fontSize: '12px', color: '#6B7280' }}>{formatSize(uploadedFile.fileSize)} · <span style={{ color: '#10B981', fontWeight: '600' }}>{uploadedFile.fileType}</span> · Uploaded successfully ✅</p>
                      </div>
                      <button type="button" onClick={() => { setUploadedFile(null); setForm(f => ({ ...f, fileUrl: '' })); setUploadProgress(0); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '18px' }}>✕</button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})}
                    placeholder="https://drive.google.com/file/... or https://dropbox.com/..." />
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>💡 Paste a shareable link from Google Drive, Dropbox, OneDrive, or any public URL</p>
                  {form.fileUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#10312B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Type</label>
                      <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ background: 'white' }}>
                        {['PDF','VIDEO','SCORM','PPT'].map(t => <option key={t} value={t}>{TYPE_CFG[t]?.icon} {t}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
              <button type="submit" disabled={loading || uploading}
                style={{ padding: '12px 24px', borderRadius: '10px', background: (loading || uploading) ? '#9CA3AF' : 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: (loading || uploading) ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                {loading ? '⏳ Creating...' : '✓ Create Course'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setUploadedFile(null); setUploadProgress(0); }}
                style={{ padding: '12px 20px', borderRadius: '10px', background: 'white', color: '#6B7280', fontWeight: '600', fontSize: '14px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Table */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#10312B' }}>All Courses ({courses.length})</h2>
        </div>
        <table>
          <thead>
            <tr>{['Course','Type','Status','Enrollments','Created','Action'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {courses.map((c: any) => {
              const cfg = TYPE_CFG[c.type] || TYPE_CFG.PDF;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{cfg.icon}</div>
                      <div>
                        <p style={{ fontWeight: '700', color: '#10312B', fontSize: '14px' }}>{c.title}</p>
                        {c.duration && <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>⏱️ {c.duration} min</p>}
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{c.type}</span></td>
                  <td><span style={{ background: c.isPublished ? '#ECFDF5' : '#FFFBEB', color: c.isPublished ? '#10B981' : '#F59E0B', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid', borderColor: c.isPublished ? '#A7F3D0' : '#FDE68A' }}>{c.isPublished ? '✅ Live' : '📝 Draft'}</span></td>
                  <td><span style={{ fontWeight: '700', fontSize: '14px', color: '#10312B' }}>{c._count?.enrollments || 0}</span></td>
                  <td style={{ color: '#9CA3AF', fontSize: '12px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!c.isPublished && (
                      <button onClick={() => handlePublish(c.id)}
                        style={{ padding: '7px 14px', borderRadius: '8px', background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                        Publish →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📝</p>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#6B7280' }}>No courses yet</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Create New Course" to get started</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,

// Update sidebar to show CDL logo
'app/dashboard/layout.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import Image from 'next/image';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/courses', label: 'Courses', icon: '📚', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/learning-paths', label: 'Learning Paths', icon: '🗺️', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/compliance', label: 'Compliance', icon: '🛡️', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/certificates', label: 'Certificates', icon: '🎓', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/announcements', label: 'Announcements', icon: '📢', roles: ['EMPLOYEE','INSTRUCTOR','MANAGER','ADMIN'] },
  { href: '/dashboard/instructor', label: 'Instructor Panel', icon: '✏️', roles: ['INSTRUCTOR','ADMIN'] },
  { href: '/dashboard/manager', label: 'My Team', icon: '👥', roles: ['MANAGER','ADMIN'] },
  { href: '/dashboard/admin', label: 'Admin Console', icon: '⚙️', roles: ['ADMIN'] },
];

const ROLE_COLORS: any = { ADMIN: '#10312B', INSTRUCTOR: '#6C9604', MANAGER: '#AEBF66', EMPLOYEE: '#3B82F6' };
const ROLE_BG: any = { ADMIN: '#E8F0EC', INSTRUCTOR: '#F4F7E8', MANAGER: '#F6F8EC', EMPLOYEE: '#EFF6FF' };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7F2', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Loading CDL LMS...</p>
      </div>
    </div>
  );

  const navItems = NAV.filter(n => n.roles.includes(user.role));
  const W = collapsed ? 68 : 256;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: W, background: '#10312B', minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, transition: 'width 0.25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '16px 14px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#6C9604', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/cdl-logo.png" alt="CDL" width={36} height={36} style={{ objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                CROP<span style={{ color: '#AEBF66' }}>DEFENDERS</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>Learning Portal</p>
            </div>
          )}
        </div>

        {/* Nav Label */}
        {!collapsed && <p style={{ padding: '14px 20px 6px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Main Menu</p>}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: collapsed ? '8px' : '8px 12px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', marginBottom: '2px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '11px' : '10px 14px', borderRadius: '10px',
                  background: active ? '#6C9604' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s', cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  {active && !collapsed && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'white', opacity: 0.7 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{user.name.charAt(0)}</span>
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: ROLE_COLORS[user.role], color: 'white', display: 'inline-block', marginTop: '3px' }}>{user.role}</span>
              </div>
            </div>
          )}
          <button onClick={() => { logout(); router.push('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: collapsed ? '10px' : '10px 14px', borderRadius: '10px', width: '100%', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>
        {/* Topbar */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: '72px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6B7280' }}>
            {collapsed ? '☰' : '✕'}
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
              CDL LMS &rsaquo; <span style={{ color: '#10312B', fontWeight: '700' }}>
                {NAV.find(n => n.href === pathname)?.label || 'Dashboard'}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: ROLE_BG[user.role], borderRadius: '40px', border: '1px solid', borderColor: ROLE_COLORS[user.role] + '40' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>{user.name.charAt(0)}</span>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#10312B', lineHeight: 1 }}>{user.name}</p>
              <p style={{ fontSize: '10px', color: ROLE_COLORS[user.role], fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{user.role}</p>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', background: '#F5F7F2' }}>{children}</main>

        <footer style={{ padding: '14px 28px', borderTop: '1px solid #E5E7EB', background: 'white' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>
            © 2026 Crop Defenders Ltd · We Protect. You Grow. · LMS v1.0
          </p>
        </footer>
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
  console.log('✅ ' + filePath);
  created++;
}
console.log('\n🎉 Done! Updated ' + created + ' files.');