const { Client, Databases, Permission, Role } = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../../.env.local') });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureCollection(colId, colName) {
    try {
        await databases.getCollection(dbId, colId);
        console.log(`Collection [${colId}] already exists.`);
    } catch {
        console.log(`Creating collection [${colId}] (${colName})...`);
        await databases.createCollection(
            dbId,
            colId,
            colName,
            [Permission.read(Role.any()), Permission.write(Role.users())]
        );
        console.log(`Created collection [${colId}].`);
        await sleep(1000);
    }
}

async function ensureStringAttr(colId, key, size = 255, required = false, array = false) {
    try {
        await databases.createStringAttribute(dbId, colId, key, size, required, undefined, array);
        console.log(`  + String attr [${key}] created in [${colId}]`);
        await sleep(700);
    } catch (e) {
        if (!e.message.includes('already exists')) {
            console.log(`  Attr [${key}] note: ${e.message}`);
        }
    }
}

async function ensureIntegerAttr(colId, key, required = false) {
    try {
        await databases.createIntegerAttribute(dbId, colId, key, required);
        console.log(`  + Integer attr [${key}] created in [${colId}]`);
        await sleep(700);
    } catch (e) {
        if (!e.message.includes('already exists')) {
            console.log(`  Attr [${key}] note: ${e.message}`);
        }
    }
}

async function ensureBooleanAttr(colId, key, required = false, defaultValue = false) {
    try {
        await databases.createBooleanAttribute(dbId, colId, key, required, defaultValue);
        console.log(`  + Boolean attr [${key}] created in [${colId}]`);
        await sleep(700);
    } catch (e) {
        if (!e.message.includes('already exists')) {
            console.log(`  Attr [${key}] note: ${e.message}`);
        }
    }
}

async function ensureIndex(colId, key, type, attributes) {
    try {
        await databases.createIndex(dbId, colId, key, type, attributes);
        console.log(`  + Index [${key}] created in [${colId}]`);
        await sleep(700);
    } catch (e) {
        if (!e.message.includes('already exists')) {
            console.log(`  Index [${key}] note: ${e.message}`);
        }
    }
}

async function runSetup() {
    console.log("=== Starting Racoonn Partner API Schema Provisioning ===");

    // 1. integration_api_keys
    await ensureCollection('integration_api_keys', 'IntegrationApiKeys');
    await ensureStringAttr('integration_api_keys', 'name', 255, true);
    await ensureStringAttr('integration_api_keys', 'partner', 255, true);
    await ensureStringAttr('integration_api_keys', 'keyPrefix', 64, true);
    await ensureStringAttr('integration_api_keys', 'keyHash', 255, true);
    await ensureStringAttr('integration_api_keys', 'environment', 32, true);
    await ensureStringAttr('integration_api_keys', 'status', 32, true);
    await ensureStringAttr('integration_api_keys', 'permissions', 255, false, true);
    await ensureStringAttr('integration_api_keys', 'createdBy', 255, false);
    await ensureStringAttr('integration_api_keys', 'expiresAt', 64, false);
    await ensureStringAttr('integration_api_keys', 'lastUsedAt', 64, false);
    await ensureIntegerAttr('integration_api_keys', 'rateLimit', false);
    await ensureIndex('integration_api_keys', 'idx_keyHash', 'unique', ['keyHash']);
    await ensureIndex('integration_api_keys', 'idx_partner_status', 'key', ['partner', 'status']);

    // 2. integration_property_access
    await ensureCollection('integration_property_access', 'IntegrationPropertyAccess');
    await ensureStringAttr('integration_property_access', 'apiKeyId', 255, true);
    await ensureStringAttr('integration_property_access', 'partner', 255, true);
    await ensureStringAttr('integration_property_access', 'propertyId', 255, true);
    await ensureStringAttr('integration_property_access', 'status', 32, true);
    await ensureIndex('integration_property_access', 'idx_api_prop', 'key', ['apiKeyId', 'propertyId']);
    await ensureIndex('integration_property_access', 'idx_partner_prop', 'key', ['partner', 'propertyId']);

    // 3. integration_idempotency_keys
    await ensureCollection('integration_idempotency_keys', 'IntegrationIdempotencyKeys');
    await ensureStringAttr('integration_idempotency_keys', 'partner', 255, true);
    await ensureStringAttr('integration_idempotency_keys', 'idempotencyKey', 255, true);
    await ensureStringAttr('integration_idempotency_keys', 'endpoint', 255, true);
    await ensureStringAttr('integration_idempotency_keys', 'requestHash', 255, true);
    await ensureStringAttr('integration_idempotency_keys', 'response', 10000, true);
    await ensureStringAttr('integration_idempotency_keys', 'status', 32, true);
    await ensureStringAttr('integration_idempotency_keys', 'expiresAt', 64, true);
    await ensureIndex('integration_idempotency_keys', 'idx_partner_key', 'unique', ['partner', 'idempotencyKey']);

    // 4. webhook_endpoints
    await ensureCollection('webhook_endpoints', 'WebhookEndpoints');
    await ensureStringAttr('webhook_endpoints', 'partner', 255, true);
    await ensureStringAttr('webhook_endpoints', 'apiKeyId', 255, false);
    await ensureStringAttr('webhook_endpoints', 'url', 1000, true);
    await ensureStringAttr('webhook_endpoints', 'events', 255, false, true);
    await ensureStringAttr('webhook_endpoints', 'status', 32, true);
    await ensureStringAttr('webhook_endpoints', 'secret', 255, true);
    await ensureStringAttr('webhook_endpoints', 'lastDeliveryAt', 64, false);
    await ensureIndex('webhook_endpoints', 'idx_webhook_partner', 'key', ['partner', 'status']);

    // 5. webhook_deliveries
    await ensureCollection('webhook_deliveries', 'WebhookDeliveries');
    await ensureStringAttr('webhook_deliveries', 'webhookEndpointId', 255, true);
    await ensureStringAttr('webhook_deliveries', 'eventId', 255, true);
    await ensureStringAttr('webhook_deliveries', 'eventType', 255, true);
    await ensureIntegerAttr('webhook_deliveries', 'attempt', true);
    await ensureStringAttr('webhook_deliveries', 'status', 32, true);
    await ensureIntegerAttr('webhook_deliveries', 'httpStatus', false);
    await ensureIntegerAttr('webhook_deliveries', 'responseTime', false);
    await ensureStringAttr('webhook_deliveries', 'error', 1000, false);
    await ensureStringAttr('webhook_deliveries', 'deliveredAt', 64, false);
    await ensureStringAttr('webhook_deliveries', 'payload', 10000, false);
    await ensureIndex('webhook_deliveries', 'idx_event_endpoint', 'key', ['eventId', 'webhookEndpointId']);

    // 6. integration_api_logs
    await ensureCollection('integration_api_logs', 'IntegrationApiLogs');
    await ensureStringAttr('integration_api_logs', 'partner', 255, true);
    await ensureStringAttr('integration_api_logs', 'apiKeyId', 255, false);
    await ensureStringAttr('integration_api_logs', 'method', 16, true);
    await ensureStringAttr('integration_api_logs', 'path', 500, true);
    await ensureIntegerAttr('integration_api_logs', 'statusCode', true);
    await ensureStringAttr('integration_api_logs', 'requestId', 255, true);
    await ensureIntegerAttr('integration_api_logs', 'responseTime', true);
    await ensureStringAttr('integration_api_logs', 'ip', 128, false);
    await ensureStringAttr('integration_api_logs', 'environment', 32, false);
    await ensureIndex('integration_api_logs', 'idx_log_req', 'key', ['requestId']);
    await ensureIndex('integration_api_logs', 'idx_log_partner', 'key', ['partner']);

    console.log("=== Setup Completed Successfully ===");
}

runSetup().catch(err => {
    console.error("Setup error:", err);
    process.exit(1);
});
