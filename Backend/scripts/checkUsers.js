const { Client, Users } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function listUsers() {
    try {
        const userList = await users.list();
        console.log("Total users:", userList.total);
        userList.users.forEach(u => {
            console.log(`- Email: ${u.email}, Name: ${u.name}, ID: ${u.$id}`);
        });
    } catch (e) {
        console.error("Error listing users:", e.message);
    }
}

listUsers();
