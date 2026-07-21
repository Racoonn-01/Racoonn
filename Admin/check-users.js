const { Client, Users } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function check() {
    try {
        const resp = await users.list();
        console.log("Users:", resp.users.map(u => ({ id: u.$id, name: u.name, email: u.email })));
    } catch(e) {
        console.error(e);
    }
}
check();
