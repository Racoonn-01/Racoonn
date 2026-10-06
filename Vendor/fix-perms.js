const { Client, Databases, Permission, Role } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

async function fix() {
  try {
    const prop = await databases.getDocument('6a3cec630035d63ea963', 'properties', '6a4645d500061bbfb3d1');
    const perms = prop.$permissions;
    if (!perms.includes('read("any")')) {
      perms.push('read("any")');
    }
    await databases.updateDocument('6a3cec630035d63ea963', 'properties', '6a4645d500061bbfb3d1', {}, perms);
    console.log('Fixed permissions for property!');
  } catch(e) {
    console.error(e);
  }
}
fix();
