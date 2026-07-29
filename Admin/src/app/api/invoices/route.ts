import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { appwriteServer } from "@/lib/appwrite/server";

const SHARED_INVOICE_FILE = "/Users/haldwani/Documents/Working/Working/Racoonn/invoices.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_invoices_v1";

export async function GET() {
  try {
    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
      const invoices = JSON.parse(fileData);
      return NextResponse.json({ success: true, invoices });
    }
  } catch (err) {
    console.warn("File read failed, trying Appwrite DB:", err);
  }

  try {
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const invoices = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, invoices });
  } catch (err) {
    return NextResponse.json({ success: true, invoices: [] });
  }
}

export async function POST(request: Request) {
  try {
    const newInvoice = await request.json();
    let currentInvoices: any[] = [];

    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      try {
        const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
        currentInvoices = JSON.parse(fileData);
      } catch (e) {
        currentInvoices = [];
      }
    }

    // Add or update invoice
    const existingIndex = currentInvoices.findIndex((inv) => inv.id === newInvoice.id);
    if (existingIndex >= 0) {
      currentInvoices[existingIndex] = newInvoice;
    } else {
      currentInvoices.unshift(newInvoice);
    }

    const jsonStr = JSON.stringify(currentInvoices, null, 2);

    try {
      fs.writeFileSync(SHARED_INVOICE_FILE, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Invoice file write warning:", fileErr);
    }

    try {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        DOC_ID,
        { details: jsonStr }
      );
    } catch (err: any) {
      if (err.code === 404) {
        try {
          await appwriteServer.databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            DOC_ID,
            {
              propertyName: "CMS Invoices Storage",
              title: "CMS Invoices Storage",
              details: jsonStr,
            }
          );
        } catch (createErr) {
          console.warn("Appwrite DB doc create warning:", createErr);
        }
      }
    }

    return NextResponse.json({ success: true, invoice: newInvoice, invoices: currentInvoices });
  } catch (err: any) {
    console.error("Error saving invoice:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, adminRemarks } = await request.json();
    let currentInvoices: any[] = [];

    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
      currentInvoices = JSON.parse(fileData);
    }

    currentInvoices = currentInvoices.map((inv) =>
      inv.id === id
        ? {
            ...inv,
            status,
            ...(adminRemarks ? { adminRemarks } : {}),
            updatedAt: new Date().toISOString(),
          }
        : inv
    );

    const jsonStr = JSON.stringify(currentInvoices, null, 2);
    fs.writeFileSync(SHARED_INVOICE_FILE, jsonStr, "utf-8");

    try {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        DOC_ID,
        { details: jsonStr }
      );
    } catch (e) {
      // ignore appwrite sync error
    }

    return NextResponse.json({ success: true, invoices: currentInvoices });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
