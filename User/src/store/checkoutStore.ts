import { create } from 'zustand';
import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import { useAuthStore } from './authStore';
import { calculateHotelGST } from "@/lib/utils/gst";

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

export interface PropertyAddon {
  id?: string;
  $id?: string;
  name?: string;
  price?: number;
  [key: string]: unknown;
}

export interface VendorOffer {
  id?: string;
  code?: string;
  status?: string;
  discountType?: string;
  type?: string;
  discountValue?: number;
  discount?: number;
  bookingStartDate?: string;
  bookingEndDate?: string;
  [key: string]: unknown;
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
  propertyAddons: PropertyAddon[] | null; // null means loading, [] means empty
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
  submitBooking: (bookingData: { hotelId?: string; hotelName: string; hotelLocation?: string; hotelImage?: string; price: number; nights: number; checkIn: string; checkOut: string; adults?: number; gstRate?: number; }) => Promise<void>;
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
  selectedHotelId: null,
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
    const searchCode = code.trim().toUpperCase();
    if (!searchCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    // Helper to get current hotel & room being booked
    const currentHotelId = get().selectedHotelId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('hotelId') : null);
    const currentRoomId = (get() as unknown as { selectedRoomId?: string }).selectedRoomId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('roomId') : null);

    // 1. Check static built-in coupons
    const staticCoupon = VALID_COUPONS[searchCode];
    if (staticCoupon) {
      set({ appliedCoupon: staticCoupon });
      return { success: true, message: `Coupon ${staticCoupon.code} applied successfully!` };
    }

    // 2. Check document.cookie for cross-port/cross-origin vendor coupons
    if (typeof document !== 'undefined') {
      try {
        const cookieName = `racoonn_coupon_${searchCode}`;
        const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
        if (match && match[1]) {
          const cookieData = JSON.parse(decodeURIComponent(match[1]));
          if (cookieData.status === 'paused') {
            return { success: false, message: 'This coupon code is currently paused.' };
          }
          if (cookieData.status === 'expired') {
            return { success: false, message: 'This coupon code has expired.' };
          }
          const todayStr = new Date().toISOString().split('T')[0];
          if (cookieData.bookingEndDate && cookieData.bookingEndDate < todayStr) {
            return { success: false, message: 'This coupon code has expired.' };
          }

          // Target property validation
          if (cookieData.propertyId && cookieData.propertyId !== 'all') {
            if (!currentHotelId || currentHotelId !== cookieData.propertyId) {
              return { success: false, message: `This coupon code is valid only for ${cookieData.propertyName || 'the selected property'}.` };
            }
          }

          // Target room validation
          if (cookieData.roomId && cookieData.roomId !== 'all') {
            if (currentRoomId && currentRoomId !== cookieData.roomId) {
              return { success: false, message: `This coupon code is valid only for ${cookieData.roomName || 'the selected room'}.` };
            }
          }

          const isPercentage = cookieData.discountType === 'percentage' || cookieData.type === 'percentage';
          const discountVal = Number(cookieData.discountValue || cookieData.discount || 0);

          const couponObj: Coupon = {
            code: searchCode,
            type: isPercentage ? 'percentage' : 'fixed',
            value: discountVal
          };

          set({ appliedCoupon: couponObj });
          return { success: true, message: `Coupon ${couponObj.code} applied successfully!` };
        }
      } catch (err) {
        console.warn("Error reading coupon cookie:", err);
      }
    }

    // 3. Dynamic lookup from vendor special offers stored in localStorage
    if (typeof window !== 'undefined') {
      try {
        const allOffers: VendorOffer[] = [];

        // Check global vendor coupons cache
        const globalStr = localStorage.getItem('racoonn_global_vendor_coupons');
        if (globalStr) {
          try {
            const parsed = JSON.parse(globalStr);
            if (Array.isArray(parsed)) allOffers.push(...parsed);
          } catch {}
        }

        // Scan all keys in localStorage for vendor special offers
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('special_offers') || key.includes('vendor_coupons') || key.includes('offers'))) {
            const itemStr = localStorage.getItem(key);
            if (itemStr) {
              try {
                const parsed = JSON.parse(itemStr);
                if (Array.isArray(parsed)) {
                  allOffers.push(...parsed);
                } else if (parsed && typeof parsed === 'object' && (parsed as VendorOffer).code) {
                  allOffers.push(parsed as VendorOffer);
                }
              } catch {}
            }
          }
        }

        // Find matching offer with promo code
        const matched = allOffers.find((o: VendorOffer) => 
          o && o.code && String(o.code).trim().toUpperCase() === searchCode
        );

        if (matched) {
          if (matched.status === 'paused') {
            return { success: false, message: 'This coupon code is currently paused.' };
          }
          if (matched.status === 'expired') {
            return { success: false, message: 'This coupon code has expired.' };
          }
          const todayStr = new Date().toISOString().split('T')[0];
          if (matched.bookingEndDate && matched.bookingEndDate < todayStr) {
            return { success: false, message: 'This coupon code has expired.' };
          }
          if (matched.bookingStartDate && matched.bookingStartDate > todayStr) {
            return { success: false, message: 'This coupon code is not active yet.' };
          }

          // Target property validation
          if (matched.propertyId && matched.propertyId !== 'all') {
            if (!currentHotelId || currentHotelId !== matched.propertyId) {
              return { success: false, message: `This coupon code is valid only for ${matched.propertyName || 'the selected property'}.` };
            }
          }

          // Target room validation
          if (matched.roomId && matched.roomId !== 'all') {
            if (currentRoomId && currentRoomId !== matched.roomId) {
              return { success: false, message: `This coupon code is valid only for ${matched.roomName || 'the selected room'}.` };
            }
          }

          const isPercentage = matched.discountType === 'percentage' || matched.type === 'percentage';
          const discountVal = Number(matched.discountValue || matched.discount || 0);

          const couponObj: Coupon = {
            code: String(matched.code).trim().toUpperCase(),
            type: isPercentage ? 'percentage' : 'fixed',
            value: discountVal
          };

          set({ appliedCoupon: couponObj });
          return { success: true, message: `Coupon ${couponObj.code} applied successfully!` };
        }
      } catch (err) {
        console.error("Error looking up vendor coupon:", err);
      }
    }

    return { success: false, message: 'Invalid or expired coupon code.' };
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
      
      // Calculate dynamic addons
      const propAddons = get().propertyAddons || [];
      const addons = get().selectedAddons.reduce((sum: number, addonId: string) => {
        const addon = propAddons.find((a: PropertyAddon) => (a.id || a.$id) === addonId);
        return sum + (addon?.price || 0);
      }, 0);

      const perNightPrice = bookingData.price || 3500;
      const nightsCount = bookingData.nights || 1;
      const gstCalc = calculateHotelGST(perNightPrice, nightsCount, 1);

      const roomAmount = gstCalc.priceBeforeTax;
      const gstRate = gstCalc.gstPercentage;
      const gstAmount = gstCalc.gstAmount;

      const { appliedCoupon } = get();
      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'fixed') {
          discount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'percentage') {
          discount = Math.floor(roomAmount * (appliedCoupon.value / 100));
        }
      }
      
      const totalAmount = Math.max(0, gstCalc.priceAfterTax + addons - discount);
      const platformCommissionRate = 18;
      const platformCommissionAmount = Math.round((roomAmount * (platformCommissionRate / 100)) * 100) / 100;
      const vendorSettlement = Math.round((totalAmount - platformCommissionAmount) * 100) / 100;

      // 1. Create Booking
      await databases.createDocument(DATABASE_ID, 'bookings', bookingId, {
        userId: user.$id,
        hotelId: bookingData.hotelId || get().selectedHotelId || 'hotel-123',
        roomId: 'room-123',
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: nightsCount,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        hotelName: bookingData.hotelName,
        hotelImage: bookingData.hotelImage || get().hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
        hotelLocation: bookingData.hotelLocation || get().hotelLocation || 'Udaipur, Rajasthan, India',
        adults: bookingData.adults || 2,
        roomPricePerNight: gstCalc.roomPricePerNight,
        gstPercentage: gstCalc.gstPercentage,
        gstAmount: gstCalc.gstAmount,
        gstType: gstCalc.gstType,
        priceBeforeTax: gstCalc.priceBeforeTax,
        priceAfterTax: gstCalc.priceAfterTax,
        taxableAmount: gstCalc.taxableAmount,
      });

      // Format additional travelers and GST metadata info
      let finalSpecialRequests = guestDetails.specialRequests || '';
      finalSpecialRequests += `\n[GST Info: Rate=${gstRate}%, Taxable=₹${roomAmount}, GST=₹${gstAmount}, VendorPayout=₹${vendorSettlement}]`;

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
        roomPrice: roomAmount,
        taxes: gstAmount,
        serviceFees: addons,
        discount: discount,
        totalAmount: totalAmount
      });

      // 4. Send Confirmation Email
      try {
        await fetch('/api/email/booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hotelName: bookingData.hotelName,
            hotelLocation: bookingData.hotelLocation || get().hotelLocation,
            price: totalAmount,
            nights: bookingData.nights,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            adults: bookingData.adults || 2,
            email: guestDetails.email,
            firstName: guestDetails.firstName,
            lastName: guestDetails.lastName,
            bookingId: bookingId.substring(0, 8).toUpperCase()
          })
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Silently fail if email is not sent, booking is already successful
      }

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
