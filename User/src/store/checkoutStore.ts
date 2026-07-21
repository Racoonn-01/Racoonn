import { create } from 'zustand';
import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import { useAuthStore } from './authStore';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
}

export interface TravelerDetails {
  fullName: string;
  gender: string;
  dateOfBirth: string;
}

export interface Coupon {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
}

export const VALID_COUPONS: Record<string, Coupon> = {
  'WELCOME500': { code: 'WELCOME500', type: 'fixed', value: 500 },
  'SUMMER2000': { code: 'SUMMER2000', type: 'fixed', value: 2000 },
  'SAVE10': { code: 'SAVE10', type: 'percentage', value: 10 },
};

interface CheckoutState {
  currentStep: number;
  guestDetails: GuestDetails;
  additionalTravelers: TravelerDetails[];
  isSubmitting: boolean;
  bookingError: string | null;
  confirmedBookingId: string | null;
  selectedHotelId: string | null;
  selectedRoomName: string | null;
  selectedPrice: number | null;
  hotelName: string | null;
  hotelImage: string | null;
  hotelLocation: string | null;
  selectedAddons: string[];
  propertyAddons: any[] | null; // null means loading, [] means empty
  appliedCoupon: Coupon | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleAddon: (id: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  updateGuestDetails: (details: Partial<GuestDetails>) => void;
  initTravelers: (count: number) => void;
  updateTraveler: (index: number, details: Partial<TravelerDetails>) => void;
  setRoomDetails: (hotelId: string, roomName: string, price: number, hotelName?: string, hotelImage?: string, hotelLocation?: string) => void;
  fetchPropertyAddons: (hotelId: string) => Promise<void>;
  submitBooking: (bookingData: { hotelId?: string; hotelName: string; hotelLocation?: string; hotelImage?: string; price: number; nights: number; checkIn: string; checkOut: string; adults?: number; }) => Promise<void>;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  currentStep: 3, // 3: Guest, 4: Confirmation
  guestDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United States',
    specialRequests: ''
  },
  additionalTravelers: [],
  isSubmitting: false,
  bookingError: null,
  confirmedBookingId: null,
  selectedRoomName: null,
  selectedPrice: null,
  hotelName: null,
  hotelImage: null,
  hotelLocation: null,
  selectedAddons: [],
  propertyAddons: null,
  appliedCoupon: null,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(5, state.currentStep + 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(3, state.currentStep - 1) })),
  toggleAddon: (id) => set((state) => ({
    selectedAddons: state.selectedAddons.includes(id) 
      ? state.selectedAddons.filter(addonId => addonId !== id)
      : [...state.selectedAddons, id]
  })),
  applyCoupon: (code) => {
    const coupon = VALID_COUPONS[code.toUpperCase()];
    if (coupon) {
      set({ appliedCoupon: coupon });
      return { success: true, message: `Coupon applied successfully!` };
    }
    return { success: false, message: 'Invalid coupon code.' };
  },
  removeCoupon: () => set({ appliedCoupon: null }),
  updateGuestDetails: (details) => set((state) => ({ 
    guestDetails: { ...state.guestDetails, ...details } 
  })),
  initTravelers: (count) => set((state) => {
    if (state.additionalTravelers.length === count) return state;
    const newTravelers = [...state.additionalTravelers];
    while (newTravelers.length < count) {
      newTravelers.push({ fullName: '', gender: '', dateOfBirth: '' });
    }
    while (newTravelers.length > count) {
      newTravelers.pop();
    }
    return { additionalTravelers: newTravelers };
  }),
  updateTraveler: (index, details) => set((state) => {
    const newTravelers = [...state.additionalTravelers];
    if (newTravelers[index]) {
      newTravelers[index] = { ...newTravelers[index], ...details };
    }
    return { additionalTravelers: newTravelers };
  }),
  setRoomDetails: (hotelId, roomName, price, hotelName, hotelImage, hotelLocation) => set({ 
    selectedHotelId: hotelId,
    selectedRoomName: roomName, 
    selectedPrice: price,
    hotelName: hotelName || null,
    hotelImage: hotelImage || null,
    hotelLocation: hotelLocation || null
  }),
  fetchPropertyAddons: async (hotelId) => {
    if (!hotelId || hotelId === 'hotel-123' || hotelId === 'undefined') {
      set({ propertyAddons: [] });
      return;
    }
    try {
      const prop = await databases.getDocument(DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties', hotelId);
      if (prop && prop.addons) {
        const parsed = prop.addons.map((a: string) => JSON.parse(a));
        set({ propertyAddons: parsed });
      } else {
        set({ propertyAddons: [] });
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
      set({ propertyAddons: [] });
    }
  },
  submitBooking: async (bookingData) => {
    set({ isSubmitting: true, bookingError: null });
    try {
      const { guestDetails } = get();
      const user = useAuthStore.getState().user;
      
      if (!user) throw new Error("User not authenticated");

      const bookingId = ID.unique();
      const taxes = Math.floor(bookingData.price * bookingData.nights * 0.1);
      
      // Calculate dynamic addons instead of hardcoded 1500
      const { ADDONS } = await import('@/components/checkout/AddonSelector');
      const addons = get().selectedAddons.reduce((sum, addonId) => {
        const addon = ADDONS.find(a => a.id === addonId);
        return sum + (addon?.price || 0);
      }, 0);
      
      const { appliedCoupon } = get();
      const roomTotal = bookingData.price * bookingData.nights;
      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'fixed') {
          discount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'percentage') {
          discount = Math.floor(roomTotal * (appliedCoupon.value / 100));
        }
      }
      
      const totalAmount = roomTotal + taxes + addons - discount;

      // 1. Create Booking
      await databases.createDocument(DATABASE_ID, 'bookings', bookingId, {
        userId: user.$id,
        hotelId: bookingData.hotelId || get().selectedHotelId || 'hotel-123',
        roomId: 'room-123', // Still hardcoded if room level inventory isn't granular yet
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        hotelName: bookingData.hotelName,
        hotelImage: bookingData.hotelImage || get().hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
        hotelLocation: bookingData.hotelLocation || get().hotelLocation || 'Udaipur, Rajasthan, India',
        adults: bookingData.adults || 2
      });

      // Format additional travelers info if any exist
      let finalSpecialRequests = guestDetails.specialRequests || '';
      const { additionalTravelers } = get();
      if (additionalTravelers && additionalTravelers.length > 0) {
        const travelersStr = additionalTravelers
          .filter(t => t.fullName) // Only include those who filled a name
          .map((t, i) => `\nGuest ${i+1}: ${t.fullName} (${t.gender}, DOB: ${t.dateOfBirth})`)
          .join('');
        
        if (travelersStr) {
          finalSpecialRequests += `\n\n--- Additional Travelers ---${travelersStr}`;
        }
      }

      // 2. Create Guest Details
      await databases.createDocument(DATABASE_ID, 'booking_guests', ID.unique(), {
        bookingId: bookingId,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        country: guestDetails.country,
        specialRequests: finalSpecialRequests.trim()
      });

      // 3. Create Payment Details
      await databases.createDocument(DATABASE_ID, 'booking_payments', ID.unique(), {
        bookingId: bookingId,
        roomPrice: bookingData.price * bookingData.nights,
        taxes: taxes,
        serviceFees: addons,
        discount: discount,
        totalAmount: totalAmount
      });

      // Move to success step
      set({ 
        currentStep: 4, 
        isSubmitting: false, 
        confirmedBookingId: bookingId.substring(0, 8).toUpperCase()
      });
    } catch (error: unknown) {
      console.error("Booking Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process booking.";
      set({ bookingError: errorMessage, isSubmitting: false });
    }
  }
}));
