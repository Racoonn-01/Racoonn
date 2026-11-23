const fs = require('fs');
const path = require('path');

const basePath = '/Users/haldwani/Documents/Working/Working/Racoonn';

function modifyFile(relPath, replacer) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log("Updated", relPath);
    }
}

// User/src/app/about/page.tsx
modifyFile('User/src/app/about/page.tsx', (content) => {
    let s = content.replace(/"A team that travels together, understands travelers better."/g, '&quot;A team that travels together, understands travelers better.&quot;');
    s = s.replace(/we're/g, 'we&apos;re');
    s = s.replace(/<img(.*?)>/g, '<Image$1 width={400} height={300} alt="Image" />');
    return s;
});

// User/src/components/shared/Footer.tsx
modifyFile('User/src/components/shared/Footer.tsx', (content) => {
    let s = content.replace(/<img(.*?)>/g, '<Image$1 width={140} height={40} alt="Badge" />');
    return s;
});

// User/src/components/property/RoomListWithAvailability.tsx
modifyFile('User/src/components/property/RoomListWithAvailability.tsx', (content) => {
    let s = content.replace(/<Image(.*?)src=(.*?)\/>/g, '<Image$1src=$2 width={800} height={600} alt="Room image" />');
    return s;
});

// TourPackages.tsx
modifyFile('User/src/components/home/TourPackages.tsx', (content) => {
    let s = content.replace(/pkg: any/g, 'pkg: unknown');
    return s;
});

