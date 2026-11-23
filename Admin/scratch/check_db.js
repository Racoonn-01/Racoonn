const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function check() {
    try {
        const res = await databases.listCollections('6a3cec630035d63ea963');
        console.log(res.collections.map(c => ({ id: c.$id, name: c.name })));
    } catch (e) {
        console.error(e);
    }
}

check();
