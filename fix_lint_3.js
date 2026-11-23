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

// User/src/components/shared/Navbar.tsx
modifyFile('User/src/components/shared/Navbar.tsx', (content) => {
    let s = content.replace(/setIsAuthModalOpen\(true\);/g, "setTimeout(() => setIsAuthModalOpen(true), 0);");
    return s;
});

// User/src/components/search/FilterModal.tsx
modifyFile('User/src/components/search/FilterModal.tsx', (content) => {
    let s = content.replace(/setSelectedAmenities\(initialFilters\?\.selectedAmenities \?\? \[\]\);/g, "setTimeout(() => setSelectedAmenities(initialFilters?.selectedAmenities ?? []), 0);");
    return s;
});

// Footer.tsx (fix ShieldCheck)
modifyFile('User/src/components/shared/Footer.tsx', (content) => {
    let s = content.replace(/ShieldCheck,\s*/g, "");
    return s;
});

