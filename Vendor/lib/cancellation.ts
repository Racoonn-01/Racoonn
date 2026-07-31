export interface CancellationCalculationResult {
  remainingHours: number;
  remainingDays: number;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  refundStatus: 'Pending' | 'Processing' | 'Completed' | 'Rejected' | 'Failed';
  bookingStatus: 'Cancelled' | 'Cancelled (Refund Pending)' | 'Cancelled (Refund Completed)' | 'Cancelled (No Refund)' | 'No Show';
  reason: string;
}

/**
 * Calculates refund eligibility based on policy rules:
 * Rule 1: > 7 Days before check-in => 100% refund
 * Rule 2: 2 to 7 Days before check-in => 50% refund
 * Rule 3: < 48 Hours before check-in => 0% refund (Rejected)
 * Rule 4: Check-in Day or No Show => 0% refund (Rejected)
 */
export function calculateCancellationRefund(
  checkInDateTimeIso: string,
  totalPaidAmount: number,
  cancellationDateTimeIso: string = new Date().toISOString()
): CancellationCalculationResult {
  const checkInTime = new Date(checkInDateTimeIso).getTime();
  const cancelTime = new Date(cancellationDateTimeIso).getTime();

  const diffMs = checkInTime - cancelTime;
  const remainingHours = diffMs / (1000 * 60 * 60);
  const remainingDays = remainingHours / 24;

  let refundPercentage = 0;
  let refundStatus: CancellationCalculationResult['refundStatus'] = 'Rejected';
  let bookingStatus: CancellationCalculationResult['bookingStatus'] = 'Cancelled (No Refund)';
  let reason = '';

  if (remainingHours <= 0) {
    refundPercentage = 0;
    refundStatus = 'Rejected';
    bookingStatus = 'No Show';
    reason = 'Cancellation on check-in date or guest no show.';
  } else if (remainingHours < 48) {
    refundPercentage = 0;
    refundStatus = 'Rejected';
    bookingStatus = 'Cancelled (No Refund)';
    reason = 'Cancellation within 48 hours of check-in.';
  } else if (remainingDays <= 7) {
    refundPercentage = 50;
    refundStatus = 'Processing';
    bookingStatus = 'Cancelled (Refund Pending)';
    reason = 'Cancelled between 2 and 7 days before check-in.';
  } else {
    refundPercentage = 100;
    refundStatus = 'Processing';
    bookingStatus = 'Cancelled (Refund Pending)';
    reason = 'Cancelled more than 7 days before check-in.';
  }

  const refundAmount = Math.round((totalPaidAmount * (refundPercentage / 100)) * 100) / 100;
  const cancellationFee = Math.round((totalPaidAmount - refundAmount) * 100) / 100;

  return {
    remainingHours,
    remainingDays,
    refundPercentage,
    refundAmount,
    cancellationFee,
    refundStatus,
    bookingStatus,
    reason,
  };
}
