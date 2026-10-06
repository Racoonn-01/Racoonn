const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

databases.listCollections('6a3cec630035d63ea963').then(res => {
    console.log(res.collections.map(c => c.name));
}).catch(err => {
    console.error(err);
});
