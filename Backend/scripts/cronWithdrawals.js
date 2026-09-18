const { Client, Databases, Query } = require('node-appwrite');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SHARED_INVOICE_FILE = '/Users/haldwani/Documents/Working/Working/Racoonn/invoices.json';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const PROPERTIES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';
const BOOKINGS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || 'bookings';
const PAYMENTS_COLLECTION = 'booking_payments';
const VENDORS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || '6a3e0fd9da7df0d38588';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Default platform fee
const PLATFORM_FEE_PERCENT = 10;

async function sendEmailToAdmin(invoice, vendorDetails) {
  const adminEmail = "info@racoonn.com"; // Admin email
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "work.vivekkumar0666@gmail.com";
  const pass = process.env.SMTP_PASS || "rgar quzx szdi fvzo";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `[Automated Withdrawal] Invoice ${invoice.invoiceNumber} - ${invoice.vendorBusiness}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #0F172A;">New Automated Withdrawal Request</h2>
      <p>A new withdrawal invoice has been automatically generated as 72 hours have passed since the bookings were completed.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>Vendor:</strong> ${invoice.vendorBusiness} (${invoice.vendorEmail})</p>
      <p><strong>Gross Amount:</strong> ₹${invoice.grossAmount}</p>
      <p><strong>Platform Fee:</strong> ₹${Math.abs(invoice.platformFeeAmount)}</p>
      <p><strong>Net Payout:</strong> ₹${invoice.totalAmount}</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p>Please log in to the Admin Dashboard to review and process this payout to the vendor's bank account.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Racoonn Automated System" <${user}>`,
      to: adminEmail,
      subject,
      html,
    });
    console.log(`Email sent to admin for invoice ${invoice.invoiceNumber}`);
    return true;
  } catch (err) {
    console.error(`Failed to send email for invoice ${invoice.invoiceNumber}:`, err);
    return false;
  }
}

async function runCron() {
  console.log("Starting 72-hour Automated Withdrawal Cron Job...");
  try {
    // 1. Fetch Invoices from file
    let currentInvoices = [];
    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
      currentInvoices = JSON.parse(fileData);
    }

    const invoicedBookingIds = new Set();
    currentInvoices.forEach(inv => {
      if (inv.type === "withdrawal" && inv.status !== "Cancelled" && inv.status !== "Rejected" && inv.bookingIds) {
        inv.bookingIds.forEach(id => invoicedBookingIds.add(id));
      }
    });

    // 2. Fetch all completed bookings
    const bookingsRes = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION, [
      Query.limit(5000)
    ]);
    const now = Date.now();
    const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;

    const completedBookings = bookingsRes.documents.filter(b => {
      if (b.status === "Cancelled" || b.status === "Rejected") return false;
      const checkOutTime = new Date(b.checkOut).getTime();
      // Must be checked out, and 72 hours must have passed
      return (now - checkOutTime) >= SEVENTY_TWO_HOURS_MS;
    });

    // Filter out already invoiced bookings
    const pendingBookings = completedBookings.filter(b => !invoicedBookingIds.has(b.$id));

    if (pendingBookings.length === 0) {
      console.log("No new bookings ready for withdrawal.");
      return;
    }

    console.log(`Found ${pendingBookings.length} bookings ready for withdrawal.`);

    // 3. Fetch properties and map hotelId to vendorId
    const propertiesRes = await databases.listDocuments(DATABASE_ID, PROPERTIES_COLLECTION, [
      Query.limit(5000)
    ]);
    const hotelToVendorMap = {};
    propertiesRes.documents.forEach(p => {
      hotelToVendorMap[p.$id] = p.vendorId;
    });

    // Fetch payments to get gross amount
    const paymentsRes = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION, [
      Query.limit(5000)
    ]);
    const paymentMap = {};
    paymentsRes.documents.forEach(p => {
      paymentMap[p.bookingId] = p;
    });

    // Fetch vendors to get vendor details
    const vendorsRes = await databases.listDocuments(DATABASE_ID, VENDORS_COLLECTION, [
      Query.limit(5000)
    ]);
    const vendorMap = {};
    vendorsRes.documents.forEach(v => {
      vendorMap[v.userId] = v;
    });

    // 4. Group bookings by vendorId
    const vendorBookings = {};
    pendingBookings.forEach(b => {
      const vendorId = hotelToVendorMap[b.hotelId];
      if (vendorId) {
        if (!vendorBookings[vendorId]) vendorBookings[vendorId] = [];
        vendorBookings[vendorId].push(b);
      }
    });

    // 5. Generate invoices
    let generatedCount = 0;
    for (const [vendorId, bookings] of Object.entries(vendorBookings)) {
      const vendorInfo = vendorMap[vendorId];
      if (!vendorInfo) {
        console.warn(`Vendor info not found for vendorId: ${vendorId}. Skipping.`);
        continue;
      }

      const generatedItems = [];
      let totalGross = 0;
      const bookingIds = [];

      bookings.forEach(b => {
        const payment = paymentMap[b.$id];
        const grossAmount = payment ? Number(payment.totalAmount || 0) : 12000;
        totalGross += grossAmount;
        bookingIds.push(b.$id);

        generatedItems.push({
          id: `gross-${b.$id}`,
          description: `Booking #${b.$id} Revenue (${b.hotelName})`,
          quantity: 1,
          unitPrice: grossAmount,
          amount: grossAmount,
          bookingId: b.$id,
        });
      });

      const platformFee = Math.round((totalGross * PLATFORM_FEE_PERCENT) / 100);
      
      generatedItems.push({
        id: `fee-deduction-${Date.now()}`,
        description: `Racoonn Platform Commission Fee (${PLATFORM_FEE_PERCENT}%)`,
        quantity: 1,
        unitPrice: -platformFee,
        amount: -platformFee,
      });

      const netEarnings = totalGross - platformFee;

      const invoiceNumber = `INV-WD-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;
      const issueDate = new Date().toISOString().split('T')[0];

      const invoiceObj = {
        id: `inv-wd-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        invoiceNumber,
        type: "withdrawal",
        vendorId: vendorId,
        vendorName: vendorInfo.ownerName || "Vendor",
        vendorBusiness: vendorInfo.brandName || "Vendor Business",
        vendorEmail: vendorInfo.email || "",
        vendorPhone: vendorInfo.contactNumber || "",
        vendorAddress: vendorInfo.address || "",
        vendorGstin: vendorInfo.gstin || "",
        bankName: vendorInfo.bankName || "",
        accountHolder: vendorInfo.accountHolderName || "",
        accountNumber: vendorInfo.accountNumber || "",
        ifsc: vendorInfo.ifscCode || "",
        upiId: vendorInfo.upiId || "",
        bookingIds: bookingIds,
        grossAmount: totalGross,
        platformFeeRate: PLATFORM_FEE_PERCENT,
        platformFeeAmount: platformFee,
        issueDate,
        dueDate: issueDate,
        items: generatedItems,
        subtotal: totalGross,
        taxRate: 18,
        taxAmount: 0,
        discount: 0,
        totalAmount: netEarnings,
        status: "Sent",
        notes: "Automated withdrawal generated after 72 hours of booking completion.",
        createdAt: new Date().toISOString(),
      };

      currentInvoices.unshift(invoiceObj);
      
      // Email Admin
      await sendEmailToAdmin(invoiceObj, vendorInfo);
      generatedCount++;
    }

    // 6. Save back to invoices.json
    if (generatedCount > 0) {
      fs.writeFileSync(SHARED_INVOICE_FILE, JSON.stringify(currentInvoices, null, 2), "utf-8");
      console.log(`Successfully generated and sent ${generatedCount} automated withdrawal invoices.`);
    }

  } catch (error) {
    console.error("Cron Job Error:", error);
  }
}

runCron();
