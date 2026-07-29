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
 * Calculates GST based strictly on room tariff per night as per Indian Statutory Regulations.
 * - Below ₹1,000 / night: 0% (GST Exempt)
 * - ₹1,001 to ₹7,500 / night: 5% GST (ITC Not Allowed)
 * - Above ₹7,500 / night: 18% GST (ITC Allowed)
 */
export function calculateRoomGst(pricePerNight: number, nights: number = 1, rooms: number = 1): GstCalculationResult {
  const cleanPrice = Math.max(0, pricePerNight);
  const cleanNights = Math.max(1, nights);
  const cleanRooms = Math.max(1, rooms);

  let gstRate = 5;
  let gstStatus = "GST @ 5%";
  let itcNote = "GST @ 5% (Input Tax Credit Not Allowed)";

  if (cleanPrice < 1000) {
    gstRate = 0;
    gstStatus = "GST Exempt (0%)";
    itcNote = "Booking is exempt from GST as tariff is below ₹1,000/night";
  } else if (cleanPrice <= 7500) {
    gstRate = 5;
    gstStatus = "GST @ 5%";
    itcNote = "GST @ 5% (Input Tax Credit Not Allowed)";
  } else {
    gstRate = 18;
    gstStatus = "GST @ 18%";
    itcNote = "GST @ 18% (Input Tax Credit Allowed)";
  }

  const roomAmount = cleanPrice * cleanNights * cleanRooms;
  const totalGstAmount = Math.round((roomAmount * (gstRate / 100)) * 100) / 100;
  const totalAmount = Math.round((roomAmount + totalGstAmount) * 100) / 100;

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
