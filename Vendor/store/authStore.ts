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
}
interface AuthState {
  user: Models.User<Models.Preferences> | null;
  profile: VendorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  checkAuth: () => Promise<void>;
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
        const profile = await authService.getVendorProfile(user.$id) as unknown as VendorProfile;
        if (profile) {
          set({ user, profile, isAuthenticated: true });
        } else {
          // Found a user session, but no vendor profile
          // They must be onboarding. Do not logout!
          set({ user, profile: null, isAuthenticated: true });
        }
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
