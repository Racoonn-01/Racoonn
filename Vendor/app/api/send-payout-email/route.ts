import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientEmail = "blackrolex1144@gmail.com",
      invoiceNumber = "INV-PAYOUT-2026-8942",
      vendorName = "BlackRolex Stays & Luxury Villa",
      vendorPhone = "+91 7900310444",
      netPayout = 22446.6,
      grossAmount = 28500,
      commissionAmount = 5130,
      gstTaxAmount = 923.4,
      bankName = "State Bank of India (SBI)",
      accountNumber = "XXXXXX9842",
      ifsc = "SBIN0004821",
      upiId = "blackrolex1144@okaxis",
    } = body;

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || "work.vivekkumar0666@gmail.com";
    const pass = process.env.SMTP_PASS || "rgar quzx szdi fvzo";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; padding: 24px; background: #F8FAFC; margin: 0; }
            .invoice-box { max-width: 680px; margin: auto; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 36px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .top-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #F1F5F9; }
            .brand { font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: 2px; }
            .brand-tag { font-size: 10px; font-weight: 800; color: #E86A70; letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }
            .inv-title { font-size: 20px; font-weight: 900; color: #E86A70; text-align: right; }
            .inv-sub { font-size: 12px; color: #64748B; text-align: right; margin-top: 4px; }
            .status-badge { display: inline-block; background: #DCFCE7; color: #15803D; font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 20px; margin-top: 8px; text-transform: uppercase; }
            
            .grid-details { display: flex; justify-content: space-between; margin-top: 28px; margin-bottom: 28px; background: #F8FAFC; padding: 20px; border-radius: 14px; border: 1px solid #F1F5F9; }
            .col { width: 48%; }
            .lbl { font-size: 10px; font-weight: 800; color: #94A3B8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
            .val-title { font-size: 15px; font-weight: 800; color: #0F172A; }
            .val-sub { font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 1.5; }
            
            .table-box { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 24px; }
            .table-box th { background: #0F172A; color: #FFFFFF; text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
            .table-box td { padding: 14px; font-size: 13px; color: #1E293B; border-bottom: 1px solid #F1F5F9; }
            
            .total-card { background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 14px; padding: 18px 22px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; }
            .total-lbl { font-size: 15px; font-weight: 900; color: #0F172A; }
            .total-val { font-size: 22px; font-weight: 900; color: #E86A70; }
            
            .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #F1F5F9; font-size: 11.5px; color: #94A3B8; text-align: center; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="top-header">
              <div>
                <div class="brand">RACOONN</div>
                <div class="brand-tag">Vendor Payout & Settlement Desk</div>
                <div style="font-size: 11px; color: #64748B; margin-top: 5px;">
                  Corporate GSTIN: <strong>05AACCR9841B1Z2</strong> | SAC: <strong>996311</strong>
                </div>
              </div>
              <div>
                <div class="inv-title">VENDOR PAYOUT INVOICE</div>
                <div class="inv-sub">Invoice #: <strong>${invoiceNumber}</strong></div>
                <div class="inv-sub">Payout Date: <strong>${issueDate}</strong></div>
                <div style="text-align: right;"><span class="status-badge">✓ WITHDRAWAL APPROVED</span></div>
              </div>
            </div>

            <div class="grid-details">
              <div class="col">
                <div class="lbl">VENDOR / BENEFICIARY</div>
                <div class="val-title">${vendorName}</div>
                <div class="val-sub">Email: <strong>${recipientEmail}</strong></div>
                <div class="val-sub">Phone: <strong>${vendorPhone}</strong></div>
              </div>
              <div class="col">
                <div class="lbl">BANK PAYOUT ACCOUNT</div>
                <div class="val-title">${bankName}</div>
                <div class="val-sub">A/C No: <strong>${accountNumber}</strong> | IFSC: <strong>${ifsc}</strong></div>
                <div class="val-sub">UPI ID: <strong>${upiId}</strong></div>
              </div>
            </div>

            <table class="table-box">
              <thead>
                <tr>
                  <th>Item / Description</th>
                  <th>Gross Revenue</th>
                  <th style="text-align: right;">Net Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Completed Guest Reservations Settlement</strong><br/>
                    <span style="font-size: 11px; color: #64748B;">Gross hotel booking earnings from checked-out guests</span>
                  </td>
                  <td>₹${grossAmount.toLocaleString("en-IN")}</td>
                  <td style="text-align: right; font-weight: 700;">₹${grossAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Racoonn Platform Fee (18% Commission)</strong><br/>
                    <span style="font-size: 11px; color: #64748B;">Standard platform commission fee for host tools & distribution</span>
                  </td>
                  <td>-18%</td>
                  <td style="text-align: right; font-weight: 700; color: #DC2626;">-₹${commissionAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Statutory GST on Commission (18% SAC 996311)</strong><br/>
                    <span style="font-size: 11px; color: #64748B;">Central & State GST tax deduction on platform service fee</span>
                  </td>
                  <td>18% GST</td>
                  <td style="text-align: right; font-weight: 700; color: #DC2626;">-₹${gstTaxAmount.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-card">
              <div class="total-row">
                <div>
                  <div class="total-lbl">NET VENDOR PAYOUT WITHDRAWAL</div>
                  <div style="font-size: 11px; color: #64748B; margin-top: 3px;">
                    Directly credited to your registered Bank Account / UPI ID
                  </div>
                </div>
                <div class="total-val">₹${netPayout.toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div class="footer">
              This is an official Vendor Payout Withdrawal Statement generated by Racoonn Hospitality Desk.<br/>
              Racoonn Corporate Desk • GSTIN: 05AACCR9841B1Z2 • SAC Code: 996311 • support@racoonn.com
            </div>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Racoonn Vendor Desk" <${user}>`,
      to: recipientEmail,
      subject: `[Vendor Payout] Payout Withdrawal Statement & PDF Invoice - ${invoiceNumber}`,
      html: htmlTemplate,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Payout email API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
