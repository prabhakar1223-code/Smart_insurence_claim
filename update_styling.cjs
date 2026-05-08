const fs = require('fs');

let content = fs.readFileSync('src/components/admin/ClaimInvestigation.tsx', 'utf-8');

// Primary text color: #FFFFFF
// Secondary text color: #D1D5DB
// Label text: #9CA3AF

// 1. Content Card Background & styling
const cardStyle = `style={{ backgroundColor: '#1F2937', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', marginBottom: '24px' }}`;
const ocrCardStyle = `style={{ backgroundColor: '#111827', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', marginBottom: '24px' }}`;

content = content.replace(/className="bg-gradient-to-br from-slate-900[^"]*shadow-lg"/g, cardStyle);
content = content.replace(/className="bg-gradient-to-br from-blue-50[^"]*sm:p-5"/g, cardStyle);
content = content.replace(/className="bg-gradient-to-br from-emerald-900[^"]*shadow-lg"/g, cardStyle);

// Replace bg-muted/20 divs. The first one is OCR Section, the second is Admin Notes.
// OCR Section Fix: background-color: #111827
let mutedDivs = 0;
content = content.replace(/className="bg-muted\/20 border border-border rounded-xl p-4 sm:p-5"/g, (match) => {
    mutedDivs++;
    if (mutedDivs === 1) return ocrCardStyle; // OCR Section
    return cardStyle; // Admin Notes
});

// Risk score section card
content = content.replace(/className=\{`border-2 rounded-xl p-4 sm:p-5 \$\{risk\.bg\} \$\{risk\.border\}`\}/g, cardStyle);


// 2. Heading styling
// font-size: 24px, font-weight: 700, color: white, add bottom spacing.
const headingStyle = `style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px' }}`;

content = content.replace(/<h3 className="font-semibold text-lg mb-5 flex items-center gap-3 text-white">/g, `<h3 ${headingStyle} className="flex items-center gap-3">`);
content = content.replace(/<h3 className="font-semibold text-sm mb-3 flex items-center gap-2">/g, `<h3 ${headingStyle} className="flex items-center gap-2">`);
content = content.replace(/<h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">/g, `<h3 ${headingStyle} className="flex items-center gap-2">`);
content = content.replace(/<h3 className="font-semibold text-sm flex items-center gap-2 text-white">/g, `<h3 ${headingStyle} className="flex items-center gap-2">`);
content = content.replace(/<h3 className="font-semibold text-lg">\n\s*<span className="text-white font-bold">AI Fraud Analysis & Reasoning<\/span>\n\s*<\/h3>/g, `<h3 ${headingStyle}>AI Fraud Analysis & Reasoning</h3>`);

// 3. Text colors
// Headings: already white.
// Secondary text (#D1D5DB) and Label text (#9CA3AF)
// Let's just blindly replace text-gray-400 and text-gray-300 with exact hex codes or keep them.
content = content.replace(/text-gray-300/g, 'text-[#D1D5DB]');
content = content.replace(/text-gray-400/g, 'text-[#9CA3AF]');
content = content.replace(/text-muted-foreground/g, 'text-[#9CA3AF]');

// 4. Important values: font-weight: 700, font-size: 20px, color: white
const importantValueStyle = `style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF' }}`;
content = content.replace(/<p className="font-bold text-white text-xl flex items-center gap-1">/g, `<p ${importantValueStyle} className="flex items-center gap-1">`);
content = content.replace(/<span className=\{`text-4xl font-black \$\{risk\.text\} leading-none`\}>\{score\}<\/span>/g, `<span ${importantValueStyle}>\{score\}</span>`);
content = content.replace(/<p className="font-bold text-white flex items-center gap-2">/g, `<p ${importantValueStyle} className="flex items-center gap-2">`);
content = content.replace(/<p className="font-mono font-bold text-white text-lg">/g, `<p ${importantValueStyle} className="font-mono">`);
content = content.replace(/<p className="font-bold text-white capitalize">/g, `<p ${importantValueStyle} className="capitalize">`);

// 5. Button styling (Blue primary, Dark secondary, better padding)
// primary button (approve)
content = content.replace(/bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5/g, 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-3');
// Reject button
content = content.replace(/bg-red-600 hover:bg-red-700 text-white px-3 py-2.5/g, 'bg-red-600 hover:bg-red-700 text-white px-5 py-3');
// Mark fraud button
content = content.replace(/bg-gray-800 hover:bg-gray-900 text-white px-3 py-2.5/g, 'bg-gray-800 hover:bg-gray-900 text-white px-5 py-3');
// Save notes button
content = content.replace(/bg-secondary hover:bg-accent text-secondary-foreground px-3 py-2.5/g, 'bg-gray-700 hover:bg-gray-600 text-white px-5 py-3');

// 6. Document Section Fix: Improve empty-state visibility. Icon brighter, text visible.
content = content.replace(/<FileText size=\{32\} className="mx-auto mb-3 text-blue-400\/70" \/>/g, '<FileText size={32} className="mx-auto mb-3 text-[#FFFFFF]" />');
content = content.replace(/<p className="text-sm font-medium text-white mb-1">No documents uploaded<\/p>\n\s*<p className="text-xs text-blue-600\/70 dark:text-blue-400\/70">This claim was submitted without supporting evidence<\/p>/g, '<p style={{color: "#FFFFFF", fontWeight: 700, fontSize: "20px"}}>No documents uploaded</p>\n                  <p style={{color: "#D1D5DB"}}>This claim was submitted without supporting evidence</p>');

// 7. Status Badges:
// Let's modify the getRiskColor to handle pending/approved if they are there, or just adjust risk badges to be rounded and have red/orange/green background.
// Risk badges are currently using things like bg-red-500/15. We will make them solid red/orange/green.
content = content.replace(/bg-red-500\/15 text-red-400 border-red-500\/20/g, 'bg-red-600 text-white border-red-600 rounded-full px-3 py-1');
content = content.replace(/bg-amber-500\/15 text-amber-400 border-amber-500\/20/g, 'bg-orange-500 text-white border-orange-500 rounded-full px-3 py-1');
content = content.replace(/bg-emerald-500\/15 text-emerald-400 border-emerald-500\/20/g, 'bg-green-600 text-white border-green-600 rounded-full px-3 py-1');
content = content.replace(/rounded text-xs/g, 'rounded-full text-xs font-bold');

// 8. Dividers
// Add borders: border-color: rgba(255,255,255,0.08)
content = content.replace(/border-slate-800\/50/g, 'border-[rgba(255,255,255,0.08)]');
content = content.replace(/border-slate-700\/50/g, 'border-[rgba(255,255,255,0.08)]');
content = content.replace(/border-slate-700\/30/g, 'border-[rgba(255,255,255,0.08)]');

fs.writeFileSync('src/components/admin/ClaimInvestigation.tsx', content, 'utf-8');
console.log('Done styling update!');
