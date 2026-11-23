import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OVERRIDES_FILE = path.join(process.cwd(), '..', 'availability_overrides.json');

function readOverrides() {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const content = fs.readFileSync(OVERRIDES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading availability overrides file:', err);
  }
  return {};
}

function writeOverrides(data: Record<string, unknown>) {
  try {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing availability overrides file:', err);
  }
}

export async function GET() {
  const overrides = readOverrides();
  return NextResponse.json({ success: true, overrides });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = readOverrides();
    const updated = { ...current, ...(body.overrides || {}) };
    writeOverrides(updated);
    return NextResponse.json({ success: true, overrides: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
