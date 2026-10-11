const { Client, Databases } = require('appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

const databases = new Databases(client);

async function test() {
    try {
        const res = await databases.listDocuments('6a3e2182003c2005da30', 'properties');
        console.log(JSON.stringify(res.documents[0].photos, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
