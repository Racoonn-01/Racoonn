const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files containing Sparkles
const result = execSync('grep -rl "Sparkles" /Users/haldwani/Documents/Working/Working/Racoonn').toString().trim().split('\n');

for (const file of result) {
  if (file && fs.existsSync(file) && !file.includes('node_modules') && !file.includes('.next')) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Sparkles with Zap
    content = content.replace(/Sparkles/g, 'Zap');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced in ${file}`);
  }
}
