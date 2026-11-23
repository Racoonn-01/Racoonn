const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

databases.listDocuments(
    '6a3cec630035d63ea963',
    'properties',
    [
        sdk.Query.limit(100)
    ]
).then(response => {
    console.log(response.documents.map(d => ({id: d.$id, name: d.propertyName, detailsLength: d.details ? d.details.length : 0})));
}).catch(err => {
    console.error(err);
});
