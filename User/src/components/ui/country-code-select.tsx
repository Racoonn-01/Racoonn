import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Country } from 'country-state-city';

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CountryCodeSelect({
  value,
  onChange,
  className = ""
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countries = Country.getAllCountries();
  
  // Deduplicate countries with the same phone code for a cleaner dropdown,
  // or keep them all so users can search their specific country. We'll keep them
  // all so search works nicely for every country name.
  const options = countries.map(c => ({
    label: `${c.flag} +${c.phonecode} (${c.name})`,
    searchStr: `${c.name} +${c.phonecode}`.toLowerCase(),
    code: `+${c.phonecode}`,
    flag: c.flag
  }));

  const filteredOptions = options.filter(option =>
    option.searchStr.includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(o => o.code === value) || options.find(o => o.code === '+1');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className="w-full h-full flex items-center justify-between cursor-pointer outline-none bg-transparent gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-brand-navy font-bold truncate">
          {selectedOption ? `${selectedOption.flag} ${selectedOption.code}` : value}
        </span>
        <ChevronDown className="text-gray-400 shrink-0" size={14} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center shrink-0 sticky top-0 bg-white">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search country or code..."
              className="w-full outline-none text-sm text-brand-navy font-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={`${option.code}-${idx}`}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${value === option.code ? 'bg-gray-50 font-medium text-brand-navy' : 'text-gray-700 font-normal'}`}
                  onClick={() => {
                    onChange(option.code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center font-normal">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
