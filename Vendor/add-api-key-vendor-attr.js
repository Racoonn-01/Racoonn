const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

const dbId = '6a3cec630035d63ea963'; // from earlier

async function run() {
    const res = await databases.listCollections(dbId);
    const vendorCol = res.collections.find(c => c.name === 'Vendors');
    if (!vendorCol) {
        console.error("Vendors collection not found!");
        return;
    }
    const colId = vendorCol.$id;
    
    const createAttr = async (key, size = 255, required = false) => {
        try {
            await databases.createStringAttribute(dbId, colId, key, size, required);
            console.log(`Created string attr ${key}`);
        } catch (e) {
            console.log(`Skipped string ${key}: ${e.message}`);
        }
    };
    
    await createAttr('apiKey', 255, false);
    await createAttr('apiSecret', 255, false);
    
    console.log("Done");
}
run();
