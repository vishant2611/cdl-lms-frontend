'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function ScormPlayerPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState('Loading course...');
  const [loadPct, setLoadPct] = useState(0);
  const [iframeSrc, setIframeSrc] = useState('');
  const [error, setError] = useState('');
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    api.get('/courses/' + courseId)
      .then(r => setCourse(r.data))
      .catch(() => setError('Course not found'));
  }, [courseId]);

  useEffect(() => {
    if (course?.fileUrl) {
      loadScorm(course.fileUrl);
    }
  }, [course?.fileUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      objectUrls.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  const updateProgress = async (pct: number, status: string) => {
    try {
      await api.patch('/enrollments/progress', { courseId, progressPct: Math.min(100, Math.round(pct)) });
      if (status === 'passed' || status === 'completed' || pct >= 100) {
        await api.post('/certificates/issue', { userId: user?.id, courseId });
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (!e.data?.type) return;
      if (e.data.type === 'scorm_status') {
        const s = e.data.value;
        const pct = s === 'passed' || s === 'completed' ? 100 : s === 'incomplete' ? 50 : 25;
        await updateProgress(pct, s);
      }
      if (e.data.type === 'scorm_score') {
        const score = parseFloat(e.data.value) || 0;
        if (score > 0) await updateProgress(score, '');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [courseId, user]);

  const getMime = (f: string) => {
    const e = f.split('.').pop()?.toLowerCase() || '';
    const m: Record<string, string> = {
      html: 'text/html', htm: 'text/html', css: 'text/css',
      js: 'application/javascript', json: 'application/json',
      xml: 'application/xml', png: 'image/png', jpg: 'image/jpeg',
      jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
      mp4: 'video/mp4', mp3: 'audio/mpeg', woff: 'font/woff',
      woff2: 'font/woff2', ttf: 'font/ttf', txt: 'text/plain',
    };
    return m[e] || 'application/octet-stream';
  };

  const findEntry = (names: string[]) => {
    const p = ['story.html','index.html','index_lms.html','story_html5.html','launch.html','default.html'];
    for (const n of p) {
      const f = names.find(x => x.toLowerCase() === n || x.toLowerCase().endsWith('/' + n));
      if (f) return f;
    }
    return names.find(x => x.endsWith('.html') && !x.includes('/')) || null;
  };

  const scormApi = [
    'window.API={_d:{},',
    'LMSInitialize:function(){return"true"},',
    'LMSFinalize:function(){this.LMSCommit();return"true"},',
    'LMSGetValue:function(k){return this._d[k]||""},',
    'LMSSetValue:function(k,v){this._d[k]=v;',
    'if(k==="cmi.core.lesson_status"||k==="cmi.completion_status"){window.parent.postMessage({type:"scorm_status",value:v},"*")}',
    'if(k==="cmi.core.score.raw"||k==="cmi.score.raw"){window.parent.postMessage({type:"scorm_score",value:v},"*")}',
    'return"true"},',
    'LMSCommit:function(){return"true"},',
    'LMSGetLastError:function(){return"0"},',
    'LMSGetErrorString:function(){return""},',
    'LMSGetDiagnostic:function(){return""}};',
    'window.API_1484_11=window.API;',
  ].join('');

  const loadScorm = async (fileUrl: string) => {
    setStatusMsg('Downloading course...');
    setLoadPct(5);
    try {
      const JSZip = (await import('jszip')).default;
      setLoadPct(10);

      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error('Download failed: ' + resp.status);
      const buf = await resp.arrayBuffer();
      setLoadPct(40);

      setStatusMsg('Extracting files...');
      const zip = await JSZip.loadAsync(buf);
      setLoadPct(50);

      const fmap: Record<string, string> = {};
      const names = Object.keys(zip.files);
      let i = 0;
      for (const name of names) {
        const entry = zip.files[name];
        if (entry.dir) { i++; continue; }
        const blob = await entry.async('blob');
        const url = URL.createObjectURL(new Blob([blob], { type: getMime(name) }));
        objectUrls.current.push(url);
        fmap[name] = url;
        setLoadPct(50 + Math.round((++i / names.length) * 35));
      }

      setStatusMsg('Building player...');
      setLoadPct(88);

      const entry = findEntry(Object.keys(fmap));
      if (!entry) throw new Error('No HTML entry point found in ZIP');

      let html = await zip.files[entry].async('string');

      // Replace all file references
      for (const [name, url] of Object.entries(fmap)) {
        if (name === entry) continue;
        const base = name.split('/').pop() || '';
        if (base) html = html.split(base).join(url);
        html = html.split(name).join(url);
      }

      // Inject SCORM API
      html = html.replace('<head>', '<head><script>' + scormApi + '<\/script>');

      setLoadPct(96);
      const finalBlob = new Blob([html], { type: 'text/html' });
      const finalUrl = URL.createObjectURL(finalBlob);
      objectUrls.current.push(finalUrl);

      setLoadPct(100);
      setStatusMsg('Launching...');
      setIframeSrc(finalUrl);

    } catch (err: any) {
      setError(err.message || 'Failed to load SCORM');
    }
  };

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px', padding: '24px' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>❌</p>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Failed to Load Course</h2>
        <p style={{ color: '#94A3B8', marginBottom: '24px', fontSize: '14px' }}>{error}</p>
        <button onClick={() => router.back()} style={{ background: '#6C9604', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Montserrat, sans-serif', fontSize: '14px' }}>← Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', flexDirection: 'column', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Topbar */}
      <div style={{ background: '#10312B', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(108,150,4,0.3)', height: '52px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6C9604', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>CDL</span>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>{course?.title || 'Loading...'}</p>
            <p style={{ color: '#AEBF66', fontSize: '11px', margin: 0 }}>SCORM Course · Progress auto-tracked</p>
          </div>
        </div>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif' }}>← Exit Course</button>
      </div>

      {/* Loading overlay */}
      {!iframeSrc && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A' }}>
          <div style={{ textAlign: 'center', color: 'white', maxWidth: '360px', padding: '24px' }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>🎮</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Preparing Your Course</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '24px' }}>{statusMsg}</p>
            <div style={{ height: '8px', background: '#1E3A5F', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10312B, #6C9604)', width: loadPct + '%', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ color: '#6C9604', fontSize: '13px', fontWeight: '700' }}>{loadPct}%</p>
          </div>
        </div>
      )}

      {/* SCORM iframe */}
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          style={{ flex: 1, border: 'none', width: '100%', height: 'calc(100vh - 52px)', display: 'block' }}
          title={course?.title || 'SCORM Course'}
          allow="fullscreen autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        />
      )}
    </div>
  );
}