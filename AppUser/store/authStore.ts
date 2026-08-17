import { create } from 'zustand';
import { authService } from '../lib/appwrite/auth';
import { Models } from 'react-native-appwrite';

export interface UserProfile extends Models.Document {
  name: string;
  email: string;
  role: string;
  userId: string;
  savedHotels?: string[];
  savedPackages?: string[];
  gender?: string;
  phone?: string;
  city?: string;
  state?: string;
  dob?: string;
  nationality?: string;
  maritalStatus?: string;
}

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  toggleSavedHotel: (hotelId: string) => Promise<void>;
  toggleSavedPackage: (packageId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        let profile = (await authService.getUserProfile(user.$id)) as unknown as UserProfile;

        if (!profile) {
          try {
            await authService.saveUserProfile(user.$id, {
              name: user.name,
              email: user.email,
            });
            profile = (await authService.getUserProfile(user.$id)) as unknown as UserProfile;
          } catch (createError) {
            console.error('Failed to auto-create profile for new user', createError);
          }
        }

        if (profile) {
          if (typeof profile.savedHotels === 'string') {
            try { profile.savedHotels = JSON.parse(profile.savedHotels); }
            catch { profile.savedHotels = (profile.savedHotels as string).split(',').filter(Boolean); }
          }
          if (typeof profile.savedPackages === 'string') {
            try { profile.savedPackages = JSON.parse(profile.savedPackages); }
            catch { profile.savedPackages = (profile.savedPackages as string).split(',').filter(Boolean); }
          }
        }

        set({ user, profile, isAuthenticated: true });
      } else {
        set({ user: null, profile: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, profile: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, profile: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  toggleSavedHotel: async (hotelId: string) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const currentSaved = profile.savedHotels || [];
    const newSaved = currentSaved.includes(hotelId)
      ? currentSaved.filter((id) => id !== hotelId)
      : [...currentSaved, hotelId];

    set({ profile: { ...profile, savedHotels: newSaved } as UserProfile });

    try {
      await authService.toggleSavedHotel(user.$id, hotelId);
    } catch (error) {
      console.error('Failed to toggle saved hotel on Appwrite:', error);
      set({ profile: { ...profile, savedHotels: currentSaved } as UserProfile });
    }
  },

  toggleSavedPackage: async (packageId: string) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const currentSaved = profile.savedPackages || [];
    const newSaved = currentSaved.includes(packageId)
      ? currentSaved.filter((id) => id !== packageId)
      : [...currentSaved, packageId];

    set({ profile: { ...profile, savedPackages: newSaved } as UserProfile });

    try {
      await authService.toggleSavedPackage(user.$id, packageId);
    } catch (error) {
      console.error('Failed to toggle saved package on Appwrite:', error);
      set({ profile: { ...profile, savedPackages: currentSaved } as UserProfile });
    }
  },
}));
