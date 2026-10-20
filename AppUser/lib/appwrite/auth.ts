import { ID, OAuthProvider } from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { account, databases, appwriteConfig } from './config';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async register(email: string, password: string, name: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Clear any existing active session to avoid 401 session-in-use conflict
    try {
      await account.deleteSession('current');
    } catch {}

    const userAccount = await account.create(ID.unique(), cleanEmail, password, cleanName);
    await account.createEmailPasswordSession(cleanEmail, password);

    let profile = null;
    try {
      profile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userAccount.$id,
        {
          userId: userAccount.$id,
          email: cleanEmail,
          name: cleanName,
          role: 'Customer',
        }
      );
    } catch (profileError) {
      console.warn('Could not create profile document during register (will be handled by checkAuth):', profileError);
      try {
        profile = await this.saveUserProfile(userAccount.$id, {
          userId: userAccount.$id,
          email: cleanEmail,
          name: cleanName,
          role: 'Customer',
        });
      } catch {}
    }

    return { userAccount, profile };
  },

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    // Clear any existing active session to avoid 401 session-in-use conflict
    try {
      await account.deleteSession('current');
    } catch {}
    const session = await account.createEmailPasswordSession(cleanEmail, password);
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

  async deleteAccount(userId: string) {
    try {
      // 1. Delete user profile document from Appwrite databases
      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          userId
        );
      } catch (err) {
        console.warn('Failed to delete profile document:', err);
      }

      // 2. Completely delete user account from Appwrite via server API
      try {
        await fetch(`${appwriteConfig.endpoint}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'X-Appwrite-Project': appwriteConfig.projectId,
            'X-Appwrite-Key': 'standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31',
          },
        });
      } catch (err) {
        console.warn('Failed to delete user via users API, falling back to updateStatus:', err);
        try {
          await account.updateStatus();
        } catch {}
      }

      // 3. Terminate sessions
      try {
        await account.deleteSessions();
      } catch {
        try {
          await account.deleteSession('current');
        } catch {}
      }

      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteAccount :: error', error);
      throw error;
    }
  },
};
