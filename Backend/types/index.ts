// Base Types for Racoonn Backend Collections

export type Role = 'Admin' | 'Vendor' | 'Customer';

export interface BaseDocument {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
}

export interface UserProfile extends BaseDocument {
    userId: string; // References Appwrite Auth ID
    role: Role;
    email: string;
    phone?: string;
    name: string;
    gender?: string;
    dob?: string;
    nationality?: string;
    maritalStatus?: string;
    anniversary?: string;
    city?: string;
    state?: string;
    passportNo?: string;
    passportExpiry?: string;
    passportCountry?: string;
    panCard?: string;
    bio?: string;
}

export interface Vendor extends BaseDocument {
    userId: string;
    businessName: string;
    gstNumber?: string;
    panNumber?: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

export interface Property extends BaseDocument {
    vendorId: string;
    name: string;
    description: string;
    type: 'Hotel' | 'Resort' | 'Villa' | 'Homestay';
    starRating: number;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    isFeatured: boolean;
}

export interface Booking extends BaseDocument {
    propertyId: string;
    roomId: string;
    customerId: string;
    vendorId: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    paymentStatus: 'Pending' | 'Paid' | 'Refunded';
}

export interface Transaction extends BaseDocument {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: 'Created' | 'Authorized' | 'Captured' | 'Failed';
}
