import PDFDocument from 'pdfkit';
import fs from 'fs';

const COLORS = {
  brand: '#E11D48',
  lightBg: '#FFF0F3',
  darkText: '#111827',
  grayText: '#6B7280',
  white: '#FFFFFF',
  line: '#FEE2E2',
};

const ICONS = {
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-7-7h5v5h-5z',
  document: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  bed: 'M20 10V7A2 2 0 0018 5H6A2 2 0 004 7v3H3v7h1.5v-2h15v2H21v-7h-1zm-9 0H6V7h5v3zm7 0h-5V7h5v3z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z',
  moon: 'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8C12.51 3.06 12.26 3 12 3z',
  wallet: 'M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0022 15V9a2 2 0 00-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z',
  users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.96.3 1.34.3c3.02 0 4.13-2.12 5.17-4.14A11.02 11.02 0 0 0 17 8zm-4.32 7.03C11.83 16.66 11.06 18 8 18c-.28 0-.58-.04-.88-.11l1.52-3.67c1.37-1.16 2.53-2.57 3.57-4.17c.56 1.83 1.1 3.54.47 5.03z'
};

function drawIcon(doc: any, path: string, x: number, y: number, color: string, scale = 1) {
  doc.save()
     .translate(x, y)
     .scale(scale)
     .path(path)
     .fill(color)
     .restore();
}

try {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(fs.createWriteStream('test.pdf'));
  
  // Header
  doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.brand).text('RACOONN', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.grayText).text('Racoonn Booking Platform', 50, 85);
  doc.text('support@racoonn.com | www.racoonn.com', 50, 100);
  
  doc.fontSize(14).font('Helvetica-Oblique').fillColor(COLORS.grayText).text('Stay More', 400, 60, { align: 'right' });
  doc.fontSize(22).font('Helvetica-BoldOblique').fillColor(COLORS.brand).text('Explore More', 350, 75, { align: 'right' });
  
  doc.end();
  console.log("PDF created successfully");
} catch (e) {
  console.error("PDF generation failed:", e);
}
