import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Client, Databases } from 'node-appwrite';

// Define the environment variables expected by the worker
type Bindings = {
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_API_KEY: string;
  APPWRITE_DATABASE_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
app.use('/*', cors({
  origin: '*', // In production, replace with your actual frontend domain
  allowHeaders: ['Content-Type', 'Authorization', 'X-Appwrite-Project'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// Root endpoint for testing
app.get('/', (c) => {
  return c.text('Racoonn Cloudflare Worker Appwrite Proxy is Running!');
});

// Example Appwrite Proxy Endpoint: Fetch Hotels
app.get('/api/hotels', async (c) => {
  try {
    const client = new Client()
      .setEndpoint(c.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(c.env.APPWRITE_PROJECT_ID)
      .setKey(c.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    // Fetch hotels from the database
    // Replace 'hotels' with your actual collection ID
    const response = await databases.listDocuments(
      c.env.APPWRITE_DATABASE_ID,
      'hotels' 
    );

    return c.json({
      success: true,
      data: response.documents,
      total: response.total
    });
  } catch (error: any) {
    console.error("Appwrite Proxy Error:", error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch hotels'
    }, 500);
  }
});

// Example Appwrite Proxy Endpoint: Save User Profile securely
app.post('/api/profiles', async (c) => {
  try {
    const body = await c.req.json();
    
    const client = new Client()
      .setEndpoint(c.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(c.env.APPWRITE_PROJECT_ID)
      .setKey(c.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    // Securely update a profile using the secret API key
    const response = await databases.updateDocument(
      c.env.APPWRITE_DATABASE_ID,
      'userprofiles', // Profile collection ID
      body.userId,
      body.data
    );

    return c.json({ success: true, data: response });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// OTP Storage in Cloudflare Worker memory/KV
interface OtpRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();

// OTP Send Endpoint
app.post('/api/otp/send', async (c) => {
  try {
    const { method, identifier } = await c.req.json();
    if (!method || !identifier) {
      return c.json({ error: 'Method and identifier required' }, 400);
    }

    const now = Date.now();
    const existing = otpStore.get(identifier);

    if (existing && now - existing.lastSentAt < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
      return c.json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` }, 429);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(identifier, {
      code: otp,
      expiresAt: now + 5 * 60 * 1000,
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`Cloudflare Worker OTP ${otp} generated for ${identifier} via ${method}`);
    return c.json({ success: true, message: `OTP sent successfully to ${identifier}` });
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to send OTP' }, 500);
  }
});

// OTP Verify Endpoint
app.post('/api/otp/verify', async (c) => {
  try {
    const { identifier, code } = await c.req.json();
    const stored = otpStore.get(identifier);

    if (!stored) {
      return c.json({ error: 'No OTP found or it has expired.' }, 400);
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return c.json({ error: 'OTP has expired. Please request a new one.' }, 400);
    }

    if (stored.attempts >= 3) {
      otpStore.delete(identifier);
      return c.json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' }, 429);
    }

    if (stored.code === code) {
      otpStore.delete(identifier);
      return c.json({ success: true, message: 'Verified successfully.' });
    } else {
      stored.attempts += 1;
      const remaining = 3 - stored.attempts;
      if (remaining <= 0) {
        otpStore.delete(identifier);
        return c.json({ error: 'Invalid OTP. Maximum attempts exceeded.' }, 400);
      }
      return c.json({ error: `Invalid OTP code. ${remaining} attempt(s) remaining.` }, 400);
    }
  } catch (error: any) {
    return c.json({ error: error.message || 'Verification error' }, 500);
  }
});

export default app;
