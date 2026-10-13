/**
 * Government of India Hotel Accommodation GST Calculation Engine
 * Synchronized with the User Portal (User/src/lib/gst.ts)
 * 
 * Rules based on effective tariff per night as per Indian Statutory Regulations:
 * - Up to ₹7,500 / night    -> 5% GST (Input Tax Credit Not Allowed)
 * - Above ₹7,500 / night   -> 18% GST (Input Tax Credit Allowed)
 * - Tour Packages          -> Flat 18% GST
 */

export interface GSTCalculationResult {
  pricePerNight: number;
  roomPricePerNight: number;
  nights: number;
  rooms: number;
  roomAmount: number;
  subtotal: number;
  priceBeforeTax: number;
  gstRate: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  priceAfterTax: number;
  grandTotal: number;
  taxableAmount: number;
  gstStatus: string;
  gstType: string;
  itcNote: string;
}

/**
 * Calculates GST based on room tariff per night & addons as per Indian Statutory Regulations.
 * - ₹0 to ₹7,500 / night: 5% GST (ITC Not Allowed)
 * - Above ₹7,500 / night: 18% GST (ITC Allowed)
 * - Packages: 18% GST
 */
export function calculateRoomGst(
  pricePerNight: number,
  nights: number = 1,
  rooms: number = 1,
  addonsAmount: number = 0,
  discountAmount: number = 0,
  isPackage: boolean = false
): GSTCalculationResult {
  const cleanPrice = Math.max(0, Number(pricePerNight) || 0);
  const cleanNights = Math.max(1, Number(nights) || 1);
  const cleanRooms = Math.max(1, Number(rooms) || 1);
  const cleanAddons = Math.max(0, Number(addonsAmount) || 0);
  const cleanDiscount = Math.max(0, Number(discountAmount) || 0);

  const roomAmount = cleanPrice * cleanNights * cleanRooms;
  const taxableBase = Math.max(0, roomAmount + cleanAddons - cleanDiscount);

  let gstRate = 0;
  let gstStatus = 'GST @ 0%';
  let itcNote = 'GST Exempt';
  let gstType = 'Exempt';

  if (isPackage) {
    gstRate = 18;
    gstStatus = 'GST @ 18%';
    itcNote = 'GST @ 18% (Packages)';
    gstType = 'With ITC';
  } else {
    // Calculate effective price per night to determine GST slab correctly as per User Portal
    const effectivePricePerNight = taxableBase / (cleanNights * cleanRooms);

    if (effectivePricePerNight <= 7500) {
      gstRate = 5;
      gstStatus = 'GST @ 5%';
      itcNote = 'GST @ 5% (Input Tax Credit Not Allowed)';
      gstType = 'Without ITC';
    } else {
      gstRate = 18;
      gstStatus = 'GST @ 18%';
      itcNote = 'GST @ 18% (Input Tax Credit Allowed)';
      gstType = 'With ITC';
    }
  }

  const totalGstAmount = Math.round(taxableBase * (gstRate / 100));
  const totalAmount = Math.round(taxableBase + totalGstAmount);

  return {
    pricePerNight: cleanPrice,
    roomPricePerNight: cleanPrice,
    nights: cleanNights,
    rooms: cleanRooms,
    roomAmount,
    subtotal: roomAmount,
    priceBeforeTax: roomAmount,
    gstRate,
    gstPercentage: gstRate,
    gstAmount: totalGstAmount,
    totalAmount,
    priceAfterTax: totalAmount,
    grandTotal: totalAmount,
    taxableAmount: taxableBase,
    gstStatus,
    gstType,
    itcNote,
  };
}

/**
 * Backwards compatible alias matching calculateHotelGST naming in AppUser
 */
export function calculateHotelGST(
  roomPricePerNight: number,
  nights: number = 1,
  rooms: number = 1,
  addonsAmount: number = 0,
  discountAmount: number = 0,
  isPackage: boolean = false
): GSTCalculationResult {
  return calculateRoomGst(
    roomPricePerNight,
    nights,
    rooms,
    addonsAmount,
    discountAmount,
    isPackage
  );
}
