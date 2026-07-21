import { useState, useEffect } from 'react';
import { UserProfile, useAuthStore } from '@/store/authStore';
import { authService } from '@/lib/appwrite/auth';
import { CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Country, State, City } from 'country-state-city';

// Reusable wrapper for the MakeMyTrip style floating label inputs
const FieldWrapper = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="relative rounded-lg border border-gray-200 bg-[#fbfbfb] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
    <label className="absolute top-2.5 left-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide z-10 pointer-events-none">
      {label}
    </label>
    {children}
  </div>
);

export default function PersonalInformationForm({ profile }: { profile: UserProfile | null }) {
  const { checkAuth } = useAuthStore();
  
  const initialFirstName = profile?.name?.split(' ')[0] || '';
  const initialLastName = profile?.name?.split(' ').slice(1).join(' ') || '';

  const legacyStateMap: Record<string, string> = {
    "NY": "New York",
    "CA": "California",
    "TX": "Texas",
    "MH": "Maharashtra",
    "NSW": "New South Wales"
  };
  const getMappedState = (stateCode?: string) => stateCode ? (legacyStateMap[stateCode] || stateCode) : '';

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    gender: profile?.gender || '',
    dob: profile?.dob || '',
    nationality: profile?.nationality || '',
    maritalStatus: profile?.maritalStatus || '',
    anniversaryMonth: profile?.anniversary?.split('-')[0] || '',
    anniversaryDay: profile?.anniversary?.split('-')[1] || '',
    city: profile?.nationality ? (profile?.city || '') : '',
    state: profile?.nationality ? getMappedState(profile?.state) : '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    // Document Fields
    passportNo: profile?.passportNo || '',
    passportExpiry: profile?.passportExpiry || '',
    passportCountry: profile?.passportCountry || '',
    panCard: profile?.panCard || ''
  });

  useEffect(() => {
    if (profile) {
      const timeoutId = setTimeout(() => {
        setFormData({
          firstName: profile.name?.split(' ')[0] || '',
          lastName: profile.name?.split(' ').slice(1).join(' ') || '',
          gender: profile.gender || '',
          dob: profile.dob || '',
          nationality: profile.nationality || '',
          maritalStatus: profile.maritalStatus || '',
          anniversaryMonth: profile.anniversary?.split('-')[0] || '',
          anniversaryDay: profile.anniversary?.split('-')[1] || '',
          city: profile.nationality ? (profile.city || '') : '',
          state: profile.nationality ? getMappedState(profile.state) : '',
          phone: profile.phone || '',
          email: profile.email || '',
          passportNo: profile.passportNo || '',
          passportExpiry: profile.passportExpiry || '',
          passportCountry: profile.passportCountry || '',
          panCard: profile.panCard || ''
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [profile]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveStatus('idle'); // Reset status on change
  };

  const handleSave = async () => {
    if (!profile?.$id) return; // User must be loaded
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const payload = {
        name: updatedName,
        email: formData.email,
        phone: formData.phone,
        bio: profile.bio, // Keep existing fields untouched
        dob: formData.dob,
        gender: formData.gender,
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,
        anniversary: (formData.anniversaryMonth && formData.anniversaryDay) 
          ? `${formData.anniversaryMonth}-${formData.anniversaryDay}` 
          : '',
        city: formData.city,
        state: formData.state,
        passportNo: formData.passportNo,
        passportExpiry: formData.passportExpiry,
        passportCountry: formData.passportCountry,
        panCard: formData.panCard
      };

      await authService.saveUserProfile(profile.$id, payload);
      
      // Update global store with fresh data
      await checkAuth();
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000); // clear success msg after 3s
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Moved outside

  return (
    <div className="space-y-12 max-w-4xl">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-12">
        
        {/* GENERAL INFORMATION SECTION */}
        <section>
          <h3 className="font-bold text-xl mb-6">General Information</h3>
          
          <div className="space-y-4">
            {/* Row 1: Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWrapper label="First & Middle Name">
                <input 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text" 
                  required
                  className="w-full h-16 px-4 pt-6 pb-2 bg-transparent outline-none text-brand-navy font-medium"
                />
              </FieldWrapper>
              <FieldWrapper label="Last Name">
                <input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  type="text" 
                  required
                  className="w-full h-16 px-4 pt-6 pb-2 bg-transparent outline-none text-brand-navy font-medium"
                />
              </FieldWrapper>
            </div>

            {/* Row 2: Gender, DOB, Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <FieldWrapper label="Gender">
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-16 px-4 pt-6 pb-2 bg-transparent outline-none text-brand-navy font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </FieldWrapper>
              </div>
              
              <div className="md:col-span-1">
                <FieldWrapper label="Date of Birth">
                  <input 
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    type="date" 
                    className="w-full h-16 px-4 pt-6 pb-2 bg-transparent outline-none text-brand-navy font-medium cursor-pointer"
                  />
                </FieldWrapper>
              </div>
              
              <div className="md:col-span-2">
                <FieldWrapper label="Nationality">
                  <div className="w-full h-16 px-4 pt-6 pb-2">
                    <SearchableSelect
                      options={Country.getAllCountries().map(c => c.name)}
                      value={formData.nationality}
                      onChange={(val) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          nationality: val,
                          state: '', // Reset state when nationality changes
                          city: ''   // Reset city when nationality changes
                        }));
                        setSaveStatus('idle');
                      }}
                      placeholder="Select Nationality"
                      className="w-full h-full font-medium"
                    />
                  </div>
                </FieldWrapper>
              </div>
            </div>

            {/* Row 3: Marital Status & Anniversary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWrapper label="Marital Status">
                <select 
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full h-16 px-4 pt-6 pb-2 bg-transparent outline-none text-brand-navy font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </FieldWrapper>

              <FieldWrapper label="Anniversary">
                <div className="flex w-full h-16 pt-5 pb-1 px-2 items-center bg-transparent">
                  <select
                    name="anniversaryDay"
                    value={formData.anniversaryDay}
                    onChange={handleChange}
                    disabled={formData.maritalStatus !== 'Married'}
                    className="w-1/3 bg-transparent outline-none text-brand-navy font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none px-2 text-center"
                  >
                    <option value="" className="bg-white text-brand-navy">DD</option>
                    {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                      <option key={d} value={d.toString().padStart(2, '0')} className="bg-white text-brand-navy">{d.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <span className="text-gray-300 pointer-events-none">/</span>
                  <select
                    name="anniversaryMonth"
                    value={formData.anniversaryMonth}
                    onChange={handleChange}
                    disabled={formData.maritalStatus !== 'Married'}
                    className="w-2/3 bg-transparent outline-none text-brand-navy font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none px-2"
                  >
                    <option value="" className="bg-white text-brand-navy">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m} className="bg-white text-brand-navy">{m}</option>
                    ))}
                  </select>
                </div>
              </FieldWrapper>
            </div>

            {/* Row 4: City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWrapper label="City of Residence">
                <div className="w-full h-16 px-4 pt-6 pb-2">
                  <SearchableSelect
                    options={
                      formData.nationality 
                        ? Array.from(new Set(
                            City.getCitiesOfCountry(
                              Country.getAllCountries().find(c => c.name === formData.nationality)?.isoCode || ""
                            )?.map(c => c.name) || []
                          ))
                        : [] // Empty if no country selected to prevent crashing the browser with 150k cities
                    }
                    value={formData.city}
                    onChange={(val) => {
                      setFormData(prev => ({ ...prev, city: val }));
                      setSaveStatus('idle');
                    }}
                    placeholder="Select City"
                    className="w-full h-full font-medium"
                  />
                </div>
              </FieldWrapper>

              <div>
                <FieldWrapper label="State">
                  <div className="w-full h-16 px-4 pt-6 pb-2">
                    <SearchableSelect
                      options={
                        formData.nationality 
                          ? State.getStatesOfCountry(
                              Country.getAllCountries().find(c => c.name === formData.nationality)?.isoCode || ""
                            )?.map(s => s.name) || []
                          : []
                      }
                      value={formData.state}
                      onChange={(val) => {
                        setFormData(prev => ({ ...prev, state: val }));
                        setSaveStatus('idle');
                      }}
                      placeholder="Select State"
                      className="w-full h-full font-medium"
                    />
                  </div>
                </FieldWrapper>
                <p className="text-[11px] text-gray-500 mt-1 ml-1">Required for GST purpose on your tax invoice</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* CONTACT DETAILS SECTION */}
        <section>
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-1">Contact Details</h3>
            <p className="text-sm text-gray-500">Add contact information to receive booking details & other alerts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`relative rounded-lg border bg-[#fbfbfb] px-4 py-3 flex items-center justify-between transition-colors ${isEditingPhone ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
              <div className="flex-1 mr-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Mobile Number
                </label>
                {isEditingPhone ? (
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoFocus
                    className="w-full font-bold text-[15px] bg-transparent outline-none text-brand-navy"
                    placeholder="+1 (Add Number)"
                  />
                ) : (
                  <p className="font-bold text-[15px]">{formData.phone || '+1 (Add Number)'}</p>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditingPhone(!isEditingPhone)}
                className="text-blue-500 font-semibold text-[15px] hover:text-blue-600 transition-colors"
              >
                {isEditingPhone ? 'Done' : 'Edit'}
              </button>
            </div>
            
            <div className={`relative rounded-lg border bg-[#fbfbfb] px-4 py-3 flex items-center justify-between transition-colors ${isEditingEmail ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
              <div className="flex-1 mr-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Email ID
                </label>
                {isEditingEmail ? (
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                    className="w-full font-bold text-[15px] bg-transparent outline-none text-brand-navy"
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="font-bold text-[15px]">{formData.email}</p>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="text-blue-500 font-semibold text-[15px] hover:text-blue-600 transition-colors"
              >
                {isEditingEmail ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
        </section>        <div className="pt-8 pb-4 flex items-center gap-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-brand-coral hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-brand-coral/20 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
          </button>
          
          {saveStatus === 'success' && (
            <span className="text-green-500 font-bold text-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 size={18} /> Profile updated successfully!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 font-bold text-sm">
              Failed to update. Try again.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
