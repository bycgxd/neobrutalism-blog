const fs = require('fs');

const text = fs.readFileSync('/Users/bycg/Downloads/neobrutalism-personal-blog/afile/SPP_司法解释二_医药分析.json', 'utf8');
let json = JSON.parse(text);

if (Array.isArray(json)) {
  json = json[0];
}

const formatForQuill = (str) => {
  if (!str) return '';
  return str.split('\n').map(p => p ? `<p>${p}</p>` : '<p><br></p>').join('');
};

const mappedData = {
  title: json.title || json.name || '',
  summary: json.summary || json.desc || '',
  content: formatForQuill(json.content || json.text || ''),
  date: json.publish_date || json.date || new Date().toISOString().split('T')[0],
  aiAnalysis: formatForQuill(json.ai_analysis || json.aiAnalysis || ''),
  tags: json.tags || json.category || '',
};

console.log(mappedData);
