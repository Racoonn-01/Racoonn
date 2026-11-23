const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

databases.listDocuments(
    '6a3cec630035d63ea963', // Database ID
    '6a3e0fd9da7df0d38588', // Vendor Collection ID
).then(res => {
    console.log(res.documents.map(d => ({ email: d.email, profileImage: d.profileImage })));
}).catch(console.error);
