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
  addonsAmount: number = 0
): GstCalculationResult {
  const cleanPrice = Math.max(0, pricePerNight);
  const cleanNights = Math.max(1, nights);
  const cleanRooms = Math.max(1, rooms);
  const cleanAddons = Math.max(0, addonsAmount);

  const roomAmount = cleanPrice * cleanNights * cleanRooms;
  const taxableBase = roomAmount + cleanAddons;

  const gstRate = 18;
  const gstStatus = "GST @ 18%";
  const itcNote = "GST @ 18%";
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
