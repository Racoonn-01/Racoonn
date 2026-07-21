const { Client, Account, Databases, Users } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

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
