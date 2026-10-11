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
            let newContent = c;
            
            // Match any trailing &output=webp that fell outside a backtick, optionally with a semicolon or other chars
            // e.g. `...`;&output=webp or `...`&output=webp
            // We want to move &output=webp inside the backtick.
            
            // Regex to find: ` (some string not containing backticks) ` (maybe some chars like ;) &output=webp
            // Actually, just find `&output=webp` or `;&output=webp` and fix them.
            
            newContent = newContent.replace(/`&output=webp/g, '&output=webp`');
            newContent = newContent.replace(/`;&output=webp/g, '&output=webp`;');
            newContent = newContent.replace(/`\n\s*&output=webp/g, '&output=webp`\n');
            newContent = newContent.replace(/',\n\s*&output=webp/g, '&output=webp\',');
            
            // Also handle any other weird cases by just finding output=webp that is outside
            // A more general regex: /`([^`]*?)`([^`]*?)&output=webp/g
            // But let's just stick to the specific ones we know.
            
            if (newContent !== c) {
                fs.writeFileSync(p, newContent, 'utf8');
                console.log('Fixed:', p);
            }
        }
    }
}

walk('Admin');
walk('User');
