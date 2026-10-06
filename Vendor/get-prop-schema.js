const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
databases.getDocument('6a3cec630035d63ea963', 'properties', '6a4645d500061bbfb3d1')
.then(res => {
    console.log(JSON.stringify(res, null, 2));
})
.catch(console.error);
