import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID || "6a3bce6900381359c3ce")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export async function GET() {
  try {
    const doc = await db.getDocument(DATABASE_ID, "properties", "cms_invoices_v1");
    const invoices = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, invoices });
  } catch (err: any) {
    if (err.code === 404) {
      return NextResponse.json({ success: true, invoices: [] });
    }
    return NextResponse.json({ success: false, error: err.message, invoices: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newInvoice = await request.json();
    let currentInvoices: any[] = [];

    try {
      const doc = await db.getDocument(DATABASE_ID, "properties", "cms_invoices_v1");
      if (doc.details) {
        currentInvoices = JSON.parse(doc.details);
      }
    } catch (e: any) {
      if (e.code !== 404) throw e;
    }

    // Add or update invoice
    const existingIndex = currentInvoices.findIndex((inv) => inv.id === newInvoice.id);
    if (existingIndex >= 0) {
      currentInvoices[existingIndex] = newInvoice;
    } else {
      currentInvoices.unshift(newInvoice);
    }

    try {
      await db.getDocument(DATABASE_ID, "properties", "cms_invoices_v1");
      await db.updateDocument(DATABASE_ID, "properties", "cms_invoices_v1", {
        details: JSON.stringify(currentInvoices)
      });
    } catch (e: any) {
      if (e.code === 404) {
        await db.createDocument(DATABASE_ID, "properties", "cms_invoices_v1", {
          details: JSON.stringify(currentInvoices)
        });
      } else {
        throw e;
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
    const { id, status } = await request.json();
    let currentInvoices: any[] = [];

    try {
      const doc = await db.getDocument(DATABASE_ID, "properties", "cms_invoices_v1");
      if (doc.details) {
        currentInvoices = JSON.parse(doc.details);
      }
    } catch (e: any) {
      if (e.code !== 404) throw e;
    }

    let updated = false;
    currentInvoices = currentInvoices.map((inv) => {
      if (inv.id === id) {
        updated = true;
        return { ...inv, status };
      }
      return inv;
    });

    if (updated) {
      await db.updateDocument(DATABASE_ID, "properties", "cms_invoices_v1", {
        details: JSON.stringify(currentInvoices)
      });
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
