const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('e:/Racoonn/User/src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(f => {
  if (f.replace(/\\/g, '/').includes('/lib/utils.ts')) return;
  
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('generatePropertySlug') && !c.includes('import { generatePropertySlug }')) {
    if (c.startsWith('"use client";')) {
      c = c.replace('"use client";', '"use client";\nimport { generatePropertySlug } from "@/lib/utils";');
    } else if (c.startsWith("'use client';")) {
      c = c.replace("'use client';", "'use client';\nimport { generatePropertySlug } from \"@/lib/utils\";");
    } else {
      c = 'import { generatePropertySlug } from "@/lib/utils";\n' + c;
    }
    fs.writeFileSync(f, c);
    console.log('Added import to ' + f);
  }
});
