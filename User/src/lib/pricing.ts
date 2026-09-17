export interface PricingParams {
  basePrice: number;
  standardCapacity: number;
  maximumCapacity: number;
  extraPersonCharge: number;
  totalGuests: number;
  numberOfNights: number;
}

export interface PricingResult {
  basePrice: number;
  standardCapacity: number;
  maximumCapacity: number;
  totalGuests: number;
  extraGuests: number;
  extraPersonCharge: number;
  numberOfNights: number;
  baseRoomAmount: number;
  extraGuestAmount: number;
  roomSubtotal: number;
  pricingBreakdown: {
    roomPricePerNight: number;
    extraGuestChargePerNight: number;
  };
}

export function calculateRoomPricing(params: PricingParams): PricingResult {
  const {
    basePrice,
    standardCapacity,
    maximumCapacity,
    extraPersonCharge,
    totalGuests,
    numberOfNights
  } = params;
  
  if (totalGuests > maximumCapacity) {
    throw new Error(`This room can accommodate a maximum of ${maximumCapacity} guests.`);
  }
  
  const extraGuests = Math.max(0, totalGuests - standardCapacity);
  const extraGuestChargesPerNight = extraGuests * extraPersonCharge;
  const totalExtraGuestCharges = extraGuestChargesPerNight * numberOfNights;
  const baseRoomAmount = basePrice * numberOfNights;
  const roomSubtotal = baseRoomAmount + totalExtraGuestCharges;
  
  return {
    basePrice,
    standardCapacity,
    maximumCapacity,
    totalGuests,
    extraGuests,
    extraPersonCharge,
    numberOfNights,
    baseRoomAmount,
    extraGuestAmount: totalExtraGuestCharges,
    roomSubtotal,
    pricingBreakdown: {
      roomPricePerNight: basePrice,
      extraGuestChargePerNight: extraGuestChargesPerNight
    }
  };
}
