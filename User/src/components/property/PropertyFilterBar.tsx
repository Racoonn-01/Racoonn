'use client';

import { Calendar, RefreshCw } from 'lucide-react';
import GuestSelector from './GuestSelector';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';

export default function PropertyFilterBar() {
  const { checkIn, checkOut, setCheckIn, setCheckOut, reset } = usePropertyFilterStore();

  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-8">
      <div className="flex-1 flex flex-col sm:flex-row border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-[#222] transition-shadow">
        <div className="flex-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 relative cursor-pointer rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
          <Calendar className="text-gray-400 shrink-0 ml-2" size={20} />
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Check-in date</label>
            <input 
              type="date" 
              className="text-[15px] text-brand-navy font-medium bg-transparent outline-none w-full cursor-pointer" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 relative cursor-pointer">
          <Calendar className="text-gray-400 shrink-0 ml-2" size={20} />
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Check-out date</label>
            <input 
              type="date" 
              className="text-[15px] text-brand-navy font-medium bg-transparent outline-none w-full cursor-pointer" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <GuestSelector />
      </div>
      <button 
        onClick={reset}
        title="Reset Filters"
        className="w-full xl:w-16 h-14 xl:h-auto rounded-2xl bg-brand-navy/5 text-brand-navy flex items-center justify-center hover:bg-brand-navy hover:text-white transition-all font-semibold xl:font-normal"
      >
        <RefreshCw size={22} className="mr-2 xl:mr-0 hidden xl:block" />
        <span className="xl:hidden">Reset Filters</span>
      </button>
    </div>
  );
}
