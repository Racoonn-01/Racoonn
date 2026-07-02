import { ID, OAuthProvider, Permission, Role } from 'appwrite';
import { account, databases, appwriteConfig } from './client';

export const authService = {
  async register(email: string, password: string, name: string) {
    try {
      await account.getSession('current');
      await account.deleteSession('current');
    } catch {} // Ignore if no session

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
      await account.getSession('current');
      await account.deleteSession('current');
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
    } catch (error) {
      console.warn("No vendor profile found for this user. They must complete onboarding.");
    }
    
    return session;
  },

  async loginWithGoogle() {
    account.createOAuth2Session(
      OAuthProvider.Google, // provider
      `${window.location.origin}/vendor/dashboard`, // success url
      `${window.location.origin}/vendor/login`  // failure url
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
  }
};
