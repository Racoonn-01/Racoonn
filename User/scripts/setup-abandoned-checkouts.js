const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setup() {
  const dbId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = 'abandoned_checkouts';

  try {
    console.log('Creating collection...');
    await databases.createCollection(
      dbId,
      collectionId,
      'Abandoned Checkouts',
      [
        Permission.read(Role.any()),
        Permission.write(Role.any())
      ]
    );
    console.log('Collection created.');

    const attributes = [
      { key: 'userId', type: 'string', required: false },
      { key: 'sessionId', type: 'string', required: true },
      { key: 'email', type: 'string', required: true },
      { key: 'name', type: 'string', required: false },
      { key: 'phone', type: 'string', required: false },
      { key: 'hotelId', type: 'string', required: false },
      { key: 'roomId', type: 'string', required: false },
      { key: 'roomName', type: 'string', required: false },
      { key: 'checkIn', type: 'string', required: false },
      { key: 'checkOut', type: 'string', required: false },
      { key: 'guests', type: 'string', required: false },
      { key: 'amount', type: 'float', required: false },
      { key: 'currency', type: 'string', required: false },
      { key: 'checkoutUrl', type: 'string', required: false },
      { key: 'bookingId', type: 'string', required: false },
      { key: 'paymentId', type: 'string', required: false },
      { key: 'status', type: 'string', required: true },
      { key: 'emailSent', type: 'boolean', required: false },
      { key: 'emailSentAt', type: 'string', required: false },
      { key: 'expiresAt', type: 'string', required: false },
      { key: 'recoveryToken', type: 'string', required: false }
    ];

    for (const attr of attributes) {
      console.log(`Adding attribute: ${attr.key}`);
      if (attr.type === 'string') {
        await databases.createStringAttribute(dbId, collectionId, attr.key, 255, attr.required);
      } else if (attr.type === 'float') {
        await databases.createFloatAttribute(dbId, collectionId, attr.key, attr.required);
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(dbId, collectionId, attr.key, attr.required, false);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Done!');
  } catch (error) {
    console.error(error);
  }
}

setup();
