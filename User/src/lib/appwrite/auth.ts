import { ID, OAuthProvider } from 'appwrite';
import { account, databases } from './config';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'RacoonnDB';
const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID || 'UserProfiles';

export const authService = {
  async register(email: string, password: string, name: string) {
    // 1. Create Appwrite Account
    const userAccount = await account.create(ID.unique(), email, password, name);
    
    // 2. Create Session
    await account.createEmailPasswordSession(email, password);
    
    // 3. Create User Profile
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
      if (!profile) throw new Error("Profile not found");

      const savedHotels = profile.savedHotels || [];
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
      console.error("Appwrite service :: toggleSavedHotel :: error", error);
      throw error;
    }
  },

  async saveUserProfile(userId: string, data: Record<string, unknown>) {
    try {
      // try to update
      return await databases.updateDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId,
        data
      );
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as Record<string, unknown>).code === 404) {
        // document not found, create it
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

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send reset email');
    }
    return await res.json();
  },

  async resetPassword(userId: string, secret: string, password: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, secret, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to reset password');
    }
    return await res.json();
  }
};
