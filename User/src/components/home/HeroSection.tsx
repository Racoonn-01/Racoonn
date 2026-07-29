'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import chatbotLogo from '@/assets/Racoonn-Logo-03.png';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Palmtree,
  Ticket,
  MapPin,
  CalendarDays,
  Users,
  ChevronDown,
  ArrowRight,
  Plus,
  Minus,
  Mic,
  MicOff
} from 'lucide-react';

const tabs = [
  { id: 'stays', label: 'Stays', icon: Home },
  { id: 'packages', label: 'Packages', icon: Palmtree },
  { id: 'activities', label: 'Activities', icon: Ticket },
];

const heroImages = [
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920&auto=format&fit=crop"
];

export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stays');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatMode, setIsChatMode] = useState(false);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<{name: string, district: string, state: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiSearch = (queryStr: string = chatQuery) => {
    if (!queryStr.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      router.push(`/search?ai=${encodeURIComponent(queryStr.trim())}`);
      // Resetting is optional, but helps if they navigate back
      setTimeout(() => setIsAnalyzing(false), 1000);
    }, 2500);
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      // We can't strictly stop it safely here without saving the recognition instance,
      // but it will stop on its own when the user stops speaking.
      // A more robust implementation would save the recognition instance to a ref.
      return;
    }

    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as {
      new (): {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: () => void;
        onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string }, isFinal: boolean } } }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
      };
    } | undefined;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      setChatQuery(transcript);
      
      if (result.isFinal) {
        setTimeout(() => {
          handleAiSearch(transcript);
        }, 800);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (destination.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        setLoadingSuggestions(true);
        fetch(`https://api.postalpincode.in/postoffice/${destination}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0] && data[0].Status === 'Success') {
              const uniqueLocations = data[0].PostOffice.slice(0, 5).map((po: { Name: string; District: string; State: string }) => ({
                name: po.Name,
                district: po.District,
                state: po.State
              }));
              setSuggestions(uniqueLocations);
            } else {
              setSuggestions([]);
            }
          })
          .catch(err => {
            console.error(err);
            setSuggestions([]);
          })
          .finally(() => {
            setLoadingSuggestions(false);
          });
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [destination]);

  return (
    <section className="relative w-full -mt-24 pt-32 rounded-b-[50px] z-10">

      {/* Background Image Slideshow */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[50px] z-0 pointer-events-none">
        {heroImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Beautiful tropical destination ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out transform-gpu will-change-opacity ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>


      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20 pb-8">

        {/* Search Card */}
        <div className="max-w-4xl mx-auto transform-gpu relative z-20">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative">

            {/* Tabs & Chatbot Container */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0 overflow-x-auto hide-scrollbar">
              
              {/* Left Side: Tabs */}
              <div className="flex items-center gap-1 transition-all duration-300">
                {!isChatMode && tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl whitespace-nowrap text-sm font-medium transition-all relative ${isActive
                        ? 'text-brand-coral'
                        : 'text-brand-charcoal/60 hover:text-brand-navy'
                        }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-coral rounded-full" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Chatbot Button */}
              <button 
                onClick={() => setIsChatMode(!isChatMode)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-coral/10 hover:bg-brand-coral/20 border border-brand-coral/20 transition-all hover:scale-105 active:scale-95 text-brand-navy font-bold text-sm mb-1.5 whitespace-nowrap shadow-sm"
              >
                <div className="w-6 h-6 relative rounded-full overflow-hidden shrink-0 bg-white">
                  <Image src={chatbotLogo} alt="AI Assistant" fill className="object-contain p-0.5" />
                </div>
                {isChatMode ? 'Classic Search' : 'Ask AI'}
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Search Fields / Chat Mode */}
            <div className="p-6 space-y-4 min-h-55 relative">
              <AnimatePresence mode="wait">
              {isChatMode ? (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  {isAnalyzing ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 gap-6 min-h-55"
                    >
                      <div className="relative w-20 h-20">
                        {/* Outer pulsing ring */}
                        <motion.div 
                          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-brand-coral border-2 border-brand-coral"
                        />
                        {/* Inner pulsing ring */}
                        <motion.div 
                          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-brand-coral"
                        />
                        <div className="absolute inset-0 bg-white rounded-full shadow-lg z-10 flex items-center justify-center overflow-hidden">
                          <Image src={chatbotLogo} alt="Analyzing" fill className="object-contain p-3 animate-pulse" />
                        </div>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center space-y-1.5"
                      >
                        <h3 className="font-bold text-brand-navy text-lg">Racoonn AI is analyzing...</h3>
                        <p className="text-[14px] text-gray-500 font-medium">Finding the perfect properties for your prompt</p>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4 border border-brand-coral/30 rounded-2xl p-5 bg-brand-coral/5 transition-colors focus-within:border-brand-coral/60 focus-within:bg-white shadow-inner relative">
                        <div className="w-8 h-8 relative rounded-full overflow-hidden shrink-0 bg-white shadow-sm mt-0.5 border border-gray-100">
                          <Image src={chatbotLogo} alt="AI Assistant" fill className="object-contain p-1" />
                        </div>
                        <textarea 
                          placeholder="e.g. Find me a beachfront villa in Bali for 2 adults next weekend with a private pool..."
                          className="w-full min-h-62.5 md:min-h-34 outline-none text-brand-navy text-[16px] placeholder:text-brand-charcoal/40 bg-transparent resize-none leading-relaxed pb-8"
                          autoFocus
                          value={chatQuery}
                          onChange={(e) => setChatQuery(e.target.value)}
                        />
                        <button 
                          onClick={handleMicClick}
                          className={`absolute right-4 bottom-4 p-2 rounded-full transition-colors ${
                            isRecording 
                              ? 'bg-red-100 text-red-500 hover:bg-red-200 animate-pulse' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={isRecording ? "Stop recording" : "Use voice input"}
                        >
                          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleAiSearch()}
                          className="bg-linear-to-r from-brand-coral to-[#e84f57] hover:shadow-[0_8px_20px_rgba(232,106,112,0.3)] text-white pl-7 pr-5 py-3.5 rounded-full font-bold flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 text-[15px] sm:w-55"
                        >
                          Ask Racoonn AI
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <ArrowRight size={16} />
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="classic"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-4"
                >

              {/* Destination Row */}
              <div className="flex items-center gap-4 border border-gray-200 rounded-2xl px-5 py-4 hover:border-brand-coral/40 transition-colors cursor-text group">
                <MapPin size={22} className="text-brand-charcoal/40 group-hover:text-brand-coral transition-colors shrink-0" />
                <div className="w-full relative">
                  <h4 className="font-semibold text-brand-navy text-[15px]">
                    {activeTab === 'activities' ? 'What do you want to do?' : 'Where are you going?'}
                  </h4>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDestination(val);
                      setShowSuggestions(true);
                      if (val.length <= 2) {
                        setSuggestions([]);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={
                      activeTab === 'stays' ? "Search destination or property" :
                      activeTab === 'packages' ? "Search destination or package name" :
                      "Search activities, tours, or destinations"
                    }
                    className="w-full outline-none text-brand-charcoal/70 text-sm font-medium placeholder:text-brand-charcoal/40 bg-transparent mt-0.5 p-0"
                  />
                  {showSuggestions && destination.length > 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      {loadingSuggestions ? (
                        <div className="p-4 text-sm text-gray-500">Loading...</div>
                      ) : suggestions.length > 0 ? (
                        <ul className="max-h-60 overflow-y-auto">
                          {suggestions.map((s, i) => (
                            <li 
                              key={i} 
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                              onClick={() => {
                                setDestination(s.district);
                                setShowSuggestions(false);
                              }}
                            >
                              <div className="font-medium text-sm text-brand-navy">{s.name}</div>
                              <div className="text-xs text-gray-500">{s.district}, {s.state}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-sm text-gray-500">No destinations found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date + Guests Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Check-in / Start Date */}
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger className="flex items-center gap-4 border border-gray-200 rounded-2xl px-5 py-4 hover:border-brand-coral/40 transition-colors cursor-pointer group flex-1 text-left focus:outline-none focus:ring-2 focus:ring-brand-coral/30">
                    <CalendarDays size={22} className="text-brand-charcoal/40 group-hover:text-brand-coral transition-colors shrink-0" />
                    <div>
                      <h4 className="font-semibold text-brand-navy text-[15px]">
                        {activeTab === 'stays' ? 'Check-in' : activeTab === 'packages' ? 'Start date' : 'Date'}
                      </h4>
                      <p className="text-sm text-brand-charcoal/50">
                        {checkIn ? format(checkIn, "PP") : "Add dates"}
                      </p>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => {
                        setCheckIn(date);
                        setIsCheckInOpen(false);
                        if (!checkOut || (date && date >= checkOut)) {
                          setCheckOut(undefined);
                        }
                        if (activeTab !== 'activities') {
                          setTimeout(() => setIsCheckOutOpen(true), 150);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>

                {/* Divider */}
                {activeTab !== 'activities' && <div className="hidden sm:block w-px bg-gray-200 self-stretch" />}

                {/* Check-out / End Date */}
                {activeTab !== 'activities' && (
                  <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                    <PopoverTrigger className="flex items-center gap-4 border border-gray-200 rounded-2xl px-5 py-4 hover:border-brand-coral/40 transition-colors cursor-pointer group flex-1 text-left focus:outline-none focus:ring-2 focus:ring-brand-coral/30">
                      <CalendarDays size={22} className="text-brand-charcoal/40 group-hover:text-brand-coral transition-colors shrink-0" />
                      <div>
                        <h4 className="font-semibold text-brand-navy text-[15px]">
                          {activeTab === 'stays' ? 'Check-out' : 'End date'}
                        </h4>
                        <p className="text-sm text-brand-charcoal/50">
                          {checkOut ? format(checkOut, "PP") : "Add dates"}
                        </p>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={(date) => {
                          setCheckOut(date);
                          setIsCheckOutOpen(false);
                        }}
                        disabled={(date) => {
                          if (checkIn) {
                            return date <= checkIn;
                          }
                          return date < new Date(new Date().setHours(0, 0, 0, 0));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {/* Divider */}
                <div className="hidden sm:block w-px bg-gray-200 self-stretch" />

                {/* Guests / Participants */}
                <Popover>
                  <PopoverTrigger className="flex items-center gap-4 border border-gray-200 rounded-2xl px-5 py-4 hover:border-brand-coral/40 transition-colors cursor-pointer group flex-1 text-left focus:outline-none focus:ring-2 focus:ring-brand-coral/30">
                    <Users size={22} className="text-brand-charcoal/40 group-hover:text-brand-coral transition-colors shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-navy text-[15px]">
                        {activeTab === 'activities' ? 'Participants' : 'Guests'}
                      </h4>
                      <p className="text-sm text-brand-charcoal/50 truncate">
                        {adults + children === 0 && rooms === 0 
                          ? (activeTab === 'activities' ? "Add participants" : "Add guests") 
                          : `${adults + children} ${activeTab === 'activities' ? 'participant' : 'guest'}${adults + children !== 1 ? 's' : ''}` + (activeTab !== 'activities' ? ` · ${rooms} room${rooms !== 1 ? 's' : ''}` : '')
                        }
                      </p>
                    </div>
                    <ChevronDown size={18} className="text-brand-charcoal/40" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-brand-navy">{activeTab === 'activities' ? 'Adults' : 'Adults'}</p>
                          <p className="text-sm text-brand-charcoal/60">Ages 13 or above</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(0, adults - 1))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-brand-charcoal"
                            disabled={adults <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center font-medium">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-brand-navy">Children</p>
                          <p className="text-sm text-brand-charcoal/60">Ages 0-12</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-brand-charcoal"
                            disabled={children <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center font-medium">{children}</span>
                          <button
                            type="button"
                            onClick={() => setChildren(children + 1)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Rooms (Hidden for Activities) */}
                      {activeTab !== 'activities' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-brand-navy">Rooms</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setRooms(Math.max(0, rooms - 1))}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-brand-charcoal"
                              disabled={rooms <= 0}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center font-medium">{rooms}</span>
                            <button
                              type="button"
                              onClick={() => setRooms(rooms + 1)}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-brand-charcoal hover:border-brand-coral hover:text-brand-coral transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">

                <Link 
                  href={
                    activeTab === 'packages' ? "/packages" : 
                    activeTab === 'activities' ? `/activities?location=${encodeURIComponent(destination)}&date=${checkIn?.toISOString() || ''}&adults=${adults}&children=${children}` : 
                    `/search?location=${encodeURIComponent(destination)}&checkIn=${checkIn?.toISOString() || ''}&checkOut=${checkOut?.toISOString() || ''}&adults=${adults}&children=${children}&rooms=${rooms}`
                  } 
                  className="bg-brand-coral hover:bg-brand-coral/90 text-white pl-7 pr-5 py-3.5 rounded-full font-bold flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 text-[15px] w-full sm:w-auto min-w-50"
                >
                  Search
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>


    </section>
  );
}
