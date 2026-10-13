export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { appwriteServer } from "@/lib/appwrite/server";

const SHARED_INVOICE_FILE = path.join(process.cwd(), "invoices.json");
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const PRIMARY_COLLECTION = "cms_invoices";
const FALLBACK_COLLECTION = "properties";
const DOC_ID = "cms_invoices_v1";

async function getInvoicesFromAppwrite(): Promise<any[]> {
  // 1. Try primary collection cms_invoices
  try {
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      PRIMARY_COLLECTION,
      DOC_ID
    );
    if (doc?.details) {
      return JSON.parse(doc.details);
    }
  } catch (err: any) {
    if (err.code !== 404) {
      console.warn("Primary cms_invoices read warning:", err.message);
    }
  }

  // 2. Fallback to properties collection
  try {
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      FALLBACK_COLLECTION,
      DOC_ID
    );
    if (doc?.details) {
      return JSON.parse(doc.details);
    }
  } catch (err: any) {
    if (err.code !== 404) {
      console.warn("Fallback properties read warning:", err.message);
    }
  }

  return [];
}

async function saveInvoicesToAppwrite(invoices: any[]): Promise<void> {
  const jsonStr = JSON.stringify(invoices);
  
  // Save to primary collection cms_invoices
  try {
    await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      PRIMARY_COLLECTION,
      DOC_ID,
      { details: jsonStr, title: 'CMS Invoices Storage' }
    );
  } catch (err: any) {
    if (err.code === 404) {
      try {
        await appwriteServer.databases.createDocument(
          DATABASE_ID,
          PRIMARY_COLLECTION,
          DOC_ID,
          { title: 'CMS Invoices Storage', details: jsonStr }
        );
      } catch (createErr) {
        console.warn("Error creating in primary cms_invoices:", createErr);
      }
    }
  }

  // Mirror to properties collection for backward compatibility with Vendor & legacy endpoints
  try {
    await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      FALLBACK_COLLECTION,
      DOC_ID,
      { details: jsonStr }
    );
  } catch (err: any) {
    if (err.code === 404) {
      try {
        await appwriteServer.databases.createDocument(
          DATABASE_ID,
          FALLBACK_COLLECTION,
          DOC_ID,
          {
            vendorId: 'admin',
            propertyName: 'CMS Invoices Storage',
            propertyType: 'hotel',
            city: 'Delhi',
            state: 'Delhi',
            location: 'Admin Dashboard',
            status: 'active',
            title: 'CMS Invoices',
            price: 0,
            details: jsonStr
          }
        );
      } catch {}
    }
  }
}

export async function GET() {
  try {
    const invoices = await getInvoicesFromAppwrite();
    if (invoices.length > 0) {
      try {
        fs.writeFileSync(SHARED_INVOICE_FILE, JSON.stringify(invoices, null, 2), "utf-8");
      } catch {}
      return NextResponse.json({ success: true, invoices });
    }
  } catch (err) {
    console.warn("Appwrite DB read failed, checking local file fallback:", err);
  }

  try {
    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
      const invoices = JSON.parse(fileData);
      return NextResponse.json({ success: true, invoices });
    }
  } catch (err) {
    console.warn("Local file fallback read failed:", err);
  }

  return NextResponse.json({ success: true, invoices: [] });
}

export async function POST(request: Request) {
  try {
    const newInvoice = await request.json();
    let currentInvoices = await getInvoicesFromAppwrite();

    // Add or update invoice
    const existingIndex = currentInvoices.findIndex((inv) => inv.id === newInvoice.id);
    if (existingIndex >= 0) {
      currentInvoices[existingIndex] = newInvoice;
    } else {
      currentInvoices.unshift(newInvoice);
    }

    try {
      fs.writeFileSync(SHARED_INVOICE_FILE, JSON.stringify(currentInvoices, null, 2), "utf-8");
    } catch (fileErr) {
      console.warn("Invoice file write warning:", fileErr);
    }

    await saveInvoicesToAppwrite(currentInvoices);

    return NextResponse.json({ success: true, invoice: newInvoice, invoices: currentInvoices });
  } catch (err: any) {
    console.error("Error saving invoice:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, adminRemarks } = await request.json();
    let currentInvoices = await getInvoicesFromAppwrite();

    currentInvoices = currentInvoices.map((inv) =>
      inv.id === id || inv.invoiceNumber === id
        ? {
            ...inv,
            status,
            ...(adminRemarks ? { adminRemarks } : {}),
            updatedAt: new Date().toISOString(),
          }
        : inv
    );

    try {
      fs.writeFileSync(SHARED_INVOICE_FILE, JSON.stringify(currentInvoices, null, 2), "utf-8");
    } catch (fileErr) {
      console.warn("Invoice file write warning:", fileErr);
    }

    await saveInvoicesToAppwrite(currentInvoices);

    return NextResponse.json({ success: true, invoices: currentInvoices });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
