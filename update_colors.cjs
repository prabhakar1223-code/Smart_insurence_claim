const fs = require('fs');

let content = fs.readFileSync('src/components/admin/ClaimInvestigation.tsx', 'utf-8');

// 1. Overlay
content = content.replace(/rgba\(0, 0, 0, 0\.88\)/g, 'rgba(15, 23, 42, 0.75)');

// 2. Modal Background & OCR Card Background
content = content.replace(/backgroundColor: '#111827'/g, "backgroundColor: '#161B26'");

// 3. Header background
content = content.replace(/bg-gradient-to-b from-\[#0B1220\] to-\[#0f172a\]\/95/g, 'bg-[#161B26]');

// 4. Card Backgrounds
content = content.replace(/backgroundColor: '#1F2937'/g, "backgroundColor: '#1D2331'");

// 5. Borders
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.08\)'/g, "border: '1px solid rgba(255,255,255,0.05)'");
content = content.replace(/border-\[rgba\(255,255,255,0\.08\)\]/g, "border-[rgba(255,255,255,0.05)]");

// 6. Shadows
content = content.replace(/boxShadow: '0 8px 20px rgba\(0,0,0,0\.25\)'/g, "boxShadow: '0 4px 15px rgba(0,0,0,0.15)'");
content = content.replace(/boxShadow: '0 25px 50px rgba\(0,0,0,0\.6\)'/g, "boxShadow: '0 15px 40px rgba(0,0,0,0.3)'");

// 7. Text colors
content = content.replace(/#9CA3AF/g, "8A9BB3");
content = content.replace(/#D1D5DB/g, "A0AEC0");

fs.writeFileSync('src/components/admin/ClaimInvestigation.tsx', content, 'utf-8');
console.log('Done adjusting colors!');
