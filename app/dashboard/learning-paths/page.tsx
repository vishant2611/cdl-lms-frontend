'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);

  useEffect(() => {
    api.get('/learning-paths').then(r => setPaths(r.data)).catch(() => {});
    api.get('/learning-paths/my').then(r => setMyPaths(r.data)).catch(() => {});
  }, []);

  const enroll = async (id: string) => {
    await api.post('/learning-paths/' + id + '/enroll', {});
    const r = await api.get('/learning-paths/my');
    setMyPaths(r.data);
  };

  const isEnrolled = (id: string) => myPaths.some((p: any) => p.learningPathId === id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Learning Paths</h1>
      {paths.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><p className="text-gray-500">No learning paths available yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paths.map((path: any) => (
            <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-2">{path.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{path.pathCourses?.length} courses</p>
              {isEnrolled(path.id) ? (
                <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#40916C' }}>Enrolled ✓</button>
              ) : (
                <button onClick={() => enroll(path.id)} className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#2D6A4F' }}>Start Path</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}