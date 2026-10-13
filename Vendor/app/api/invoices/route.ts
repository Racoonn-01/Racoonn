export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID || "6a3bce6900381359c3ce")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const PRIMARY_COLLECTION = "cms_invoices";
const FALLBACK_COLLECTION = "properties";
const DOC_ID = "cms_invoices_v1";

async function getInvoices() {
  try {
    const doc = await db.getDocument(DATABASE_ID, PRIMARY_COLLECTION, DOC_ID);
    if (doc?.details) return JSON.parse(doc.details);
  } catch (err: any) {
    if (err.code !== 404) console.warn("Vendor primary cms_invoices read error:", err.message);
  }

  try {
    const doc = await db.getDocument(DATABASE_ID, FALLBACK_COLLECTION, DOC_ID);
    if (doc?.details) return JSON.parse(doc.details);
  } catch (err: any) {
    if (err.code !== 404) console.warn("Vendor fallback properties read error:", err.message);
  }

  return [];
}

export async function GET() {
  try {
    const invoices = await getInvoices();
    return NextResponse.json({ success: true, invoices });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, invoices: [] }, { status: 500 });
  }
}

async function saveInvoices(invoices: any[]) {
  const jsonStr = JSON.stringify(invoices);
  
  // 1. Primary cms_invoices
  try {
    await db.updateDocument(DATABASE_ID, PRIMARY_COLLECTION, DOC_ID, { details: jsonStr, title: "CMS Invoices Storage" });
  } catch (err: any) {
    if (err.code === 404) {
      try {
        await db.createDocument(DATABASE_ID, PRIMARY_COLLECTION, DOC_ID, { title: "CMS Invoices Storage", details: jsonStr });
      } catch (e) {}
    }
  }

  // 2. Mirror to properties
  try {
    await db.updateDocument(DATABASE_ID, FALLBACK_COLLECTION, DOC_ID, { details: jsonStr });
  } catch (err: any) {
    if (err.code === 404) {
      try {
        await db.createDocument(DATABASE_ID, FALLBACK_COLLECTION, DOC_ID, {
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
        });
      } catch (e) {}
    }
  }
}

export async function POST(request: Request) {
  try {
    const newInvoice = await request.json();
    let currentInvoices = await getInvoices();

    // Add or update invoice
    const existingIndex = currentInvoices.findIndex((inv) => inv.id === newInvoice.id);
    if (existingIndex >= 0) {
      currentInvoices[existingIndex] = newInvoice;
    } else {
      currentInvoices.unshift(newInvoice);
    }

    await saveInvoices(currentInvoices);

    return NextResponse.json({ success: true, invoice: newInvoice, invoices: currentInvoices });
  } catch (err: any) {
    console.error("Error saving invoice in Vendor:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    let currentInvoices = await getInvoices();

    let updated = false;
    currentInvoices = currentInvoices.map((inv) => {
      if (inv.id === id) {
        updated = true;
        return { ...inv, status };
      }
      return inv;
    });

    if (updated) {
      await saveInvoices(currentInvoices);
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
