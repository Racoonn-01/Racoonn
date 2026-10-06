const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

databases.listAttributes('6a3cec630035d63ea963', 'promotions').then(res => {
    console.log(res.attributes.map(a => a.key));
}).catch(console.error);
