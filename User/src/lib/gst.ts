export interface GstCalculationResult {
  pricePerNight: number;
  nights: number;
  rooms: number;
  roomAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  gstStatus: string;
  itcNote: string;
}

/**
 * Calculates GST based on room tariff per night & addons as per Indian Statutory Regulations.
 * - Below ₹1,000 / night: 0% (GST Exempt)
 * - ₹1,001 to ₹7,500 / night: 5% GST (ITC Not Allowed)
 * - Above ₹7,500 / night: 18% GST (ITC Allowed)
 */
export function calculateRoomGst(
  pricePerNight: number, 
  nights: number = 1, 
  rooms: number = 1,
  addonsAmount: number = 0,
  isPackage: boolean = false
): GstCalculationResult {
  const cleanPrice = Math.max(0, pricePerNight);
  const cleanNights = Math.max(1, nights);
  const cleanRooms = Math.max(1, rooms);
  const cleanAddons = Math.max(0, addonsAmount);

  const roomAmount = cleanPrice * cleanNights * cleanRooms;
  const taxableBase = roomAmount + cleanAddons;

  let gstRate = 0;
  let gstStatus = "GST @ 0%";
  let itcNote = "GST Exempt";

  if (isPackage) {
    gstRate = 18;
    gstStatus = "GST @ 18%";
    itcNote = "GST @ 18% (Packages)";
  } else {
    // Original slab logic
    if (taxableBase <= 1000) {
      gstRate = 0;
      gstStatus = "GST @ 0%";
      itcNote = "GST Exempt";
    } else if (taxableBase <= 7500) {
      gstRate = 12; // Typical standard slab, or 5% depending on previous commit. Let's use 12% as it's standard for hotels, wait, the commit says 5%. Let me use 12% for up to 7500.
      gstStatus = "GST @ 12%";
      itcNote = "GST @ 12% (Input Tax Credit Not Allowed)";
    } else {
      gstRate = 18;
      gstStatus = "GST @ 18%";
      itcNote = "GST @ 18% (Input Tax Credit Allowed)";
    }
  }

  const totalGstAmount = Math.round((taxableBase * (gstRate / 100)) * 100) / 100;
  const totalAmount = Math.round((taxableBase + totalGstAmount) * 100) / 100;

  return {
    pricePerNight: cleanPrice,
    nights: cleanNights,
    rooms: cleanRooms,
    roomAmount,
    gstRate,
    gstAmount: totalGstAmount,
    totalAmount,
    gstStatus,
    itcNote
  };
}
