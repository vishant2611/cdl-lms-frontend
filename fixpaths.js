const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Crop Defender\\CDL-Projects\\cdl-lms-frontend';

const fixes = [
  ['app/dashboard/page.tsx', '../../'],
  ['app/dashboard/layout.tsx', '../../'],
  ['app/dashboard/courses/page.tsx', '../../../'],
  ['app/dashboard/leaderboard/page.tsx', '../../../'],
  ['app/dashboard/compliance/page.tsx', '../../../'],
  ['app/dashboard/certificates/page.tsx', '../../../'],
  ['app/dashboard/announcements/page.tsx', '../../../'],
  ['app/dashboard/learning-paths/page.tsx', '../../../'],
  ['app/dashboard/instructor/page.tsx', '../../../'],
  ['app/dashboard/manager/page.tsx', '../../../'],
  ['app/dashboard/admin/page.tsx', '../../../'],
];

fixes.forEach(([f, prefix]) => {
  const fp = path.join(base, f);
  if (fs.existsSync(fp)) {
    let c = fs.readFileSync(fp, 'utf8');
    c = c.replace(/from ['"][.\/]*lib\/api['"]/g, "from '" + prefix + "lib/api'");
    c = c.replace(/from ['"][.\/]*store\/authStore['"]/g, "from '" + prefix + "store/authStore'");
    fs.writeFileSync(fp, c);
    console.log('Fixed: ' + f);
  }
});
console.log('All done!');