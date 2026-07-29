const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const databases = new Databases(client);

async function setupPromotionsCollection() {
    const dbId = '6a3cec630035d63ea963';
    const collectionId = 'promotions';

    console.log("Setting up 'promotions' collection...");

    try {
        await databases.createCollection(
            dbId,
            collectionId,
            'Promotions',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]
        );
        console.log("Collection created successfully.");
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        if (error.code === 409) {
            console.log("Collection already exists. Proceeding to add attributes...");
        } else {
            console.error("Error creating collection:", error);
            return;
        }
    }

    const attributes = [
        () => databases.createStringAttribute(dbId, collectionId, 'name', 255, true),
        () => databases.createStringAttribute(dbId, collectionId, 'code', 255, true),
        () => databases.createStringAttribute(dbId, collectionId, 'type', 255, true),
        () => databases.createStringAttribute(dbId, collectionId, 'discountType', 255, true),
        () => databases.createFloatAttribute(dbId, collectionId, 'discountValue', true),
        () => databases.createFloatAttribute(dbId, collectionId, 'minOrderValue', true),
        () => databases.createStringAttribute(dbId, collectionId, 'status', 255, true),
        () => databases.createStringAttribute(dbId, collectionId, 'validUntil', 255, false),
        () => databases.createStringAttribute(dbId, collectionId, 'description', 5000, false),
        () => databases.createStringAttribute(dbId, collectionId, 'image', 1024, false),
    ];

    for (const createAttr of attributes) {
        try {
            await createAttr();
            console.log("Attribute created.");
        } catch (error) {
            if (error.code === 409) {
                console.log("Attribute already exists.");
            } else {
                console.error("Error creating attribute:", error.message);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Finished setting up promotions collection.");
}

setupPromotionsCollection();
