import { ID } from 'appwrite';
import { account, databases, appwriteConfig } from './config';

const DATABASE_ID = appwriteConfig.databaseId;
const PROFILES_COLLECTION_ID = appwriteConfig.profilesCollectionId;

export const authService = {
  async register(email: string, password: string, name: string) {
    const userAccount = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const profile = await databases.createDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userAccount.$id,
      {
        userId: userAccount.$id,
        email: email,
        name: name,
        role: 'Customer',
      }
    );
    return { userAccount, profile };
  },

  async login(email: string, password: string) {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  },

  async logout() {
    return await account.deleteSession('current');
  },

  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch {
      return null;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId
      );
      return profile;
    } catch {
      return null;
    }
  },

  async toggleSavedHotel(userId: string, hotelId: string) {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const savedHotels = (profile as any).savedHotels || [];
      let newSavedHotels;

      if (savedHotels.includes(hotelId)) {
        newSavedHotels = savedHotels.filter((id: string) => id !== hotelId);
      } else {
        newSavedHotels = [...savedHotels, hotelId];
      }

      return await databases.updateDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId,
        { savedHotels: newSavedHotels }
      );
    } catch (error) {
      console.error('Appwrite service :: toggleSavedHotel :: error', error);
      throw error;
    }
  },

  async saveUserProfile(userId: string, data: Record<string, unknown>) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId,
        data
      );
    } catch (e: any) {
      if (e && typeof e === 'object' && e.code === 404) {
        return await databases.createDocument(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          userId,
          { userId, role: 'Customer', ...data }
        );
      }
      throw e;
    }
  },
};
