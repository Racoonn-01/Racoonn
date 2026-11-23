const { Client, Databases } = require('appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

const databases = new Databases(client);
databases.listDocuments('6a3cec630035d63ea963', 'rooms').then(res => {
    console.log(JSON.stringify(res.documents.map(r => ({ name: r.name, photos: r.photos })), null, 2));
}).catch(console.error);
