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

interface CheckoutState {
  currentStep: number;
  guestDetails: GuestDetails;
  isSubmitting: boolean;
  bookingError: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateGuestDetails: (details: Partial<GuestDetails>) => void;
  submitBooking: (bookingData: { hotelName: string; price: number; nights: number; checkIn: string; checkOut: string }) => Promise<void>;
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
  isSubmitting: false,
  bookingError: null,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(5, state.currentStep + 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(3, state.currentStep - 1) })),
  updateGuestDetails: (details) => set((state) => ({ 
    guestDetails: { ...state.guestDetails, ...details } 
  })),
  submitBooking: async (bookingData) => {
    set({ isSubmitting: true, bookingError: null });
    try {
      const { guestDetails } = get();
      const user = useAuthStore.getState().user;
      
      if (!user) throw new Error("User not authenticated");

      const bookingId = ID.unique();
      const taxes = Math.floor(bookingData.price * bookingData.nights * 0.1);
      const addons = 1500;
      const discount = 2000;
      const totalAmount = (bookingData.price * bookingData.nights) + taxes + addons - discount;

      // 1. Create Booking
      await databases.createDocument(DATABASE_ID, 'bookings', bookingId, {
        userId: user.$id,
        hotelId: 'hotel-123', // Hardcoded for demo, normally pass from URL
        roomId: 'room-123',
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        hotelName: bookingData.hotelName,
        hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
        hotelLocation: 'Udaipur, Rajasthan, India',
        adults: 2
      });

      // 2. Create Guest Details
      await databases.createDocument(DATABASE_ID, 'booking_guests', ID.unique(), {
        bookingId: bookingId,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        country: guestDetails.country,
        specialRequests: guestDetails.specialRequests
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
      set({ currentStep: 4, isSubmitting: false });
    } catch (error: unknown) {
      console.error("Booking Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process booking.";
      set({ bookingError: errorMessage, isSubmitting: false });
    }
  }
}));
