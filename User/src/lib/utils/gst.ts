/**
 * Government of India Hotel Accommodation GST Calculation Engine
 * 
 * Rules based on PER NIGHT room tariff before taxes:
 * - Up to ₹1,000      -> 0% GST (Exempt)
 * - ₹1,001 - ₹7,500   -> 5% GST (Without ITC)
 * - Above ₹7,500      -> 18% GST (With ITC)
 */

export interface GSTCalculationResult {
  roomPricePerNight: number;
  rooms: number;
  nights: number;
  subtotal: number; // priceBeforeTax
  gstPercentage: number;
  gstType: 'Exempt' | 'Without ITC' | 'With ITC';
  gstAmount: number;
  grandTotal: number; // priceAfterTax
  priceBeforeTax: number;
  priceAfterTax: number;
  taxableAmount: number;
}

export function calculateHotelGST(
  roomPricePerNight: number,
  nights: number = 1,
  rooms: number = 1
): GSTCalculationResult {
  const sanitizedRate = Math.max(0, Number(roomPricePerNight) || 0);
  const sanitizedNights = Math.max(1, Number(nights) || 1);
  const sanitizedRooms = Math.max(1, Number(rooms) || 1);

  let gstPercentage = 0;
  let gstType: 'Exempt' | 'Without ITC' | 'With ITC' = 'Exempt';

  if (sanitizedRate <= 1000) {
    gstPercentage = 0;
    gstType = 'Exempt';
  } else if (sanitizedRate <= 7500) {
    gstPercentage = 5;
    gstType = 'Without ITC';
  } else {
    gstPercentage = 18;
    gstType = 'With ITC';
  }

  const subtotal = Math.round(sanitizedRate * sanitizedRooms * sanitizedNights);
  const gstAmount = Math.round((subtotal * gstPercentage) / 100);
  const grandTotal = subtotal + gstAmount;

  return {
    roomPricePerNight: sanitizedRate,
    rooms: sanitizedRooms,
    nights: sanitizedNights,
    subtotal,
    gstPercentage,
    gstType,
    gstAmount,
    grandTotal,
    priceBeforeTax: subtotal,
    priceAfterTax: grandTotal,
    taxableAmount: subtotal,
  };
}
