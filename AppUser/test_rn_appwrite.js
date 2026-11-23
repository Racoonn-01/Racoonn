const { Client, Storage } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

const storage = new Storage(client);
const view = storage.getFileView('6a3e398000280b2b3d20', '6a4649d70031cfda07c1');
console.log(typeof view);
console.log(view.toString ? view.toString() : view);
