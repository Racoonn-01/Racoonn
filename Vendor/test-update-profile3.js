const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

// using vendor ID from the previous task
const docId = '6a44e9d4003015938636'; 

databases.updateDocument('6a3cec630035d63ea963', '6a3e0fd9da7df0d38588', docId, {
    firstName: "",
    lastName: "",
    phone: "+91 7900310444",
}).then(res => console.log("Success")).catch(console.error);
