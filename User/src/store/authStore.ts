import { create } from 'zustand';
import { authService } from '../lib/appwrite/auth';

import { Models } from 'appwrite';

export interface UserProfile extends Models.Document {
  name: string;
  email: string;
  role: string;
  userId: string;
  savedHotels?: string[];
  gender?: string;
  dob?: string;
  nationality?: string;
  maritalStatus?: string;
  anniversary?: string;
  city?: string;
  state?: string;
  phone?: string;
  passportNo?: string;
  passportExpiry?: string;
  passportCountry?: string;
  panCard?: string;
  bio?: string;
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        let profile = await authService.getUserProfile(user.$id) as unknown as UserProfile;
        
        // Auto-create profile document for new OAuth users if it doesn't exist
        if (!profile) {
          try {
            await authService.saveUserProfile(user.$id, {
              name: user.name,
              email: user.email,
            });
            profile = await authService.getUserProfile(user.$id) as unknown as UserProfile;
          } catch (createError) {
            console.error('Failed to auto-create profile for new user', createError);
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
    const { user, profile } = useAuthStore.getState();
    if (!user || !profile) return;
    
    // Optimistic UI update
    const currentSaved = profile.savedHotels || [];
    const newSaved = currentSaved.includes(hotelId)
      ? currentSaved.filter(id => id !== hotelId)
      : [...currentSaved, hotelId];
      
    set({ profile: { ...profile, savedHotels: newSaved } });
    
    try {
      await authService.toggleSavedHotel(user.$id, hotelId);
    } catch (error) {
      // Revert on failure
      set({ profile });
      console.error('Failed to toggle saved hotel', error);
    }
  }
}));
