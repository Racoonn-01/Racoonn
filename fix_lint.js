const fs = require('fs');
const path = require('path');

const basePath = '/Users/haldwani/Documents/Working/Working/Racoonn';

function modifyFile(relPath, replacer) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) {
        console.error("Not found:", fullPath);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log("Updated", relPath);
    }
}

// AdminSidebar
modifyFile('Admin/src/components/layout/AdminSidebar.tsx', (content) => {
    let s = content.replace(/setIsMounted\(true\);/, 'setTimeout(() => setIsMounted(true), 0);');
    s = s.replace(/BarChart3,\s*/g, '');
    s = s.replace(/Bell,\s*/g, '');
    s = s.replace(/Tent,\s*/g, '');
    return s;
});

// CMSSidebar
modifyFile('Admin/src/components/layout/CMSSidebar.tsx', (content) => {
    return content.replace(/LayoutDashboard,\s*/g, '');
});

// DynamicPopularStays
modifyFile('User/src/components/home/DynamicPopularStays.tsx', (content) => {
    let s = content.replace(/let propertyPriceMap/g, 'const propertyPriceMap');
    s = s.replace(/Star,\s*/g, '');
    s = s.replace(/const res = await/g, 'await');
    return s;
});

// TourPackages
modifyFile('User/src/components/home/TourPackages.tsx', (content) => {
    let s = content.replace(/pkg: any/g, 'pkg: unknown');
    s = s.replace(/\(pkg: any\)/g, '(pkg: unknown)');
    return s;
});

// Navbar
modifyFile('User/src/components/shared/Navbar.tsx', (content) => {
    let s = content.replace(/setAuthModalView\('signin'\);/g, "setTimeout(() => setAuthModalView('signin'), 0);");
    s = s.replace(/z-\[9999\]/g, 'z-9999');
    return s;
});

// contact page
modifyFile('User/src/app/contact/page.tsx', (content) => {
    return content.replace(/radial-gradient\(circle_at_center,_var/g, 'radial-gradient(circle_at_center,var');
});

// help page
modifyFile('User/src/app/help/page.tsx', (content) => {
    let s = content.replace(/BookOpen,\s*/g, '');
    s = s.replace(/Link,\s*/g, '');
    s = s.replace(/import Link from 'next\/link';\n/g, '');
    return s;
});

// packages/[id]/page.tsx
modifyFile('User/src/app/packages/[id]/page.tsx', (content) => {
    let s = content.replace(/bg-\[#1F2E4A\]/g, 'bg-brand-navy');
    s = s.replace(/z-\[100\]/g, 'z-100');
    s = s.replace(/z-\[110\]/g, 'z-110');
    return s;
});

// PopularStaysDehradun
modifyFile('User/src/components/home/PopularStaysDehradun.tsx', (content) => {
    return content.replace(/Star,\s*/g, '');
});

// PopularStaysNainital
modifyFile('User/src/components/home/PopularStaysNainital.tsx', (content) => {
    return content.replace(/Star,\s*/g, '');
});

// TourCard
modifyFile('User/src/components/packages/TourCard.tsx', (content) => {
    let s = content.replace(/flex-grow/g, 'grow');
    s = s.replace(/h-\[1px\]/g, 'h-px');
    return s;
});

// RoomListWithAvailability
modifyFile('User/src/components/property/RoomListWithAvailability.tsx', (content) => {
    let s = content.replace(/ShieldCheck,\s*/g, '');
    s = s.replace(/Utensils,\s*/g, '');
    s = s.replace(/const guestsPerRoom =/g, '// const guestsPerRoom =');
    s = s.replace(/<img(.*?)src=/g, '<Image$1src='); // Naive replacement, will check carefully
    return s;
});

// Footer
modifyFile('User/src/components/shared/Footer.tsx', (content) => {
    let s = content.replace(/Mail,\s*/g, '');
    s = s.replace(/Send,\s*/g, '');
    s = s.replace(/Navigation,\s*/g, '');
    s = s.replace(/Heart,\s*/g, '');
    s = s.replace(/ShieldCheck,\s*/g, '');
    s = s.replace(/h-\[38px\]/g, 'h-9.5');
    // For images, we should be careful. 
    return s;
});

// ProgressSidebar
modifyFile('Vendor/components/onboarding/ProgressSidebar.tsx', (content) => {
    return content.replace(/bg-gradient-to-b/g, 'bg-linear-to-b');
});

// Step10Review
modifyFile('Vendor/components/onboarding/Step10Review.tsx', (content) => {
    return content.replace(/flex-shrink-0/g, 'shrink-0');
});

