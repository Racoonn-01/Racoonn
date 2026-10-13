export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Parses any date string or Date object into a reliable JavaScript Date.
 * Handles "01 Aug, 2026", "Aug 1, 2026", "2026-08-01", "01 Aug 2026", etc.
 */
export function parseFlexibleDate(str: string | Date | undefined | null): Date {
  if (!str) return new Date();
  if (str instanceof Date && !isNaN(str.getTime())) return str;
  if (typeof str !== 'string') return new Date();

  const clean = str.trim();
  if (!clean || clean.toLowerCase() === 'add dates') return new Date();

  // Try standard ISO or JS date parse
  const parsedDirect = new Date(clean);
  if (!isNaN(parsedDirect.getTime())) {
    return parsedDirect;
  }

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const parts = clean.split(/[\s,]+/); // split by spaces or commas
  if (parts.length >= 3) {
    const p0Num = parseInt(parts[0], 10);
    const p1Num = parseInt(parts[1], 10);
    const p2Num = parseInt(parts[2], 10);

    // Case 1: "01 Aug 2026" or "1 Aug 2026"
    if (!isNaN(p0Num) && isNaN(p1Num) && !isNaN(p2Num)) {
      const mIdx = months.indexOf(parts[1].slice(0, 3).toLowerCase());
      if (mIdx !== -1) {
        return new Date(p2Num, mIdx, p0Num);
      }
    }

    // Case 2: "Aug 01 2026" or "Aug 1 2026"
    if (isNaN(p0Num) && !isNaN(p1Num) && !isNaN(p2Num)) {
      const mIdx = months.indexOf(parts[0].slice(0, 3).toLowerCase());
      if (mIdx !== -1) {
        return new Date(p2Num, mIdx, p1Num);
      }
    }
  }

  return new Date();
}

/**
 * Formats a Date to "DD MMM, YYYY" (e.g. "01 Aug, 2026")
 */
export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_SHORT_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

/**
 * Formats a Date to "MMM D, YYYY" (e.g. "Aug 1, 2026")
 */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = MONTH_SHORT_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Calculates number of nights between checkIn and checkOut (minimum 1).
 */
export function calculateNights(
  checkIn: string | Date | undefined | null,
  checkOut: string | Date | undefined | null
): number {
  const dIn = parseFlexibleDate(checkIn);
  const dOut = parseFlexibleDate(checkOut);
  const diffMs = dOut.getTime() - dIn.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}
