import { Client, Databases, Query } from 'node-appwrite';
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '670be6550005a7465355'); // Checking user app .env.local usually has it, let's just grep env
