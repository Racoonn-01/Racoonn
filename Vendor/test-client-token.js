const { Client, Account, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const account = new Account(client);

async function run() {
    try {
        const token = await account.createSession('6a44e9d4003015938636');
        console.log(token.secret);
        
        // now use this session
        const client2 = new Client()
            .setEndpoint('https://sgp.cloud.appwrite.io/v1')
            .setProject('6a3bce6900381359c3ce')
            .setSession(token.secret);
            
        const db = new Databases(client2);
        
        await db.updateDocument('6a3cec630035d63ea963', '6a3e0fd9da7df0d38588', '6a44e9d4003015938636', {
            firstName: "",
            lastName: "",
            phone: "+91 7900310444"
        });
        console.log("Success with client token");
    } catch (e) {
        console.error(e);
    }
}
run();
