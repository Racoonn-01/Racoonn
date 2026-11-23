import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className="w-full h-full flex items-center justify-between cursor-pointer outline-none bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'text-brand-navy'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className="text-gray-400 shrink-0 ml-2" size={16} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center shrink-0 sticky top-0 bg-white">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full outline-none text-sm text-brand-navy"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${value === option ? 'bg-gray-50 font-medium text-brand-navy' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
