const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce') // Assuming project ID from URLs
    .setKey(process.env.APPWRITE_API_KEY || ''); // We might not have the key

const databases = new sdk.Databases(client);

databases.listDocuments(
    '6a3cec630035d63ea963',
    'properties'
).then(response => {
    console.log(response.documents.map(d => ({id: d.$id, name: d.propertyName})));
}).catch(err => {
    console.error(err);
});
