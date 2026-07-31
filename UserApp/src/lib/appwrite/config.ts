import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6a3bce6900381359c3ce');

export const appwriteConfig = {
  databaseId: '6a3cec630035d63ea963',
  roomCollectionId: 'rooms',
  bookingCollectionId: 'bookings',
  reviewCollectionId: '6a59c6f526bfcf71ddbf',
  activitiesCollectionId: 'activities',
  profilesCollectionId: 'UserProfiles',
  propertyCollectionId: 'properties',
};

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
