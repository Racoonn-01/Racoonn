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
  let c = fs.readFileSync(f, 'utf8');
  let modified = false;

  // Match href={`/property/${variable}`}
  const regex = /href=\{\`\/property\/\$\{([^}]+)\}\`\}/g;
  
  if (c.match(regex)) {
    c = c.replace(regex, (match, p1) => {
      const nameField = p1.replace(/\.\$id|\.id/, '.title') + ' || ' + p1.replace(/\.\$id|\.id/, '.propertyName') + ' || ""';
      return 'href={`/property/${generatePropertySlug(' + p1 + ', ' + nameField + ')}`}';
    });
    
    if (!c.includes('generatePropertySlug')) {
      c = 'import { generatePropertySlug } from "@/lib/utils";\n' + c;
    }
    modified = true;
  }
  
  // Also match URL strings like url: `${baseUrl}/property/${property.$id}`
  const regexUrl = /url: \`\$\{baseUrl\}\/property\/\$\{([^}]+)\}\`/g;
  if (c.match(regexUrl)) {
    c = c.replace(regexUrl, (match, p1) => {
      const nameField = p1.replace(/\.\$id|\.id/, '.title') + ' || ' + p1.replace(/\.\$id|\.id/, '.propertyName') + ' || ""';
      return 'url: `${baseUrl}/property/${generatePropertySlug(' + p1 + ', ' + nameField + ')}`';
    });
    if (!c.includes('generatePropertySlug')) {
      c = 'import { generatePropertySlug } from "@/lib/utils";\n' + c;
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, c);
    console.log('Updated ' + f);
  }
});
