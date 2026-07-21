const { Client, Storage, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const fs = require('fs');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const storage = new Storage(client);

async function run() {
    try {
        fs.writeFileSync('test-image.jpg', 'fake image content');
        const file = InputFile.fromPath('test-image.jpg', 'test-image.jpg');
        const res = await storage.createFile('6a3e398000280b2b3d20', ID.unique(), file);
        console.log("Success:", res.$id);
    } catch(e) {
        console.error(e);
    }
}
run();
