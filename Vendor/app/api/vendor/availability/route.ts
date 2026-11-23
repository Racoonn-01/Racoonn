import { NextResponse } from 'next/server';
import { Client, Databases, Query, ID, Permission, Role } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'room_availability';
const OVERRIDES_FILE = path.join(process.cwd(), '..', 'availability_overrides.json');

function getDatabases() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';
  const apiKey = process.env.APPWRITE_API_KEY || 'standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31';

  const client = new Client();
  if (endpoint) client.setEndpoint(endpoint);
  if (projectId) client.setProject(projectId);
  if (apiKey) client.setKey(apiKey);

  return new Databases(client);
}

// 1. GET: fetch from Appwrite database room_availability collection first, then merge local file if exists
export async function GET() {
  const overrides: Record<string, Record<string, { price?: number; available?: number; blocked?: boolean }>> = {};

  try {
    const databases = getDatabases();
    const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5000)]);
    for (const doc of res.documents) {
      if (doc.roomId && doc.date) {
        if (!overrides[doc.roomId]) overrides[doc.roomId] = {};
        overrides[doc.roomId][doc.date] = {
          price: doc.price !== undefined ? Number(doc.price) : undefined,
          available: doc.availableCount !== undefined ? Number(doc.availableCount) : undefined,
          blocked: Boolean(doc.isBlocked)
        };
      }
    }
  } catch (err: unknown) {
    console.warn('Appwrite room_availability fetch fallback to file/empty:', err);
  }

  // Local fallback if on localhost
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const fileContent = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf-8'));
      for (const [rId, dMap] of Object.entries(fileContent)) {
        if (!overrides[rId]) overrides[rId] = {};
        for (const [dKey, dVal] of Object.entries(dMap as any)) {
          if (!overrides[rId][dKey]) {
            overrides[rId][dKey] = dVal as any;
          }
        }
      }
    }
  } catch (e) {
    // Ignore in serverless / production
  }

  return NextResponse.json(
    { success: true, overrides },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}

// 2. POST: save directly to Appwrite database room_availability collection
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newOverrides = body.overrides || {};
    const databases = getDatabases();

    const permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any())
    ];

    for (const [roomId, dateMap] of Object.entries(newOverrides)) {
      for (const [date, val] of Object.entries(dateMap as Record<string, any>)) {
        try {
          const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('roomId', roomId),
            Query.equal('date', date),
            Query.limit(1)
          ]);

          const payload = {
            ...(val.price !== undefined ? { price: Number(val.price) } : {}),
            ...(val.available !== undefined ? { availableCount: Number(val.available) } : {}),
            ...(val.blocked !== undefined ? { isBlocked: Boolean(val.blocked) } : {})
          };

          if (existing.documents.length > 0) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTION_ID,
              existing.documents[0].$id,
              payload,
              permissions
            );
          } else {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              ID.unique(),
              {
                roomId,
                date,
                price: Number(val.price || 0),
                availableCount: Number(val.available !== undefined ? val.available : 1),
                isBlocked: Boolean(val.blocked)
              },
              permissions
            );
          }
        } catch (itemErr) {
          console.warn(`Failed to upsert room_availability for ${roomId} ${date}:`, itemErr);
        }
      }
    }

    // Also write to local file if environment allows
    try {
      if (fs.existsSync(path.dirname(OVERRIDES_FILE))) {
        let current = {};
        if (fs.existsSync(OVERRIDES_FILE)) {
          try { current = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf-8')); } catch {}
        }
        const updated = { ...current, ...newOverrides };
        fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      }
    } catch (fsErr) {
      // Expected in serverless read-only filesystem
    }

    return NextResponse.json({ success: true, overrides: newOverrides });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
