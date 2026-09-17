import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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
        firstName = '',
        lastName = '',
        bookingId = 'N/A',
        addonsList = [],
        gstRate = 18,
        gstAmount = 0
      } = data;

      // 1. Header (Logo & Company Info)
      const logoPath = path.join(process.cwd(), 'src/assets/Racoonn-Logo-02.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 140 });
      } else {
        doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.brand).text('RACOONN', 50, 45);
      }
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.textDark);
      doc.text('CIELE TRAVELS PRIVATE LIMITED', 50, 90);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.textLight);
      doc.text('GSTIN - 05AAOCC0859Q1Z0', 50, 105);
      doc.text('B-81, Rose Villa, Samiah Lake City, Rudrapur,', 50, 120);
      doc.text('Kichha, Udham Singh Nagar - 263153, Uttarakhand', 50, 135);
      doc.text('Phone: +91 9061****** | Email: support@racoonn.com', 50, 150);

      // Invoice Meta (Right Aligned)
      doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.textDark).text('INVOICE', 350, 45, { align: 'right' });
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 350, 80, { align: 'right' });
      doc.text(`Booking Ref: ${bookingId}`, 350, 95, { align: 'right' });
      doc.text(`Invoice No: INV-12345678`, 350, 110, { align: 'right' });

      // Divider
      doc.moveTo(50, 175).lineTo(545, 175).strokeColor(COLORS.border).lineWidth(1).stroke();

      // 2. Billing & Hotel Details
      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Billed To', 50, 195);
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.textLight).text(`${firstName} ${lastName}`.trim() || 'Guest', 50, 215);
      doc.text(email, 50, 230);

      doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textDark).text('Hotel Details', 300, 195);
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
      
      addonsList.forEach((addon: any) => {
        rowY += 20;
        const addonPrice = Number(addon.price) || 0;
        doc.font('Helvetica').fillColor(COLORS.textLight).text(`Add-on: ${addon.name}`, 300, rowY);
        doc.font('Helvetica').fillColor(COLORS.textDark).text(`INR ${addonPrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });
      });
      
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
      bookingId = 'N/A',
      addonsList = [],
      gstRate = 18,
      gstAmount = 0
    } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 1. Generate PDF Buffer
    const pdfBuffer = await generateInvoicePdf(data);

    // 2. Prepare Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #E86A6F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${firstName || 'Guest'},</p>
          <p>Thank you for booking with Racoonn. Your reservation at <strong>${hotelName}</strong> is confirmed!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #E86A6F;">Booking Details</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotelName} ${hotelLocation ? '(' + hotelLocation + ')' : ''}</p>
            <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
            <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
            <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${nights} Night(s)</p>
            ${addonsList?.length > 0 ? addonsList.map((a: any) => `<p style="margin: 5px 0;"><strong>Add-on (${a.name}):</strong> ₹${(Number(a.price) || 0).toLocaleString("en-IN")}</p>`).join('') : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p style="margin: 5px 0; font-size: 1.1em;"><strong>Total Paid:</strong> ₹${(Number(price) || 0).toLocaleString("en-IN")}</p>
          </div>
          
          <p>Your official invoice has been attached to this email as a PDF document.</p>
          <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
          <p>Safe travels!</p>
          <p><strong>The Racoonn Team</strong></p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Racoonn Bookings" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking Confirmed: ${hotelName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${bookingId || 'Booking'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log("Message sent with invoice attached: %s", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email', details: error.message },
      { status: 500 }
    );
  }
}
