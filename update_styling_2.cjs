const fs = require('fs');

let content = fs.readFileSync('src/components/admin/ClaimInvestigation.tsx', 'utf-8');

// Update getRiskColor for High Risk, Medium Risk, Low Risk (which maps to red, orange, green badges)
// "Use rounded badges"
// We also need to map Pending to orange, Approved to green. Wait, risk uses score, status uses claim.status.
// Let's modify the Risk Level rendering in the header.
// Risk Level is rendered as: <span className="text-gray-500">Risk Level: {risk.label}</span>
// Let's render a proper badge for Risk Level and add Status badge.

content = content.replace(
  /<span className="text-gray-500">Risk Level: \{risk\.label\}<\/span>/,
  `
  <span className="text-gray-500">Risk Level: </span>
  <span className={\`px-3 py-1 rounded-full text-xs font-bold text-white \${score >= 70 ? 'bg-red-600' : score >= 30 ? 'bg-orange-500' : 'bg-green-600'}\`}>
    {risk.label}
  </span>
  <span className="text-gray-600">•</span>
  <span className="text-gray-500">Status: </span>
  <span className={\`px-3 py-1 rounded-full text-xs font-bold text-white \${(claim.status || '').toUpperCase() === 'APPROVED' ? 'bg-green-600' : (claim.status || '').toUpperCase() === 'REJECTED' ? 'bg-red-600' : 'bg-orange-500'}\`}>
    {claim.status || 'PENDING'}
  </span>
  `
);

// We need to change Label text to #9CA3AF (medium gray) in Section A and OCR Summary
// My previous script replaced text-gray-300 with #D1D5DB which made the labels #D1D5DB.
// Let's replace text-[#D1D5DB] with text-[#9CA3AF] for the small labels.
content = content.replace(/<p className="text-xs text-\[#D1D5DB\] mb-1\.5">/g, '<p className="text-xs text-[#9CA3AF] mb-1.5">');
// And OCR Summary
content = content.replace(/<p className="text-xs text-\[#D1D5DB\]">/g, '<p className="text-xs text-[#9CA3AF]">');
// Description label
content = content.replace(/<p className="text-sm font-bold text-\[#D1D5DB\] mb-2">Description<\/p>/, '<p className="text-sm font-bold text-[#9CA3AF] mb-2">Description</p>');

// Status block in Section A
// We will add a Status block right after Submitted.
const statusBlock = `
                <div className="bg-slate-800/30 border border-[rgba(255,255,255,0.08)] rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                  <p className="text-xs text-[#9CA3AF] mb-1.5">Status</p>
                  <p style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF' }} className="capitalize">{claim.status || 'Pending'}</p>
                </div>
`;
content = content.replace(/(<div className="bg-slate-800\/30 border border-\[rgba\(255,255,255,0\.08\)\] rounded-xl p-4 hover:border-pink-500\/30 transition-colors">\s*<p className="text-xs text-\[#9CA3AF\] mb-1\.5">Submitted<\/p>\s*<p style=\{\{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF' \}\} className="flex items-center gap-2"><Calendar size=\{16\} className="text-pink-400" \/> \{claim\.submittedDate \? new Date\(claim\.submittedDate\)\.toLocaleDateString\(\) : 'N\/A'\}<\/p>\s*<\/div>)/, `$1\n${statusBlock}`);

// Fix Button Padding
content = content.replace(/px-3 py-2\.5/g, 'px-5 py-3');

fs.writeFileSync('src/components/admin/ClaimInvestigation.tsx', content, 'utf-8');
console.log('Done additional styling updates!');
