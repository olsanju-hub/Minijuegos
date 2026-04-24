const fs = require('fs');
let content = fs.readFileSync('ui.js', 'utf8');

// The original renderResult starts at 1077 or similar, and ends right before function getGame(id) or something similar.
// Wait, actually, let me just find all `function renderResult(vm) {`
const matches = content.split('  function renderResult(vm) {');
if (matches.length === 3) {
  // It means there are two. We want to keep the FIRST one (which was injected by my script above renderRules... wait, no my script injected renderResult AFTER renderRules).
  // Actually, I'll just use Regex to remove the second renderResult up to the next function.
  content = content.replace(/  function renderResult\(vm\) \{[\s\S]*?    `;\n  \}\n\n  function bindEvents/, '  function bindEvents');
  fs.writeFileSync('ui.js', content, 'utf8');
  console.log("Cleaned up duplicate renderResult.");
} else {
  console.log("No duplicate found or regex didn't work. matches: " + matches.length);
}
