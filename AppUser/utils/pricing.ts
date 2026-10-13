export interface PricingParams {
  basePrice: number;
  standardCapacity: number;
  maximumCapacity: number;
  extraPersonCharge: number;
  totalGuests: number;
  numberOfNights?: number;
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
    standardCapacity = 2,
    maximumCapacity = 4,
    extraPersonCharge = 0,
    totalGuests = 2,
    numberOfNights = 1,
  } = params;

  const nights = Math.max(1, numberOfNights);
  const safeGuests = Math.min(totalGuests, maximumCapacity);
  const extraGuests = Math.max(0, safeGuests - standardCapacity);
  const extraGuestChargePerNight = extraGuests * extraPersonCharge;
  const extraGuestAmount = extraGuestChargePerNight * nights;
  const baseRoomAmount = basePrice * nights;
  const roomSubtotal = baseRoomAmount + extraGuestAmount;

  return {
    basePrice,
    standardCapacity,
    maximumCapacity,
    totalGuests,
    extraGuests,
    extraPersonCharge,
    numberOfNights: nights,
    baseRoomAmount,
    extraGuestAmount,
    roomSubtotal,
    pricingBreakdown: {
      roomPricePerNight: basePrice,
      extraGuestChargePerNight,
    },
  };
}
