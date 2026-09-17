"use client";
import { useEffect, useRef, useState } from "react";
import { User, Mail, Phone, MapPin, MessageSquare, Clock, Search, ChevronDown, Check } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useAuthStore } from "@/store/authStore";

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', dialCode: '+355' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', dialCode: '+213' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', dialCode: '+376' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', dialCode: '+374' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', dialCode: '+1242' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', dialCode: '+1246' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', dialCode: '+375' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', dialCode: '+501' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', dialCode: '+229' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', dialCode: '+975' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', dialCode: '+387' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', dialCode: '+359' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '+257' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', dialCode: '+238' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', dialCode: '+855' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', dialCode: '+237' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', dialCode: '+236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', dialCode: '+235' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', dialCode: '+269' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', dialCode: '+385' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', dialCode: '+53' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', dialCode: '+357' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', dialCode: '+253' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', dialCode: '+1767' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', dialCode: '+1' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dialCode: '+503' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', dialCode: '+291' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', dialCode: '+372' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', dialCode: '+268' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', dialCode: '+679' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dialCode: '+220' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', dialCode: '+995' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', dialCode: '+1473' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dialCode: '+502' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', dialCode: '+224' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '+592' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', dialCode: '+509' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', dialCode: '+504' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', dialCode: '+354' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '+98' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', dialCode: '+964' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', dialCode: '+1876' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', dialCode: '+962' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', dialCode: '+686' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', dialCode: '+850' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '+856' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', dialCode: '+371' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', dialCode: '+961' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '+266' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '+231' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', dialCode: '+218' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', dialCode: '+370' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '+261' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', dialCode: '+960' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', dialCode: '+356' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', dialCode: '+692' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', dialCode: '+222' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', dialCode: '+230' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', dialCode: '+691' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', dialCode: '+373' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', dialCode: '+976' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', dialCode: '+382' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '+95' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', dialCode: '+264' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', dialCode: '+674' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dialCode: '+505' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', dialCode: '+389' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', dialCode: '+680' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', dialCode: '+507' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', dialCode: '+675' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', dialCode: '+40' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', dialCode: '+1869' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', dialCode: '+1758' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', dialCode: '+1784' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', dialCode: '+685' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', dialCode: '+378' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹', dialCode: '+239' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', dialCode: '+381' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', dialCode: '+248' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', dialCode: '+421' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', dialCode: '+386' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', dialCode: '+677' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', dialCode: '+252' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', dialCode: '+211' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', dialCode: '+249' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '+597' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', dialCode: '+963' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', dialCode: '+992' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', dialCode: '+670' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', dialCode: '+676' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', dialCode: '+1868' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', dialCode: '+216' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', dialCode: '+688' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '+380' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', dialCode: '+678' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', dialCode: '+39' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', dialCode: '+967' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263' }
];

export function GuestDetailsForm() {
  const { guestDetails, updateGuestDetails } = useCheckoutStore();
  const { profile } = useAuthStore();
  const hasInitialized = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setIsPhoneDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPhoneCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) || c.dialCode.includes(phoneSearchQuery));
  const selectedCountry = COUNTRIES.find(c => c.name === guestDetails.country);
  const phoneCountry = selectedCountry || COUNTRIES.find(c => c.dialCode === '+91');

  useEffect(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      const updates: Partial<typeof guestDetails> = {};
      
      if (!guestDetails.firstName && !guestDetails.lastName && profile.name) {
        const nameParts = profile.name.split(" ");
        updates.firstName = nameParts[0] || "";
        updates.lastName = nameParts.slice(1).join(" ") || "";
      }
      if (!guestDetails.email && profile.email) {
        updates.email = profile.email;
      }
      if (!guestDetails.phone && profile.phone) {
        updates.phone = profile.phone;
      }

      if (Object.keys(updates).length > 0) {
        updateGuestDetails(updates);
      }
    }
  }, [profile, guestDetails.firstName, guestDetails.lastName, guestDetails.email, guestDetails.phone, updateGuestDetails]);

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
            <div className="flex gap-2 relative" ref={phoneDropdownRef}>
              <button 
                type="button" 
                onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                className="px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span className="text-lg">{phoneCountry ? phoneCountry.flag : '🇮🇳'}</span>
                <span className="text-sm font-medium text-gray-700">{phoneCountry ? phoneCountry.dialCode : '+91'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
              
              {isPhoneDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search country or code..." 
                        value={phoneSearchQuery}
                        onChange={(e) => setPhoneSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredPhoneCountries.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">No countries found</div>
                    ) : (
                      filteredPhoneCountries.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            updateGuestDetails({ country: c.name });
                            setIsPhoneDropdownOpen(false);
                            setPhoneSearchQuery("");
                          }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-brand-sky/20 flex items-center gap-3 transition-colors ${guestDetails.country === c.name ? 'bg-brand-sky/10' : ''}`}
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span className="text-gray-900 font-medium w-12">{c.dialCode}</span>
                          <span className={`text-sm truncate ${guestDetails.country === c.name ? 'text-brand-navy font-medium' : 'text-gray-600'}`}>
                            {c.name}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              <input suppressHydrationWarning value={guestDetails.phone} onChange={e => updateGuestDetails({ phone: e.target.value })} type="tel" placeholder="(555) 000-0000" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2 relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> Country/Region</label>
            <button 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all bg-white text-left flex justify-between items-center"
            >
              <span className={selectedCountry ? "text-gray-900" : "text-gray-500"}>
                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "Select your region"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-gray-100 flex items-center bg-white sticky top-0 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-brand-coral focus:ring-1 focus:ring-brand-coral rounded-md outline-none text-sm transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="overflow-y-auto p-1 bg-white">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.name}
                        type="button"
                        onClick={() => {
                          updateGuestDetails({ country: country.name });
                          setIsDropdownOpen(false);
                          setSearchQuery("");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${guestDetails.country === country.name ? 'bg-brand-coral/5 text-brand-coral font-medium' : 'text-gray-700'}`}
                      >
                        <span>{country.flag} {country.name}</span>
                        {guestDetails.country === country.name && <Check className="w-4 h-4" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
