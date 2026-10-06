const { Client, Databases, Query } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
databases.listDocuments('6a3cec630035d63ea963', 'properties', [Query.limit(1), Query.orderDesc('$createdAt')])
.then(res => {
    if (res.documents.length > 0) {
        console.log("ID:", res.documents[0].$id, "Name:", res.documents[0].propertyName || res.documents[0].name);
    } else {
        console.log("No properties found");
    }
})
.catch(console.error);
