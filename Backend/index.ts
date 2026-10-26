import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Client, Databases, Query } from 'node-appwrite';
import PDFDocument from 'pdfkit';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationDocument,
  getUserPreferences,
  updateUserPreferences,
  sendBookingConfirmationPush,
  sendVendorNewBookingAlert,
} from './services/pushNotificationService';
import { startRemindersScheduler, runBookingRemindersJob } from './cron/remindersCron';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5005);

app.use(cors());
app.use(express.json());

interface OtpRecord {
    code: string;
    expiresAt: number;
    lastSentAt: number;
    attempts: number;
}

interface RequestLimitRecord {
    count: number;
    firstRequestTime: number;
}

const otpStore = new Map<string, OtpRecord>();
const requestLimits = new Map<string, RequestLimitRecord>();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Racoonn Backend is running!' });
});

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials are not configured');
    }

    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

app.post('/api/payments/razorpay/order', async (req, res) => {
    try {
        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'A valid payment amount is required.' });
        }

        const order = await getRazorpayClient().orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcn_${Date.now()}`,
            notes: {
                bookingType: String(req.body.bookingType || 'stay'),
                bookingId: String(req.body.bookingId || ''),
            },
        });

        return res.status(201).json({ order });
    } catch (error) {
        console.error('Failed to create Razorpay order:', error);
        return res.status(500).json({ error: 'Unable to start the payment.' });
    }
});

app.post('/api/payments/razorpay/verify', (req, res) => {
    try {
        const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

        if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_SECRET) {
            return res.status(400).json({ error: 'Payment verification details are missing.' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');
        const signatureBuffer = Buffer.from(String(signature), 'utf8');
        const isValid = expectedSignatureBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(
            expectedSignatureBuffer,
            signatureBuffer
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Payment signature verification failed.' });
        }

        return res.json({ verified: true, paymentId, orderId });
    } catch (error) {
        console.error('Failed to verify Razorpay payment:', error);
        return res.status(500).json({ error: 'Unable to verify the payment.' });
    }
});

app.post('/api/otp/send', async (req, res) => {
    try {
        const { method, identifier } = req.body;
        if (!method || !identifier) {
            return res.status(400).json({ error: 'Method and identifier required' });
        }

        const now = Date.now();

        // 1. Rate Limit: Check resend cooldown (60 seconds)
        const existingOtp = otpStore.get(identifier);
        if (existingOtp && (now - existingOtp.lastSentAt) < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (now - existingOtp.lastSentAt)) / 1000);
            return res.status(429).json({ 
                error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` 
            });
        }

        // 2. Rate Limit: Max requests per identifier window (5 requests per 15 mins)
        const limitWin = 15 * 60 * 1000;
        const userLimit = requestLimits.get(identifier) || { count: 0, firstRequestTime: now };
        if (now - userLimit.firstRequestTime > limitWin) {
            userLimit.count = 1;
            userLimit.firstRequestTime = now;
        } else {
            userLimit.count += 1;
        }
        requestLimits.set(identifier, userLimit);

        if (userLimit.count > 5) {
            return res.status(429).json({ 
                error: 'Too many OTP requests. Please try again after 15 minutes.' 
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 5 min validity, reset attempt counter
        otpStore.set(identifier, {
            code: otp,
            expiresAt: now + 5 * 60 * 1000,
            lastSentAt: now,
            attempts: 0
        });

        if (method === 'email') {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: false,
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            const templatePath = path.join(__dirname, 'templates/emails/verification-code.html');
            let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
            htmlTemplate = htmlTemplate.replace('731924', otp);
            
            await transporter.sendMail({
                from: '"Racoonn" <support@racoonn.com>',
                to: identifier,
                subject: `Verify Your Email - ${otp}`,
                html: htmlTemplate,
            });
            console.log(`Email OTP ${otp} sent to ${identifier}`);
        } else {
            console.log(`Mock SMS OTP ${otp} sent to ${identifier}`);
        }

        res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/otp/verify', (req, res) => {
    const { identifier, code } = req.body;
    const stored = otpStore.get(identifier);

    if (!stored) {
        return res.status(400).json({ error: 'No OTP found or it has expired.' });
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check failed attempts limit (max 3 allowed)
    if (stored.attempts >= 3) {
        otpStore.delete(identifier);
        return res.status(429).json({ 
            error: 'Maximum verification attempts exceeded. Please request a new OTP.' 
        });
    }

    if (stored.code === code) {
        otpStore.delete(identifier);
        return res.json({ success: true, message: 'Verified successfully.' });
    } else {
        stored.attempts += 1;
        const remaining = 3 - stored.attempts;
        if (remaining <= 0) {
            otpStore.delete(identifier);
            return res.status(400).json({ 
                error: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.' 
            });
        }
        return res.status(400).json({ 
            error: `Invalid OTP code. ${remaining} attempt(s) remaining.` 
        });
    }
});

// --------------------------------------------------------------------------
// Invoice PDF & Booking Confirmation Email Engine
// --------------------------------------------------------------------------

const INVOICE_COLORS = {
  textDark: '#1F2937',
  textLight: '#6B7280',
  brand: '#E11D48',
  border: '#E5E7EB',
  bgLight: '#F9FAFB'
};

function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || process.env.SMTP_USERNAME || 'info@racoonn.com';
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'Info@321-Preet';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getAppwriteAdminDb() {
  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';
  const apiKey = process.env.APPWRITE_API_KEY || '';
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  return {
    db: new Databases(client),
    dbId: process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963',
  };
}

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
        gstAmount = 0,
        isPackage = false
      } = data;

      // 1. Header (Logo & Company Info)
      const possibleLogoPaths = [
        path.join(__dirname, 'assets/Racoonn-Logo-02.png'),
        path.join(__dirname, '../User/src/assets/Racoonn-Logo-02.png'),
        path.join(process.cwd(), 'assets/Racoonn-Logo-02.png'),
        path.join(process.cwd(), '../User/src/assets/Racoonn-Logo-02.png'),
      ];
      const logoPath = possibleLogoPaths.find((p) => fs.existsSync(p));
      if (logoPath) {
        doc.image(logoPath, 50, 45, { width: 140 });
      } else {
        doc.fontSize(24).font('Helvetica-Bold').fillColor(INVOICE_COLORS.brand).text('RACOONN', 50, 45);
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark);
      doc.text('CIELLE TRAVELS PRIVATE LIMITED', 50, 90);
      doc.fontSize(9).font('Helvetica').fillColor(INVOICE_COLORS.textLight);
      doc.text('GSTIN - 05AAOCC0859Q1Z0', 50, 105);
      doc.text('SECOND FLOOR  PSA PLAZA, SHOP NO 207 , NAINITAL ROAD,', 50, 120);
      doc.text('Rudrapur, Udham Singh Nagar, Uttarakhand, 263153', 50, 135);
      doc.text('Phone: +91 8954442144 | Email: info@racoonn.com', 50, 150);

      // Invoice Meta (Right Aligned)
      doc.fontSize(28).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text('INVOICE', 350, 45, { align: 'right' });
      doc.fontSize(10).font('Helvetica').fillColor(INVOICE_COLORS.textLight).text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 350, 80, { align: 'right' });
      doc.text(`Booking Ref: ${bookingId.substring(0, 8).toUpperCase()}`, 350, 95, { align: 'right' });

      const invoiceNo = data.invoiceNumber || `INV-${bookingId.substring(0, 8).toUpperCase()}`;
      doc.text(`Invoice No: ${invoiceNo}`, 350, 110, { align: 'right' });

      // Divider
      doc.moveTo(50, 175).lineTo(545, 175).strokeColor(INVOICE_COLORS.border).lineWidth(1).stroke();

      // 2. Billing & Hotel Details
      doc.fontSize(12).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text('Billed To', 50, 195);
      doc.fontSize(10).font('Helvetica').fillColor(INVOICE_COLORS.textLight).text(`${firstName} ${lastName}`.trim() || 'Guest', 50, 215);
      if (email) doc.text(email, 50, 230);

      doc.fontSize(12).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text(isPackage ? 'Package Details' : 'Hotel Details', 300, 195);
      doc.fontSize(10).font('Helvetica').fillColor(INVOICE_COLORS.textLight).text(hotelName, 300, 215, { width: 245 });
      if (hotelLocation) {
        doc.text(hotelLocation, 300, doc.y + 2, { width: 245 });
      }

      // 3. Stay Details Table
      const tableY = 285;
      doc.roundedRect(50, tableY, 495, 30, 4).fill(INVOICE_COLORS.bgLight);

      doc.fontSize(10).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark);
      doc.text('Description', 60, tableY + 10);
      doc.text('Details', 300, tableY + 10);

      // Table Row
      let rowY = tableY + 45;
      doc.font('Helvetica').fillColor(INVOICE_COLORS.textDark);

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
      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor(INVOICE_COLORS.border).stroke();

      // 4. Financial Breakdown
      const addonsTotal = addonsList.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      const basePrice = price - addonsTotal - gstAmount;

      rowY += 30;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text('Financial Breakdown', 60, rowY);

      rowY += 25;
      const safeBasePrice = Number(basePrice) || 0;
      doc.font('Helvetica').fillColor(INVOICE_COLORS.textLight).text('Base Price (Excl. GST):', 300, rowY);
      doc.font('Helvetica').fillColor(INVOICE_COLORS.textDark).text(`INR ${safeBasePrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });

      if (!isPackage) {
        addonsList.forEach((addon: any) => {
          rowY += 20;
          const addonPrice = Number(addon.price) || 0;
          doc.font('Helvetica').fillColor(INVOICE_COLORS.textLight).text(`Add-on: ${addon.name}`, 300, rowY);
          doc.font('Helvetica').fillColor(INVOICE_COLORS.textDark).text(`INR ${addonPrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });
        });
      }

      rowY += 20;
      const safeGstAmount = Number(gstAmount) || 0;
      doc.font('Helvetica').fillColor(INVOICE_COLORS.textLight).text(`GST (${gstRate}%):`, 300, rowY);
      doc.font('Helvetica').fillColor(INVOICE_COLORS.textDark).text(`INR ${safeGstAmount.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });

      // Total Line
      rowY += 15;
      doc.moveTo(300, rowY).lineTo(545, rowY).strokeColor(INVOICE_COLORS.border).stroke();

      rowY += 15;
      doc.fontSize(14).font('Helvetica-Bold').fillColor(INVOICE_COLORS.brand).text('Total Paid:', 300, rowY);
      const safePrice = Number(price) || 0;
      doc.fontSize(14).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text(`INR ${safePrice.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });

      // 5. Footer
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(INVOICE_COLORS.border).stroke();
      doc.fontSize(10).font('Helvetica-Bold').fillColor(INVOICE_COLORS.textDark).text('Thank you for booking with Racoonn!', 50, footerY + 15, { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor(INVOICE_COLORS.textLight).text('This is a computer-generated invoice and does not require a physical signature.', 50, footerY + 30, { align: 'center' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

app.post('/api/invoice/download', async (req, res) => {
  try {
    const data = req.body;
    const pdfBuffer = await generateInvoicePdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${data.displayBookingId || 'Booking'}.pdf`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Download invoice error:', error);
    return res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
  }
});

app.post('/api/email/booking-confirmation', async (req, res) => {
  try {
    const data = req.body;
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
      isPackage = false,
      hotelId = null
    } = data;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 1. Generate PDF Buffer
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generateInvoicePdf(data);
    } catch (pdfErr) {
      console.error('Failed to generate PDF buffer:', pdfErr);
    }

    // 2. Prepare Email Transporter
    const transporter = getEmailTransporter();

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
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.displayBookingId || bookingId?.substring(0, 8).toUpperCase() || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>${isPackage ? 'Package Name' : 'Hotel'}:</strong> ${hotelName} ${hotelLocation ? '(' + hotelLocation + ')' : ''}</p>
            ${isPackage ? `
              <p style="margin: 5px 0;"><strong>Starting date:</strong> ${checkIn}</p>
              <p style="margin: 5px 0;"><strong>Duration of Package:</strong> ${nights} Night(s)</p>
            ` : `
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
              <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${nights} Night(s)</p>
              ${addonsList?.length > 0 ? addonsList.map((a: any) => `<p style="margin: 5px 0;"><strong>Add-on (${a.name}):</strong> ₹${(Number(a.price) || 0).toLocaleString("en-IN")}</p>`).join('') : ''}
            `}
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

    // 2. Dispatch Instant Push Notification to Guest
    try {
      let guestUserId = data.userId;
      if (!guestUserId && bookingId && bookingId !== 'N/A') {
        const { db, dbId } = getAppwriteAdminDb();
        const bDoc = await db.getDocument(dbId, 'bookings', bookingId).catch(() => null);
        if (bDoc && bDoc.userId) guestUserId = bDoc.userId;
      }
      if (guestUserId) {
        await sendBookingConfirmationPush({
          userId: guestUserId,
          hotelName,
          bookingId,
          displayBookingId: data.displayBookingId,
          checkIn,
          checkOut,
          price,
        });
        console.log('Push notification dispatched to guest user:', guestUserId);
      }
    } catch (pushErr: any) {
      console.warn('Failed to send booking confirmation push notification:', pushErr.message);
    }

    // 2b. Send Confirmation Email with PDF Invoice (non-blocking)
    try {
      const mailOptions: any = {
        from: `"Racoonn Bookings" <${process.env.SMTP_USER || process.env.SMTP_USERNAME || 'info@racoonn.com'}>`,
        to: email,
        subject: `Booking Confirmed: ${hotelName}`,
        html: htmlContent,
      };

      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `Invoice-${data.displayBookingId || bookingId?.substring(0, 8).toUpperCase() || 'Booking'}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      }

      transporter.sendMail(mailOptions)
        .then(() => console.log('Confirmation email sent to user:', email))
        .catch((emailErr) => console.error('Failed to send user confirmation email:', emailErr));
    } catch (emailErr) {
      console.error('Failed to prepare user confirmation email:', emailErr);
    }

    // 3. Notify Vendor & Generate Vendor Dashboard Invoice
    if (hotelId) {
      try {
        const { db, dbId } = getAppwriteAdminDb();
        const property = await db.getDocument(dbId, 'properties', hotelId).catch(() => null);

        let vendor: any = null;
        if (property && (property.vendorId || property.userId)) {
          vendor = await db.getDocument(dbId, '6a3e0fd9da7df0d38588', property.vendorId || property.userId).catch(() => null);
        }

        if (vendor && vendor.email) {
          const vendorHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
              <div style="background-color: #E86A6F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">New Booking Alert!</h1>
              </div>
              <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                <p>Hi ${vendor.businessName || vendor.firstName || 'Vendor'},</p>
                <p>You have received a new booking for <strong>${hotelName}</strong>.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                  <p style="margin: 5px 0;"><strong>Guest Name:</strong> ${firstName} ${lastName || ''}</p>
                  <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
                  <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
                  <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
                  <p style="margin: 5px 0;"><strong>Nights:</strong> ${nights}</p>
                </div>
                <p>Please log in to your vendor dashboard to manage this booking.</p>
                <p><strong>The Racoonn Team</strong></p>
              </div>
            </div>
          `;

          try {
            await transporter.sendMail({
              from: `"Racoonn Bookings" <${process.env.SMTP_USER || process.env.SMTP_USERNAME || 'info@racoonn.com'}>`,
              to: vendor.email,
              subject: `New Booking Alert: ${hotelName}`,
              html: vendorHtml,
            });
            console.log('Vendor notification sent to:', vendor.email);
          } catch (vendorEmailErr) {
            console.error('Failed to send vendor notification email:', vendorEmailErr);
          }

          // Also dispatch real-time vendor push notification if vendor has registered devices
          try {
            const vendorUserId = vendor.userId || vendor.$id;
            if (vendorUserId) {
              await sendVendorNewBookingAlert({
                vendorId: vendorUserId,
                propertyName: hotelName,
                bookingId,
                guestName: `${firstName} ${lastName || ''}`.trim(),
                checkIn,
                checkOut,
              });
              console.log('Vendor push notification dispatched to:', vendorUserId);
            }
          } catch (vendorPushErr: any) {
            console.warn('Failed to send vendor push notification:', vendorPushErr.message);
          }
        }

        // --- INSTANT AUTO INVOICE GENERATION FOR VENDOR DASHBOARD ---
        try {
          let invoicesDoc = await db.getDocument(dbId, 'cms_invoices', 'cms_invoices_v1').catch(() => null);
          if (!invoicesDoc) {
            invoicesDoc = await db.getDocument(dbId, 'properties', 'cms_invoices_v1').catch(() => null);
          }
          let allInvoices = invoicesDoc?.details ? JSON.parse(invoicesDoc.details) : [];

          const v = vendor || {};
          const effectiveFeePercent = v.allow24PercentGst ? 24 : 18;
          const invoiceTotal = Number(price) || 0;
          const pricePerNight = invoiceTotal / Math.max(1, nights || 1);
          const gstRate = pricePerNight <= 7500 ? 0.05 : 0.18;
          const gstMultiplier = 1 + gstRate;

          const userPaysBase = Number((invoiceTotal / gstMultiplier).toFixed(2));
          const commission = Math.round(userPaysBase * (effectiveFeePercent / 100));
          const taxableValue = userPaysBase - commission;

          const isIgst = v.gstin ? !v.gstin.startsWith("05") : (v.state && v.state.toLowerCase() !== "uttarakhand");
          const cgst = isIgst ? 0 : Number((taxableValue * (gstRate / 2)).toFixed(2));
          const sgst = isIgst ? 0 : Number((taxableValue * (gstRate / 2)).toFixed(2));
          const igst = isIgst ? Number((taxableValue * gstRate).toFixed(2)) : 0;

          const totalGst = cgst + sgst + igst;
          const netPayable = Math.max(1, taxableValue + totalGst);

          const cleanHotelName = (hotelName || "HT").replace(/[^a-zA-Z]/g, '').toUpperCase();
          const hNamePart = cleanHotelName.substring(0, 2).padEnd(2, 'X');
          const hIdPart = (hotelId || "00").substring((hotelId || "00").length - 2).toUpperCase();
          const hotelCode = `${hNamePart}${hIdPart}`;

          const hotelInvoices = allInvoices.filter((inv: any) => inv.propertyId === hotelId || (inv.id && typeof inv.id === 'string' && inv.id.startsWith(`${hotelCode}/INV/`)));
          const serialNumber = (hotelInvoices.length + 1).toString().padStart(3, '0');

          const newInvoiceId = `${hotelCode}/INV/${serialNumber}`;

          const newInvoice = {
            id: newInvoiceId,
            invoiceNumber: newInvoiceId,
            type: "tax_invoice",
            status: "Invoice Submitted",
            adminCompany: "CIELLE TRAVELS PRIVATE LIMITED",
            adminPlatform: "Racoonn",
            adminAddress: "B-81, Rose Villa, Samiah Lake City, Rudrapur, Kichha, Udham Singh Nagar - 263153, Uttarakhand",
            adminEmail: "info@racoonn.com",

            propertyId: hotelId || "",
            vendorId: v.$id || property?.vendorId || property?.userId || 'unknown-vendor',
            vendorName: v.businessName || v.hotelName || v.firstName || "Partner Vendor",
            vendorBusiness: v.businessName || v.hotelName || "Partner Property",
            vendorEmail: v.email || "vendor@racoonn.com",
            vendorPhone: v.phone || "",
            vendorAddress: [property?.address || v.address, property?.city || v.city, property?.state || v.state, property?.pincode || v.pincode].filter(Boolean).join(", ") || "Vendor Address",
            vendorCity: property?.city || v.city || "",
            vendorState: property?.state || v.state || "",
            vendorGstin: v.gstin || "",
            vendorPan: v.pan || "",

            bookingIds: [bookingId],
            checkIn,
            checkOut,
            nights,

            taxableValue,
            cgst,
            sgst,
            igst,
            totalGst,
            invoiceTotal,
            otaCommission: commission,
            netPayable,

            bankName: v.bankName || "",
            accountHolder: v.accountHolder || "",
            accountNumber: v.accountNumber || "",
            ifsc: v.ifsc || "",
            upiId: v.upiId || "",
            issueDate: new Date().toISOString(),
            placeOfSupply: "Uttarakhand (05)",

            items: [
              {
                id: `item-${Date.now()}`,
                description: `Room accommodation charges - OTA bookings settled through Racoonn`,
                sacCode: "996311",
                bookingId: bookingId,
                checkIn,
                checkOut,
                nights,
                taxableAmount: taxableValue,
              },
            ],
          };

          allInvoices.unshift(newInvoice);
          const detailsStr = JSON.stringify(allInvoices);

          // 1. Primary cms_invoices
          try {
            await db.updateDocument(dbId, 'cms_invoices', 'cms_invoices_v1', {
              details: detailsStr,
              title: 'CMS Invoices Storage'
            });
          } catch (updateErr: any) {
            if (updateErr.code === 404) {
              try {
                await db.createDocument(dbId, 'cms_invoices', 'cms_invoices_v1', {
                  title: 'CMS Invoices Storage',
                  details: detailsStr
                });
              } catch (createErr) {}
            }
          }

          // 2. Mirror to properties
          try {
            await db.updateDocument(dbId, 'properties', 'cms_invoices_v1', {
              details: detailsStr,
            });
          } catch (propErr: any) {
            if (propErr.code === 404) {
              try {
                await db.createDocument(dbId, 'properties', 'cms_invoices_v1', {
                  vendorId: 'admin',
                  propertyName: 'CMS Invoices Storage',
                  propertyType: 'hotel',
                  city: 'Delhi',
                  state: 'Delhi',
                  location: 'Admin Dashboard',
                  status: 'active',
                  title: 'CMS Invoices',
                  price: 0,
                  details: detailsStr,
                });
              } catch (e) {}
            }
          }
          console.log("Instant vendor invoice generated for Vendor Dashboard:", newInvoiceId);
        } catch (invoiceErr) {
          console.error("Failed to generate instant vendor invoice:", invoiceErr);
        }
      } catch (vendorErr) {
        console.error("Failed to process vendor notification and invoice:", vendorErr);
      }
    }

    return res.json({ success: true, messageId: 'success' });
  } catch (error: any) {
    console.error('Error in /api/email/booking-confirmation:', error);
    return res.status(500).json({ error: 'Failed to send confirmation email', details: error.message });
  }
});

// 🌟 CMS Popular Stays (mirrors User Portal /api/cms/popular-stays)
app.get('/api/cms/popular-stays', async (req, res) => {
  const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_stays_cms.json";
  const COLLECTION_ID = "popular_stays";

  try {
    const { db, dbId } = getAppwriteAdminDb();
    const docs = await db.listDocuments(
      dbId,
      COLLECTION_ID,
      [Query.limit(100)]
    );

    if (docs && docs.documents.length > 0) {
      const stays = docs.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title || "",
        subtitle: doc.subtitle || "",
        location: doc.location || "",
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        order: doc.order || 0,
        propertyIds: doc.propertyIds || []
      }));
      return res.json({ success: true, sections: stays });
    }
  } catch (err: any) {
    console.warn("Appwrite popular_stays collection fetch warning in backend:", err.message);
  }

  // Fallback to shared JSON file
  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const stays = JSON.parse(fileData);
      return res.json({ success: true, sections: stays });
    }
  } catch {}

  return res.json({ success: true, sections: [] });
});

// ==========================================
// PUSH NOTIFICATION & NOTIFICATION CENTER APIS
// ==========================================

// Register device push token
app.post('/api/notifications/devices/register', async (req, res) => {
  try {
    const { userId, pushToken, platform, deviceIdentifier, deviceName } = req.body;
    if (!userId || !pushToken) {
      return res.status(400).json({ error: 'userId and pushToken are required' });
    }
    const result = await registerDeviceToken({
      userId,
      pushToken,
      platform: platform || 'android',
      deviceIdentifier: deviceIdentifier || pushToken,
      deviceName,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error registering device token:', err);
    return res.status(500).json({ error: 'Failed to register device token', details: err.message });
  }
});

// Unregister device push token (logout)
app.post('/api/notifications/devices/unregister', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = await unregisterDeviceToken(userId, pushToken);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error unregistering device token:', err);
    return res.status(500).json({ error: 'Failed to unregister device token', details: err.message });
  }
});

// Get user in-app notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    const limit = Number(req.query.limit || 30);
    const offset = Number(req.query.offset || 0);
    const category = req.query.category ? String(req.query.category) : undefined;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await getUserNotifications({
      userId,
      limit,
      offset,
      category,
      unreadOnly,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Error fetching user notifications:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Mark single notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to mark as read', details: err.message });
  }
});

// Mark all notifications as read for a user
app.post('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = await markAllNotificationsAsRead(userId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to mark all as read', details: err.message });
  }
});

// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteNotificationDocument(id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete notification', details: err.message });
  }
});

// Get user notification preferences
app.get('/api/notifications/preferences', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const prefs = await getUserPreferences(userId);
    return res.status(200).json({ preferences: prefs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch preferences', details: err.message });
  }
});

// Update user notification preferences
app.put('/api/notifications/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    if (!userId || !preferences) return res.status(400).json({ error: 'userId and preferences are required' });
    const result = await updateUserPreferences(userId, preferences);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update preferences', details: err.message });
  }
});

// Trigger reminders manually (for cron service or testing)
app.post('/api/notifications/cron/run-reminders', async (req, res) => {
  try {
    const summary = await runBookingRemindersJob();
    return res.status(200).json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to run reminders', details: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
    // Start background reminders scheduler
    try {
      startRemindersScheduler();
    } catch (schedErr: any) {
      console.warn('Could not start reminders scheduler:', schedErr.message);
    }
  });
}

export default app;
export { app };


