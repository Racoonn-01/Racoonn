import { ID, OAuthProvider, Permission, Role } from 'appwrite';
import { account, databases, appwriteConfig } from './client';

export const authService = {
  async register(email: string, password: string, name: string) {
    try {
      // Clear all active sessions to avoid Appwrite max session limit error (100 sessions per user)
      await account.deleteSessions();
    } catch {} // Ignore if no active session

    // 1. Create Appwrite Account
    const userAccount = await account.create(ID.unique(), email, password, name);
    
    // 2. Create Session
    await account.createEmailPasswordSession(email, password);
    
    // 3. Create Vendor Profile
    try {
      const profile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        userAccount.$id,
        {
          userId: userAccount.$id,
          email: email,
          status: 'Pending',
          role: 'Vendor',
          businessName: name || email.split('@')[0],
        },
        [
          Permission.read(Role.user(userAccount.$id)),
          Permission.write(Role.user(userAccount.$id)),
          Permission.update(Role.user(userAccount.$id)),
          Permission.delete(Role.user(userAccount.$id))
        ]
      );
      return { userAccount, profile };
    } catch (e) {
      console.warn("Could not create vendor profile document yet:", e);
      return { userAccount, profile: null };
    }
  },

  async login(email: string, password: string) {
    try {
      // Delete all existing sessions on login to avoid reaching Appwrite 100 sessions per user limit
      await account.deleteSessions();
    } catch {} // Ignore if no session

    const session = await account.createEmailPasswordSession(email, password);
    
    // Check if the user has a Vendor profile, but don't delete session if they don't!
    // They might be in the middle of onboarding.
    const user = await account.get();
    try {
      await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        user.$id
      );
    } catch {
      console.warn("No vendor profile found for this user. They must complete onboarding.");
    }
    
    return session;
  },

  async loginWithGoogle() {
    account.createOAuth2Session(
      OAuthProvider.Google, // provider
      `${window.location.origin}/`, // success url
      `${window.location.origin}/`  // failure url
    );
  },

  async logout() {
    return await account.deleteSession('current');
  },

  async getCurrentVendorUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  async getVendorProfile(userId: string) {
    try {
      return await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        userId
      );
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    return await account.createRecovery(
      email,
      `${window.location.origin}/vendor/reset-password`
    );
  },

  async resetPassword(userId: string, secret: string, password: string) {
    return await account.updateRecovery(userId, secret, password);
  },

  async createInitialVendorProfile(user: any) {
    try {
      const profile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        user.$id,
        {
          userId: user.$id,
          email: user.email,
          status: 'Pending',
          role: 'Vendor',
          businessName: user.name || user.email.split('@')[0],
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      return profile;
    } catch (e) {
      console.warn("Could not create initial vendor profile document:", e);
      return null;
    }
  }
};
