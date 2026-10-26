import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { sendCheckInReminderPush, sendCheckOutReminderPush } from '../services/pushNotificationService';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks bookings for upcoming check-ins (tomorrow) and check-outs (today)
 * and dispatches reminder push notifications without duplicates.
 */
export async function runBookingRemindersJob() {
  console.log('[RemindersCron] Running scheduled booking reminders check...');
  const now = new Date();
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = formatDateYYYYMMDD(now);
  const tomorrowStr = formatDateYYYYMMDD(tomorrow);

  let checkInsSent = 0;
  let checkOutsSent = 0;

  try {
    // 1. Fetch active/confirmed bookings
    const bookingsRes = await databases.listDocuments(dbId, 'bookings', [
      Query.equal('status', 'Confirmed'),
      Query.limit(100),
    ]);

    for (const b of bookingsRes.documents) {
      const bookingId = b.$id;
      const userId = b.userId;
      const hotelName = b.hotelName || 'Racoonn Stay';
      const checkInDate = String(b.checkIn || '');
      const checkOutDate = String(b.checkOut || '');

      if (!userId) continue;

      // Check-in reminder (if check-in is tomorrow)
      if (checkInDate.includes(tomorrowStr) || isDateMatch(checkInDate, tomorrow)) {
        const alreadyNotified = await hasReminderBeenSent(userId, bookingId, 'checkin');
        if (!alreadyNotified) {
          await sendCheckInReminderPush({
            userId,
            hotelName,
            bookingId,
            checkInDate,
          });
          checkInsSent++;
          console.log(`[RemindersCron] Check-in reminder dispatched for booking: ${bookingId}`);
        }
      }

      // Check-out reminder (if check-out is today)
      if (checkOutDate.includes(todayStr) || isDateMatch(checkOutDate, now)) {
        const alreadyNotified = await hasReminderBeenSent(userId, bookingId, 'checkout');
        if (!alreadyNotified) {
          await sendCheckOutReminderPush({
            userId,
            hotelName,
            bookingId,
            checkOutDate,
          });
          checkOutsSent++;
          console.log(`[RemindersCron] Check-out reminder dispatched for booking: ${bookingId}`);
        }
      }
    }
  } catch (err: any) {
    console.error('[RemindersCron] Error during reminder scan:', err.message);
  }

  console.log(`[RemindersCron] Completed: ${checkInsSent} check-in reminders, ${checkOutsSent} check-out reminders sent.`);
  return { checkInsSent, checkOutsSent };
}

/**
 * Checks if a reminder notification already exists in user_notifications for this booking
 */
async function hasReminderBeenSent(userId: string, bookingId: string, type: 'checkin' | 'checkout'): Promise<boolean> {
  try {
    const existing = await databases.listDocuments(dbId, 'user_notifications', [
      Query.equal('userId', userId),
      Query.equal('category', 'reminder'),
      Query.limit(20),
    ]);

    return existing.documents.some(doc => {
      if (doc.data && doc.data.includes(bookingId)) {
        if (type === 'checkin' && doc.title.toLowerCase().includes('ready')) return true;
        if (type === 'checkout' && doc.title.toLowerCase().includes('check-out')) return true;
      }
      return false;
    });
  } catch {
    return false;
  }
}

function isDateMatch(dateStr: string, targetDate: Date): boolean {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return (
      d.getFullYear() === targetDate.getFullYear() &&
      d.getMonth() === targetDate.getMonth() &&
      d.getDate() === targetDate.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Starts periodic reminder scheduler in background (runs every hour)
 */
export function startRemindersScheduler() {
  const ONE_HOUR = 60 * 60 * 1000;
  // Run first check after 2 minutes
  setTimeout(() => {
    runBookingRemindersJob().catch(err => console.error('[RemindersCron] Error in initial run:', err));
  }, 120000);

  // Then recurring every hour
  setInterval(() => {
    runBookingRemindersJob().catch(err => console.error('[RemindersCron] Error in periodic run:', err));
  }, ONE_HOUR);

  console.log('⏰ Booking reminders background scheduler initialized (interval: 1 hour).');
}
