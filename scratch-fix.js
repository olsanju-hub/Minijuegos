const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

// Replace all \` with ` where it is the start or end of a template literal.
// E.g. return \` -> return `
content = content.replace(/return \\`/g, 'return `');
// and \`; -> `;
content = content.replace(/\\`;/g, '`;');
// and = \` -> = `
content = content.replace(/= \\`/g, '= `');
// and ? \` -> ? `
content = content.replace(/\? \\`/g, '? `');
// and : \` -> : `
content = content.replace(/: \\`/g, ': `');

fs.writeFileSync('ui.js', content, 'utf8');
