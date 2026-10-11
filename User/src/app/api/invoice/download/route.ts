import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Client, Databases, Query } from "node-appwrite";

const COLORS = {
  textDark: '#1F2937',
  textLight: '#6B7280',
  brand: '#E11D48',
  border: '#E5E7EB',
  bgLight: '#F9FAFB'
};

function generateInvoicePdf(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const {
        hotelName = 'Racoonn Hotel',
        hotelLocation = '',
        price = 0,
        nights = 1,
        checkIn = 'N/A',
        checkOut = 'N/A',
        adults = 1,
        email = '',
        firstName = 'Guest',
        lastName = '',
        bookingId = 'N/A',
        addonsList = [],
        gstRate = 18,
        gstAmount = 0,
        isPackage = false
      } = data;

      // 1. Header (Logo & Company Info)
      const logoPath = path.join(process.cwd(), 'src/assets/Racoonn-Logo-02.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 140 });
      } else {
        doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.brand).text('RACOONN', 50, 45);
      }
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textDark);
      doc.text('CIELLE TRAVELS PRIVATE LIMITED', 50, 90);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);
      doc.text('GSTIN - 05AAOCC0859Q1Z0', 50, 105);
      doc.text('B-81, Rose Villa, Samiah Lake City, Rudrapur,', 50, 120);
      doc.text('Kichha, Udham Singh Nagar - 263153, Uttarakhand', 50, 135);
      doc.text('Phone: +91 8954442144 | Email: support@racoonn.com', 50, 150);

      // Invoice Meta (Right Aligned)
      doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.textDark).text('INVOICE', 350, 45, { align: 'right' });
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 350, 80, { align: 'right' });
      doc.text(`Booking Ref: ${bookingId.substring(0, 8).toUpperCase()}`, 350, 95, { align: 'right' });
      
      const invoiceNo = data.invoiceNumber || `INV-${bookingId.substring(0, 8).toUpperCase()}`;
      doc.text(`Invoice No: ${invoiceNo}`, 350, 110, { align: 'right' });

      // Divider
      doc.moveTo(50, 175).lineTo(545, 175).strokeColor(COLORS.border).lineWidth(1).stroke();

      // 2. Billing & Hotel Details
      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Billed To', 50, 195);
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text(`${firstName} ${lastName}`.trim() || 'Guest', 50, 215);
      if (email) doc.text(email, 50, 230);

      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text(isPackage ? 'Package Details' : 'Hotel Details', 300, 195);
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text(hotelName, 300, 215, { width: 245 });
      if (hotelLocation) {
        doc.text(hotelLocation, 300, doc.y + 2, { width: 245 });
      }

      // 3. Stay Details Table
      const tableY = 285;
      doc.roundedRect(50, tableY, 495, 30, 4).fill(COLORS.bgLight);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textDark);
      doc.text('Description', 60, tableY + 10);
      doc.text('Details', 300, tableY + 10);

      // Table Row
      let rowY = tableY + 45;
      doc.font('Helvetica').fillColor(COLORS.textDark);
      
      if (isPackage) {
        doc.text('Starting Date', 60, rowY);
        doc.text(checkIn, 300, rowY);
        rowY += 20;

        doc.text('Duration', 60, rowY);
        doc.text(`${nights} Night(s)`, 300, rowY);
        rowY += 20;

        doc.text('Guests', 60, rowY);
        doc.text(`${adults} Adult(s)`, 300, rowY);
        rowY += 30;
      } else {
        doc.text('Check-In Date', 60, rowY);
        doc.text(checkIn, 300, rowY);
        rowY += 20;
        
        doc.text('Check-Out Date', 60, rowY);
        doc.text(checkOut, 300, rowY);
        rowY += 20;

        doc.text('Duration', 60, rowY);
        doc.text(`${nights} Night(s)`, 300, rowY);
        rowY += 20;

        doc.text('Guests', 60, rowY);
        doc.text(`${adults} Adult(s)`, 300, rowY);
        rowY += 30;
      }
      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor(COLORS.border).stroke();

      // 4. Financial Breakdown
      const addonsTotal = addonsList.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      
      // Calculate base price properly
      const basePrice = price - addonsTotal - gstAmount;

      rowY += 30;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Financial Breakdown', 60, rowY);
      
      // Breakdown Table (Right Aligned)
      rowY += 25;
      const safeBasePrice = Number(basePrice) || 0;
      doc.font('Helvetica').fillColor(COLORS.textLight).text('Base Price (Excl. GST):', 300, rowY);
      doc.font('Helvetica').fillColor(COLORS.textDark).text(`INR ${safeBasePrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });
      
      if (!isPackage) {
        addonsList.forEach((addon: any) => {
          rowY += 20;
          const addonPrice = Number(addon.price) || 0;
          doc.font('Helvetica').fillColor(COLORS.textLight).text(`Add-on: ${addon.name}`, 300, rowY);
          doc.font('Helvetica').fillColor(COLORS.textDark).text(`INR ${addonPrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });
        });
      }
      
      rowY += 20;
      const safeGstAmount = Number(gstAmount) || 0;
      doc.font('Helvetica').fillColor(COLORS.textLight).text(`GST (${gstRate}%):`, 300, rowY);
      doc.font('Helvetica').fillColor(COLORS.textDark).text(`INR ${safeGstAmount.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });
      
      // Total Line
      rowY += 15;
      doc.moveTo(300, rowY).lineTo(545, rowY).strokeColor(COLORS.border).stroke();
      
      rowY += 15;
      doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.brand).text('Total Paid:', 300, rowY);
      const safePrice = Number(price) || 0;
      doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.textDark).text(`INR ${safePrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });

      // 5. Footer
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(COLORS.border).stroke();
      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Thank you for booking with Racoonn!', 50, footerY + 15, { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight).text('This is a computer-generated invoice and does not require a physical signature.', 50, footerY + 30, { align: 'center' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (data.bookingId && !data.invoiceNumber) {
      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
          .setKey(process.env.APPWRITE_API_KEY || "");
        
        const databases = new Databases(client);
        const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
        const collId = process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "bookings";

        const bookingDoc = await databases.getDocument(dbId, collId, data.bookingId);
        
        const response = await databases.listDocuments(dbId, collId, [
          Query.lessThanEqual('$createdAt', bookingDoc.$createdAt),
          Query.limit(1)
        ]);
        
        data.invoiceNumber = `INV-${response.total.toString().padStart(3, '0')}`;
      } catch (err) {
        console.error("Failed to generate serial invoice number:", err);
      }
    }

    const pdfBuffer = await generateInvoicePdf(data);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${data.bookingId || 'Download'}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
