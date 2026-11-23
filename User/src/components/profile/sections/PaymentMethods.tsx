"use client";

import { useState, useEffect } from 'react';
import { FileText, ArrowUpRight, ArrowDownRight, Search, Loader2 } from 'lucide-react';
import { getUserBookings, getBookingPayments } from '@/lib/appwrite/api';
import { useAuthStore } from '@/store/authStore';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: string;
  type: 'Debit' | 'Credit';
  description: string;
  paymentMethod: string;
  rawBooking?: any;
  rawPayment?: any;
}
const mockTransactions = [
  {
    id: 'TXN-98231',
    date: 'Oct 12, 2026',
    amount: '$1,250.00',
    status: 'Completed',
    type: 'Debit',
    description: 'The Ritz-Carlton, Bali',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'TXN-87123',
    date: 'Sep 10, 2025',
    amount: '$3,200.00',
    status: 'Refunded',
    type: 'Credit',
    description: 'Refund: Four Seasons Paris',
    paymentMethod: 'Mastercard •••• 8812'
  },
  {
    id: 'TXN-76543',
    date: 'Jan 05, 2026',
    amount: '$4,800.00',
    status: 'Completed',
    type: 'Debit',
    description: 'Waldorf Astoria Maldives',
    paymentMethod: 'Visa •••• 4242'
  }
];

export default function PaymentMethods() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const bookings = await getUserBookings(user.$id);
        
        if (bookings.length > 0) {
          const bookingIds = bookings.map(b => b.$id);
          const payments = await getBookingPayments(bookingIds);
          
          const formattedTransactions: Transaction[] = bookings.map(booking => {
            const payment = payments.find(p => p.bookingId === booking.$id);
            // Default to calculating price if payment document is missing for some reason
            const total = payment ? payment.totalAmount : (booking.price * booking.nights);
            
            const isCancelled = booking.status === 'Cancelled';
            
            return {
              id: `TXN-${booking.$id.slice(-6).toUpperCase()}`,
              date: new Date(booking.$createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
              amount: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
              status: isCancelled ? 'Refunded' : (booking.paymentStatus || 'Completed'),
              type: isCancelled ? 'Credit' : 'Debit',
              description: isCancelled ? `Refund: ${booking.hotelName || 'Hotel Booking'}` : (booking.hotelName || 'Hotel Booking'),
              paymentMethod: 'Credit Card', // Default placeholder since we don't store actual card info yet
              rawBooking: booking,
              rawPayment: payment
            };
          });
          
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadInvoice = async (txn: Transaction) => {
    if (!txn.rawBooking || !user) return;
    try {
      setIsDownloading(txn.id);
      
      const payload = {
        hotelName: txn.rawBooking.hotelName,
        hotelLocation: txn.rawBooking.hotelLocation || '',
        price: txn.rawPayment?.totalAmount || (txn.rawBooking.price * txn.rawBooking.nights),
        firstName: user.name?.split(' ')[0] || 'Guest',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        checkIn: txn.rawBooking.checkIn || txn.rawBooking.checkInDate || txn.rawBooking.startDate || 'N/A',
        checkOut: txn.rawBooking.checkOut || txn.rawBooking.checkOutDate || txn.rawBooking.endDate || 'N/A',
        nights: txn.rawBooking.nights || txn.rawBooking.totalNights || txn.rawBooking.numberOfDays || 1,
        adults: txn.rawBooking.adults || txn.rawBooking.guests || 1,
        bookingId: txn.rawBooking.$id,
        displayBookingId: txn.rawBooking.$id.substring(0, 8).toUpperCase(),
        gstRate: txn.rawBooking.gstPercentage || 18,
        gstAmount: txn.rawPayment?.taxes || txn.rawBooking.gstAmount || 0,
        addonsList: txn.rawBooking.snapshotRoomConfig ? JSON.parse(txn.rawBooking.snapshotRoomConfig).addonsList : (txn.rawPayment?.serviceFees ? [{ name: 'Additional Services', price: txn.rawPayment.serviceFees }] : []),
        isPackage: (txn.rawBooking.roomId || '').startsWith('Package:') || (txn.rawBooking.roomId || '').toLowerCase().includes('package') || (txn.rawBooking.hotelId || '').startsWith('pkg-')
      };

      const res = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${payload.displayBookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Failed to download invoice", err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold mb-2">Payment History</h2>
          <p className="text-gray-500">View your past transactions, refunds, and receipts.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral text-sm w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 whitespace-nowrap">
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-coral" />
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'Credit' ? 'bg-green-50 text-green-600' : 'bg-brand-coral/10 text-brand-coral'}`}>
                          {txn.type === 'Credit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy text-sm">{txn.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{txn.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className={`font-bold ${txn.type === 'Credit' ? 'text-green-600' : 'text-brand-navy'}`}>
                        {txn.type === 'Credit' ? '+' : ''}{txn.amount}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        txn.status === 'Completed' || txn.status === 'Paid' ? 'bg-green-50 text-green-600' : 
                        txn.status === 'Refunded' ? 'bg-blue-50 text-blue-600' : 
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-gray-600">{txn.date}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadInvoice(txn)}
                        disabled={isDownloading === txn.id}
                        className="p-2 text-gray-400 hover:text-brand-coral transition-colors rounded-lg hover:bg-brand-coral/5 inline-flex disabled:opacity-50"
                      >
                        {isDownloading === txn.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <FileText size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
