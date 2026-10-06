const { Client, Storage } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const storage = new Storage(client);

storage.getBucket('6a3e398000280b2b3d20').then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
