import { NextResponse } from "next/server";
import fs from "fs";

const SHARED_INVOICE_FILE = "/Users/haldwani/Documents/Working/Working/Racoonn/invoices.json";

export async function GET() {
  try {
    if (fs.existsSync(SHARED_INVOICE_FILE)) {
      const fileData = fs.readFileSync(SHARED_INVOICE_FILE, "utf-8");
      const invoices = JSON.parse(fileData);
      return NextResponse.json({ success: true, invoices });
    }
    return NextResponse.json({ success: true, invoices: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, invoices: [] }, { status: 500 });
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
      } catch {
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
    fs.writeFileSync(SHARED_INVOICE_FILE, jsonStr, "utf-8");

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

    return NextResponse.json({ success: true, invoices: currentInvoices });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
