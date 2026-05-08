import re

with open('src/components/admin/ClaimInvestigation.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace heading: Fraud Investigation Dashboard
content = re.sub(r'<h2 className="[^"]*bg-gradient-to-r[^"]*">', '<h2 className="text-xl sm:text-2xl font-bold text-white">', content)

# Replace Subtext text-gray-400 with text-gray-300
content = content.replace('text-gray-400', 'text-gray-300')
content = content.replace('text-gray-500', 'text-gray-400')
content = content.replace('text-muted-foreground', 'text-gray-300')
content = content.replace('text-blue-700 dark:text-blue-300', 'text-white')

# AI Fraud Analysis & Reasoning heading
content = content.replace('<span className={risk.text}>AI Fraud Analysis & Reasoning</span>', '<span className="text-white font-bold">AI Fraud Analysis & Reasoning</span>')
content = content.replace('<Shield size={22} className={risk.text} />', '<Shield size={22} className="text-white" />')

# Uploaded Evidence heading text-blue-500 -> text-white
content = content.replace('<FileText size={18} className="text-blue-500" />', '<FileText size={18} className="text-white" />')

# OCR Extracted Data heading
content = content.replace('<h3 className="font-semibold text-sm flex items-center gap-2">\n                  <FileSearch size={16} />\n                  📊 OCR Extracted Data & Analysis', '<h3 className="font-semibold text-sm flex items-center gap-2 text-white">\n                  <FileSearch size={16} className="text-white" />\n                  📊 OCR Extracted Data & Analysis')

# Risk Factor Breakdown heading
content = content.replace('<h4 className="text-sm font-bold mb-3 flex items-center gap-2">\n                      <BarChart size={16} className={risk.text} /> Risk Factor Breakdown', '<h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-white">\n                      <BarChart size={16} className="text-white" /> Risk Factor Breakdown')

# What This Score Means heading
content = content.replace('<h4 className="text-sm font-bold mb-2 flex items-center gap-2">\n                      <Info size={16} className={risk.text} /> What This Score Means', '<h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-white">\n                      <Info size={16} className="text-white" /> What This Score Means')

# Additional Risk Indicators
content = content.replace('<h4 className="text-sm font-bold mb-3">Additional Risk Indicators</h4>', '<h4 className="text-sm font-bold mb-3 text-white">Additional Risk Indicators</h4>')

with open('src/components/admin/ClaimInvestigation.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
