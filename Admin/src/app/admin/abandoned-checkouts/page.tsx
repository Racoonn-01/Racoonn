"use client";

import { useEffect, useState } from 'react';
import { client } from '@/lib/appwrite/client';
import { Query, Databases } from 'appwrite';
import { BarChart3, Mail, RefreshCcw, DollarSign } from 'lucide-react';

const databases = new Databases(client);

interface CheckoutRecord {
  $id: string;
  $createdAt: string;
  email: string;
  name?: string;
  phone?: string;
  hotelId?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  amount?: number;
  status: string;
  emailSent?: boolean;
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'abandoned_checkouts';

export default function AbandonedCheckoutsPage() {
  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]);
      setCheckouts(res.documents as unknown as CheckoutRecord[]);
    } catch (err) {
      console.error('Failed to fetch abandoned checkouts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const total = checkouts.length;
  const emailsSent = checkouts.filter(c => c.emailSent).length;
  const recovered = checkouts.filter(c => c.status === 'PAYMENT_COMPLETED' || c.status === 'BOOKED').length;
  const recoveryRate = emailsSent > 0 ? ((recovered / emailsSent) * 100).toFixed(1) : 0;
  
  const recoveredRevenue = checkouts
    .filter(c => c.status === 'PAYMENT_COMPLETED' || c.status === 'BOOKED')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Checkouts</h1>
          <p className="text-gray-500">Track and recover lost bookings automatically.</p>
        </div>
        <button onClick={fetchCheckouts} className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><BarChart3 size={20} /></div>
            <p className="text-gray-500 font-medium">Total Abandoned</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{total}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail size={20} /></div>
            <p className="text-gray-500 font-medium">Emails Sent</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{emailsSent}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><RefreshCcw size={20} /></div>
            <p className="text-gray-500 font-medium">Recovery Rate</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{recoveryRate}%</h3>
          <p className="text-xs text-gray-400 mt-1">{recovered} bookings recovered</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
            <p className="text-gray-500 font-medium">Recovered Revenue</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">₹{recoveredRevenue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Recent Abandoned Checkouts</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Hotel / Room</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {checkouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No abandoned checkouts found.</td>
                  </tr>
                ) : (
                  checkouts.map(checkout => (
                    <tr key={checkout.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{checkout.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{checkout.email}</p>
                        {checkout.phone && <p className="text-xs text-gray-400">{checkout.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{checkout.hotelId}</p>
                        <p className="text-sm text-gray-500">{checkout.roomName || 'Unknown Room'}</p>
                        <p className="text-xs text-gray-400">{checkout.checkIn} to {checkout.checkOut}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">₹{checkout.amount?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                          checkout.status === 'PAYMENT_COMPLETED' || checkout.status === 'BOOKED' 
                            ? 'bg-green-100 text-green-700' 
                            : checkout.status === 'ABANDONED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {checkout.status === 'ABANDONED' && checkout.emailSent ? 'EMAILED' : checkout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{new Date(checkout.$createdAt).toLocaleString()}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
