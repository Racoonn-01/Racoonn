const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY || 'standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const databases = new Databases(client);

async function run() {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    try {
        console.log('Creating support_tickets collection...');
        const collection = await databases.createCollection(
            dbId,
            'support_tickets',
            'Support Tickets',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]
        );
        console.log('Collection created:', collection.$id);

        console.log('Creating attributes...');
        await databases.createStringAttribute(dbId, collection.$id, 'subject', 255, true);
        await databases.createStringAttribute(dbId, collection.$id, 'category', 100, true);
        await databases.createStringAttribute(dbId, collection.$id, 'description', 5000, true);
        await databases.createStringAttribute(dbId, collection.$id, 'vendorId', 255, true);
        await databases.createStringAttribute(dbId, collection.$id, 'status', 50, false, 'Open');
        
        console.log('Attributes created. Please note it may take a few seconds for attributes to be fully available.');
        
        const fs = require('fs');
        const envLocal = fs.readFileSync('.env.local', 'utf8');
        if (!envLocal.includes('NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID')) {
            fs.appendFileSync('.env.local', `\nNEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID=${collection.$id}\n`);
            console.log('Added NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID to Vendor/.env.local');
        }
        
        // Also add to Admin app
        const adminEnvPath = '../Admin/.env';
        if (fs.existsSync(adminEnvPath)) {
            const adminEnv = fs.readFileSync(adminEnvPath, 'utf8');
            if (!adminEnv.includes('APPWRITE_TICKETS_COLLECTION_ID')) {
                fs.appendFileSync(adminEnvPath, `\nAPPWRITE_TICKETS_COLLECTION_ID=${collection.$id}\n`);
                console.log('Added APPWRITE_TICKETS_COLLECTION_ID to Admin/.env');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}
run();
