const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

const databases = new sdk.Databases(client);

databases.listDocuments('6a3cec630035d63ea963', 'properties').then(res => {
    console.log(JSON.stringify(res.documents, null, 2));
}).catch(err => console.error(err));
