import { BedDouble, Coffee, Cigarette, Globe } from 'lucide-react';

export default function TravelPreferences() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold mb-2">Travel Preferences</h2>
        <p className="text-gray-500">Customize your travel style so we can tailor the best recommendations for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Room & Bed Preferences */}
        <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <BedDouble size={20} />
            </div>
            <h3 className="font-bold text-lg">Room & Bed</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Preferred Room Type</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-coral bg-gray-50 focus:bg-white transition-all appearance-none">
                <option>Suite</option>
                <option>Deluxe Room</option>
                <option>Standard Room</option>
                <option>Villa</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Preferred Bed Type</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-coral bg-gray-50 focus:bg-white transition-all appearance-none">
                <option>King Size</option>
                <option>Queen Size</option>
                <option>Twin Beds</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Cigarette size={18} className="text-gray-400" />
                <span className="text-sm font-bold">Smoking Preference</span>
              </div>
              <select className="px-4 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-gray-50">
                <option>Non-Smoking</option>
                <option>Smoking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dining & Lifestyle */}
        <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
              <Coffee size={20} />
            </div>
            <h3 className="font-bold text-lg">Dining & Lifestyle</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Dietary/Meal Preference</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-coral bg-gray-50 focus:bg-white transition-all appearance-none">
                <option>No Preference</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Halal</option>
                <option>Gluten-Free</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Primary Travel Purpose</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-coral bg-gray-50 focus:bg-white transition-all appearance-none">
                <option>Leisure & Vacation</option>
                <option>Business</option>
                <option>Family Trips</option>
                <option>Solo Adventure</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Favorite Destinations</label>
              <input 
                type="text" 
                placeholder="e.g. Bali, Paris, Tokyo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-coral bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Global Settings */}
        <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-lg">Region & Notifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Preferred Currency</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>INR (₹)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Preferred Language</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50">
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="flex flex-col justify-center gap-3 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-brand-coral focus:ring-brand-coral" />
                <span className="text-sm font-bold text-gray-700">Receive Promotional Emails</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-brand-coral focus:ring-brand-coral" />
                <span className="text-sm font-bold text-gray-700">Receive SMS Updates</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-4">
        <button className="bg-brand-coral hover:bg-opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-brand-coral/20">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
