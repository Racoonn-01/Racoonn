const fs = require('fs');
const path = require('path');

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.vscode') continue;
        
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            const c = fs.readFileSync(p, 'utf8');
            if (c.includes('`&output=webp')) {
                fs.writeFileSync(p, c.replace(/`&output=webp/g, '&output=webp`'), 'utf8');
                console.log('Fixed:', p);
            }
        }
    }
}

walk('Admin');
walk('User');
