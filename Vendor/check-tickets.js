const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY || 'standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const databases = new Databases(client);

async function run() {
    try {
        const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        const ticketsCol = collections.collections.find(c => c.name.toLowerCase().includes('ticket'));
        if (ticketsCol) {
            console.log('Found tickets collection:', ticketsCol.$id, ticketsCol.name);
        } else {
            console.log('No tickets collection found.');
        }
    } catch (error) {
        console.error(error);
    }
}
run();
