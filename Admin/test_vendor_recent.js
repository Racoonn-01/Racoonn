const { Client, Databases, Query } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');
const db = new Databases(client);
db.listDocuments('6a3cec630035d63ea963', '6a3e0fd9da7df0d38588', [Query.orderDesc('$updatedAt'), Query.limit(3)]).then(res => console.log(JSON.stringify(res.documents, null, 2))).catch(console.error);
