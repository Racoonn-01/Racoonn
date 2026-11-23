const fs = require('fs');
const path = require('path');

function wrapImageSrc(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.vscode') continue;
        
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            wrapImageSrc(p);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            let content = fs.readFileSync(p, 'utf8');
            let newContent = content;
            
            // Only apply if it imports Image and uses it
            if (content.includes('next/image') && !content.includes('optimizeAppwriteImage')) {
                // Find all <Image src={VAR} or <Image src={`...`}
                // We'll replace `src={` or `src={var}` with `src={optimizeAppwriteImage(...)`
                // Regex: src=\{([^}]+)\} where it's inside an Image tag. 
                // A safer regex: <Image[^>]*\bsrc=\{([^}]+)\}[^>]*>
                
                // Let's just do a simpler search/replace for specific patterns.
                // Actually, the easiest way is just to add the optimizeAppwriteImage import and wrap any dest.image
                
                newContent = content.replace(/(src=\{)([^}]*)(\})/g, (match, p1, p2, p3) => {
                    // Avoid wrapping if it's already wrapped or if it's a static string literal
                    if (p2.includes('optimizeAppwriteImage') || (p2.startsWith('"') && p2.endsWith('"')) || (p2.startsWith("'") && p2.endsWith("'"))) {
                        return match;
                    }
                    return `${p1}optimizeAppwriteImage(${p2})${p3}`;
                });
                
                if (newContent !== content) {
                    newContent = `import { optimizeAppwriteImage } from "@/lib/optimizeImage";\n` + newContent;
                    fs.writeFileSync(p, newContent, 'utf8');
                    console.log('Wrapped src in:', p);
                }
            }
        }
    }
}

wrapImageSrc('User/src/components');
