const { Client, Account, Databases, Users } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function run() {
    try {
        // Change password
        await users.updatePassword('6a44e9d4003015938636', 'Preet@1234');
        
        // Log in as user
        const client2 = new Client()
            .setEndpoint('https://sgp.cloud.appwrite.io/v1')
            .setProject('6a3bce6900381359c3ce');
        const account = new Account(client2);
        const session = await account.createEmailPasswordSession('blackrolex1144@gmail.com', 'Preet@1234');
        
        // Try updateDocument as user
        const db = new Databases(client2);
        await db.updateDocument('6a3cec630035d63ea963', '6a3e0fd9da7df0d38588', '6a44e9d4003015938636', {
            firstName: "John",
            lastName: "Smith",
            phone: "+91 7900310444",
            profileImage: "6a4660b600087e35d001"
        });
        
        console.log("Success client update");
    } catch (e) {
        console.error(e);
    }
}
run();
