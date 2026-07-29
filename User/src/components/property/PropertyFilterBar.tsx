'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, RefreshCw, CalendarDays } from 'lucide-react';
import { format, addDays } from 'date-fns';
import GuestSelector from './GuestSelector';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function PropertyFilterBar() {
  const { checkIn, checkOut, setCheckIn, setCheckOut, reset } = usePropertyFilterStore();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  // Parse YYYY-MM-DD safely into Date object without timezone shift
  const parseDateString = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
  };

  const formatDateToString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const checkInDateObj = parseDateString(checkIn);
  const checkOutDateObj = parseDateString(checkOut);

  const handleCheckInSelect = (date: Date | undefined) => {
    if (!date) return;
    const newCheckInStr = formatDateToString(date);
    setCheckIn(newCheckInStr);

    // If checkOut is empty or <= new checkIn, automatically set checkOut to checkIn + 1 day
    if (!checkOutDateObj || checkOutDateObj <= date) {
      const nextDay = addDays(date, 1);
      setCheckOut(formatDateToString(nextDay));
    }

    setIsCheckInOpen(false);
    // Auto open checkout date picker smoothly
    setTimeout(() => {
      setIsCheckOutOpen(true);
    }, 150);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (!date) return;
    setCheckOut(formatDateToString(date));
    setIsCheckOutOpen(false);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-8">
      <div className="flex-1 flex flex-col sm:flex-row border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-brand-coral/40 transition-all bg-white shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        
        {/* Check-in Date */}
        <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <PopoverTrigger className="flex-1 p-3.5 hover:bg-gray-50/80 transition-colors flex items-center justify-between cursor-pointer rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none text-left outline-none group">
            <div className="flex items-center gap-3 w-full">
              <CalendarIcon className="text-gray-400 group-hover:text-brand-coral transition-colors shrink-0 ml-1" size={20} />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 cursor-pointer">
                  Check-in date
                </label>
                <div className="text-[15px] text-brand-navy font-semibold truncate">
                  {checkInDateObj ? format(checkInDateObj, 'dd/MM/yyyy') : 'Select date'}
                </div>
              </div>
              <CalendarDays size={16} className="text-gray-400 group-hover:text-brand-coral transition-colors shrink-0 mr-1" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 bg-white" align="start" sideOffset={8}>
            <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-coral animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Select Check-In Date
                </span>
              </div>
            </div>
            <Calendar
              mode="single"
              selected={checkInDateObj}
              onSelect={handleCheckInSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="p-1"
            />
          </PopoverContent>
        </Popover>

        {/* Check-out Date */}
        <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
          <PopoverTrigger className="flex-1 p-3.5 hover:bg-gray-50/80 transition-colors flex items-center justify-between cursor-pointer text-left outline-none group">
            <div className="flex items-center gap-3 w-full">
              <CalendarIcon className="text-gray-400 group-hover:text-brand-coral transition-colors shrink-0 ml-1" size={20} />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 cursor-pointer">
                  Check-out date
                </label>
                <div className="text-[15px] text-brand-navy font-semibold truncate">
                  {checkOutDateObj ? format(checkOutDateObj, 'dd/MM/yyyy') : 'Select date'}
                </div>
              </div>
              <CalendarDays size={16} className="text-gray-400 group-hover:text-brand-coral transition-colors shrink-0 mr-1" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 bg-white" align="start" sideOffset={8}>
            <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-navy animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Select Check-Out Date
                </span>
              </div>
              {checkInDateObj && (
                <span className="text-[11px] font-semibold text-brand-coral bg-brand-coral/10 px-2.5 py-0.5 rounded-full border border-brand-coral/20 shrink-0">
                  Check-in: {format(checkInDateObj, "dd MMM")}
                </span>
              )}
            </div>
            <Calendar
              mode="single"
              selected={checkOutDateObj}
              onSelect={handleCheckOutSelect}
              disabled={(date) => {
                const today = new Date(new Date().setHours(0, 0, 0, 0));
                if (checkInDateObj) {
                  return date <= checkInDateObj;
                }
                return date < today;
              }}
              defaultMonth={checkInDateObj || new Date()}
              className="p-1"
            />
          </PopoverContent>
        </Popover>

        {/* Guests & Rooms */}
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

