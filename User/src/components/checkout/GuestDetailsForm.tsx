"use client";
import { User, Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";

export function GuestDetailsForm() {
  const { guestDetails, updateGuestDetails } = useCheckoutStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-poppins font-bold text-brand-navy mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-brand-coral" /> Guest Details
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input suppressHydrationWarning value={guestDetails.firstName} onChange={e => updateGuestDetails({ firstName: e.target.value })} type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input suppressHydrationWarning value={guestDetails.lastName} onChange={e => updateGuestDetails({ lastName: e.target.value })} type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Mail className="w-4 h-4 text-gray-400" /> Email Address</label>
            <input suppressHydrationWarning value={guestDetails.email} onChange={e => updateGuestDetails({ email: e.target.value })} type="email" placeholder="john.doe@example.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400" /> Phone Number</label>
            <input suppressHydrationWarning value={guestDetails.phone} onChange={e => updateGuestDetails({ phone: e.target.value })} type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> Country/Region</label>
            <select value={guestDetails.country} onChange={e => updateGuestDetails({ country: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all bg-white">
              <option>United States</option>
              <option>United Kingdom</option>
              <option>India</option>
              <option>United Arab Emirates</option>
              <option>Australia</option>
              <option>Canada</option>
              <option>France</option>
              <option>Germany</option>
              <option>Italy</option>
              <option>Japan</option>
              <option>Singapore</option>
              <option>South Africa</option>
              <option>Spain</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-sky space-y-6">
          <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-coral" /> Additional Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> Arrival Time</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all bg-white">
                <option>I don&apos;t know yet</option>
                <option>12:00 PM - 02:00 PM</option>
                <option>02:00 PM - 04:00 PM</option>
                <option>04:00 PM - 06:00 PM</option>
                <option>After 06:00 PM</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Smoking Preference</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="smoking" className="w-4 h-4 text-brand-coral focus:ring-brand-coral" defaultChecked />
                  <span className="text-sm text-gray-700">Non-smoking</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="smoking" className="w-4 h-4 text-brand-coral focus:ring-brand-coral" />
                  <span className="text-sm text-gray-700">Smoking</span>
                </label>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Special Requests (Optional)</label>
              <textarea value={guestDetails.specialRequests} onChange={e => updateGuestDetails({ specialRequests: e.target.value })} placeholder="e.g. Quiet room, high floor, anniversary celebration..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all min-h-25 resize-y"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-brand-sky bg-brand-sand/50 hover:bg-brand-sky/30 transition-colors">
                <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-brand-coral focus:ring-brand-coral" />
                <div>
                  <span className="block font-medium text-brand-navy">Airport Pickup Required</span>
                  <span className="block text-sm text-gray-500 mt-0.5">We will contact you to arrange the details. Additional charges may apply.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
