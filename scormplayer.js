const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const files = {

'app/scorm-player/[courseId]/page.tsx': `
'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

export default function ScormPlayerPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Loading...');
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    api.get('/courses/' + courseId)
      .then(r => { setCourse(r.data); setLoading(false); })
      .catch(() => { setError('Course not found'); setLoading(false); });
  }, [courseId]);

  useEffect(() => {
    if (course) loadScorm();
    return () => {
      // Cleanup object URLs on unmount
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, [course]);

  const updateBackendProgress = async (pct: number, lessonStatus: string) => {
    try {
      await api.patch('/enrollments/progress', { courseId, progressPct: pct });
      if (lessonStatus === 'passed' || lessonStatus === 'completed' || pct >= 100) {
        await api.post('/certificates/issue', { userId: user?.id, courseId });
      }
    } catch (e) {
      console.error('Progress update failed:', e);
    }
  };

  const loadScorm = async () => {
    if (!course?.fileUrl) return;
    setExtracting(true);
    setStatus('Downloading course content...');

    try {
      const JSZip = (await import('jszip')).default;

      // Download the ZIP
      const response = await fetch(course.fileUrl);
      if (!response.ok) throw new Error('Failed to download course');
      const zipBuffer = await response.arrayBuffer();

      setStatus('Extracting course files...');
      const zip = await JSZip.loadAsync(zipBuffer);

      // Extract all files into memory as object URLs
      const fileMap: Record<string, string> = {};
      const files = Object.keys(zip.files);

      for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const zipEntry = zip.files[filename];
        if (zipEntry.dir) continue;

        setProgress(Math.round((i / files.length) * 80));

        const blob = await zipEntry.async('blob');
        const mimeType = getMimeType(filename);
        const typedBlob = new Blob([blob], { type: mimeType });
        const objectUrl = URL.createObjectURL(typedBlob);
        objectUrls.current.push(objectUrl);
        fileMap[filename] = objectUrl;
      }

      setProgress(85);
      setStatus('Preparing course player...');

      // Find entry point
      const entryPoint = findEntryPoint(Object.keys(fileMap));
      if (!entryPoint) throw new Error('No entry point found in SCORM package');

      setProgress(90);

      // Build HTML with SCORM API bridge
      const entryBlob = zip.files[entryPoint];
      let htmlContent = await entryBlob.async('string');

      // Replace relative URLs with object URLs
      for (const [filename, objectUrl] of Object.entries(fileMap)) {
        if (filename === entryPoint) continue;
        const escapedName = filename.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        htmlContent = htmlContent.replace(new RegExp(escapedName, 'g'), objectUrl);
        // Also handle just the basename
        const basename = filename.split('/').pop() || '';
        if (basename && basename !== filename) {
          htmlContent = htmlContent.replace(new RegExp(basename.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), objectUrl);
        }
      }

      // Inject SCORM API bridge
      const scormBridge = buildScormBridge();
      htmlContent = htmlContent.replace('<head>', '<head><script>' + scormBridge + '<\/script>');

      const finalBlob = new Blob([htmlContent], { type: 'text/html' });
      const finalUrl = URL.createObjectURL(finalBlob);
      objectUrls.current.push(finalUrl);

      setProgress(100);
      setStatus('Launching course...');

      if (iframeRef.current) {
        iframeRef.current.src = finalUrl;
      }

      setExtracting(false);

    } catch (err: any) {
      setError('Failed to load SCORM: ' + err.message);
      setExtracting(false);
    }
  };

  const buildScormBridge = () => {
    return [
      'window.API = {',
      '  _data: {},',
      '  _startTime: Date.now(),',
      '  LMSInitialize: function() { return "true"; },',
      '  LMSFinalize: function() { this.LMSCommit(); return "true"; },',
      '  LMSGetValue: function(k) { return this._data[k] || ""; },',
      '  LMSSetValue: function(k, v) {',
      '    this._data[k] = v;',
      '    if (k === "cmi.core.lesson_status" || k === "cmi.completion_status") {',
      '      window.parent.postMessage({ type: "scorm_status", value: v }, "*");',
      '    }',
      '    if (k === "cmi.core.score.raw" || k === "cmi.score.raw") {',
      '      window.parent.postMessage({ type: "scorm_score", value: v }, "*");',
      '    }',
      '    if (k === "cmi.core.session_time" || k === "cmi.session_time") {',
      '      window.parent.postMessage({ type: "scorm_time", value: v }, "*");',
      '    }',
      '    return "true";',
      '  },',
      '  LMSCommit: function() {',
      '    window.parent.postMessage({ type: "scorm_commit", data: this._data }, "*");',
      '    return "true";',
      '  },',
      '  LMSGetLastError: function() { return "0"; },',
      '  LMSGetErrorString: function() { return ""; },',
      '  LMSGetDiagnostic: function() { return ""; }',
      '};',
      'window.API_1484_11 = window.API;',
    ].join('\\n');
  };

  // Listen for SCORM messages from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      if (event.data.type === 'scorm_status') {
        const status = event.data.value;
        let pct = 0;
        if (status === 'passed' || status === 'completed') pct = 100;
        else if (status === 'incomplete') pct = 50;
        else if (status === 'browsed') pct = 25;
        await updateBackendProgress(pct, status);
      }

      if (event.data.type === 'scorm_score') {
        const score = parseFloat(event.data.value) || 0;
        await updateBackendProgress(score, '');
      }

      if (event.data.type === 'scorm_commit') {
        const data = event.data.data;
        const status = data['cmi.core.lesson_status'] || data['cmi.completion_status'] || '';
        const score = parseFloat(data['cmi.core.score.raw'] || data['cmi.score.raw'] || '0');
        let pct = score > 0 ? score : status === 'passed' || status === 'completed' ? 100 : 0;
        if (pct > 0) await updateBackendProgress(pct, status);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [courseId, user]);

  const findEntryPoint = (files: string[]): string | null => {
    const priorities = [
      'story.html', 'index.html', 'index_lms.html',
      'story_html5.html', 'launch.html', 'default.html'
    ];
    for (const p of priorities) {
      const found = files.find(f => f.toLowerCase() === p || f.toLowerCase().endsWith('/' + p));
      if (found) return found;
    }
    // Fallback: any root HTML file
    const rootHtml = files.find(f => f.endsWith('.html') && !f.includes('/'));
    return rootHtml || null;
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      html: 'text/html', htm: 'text/html', css: 'text/css',
      js: 'application/javascript', json: 'application/json',
      xml: 'application/xml', png: 'image/png', jpg: 'image/jpeg',
      jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
      mp4: 'video/mp4', mp3: 'audio/mpeg', pdf: 'application/pdf',
      woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf',
      swf: 'application/x-shockwave-flash', txt: 'text/plain',
    };
    return types[ext] || 'application/octet-stream';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p>Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: '400px' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>❌</p>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Failed to Load Course</h2>
        <p style={{ color: '#94A3B8', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => router.back()} style={{ background: '#6C9604', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Montserrat, sans-serif' }}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', flexDirection: 'column', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ background: '#10312B', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(108,150,4,0.3)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6C9604', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>CDL</span>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{course?.title}</p>
            <p style={{ color: '#AEBF66', fontSize: '11px' }}>SCORM Course · Progress tracked automatically</p>
          </div>
        </div>
        <button onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif' }}>
          ← Exit Course
        </button>
      </div>

      {/* Loading Overlay */}
      {extracting && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B2A' }}>
          <div style={{ textAlign: 'center', color: 'white', maxWidth: '360px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Preparing Your Course</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '24px' }}>{status}</p>
            <div style={{ height: '8px', background: '#1E3A5F', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10312B, #6C9604)', width: progress + '%', transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ color: '#6C9604', fontSize: '13px', fontWeight: '700' }}>{progress}%</p>
          </div>
        </div>
      )}

      {/* SCORM iframe */}
      {!extracting && (
        <iframe
          ref={iframeRef}
          style={{ flex: 1, border: 'none', width: '100%', minHeight: 'calc(100vh - 56px)' }}
          title={course?.title}
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
        />
      )}
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