import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/custom_package_leads.json";

export async function GET() {
  noStore();
  try {
    let leads = [];
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      if (fileData) leads = JSON.parse(fileData);
    }
    return NextResponse.json({ success: true, leads: leads.reverse() }); // Return newest first
  } catch (err: unknown) {
    console.error("Error reading custom package leads:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });

    let leads: any[] = [];
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      if (fileData) leads = JSON.parse(fileData);
    }

    const leadIndex = leads.findIndex((l: any) => l.id === id);
    if (leadIndex === -1) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    leads[leadIndex].status = status;
    fs.writeFileSync(SHARED_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");

    return NextResponse.json({ success: true, lead: leads[leadIndex] });
  } catch (err: unknown) {
    console.error("Error updating custom package lead:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
