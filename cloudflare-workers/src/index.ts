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

export default app;
