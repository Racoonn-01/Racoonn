const fs = require('fs');
const path = require('path');

function removeUnoptimizedFromNextConfig(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/\s*unoptimized:\s*true,?\n?/g, '');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function removeUnoptimizedProp(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.vscode') continue;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            removeUnoptimizedProp(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content.replace(/\sunoptimized(\s|>|\/)/g, "$1");
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Removed unoptimized prop from: ${filePath}`);
            }
        }
    }
}

removeUnoptimizedFromNextConfig('User/next.config.ts');
removeUnoptimizedFromNextConfig('Admin/next.config.ts');

removeUnoptimizedProp('User/src');
removeUnoptimizedProp('Admin/src');

console.log("Next.js Image Optimization enabled globally!");
