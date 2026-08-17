import { create } from 'zustand';
import { authService } from '../lib/appwrite/auth';
import { Models } from 'appwrite';

export interface VendorProfile extends Models.Document {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  altPhone?: string;
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  role: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  onboardingStep?: number;
  profileImage?: string;
  bizType?: string;
  idType?: string;
  aadharNumber?: string;
  idProofFront?: string;
  idProofBack?: string;
  businessProof?: string;
  currentPropertyId?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;
  allow24PercentGst?: boolean;
}
interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: VendorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentVendorUser();
      if (user) {
        let profile = await authService.getVendorProfile(user.$id) as unknown as VendorProfile;
        if (!profile) {
          // Found a user session, but no vendor profile
          // This happens on Google login for new users. Create the profile now.
          profile = await authService.createInitialVendorProfile(user) as unknown as VendorProfile;
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

  refreshProfile: async () => {
    try {
      const user = await authService.getCurrentVendorUser();
      if (user) {
        let profile = await authService.getVendorProfile(user.$id) as unknown as VendorProfile;
        if (profile) {
          set({ profile });
        }
      }
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error: any) {
      // Ignore 401 errors (User is already logged out)
      if (error?.code !== 401) {
        console.error('Logout failed', error);
      }
    } finally {
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading })
}));
