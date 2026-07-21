const { Client, Account, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

// Simulate client SDK by logging in with user credentials
const account = new Account(client);
const databases = new Databases(client);

async function run() {
    try {
        await account.createEmailPasswordSession('blackrolex1144@gmail.com', 'Preet@1234'); // wait, I don't know the password.
        // Let's create a session using the server SDK, get a session token, and use it?
        
    } catch (e) {
        console.error(e);
    }
}
run();
