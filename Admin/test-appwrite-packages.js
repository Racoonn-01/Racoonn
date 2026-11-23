const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
// Let's first get the collection ID of 'Packages' by listing again to get IDs.
databases.listCollections('6a3cec630035d63ea963').then(async res => {
    const packagesCollection = res.collections.find(c => c.name === 'Packages');
    if (packagesCollection) {
        console.log("Packages Collection ID:", packagesCollection.$id);
        const docs = await databases.listDocuments('6a3cec630035d63ea963', packagesCollection.$id);
        console.log("Packages count:", docs.total);
        console.log(docs.documents.map(d => ({id: d.$id, title: d.title || d.name || d.propertyName})));
    }
}).catch(err => {
    console.error(err);
});
