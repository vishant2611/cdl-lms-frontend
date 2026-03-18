const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

// Fix 1: Login page - add CDL logo
const loginFile = path.join(base, 'app/login/page.tsx');
let login = fs.readFileSync(loginFile, 'utf8');

// Replace the SVG logo in login with actual CDL logo image
login = login.replace(
  `<div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="30" r="14" stroke="#AEBF66" strokeWidth="2.5"/>
              <path d="M20 20 Q25 8 30 20" stroke="#6C9604" strokeWidth="2.5" fill="none"/>
              <path d="M25 8 L28 14 L22 14 Z" fill="#6C9604"/>
            </svg>
          </div>`,
  `<div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
            <img src="/cdl-logo.png" alt="CDL" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </div>`
);

fs.writeFileSync(loginFile, login);
console.log('Fixed: login logo');

// Fix 2: Next.js config - allow images
const nextConfig = path.join(base, 'next.config.ts');
fs.writeFileSync(nextConfig, `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
`);
console.log('Fixed: next.config.ts for images');

console.log('Done!');