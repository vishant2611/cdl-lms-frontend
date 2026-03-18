'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function InstructorPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/courses', { ...form, duration: form.duration ? parseInt(form.duration) : undefined });
    const r = await api.get('/courses');
    setCourses(r.data);
    setShowForm(false);
    setForm({ title: '', description: '', type: 'PDF', fileUrl: '', duration: '' });
  };

  const handlePublish = async (id: string) => {
    await api.patch('/courses/' + id + '/publish', {});
    const r = await api.get('/courses');
    setCourses(r.data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Instructor Panel</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>+ New Course</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Course Title" required className="px-4 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-2 border rounded-lg text-sm">
              {['PDF','VIDEO','SCORM','PPT'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} placeholder="File URL" required className="px-4 py-2 border rounded-lg text-sm" />
            <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="Duration (minutes)" type="number" className="px-4 py-2 border rounded-lg text-sm" />
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="px-4 py-2 border rounded-lg text-sm md:col-span-2" rows={3} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#2D6A4F' }}>Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg text-sm border border-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Title','Type','Status','Enrollments','Action'].map(h => <th key={h} className="px-5 py-3 text-left font-medium text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{c.title}</td>
                <td className="px-5 py-3">{c.type}</td>
                <td className="px-5 py-3">{c.isPublished ? '✅ Published' : '📝 Draft'}</td>
                <td className="px-5 py-3">{c._count?.enrollments || 0}</td>
                <td className="px-5 py-3">{!c.isPublished && <button onClick={() => handlePublish(c.id)} className="text-xs px-3 py-1 rounded text-white" style={{ background: '#2D6A4F' }}>Publish</button>}</td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No courses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}