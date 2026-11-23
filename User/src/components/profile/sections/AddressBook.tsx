import { MapPin, Plus, Home, Briefcase } from 'lucide-react';

const mockAddresses = [
  { id: 1, type: 'Home', isDefault: true, name: 'John Doe', address: '123 Luxury Lane, Suite 400', city: 'Beverly Hills', state: 'CA', zip: '90210', country: 'United States' },
  { id: 2, type: 'Office', isDefault: false, name: 'John Doe', address: '456 Corporate Blvd, Floor 12', city: 'New York', state: 'NY', zip: '10001', country: 'United States' }
];

export default function AddressBook() {
  const getIcon = (type: string) => {
    switch(type) {
      case 'Home': return <Home size={20} />;
      case 'Office': return <Briefcase size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold mb-2">Address Book</h2>
          <p className="text-gray-500">Manage your billing and mailing addresses.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-brand-coral text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm">
          <Plus size={18} /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAddresses.map((addr) => (
          <div key={addr.id} className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500">
                  {getIcon(addr.type)}
                </div>
                <div>
                  <h3 className="font-bold text-brand-navy">{addr.type}</h3>
                  {addr.isDefault && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                      Default Billing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm font-bold text-gray-400 hover:text-brand-coral transition-colors">Edit</button>
                <button className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Remove</button>
              </div>
            </div>

            <div className="space-y-1 text-gray-500 text-sm">
              <p className="font-bold text-gray-700">{addr.name}</p>
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              <p>{addr.country}</p>
            </div>
          </div>
        ))}
        
        {/* Add Address Button */}
        <button className="md:hidden flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-coral hover:text-brand-coral hover:bg-brand-coral/5 transition-all gap-3 h-full min-h-50">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="font-bold">Add New Address</span>
        </button>
      </div>
    </div>
  );
}
