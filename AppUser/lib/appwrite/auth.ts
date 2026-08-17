import { ID, OAuthProvider } from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { account, databases, appwriteConfig } from './config';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async register(email: string, password: string, name: string) {
    const userAccount = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);

    const profile = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.profilesCollectionId,
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

  async loginWithGoogle() {
    try {
      const redirectUrl = Linking.createURL('/');
      const loginUrl = account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUrl,
        redirectUrl
      );

      if (!loginUrl) throw new Error('Failed to generate Google Sign-in URL');

      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl.toString(),
        redirectUrl
      );

      if (result.type === 'success') {
        const url = Linking.parse(result.url);
        const secret = url.queryParams?.secret as string;
        const userId = url.queryParams?.userId as string;

        if (secret && userId) {
          await account.createSession(userId, secret);
          const currentUser = await account.get();
          if (currentUser) {
            await this.saveUserProfile(currentUser.$id, {
              userId: currentUser.$id,
              email: currentUser.email,
              name: currentUser.name || 'Racoonn Traveler',
              role: 'Customer',
            });
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Appwrite service :: loginWithGoogle :: error', error);
      throw error;
    }
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
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
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

      let savedHotels: string[] = [];
      if (Array.isArray(profile.savedHotels)) {
        savedHotels = profile.savedHotels;
      } else if (typeof profile.savedHotels === 'string') {
        try { savedHotels = JSON.parse(profile.savedHotels); }
        catch { savedHotels = profile.savedHotels.split(',').filter(Boolean); }
      }
      let newSavedHotels: string[];

      if (savedHotels.includes(hotelId)) {
        newSavedHotels = savedHotels.filter((id: string) => id !== hotelId);
      } else {
        newSavedHotels = [...savedHotels, hotelId];
      }

      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        { savedHotels: newSavedHotels }
      );
    } catch (error) {
      console.error('Appwrite service :: toggleSavedHotel :: error', error);
      throw error;
    }
  },

  async toggleSavedPackage(userId: string, packageId: string) {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) throw new Error('Profile not found');

      let savedPackages: string[] = [];
      if (Array.isArray(profile.savedPackages)) {
        savedPackages = profile.savedPackages;
      } else if (typeof profile.savedPackages === 'string') {
        try { savedPackages = JSON.parse(profile.savedPackages); }
        catch { savedPackages = profile.savedPackages.split(',').filter(Boolean); }
      }
      let newSavedPackages: string[];

      if (savedPackages.includes(packageId)) {
        newSavedPackages = savedPackages.filter((id: string) => id !== packageId);
      } else {
        newSavedPackages = [...savedPackages, packageId];
      }

      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        { savedPackages: newSavedPackages }
      );
    } catch (error) {
      console.error('Appwrite service :: toggleSavedPackage :: error', error);
      throw error;
    }
  },

  async saveUserProfile(userId: string, data: Record<string, unknown>) {
    try {
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        data
      );
    } catch {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        { userId, ...data }
      );
    }
  },
};
