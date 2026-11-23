const fs = require('fs');
const path = require('path');

const dirs = ['Admin', 'User', 'Vendor', 'AppUser', 'Backend', '.'];

// Updated regex to include ${} characters
const regex = /(https:\/\/[a-zA-Z0-9.-]*appwrite\.io\/v1\/storage\/buckets\/[a-zA-Z0-9_$-{}]+\/files\/[a-zA-Z0-9_$-{}]+)\/view(\?project=[a-zA-Z0-9_$-{}]+)/g;

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.vscode' || file === 'cloudflare-workers') continue;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json') || filePath.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;

            if (regex.test(content)) {
                newContent = newContent.replace(regex, "$1/preview$2&output=webp");
            }
            
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated URLs in: ${filePath}`);
            }
        }
    }
}

dirs.forEach(walk);
console.log("Done updating hardcoded URLs.");
