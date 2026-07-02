"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin, Building, Building2, Warehouse, Coffee, Ship, Home, Car, Castle, Mountain, Box, Circle, Globe, Tractor, Users, Palmtree, Tent, Wind } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { ID, Permission, Role } from "appwrite";
import { Loader2 } from "lucide-react";

const PROPERTY_TYPES = [
  { name: "Apartment", icon: Building },
  { name: "Barn", icon: Warehouse },
  { name: "Bed & breakfast", icon: Coffee },
  { name: "Boat", icon: Ship },
  { name: "Boutique Hotel", icon: Building2 },
  { name: "Cabin", icon: Home },
  { name: "Campervan/motorhome", icon: Car },
  { name: "Casa particular", icon: Home },
  { name: "Castle", icon: Castle },
  { name: "Cave", icon: Mountain },
  { name: "Container", icon: Box },
  { name: "Cottage", icon: Home },
  { name: "Cycladic home", icon: Home },
  { name: "Dammuso", icon: Home },
  { name: "Dome", icon: Circle },
  { name: "Earth home", icon: Globe },
  { name: "Farm", icon: Tractor },
  { name: "Flat/apartment", icon: Building },
  { name: "Guest house", icon: Home },
  { name: "Homestay", icon: Home },
  { name: "Hostel", icon: Users },
  { name: "Hotel", icon: Building2 },
  { name: "House", icon: Home },
  { name: "Houseboat", icon: Ship },
  { name: "Lodge", icon: Home },
  { name: "Minsu", icon: Home },
  { name: "Resort", icon: Palmtree },
  { name: "Riad", icon: Home },
  { name: "Ryokan", icon: Home },
  { name: "Shepherd’s hut", icon: Home },
  { name: "Tent", icon: Tent },
  { name: "Tiny home", icon: Home },
  { name: "Tower", icon: Building2 },
  { name: "Tree house", icon: Home },
  { name: "Trullo", icon: Home },
  { name: "Villa", icon: Home },
  { name: "Windmill", icon: Wind },
  { name: "Yurt", icon: Tent }
];

const STATE_CITY_MAP: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Dadra and Nagar Haveli": ["Silvassa"],
  "Daman and Diu": ["Daman", "Diu"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Calangute"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Dalhousie"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Gulmarg", "Pahalgam"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Munnar", "Alleppey"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Lonavala"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong", "Cherrapunji"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Puducherry": ["Pondicherry", "Auroville"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Pushkar", "Jaisalmer"],
  "Sikkim": ["Gangtok", "Pelling", "Lachung"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Ooty", "Kodaikanal"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Mathura"],
  "Uttarakhand": ["Dehradun", "Nainital", "Haridwar", "Rishikesh", "Mussoorie", "Almora", "Haldwani"],
  "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Howrah", "Durgapur"]
};

const INDIAN_STATES = Object.keys(STATE_CITY_MAP);

export function Step4Property({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { user, profile, checkAuth } = useAuthStore();
  const [propertyName, setPropertyName] = useState("");
  const [selectedType, setSelectedType] = useState("Hotel");
  const [city, setCity] = useState("Mumbai");
  const [propertyState, setPropertyState] = useState("Maharashtra");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState(profile?.address || "");

  useEffect(() => {
    const loadPropertyData = async () => {
      // 1. If we have a currentPropertyId in profile, load from DB
      if (profile?.currentPropertyId) {
        try {
          const property = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.propertyCollectionId,
            profile.currentPropertyId
          );
          if (property.propertyName) setPropertyName(property.propertyName);
          if (property.propertyType) setSelectedType(property.propertyType);
          if (property.city) setCity(property.city);
          if (property.state) setPropertyState(property.state);
          if (property.description) setDescription(property.description);
        } catch(e) {
          console.error("Failed to load property", e);
        }
      } else {
        // 2. Otherwise auto-detect from registered address
        const addr = profile?.address;
  
        if (addr) {
          setRegisteredAddress(addr);
          const lowerAddr = addr.toLowerCase();
          let detectedState = "";
          
          for (const state of INDIAN_STATES) {
            if (lowerAddr.includes(state.toLowerCase())) {
              detectedState = state;
              setPropertyState(state);
              break;
            }
          }
  
          if (detectedState && STATE_CITY_MAP[detectedState]) {
            const cities = STATE_CITY_MAP[detectedState];
            let detectedCity = false;
            for (const c of cities) {
              if (lowerAddr.includes(c.toLowerCase())) {
                setCity(c);
                detectedCity = true;
                break;
              }
            }
            if (!detectedCity && cities.length > 0) {
              setCity(cities[0]);
            }
          }
        }
      }
    };
    loadPropertyData();
  }, [profile]);

  const saveToLocal = () => {
    // No-op, removed local storage
  };

  const handleBackClick = () => {
    saveToLocal();
    onBack();
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleNextSubmit = async () => {
    setError("");

    if (!propertyName.trim() || !city.trim() || !propertyState.trim()) {
      setError("Please fill in Property Name, City, and State.");
      return;
    }

    let currentUser = user;
    let currentProfile = profile;

    if (!currentUser || !currentProfile) {
      await checkAuth();
      const storeState = useAuthStore.getState();
      currentUser = storeState.user;
      currentProfile = storeState.profile;
      
      if (!currentUser || !currentProfile) {
        setError("You must be logged in to save a property.");
        return;
      }
    }

    setIsLoading(true);
    try {
      saveToLocal();
      
      const existingPropertyId = currentProfile.currentPropertyId;
      
      const propertyData = {
        vendorId: currentUser.$id,
        propertyName,
        title: propertyName,
        propertyType: selectedType,
        city,
        state: propertyState,
        location: `${registeredAddress ? registeredAddress + ", " : ""}${city}, ${propertyState}`,
        description,
        price: 0,
        status: "Pending"
      };

      let finalPropertyId = existingPropertyId;

      if (existingPropertyId) {
        // Update existing property document
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          existingPropertyId,
          propertyData
        );
      } else {
        // Create new property document
        const newProperty = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          ID.unique(),
          propertyData,
          [
            Permission.read(Role.user(currentUser.$id)),
            Permission.write(Role.user(currentUser.$id)),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id))
          ]
        );
        finalPropertyId = newProperty.$id;
      }

      // 2. Update Vendor Onboarding Step and currentPropertyId
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        currentProfile.$id,
        {
          onboardingStep: 4,
          currentPropertyId: finalPropertyId
        }
      );

      // Refresh auth store to get updated profile
      await checkAuth();

      // Proceed to next step
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">Add your property</h1>
        <p className="text-slate-500 font-medium">Let's create your listing profile. Travelers will see these details when searching for places to stay.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-500 font-medium text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Property Name</label>
          <Input 
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium text-lg" 
            placeholder="e.g. The Grand Racoonn Resort" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Property Type</label>
          <Select value={selectedType} onValueChange={(val) => { if (val) setSelectedType(val); }}>
            <SelectTrigger className="w-full h-12! rounded-xl border-slate-200 bg-white px-4 focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium text-slate-700">
              <SelectValue placeholder="Select a property type" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-100 w-[80vw] sm:w-150 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <SelectItem 
                    key={type.name} 
                    value={type.name} 
                    className="flex flex-col items-start justify-center p-4 rounded-xl border border-slate-200 transition-all text-left cursor-pointer data-[state=checked]:border-slate-800 data-[state=checked]:bg-slate-50 data-[state=checked]:ring-1 data-[state=checked]:ring-slate-800 focus:bg-slate-50 focus:text-slate-900 h-24"
                  >
                    <div className="flex flex-col items-start gap-2 w-full">
                      <type.icon className="w-6 h-6 stroke-[1.5px]" />
                      <span className="font-bold text-sm whitespace-normal text-left leading-tight">{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Live Google Map */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pin Location on Map</label>
            {registeredAddress && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-50" title={registeredAddress}>
                📍 {registeredAddress}
              </span>
            )}
          </div>
          <div className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative group">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${registeredAddress ? registeredAddress + ", " : ""}${city}, ${propertyState}` || "India")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full"
            ></iframe>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-[#1F2E4A]/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm text-white">
                <MapPin className="w-4 h-4 text-[#E86A70]" /> Interactive Map Enabled
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">State</label>
            <Select value={propertyState} onValueChange={(val) => { if (val) { setPropertyState(val); setCity(STATE_CITY_MAP[val]?.[0] || ""); } }}>
              <SelectTrigger className="w-full h-12! rounded-xl border-slate-200 bg-white px-4 focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium text-slate-700">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map(state => (
                  <SelectItem key={state} value={state} className="font-medium text-slate-700">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">City</label>
            <Input 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="city-suggestions"
              className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium" 
              placeholder="e.g. Mumbai" 
            />
            <datalist id="city-suggestions">
              {(STATE_CITY_MAP[propertyState] || []).map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Property Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium resize-none min-h-30 outline-none" 
            placeholder="Describe what makes your property unique. Highlight nearby attractions, atmosphere, and special features..."
          />
        </div>

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBackClick} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNextSubmit} disabled={isLoading} className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue Setup <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </motion.div>
    </motion.div>
  );
}
