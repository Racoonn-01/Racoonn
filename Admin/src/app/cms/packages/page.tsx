"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Trash2, Image as ImageIcon, ArrowLeft, Pencil, 
  IndianRupee, ChevronLeft, ChevronRight, X, Check,
  Building, Loader2, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

type PricingSlab = {
  id: string;
  minPersons: number;
  maxPersons: number;
  pricePerPerson: number;
}

type ItineraryPoint = {
  title: string;
  description: string;
  hasHotelActions?: boolean;
}

type ItineraryDay = {
  id: string;
  dayNumber: number;
  title: string;
  activities: string;
  points: ItineraryPoint[];
}

type HotelOption = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  pricePerNight: number;
  isDefault: boolean;
}

type ActivityOption = {
  id: string;
  title: string;
  description: string;
  image: string;
  pricePerPerson: number;
  priceLabel: string;
}

type Package = {
  id: string;
  title: string;
  location: string;
  duration: string;
  features: string;
  badge: string;
  images: string[];
  pricing: PricingSlab[];
  hotelOptions: HotelOption[];
  activityOptions: ActivityOption[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  itinerary: ItineraryDay[];
  status: 'draft' | 'published';
}

const emptyForm: Package = {
  id: "",
  title: "",
  location: "Uttarakhand",
  duration: "6 Days / 5 Nights",
  features: "Meals | Stay | Transfer",
  badge: "Bestseller",
  images: [],
  pricing: [{ id: Date.now().toString(), minPersons: 1, maxPersons: 2, pricePerPerson: 18999 }],
  hotelOptions: [
    {
      id: "h1",
      title: "Premium Hotel Stay",
      description: "Experience maximum comfort in our handpicked 3 or 4-star properties.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
      tags: ["AC Rooms", "Breakfast Included"],
      pricePerNight: 3500,
      isDefault: true
    },
    {
      id: "h2",
      title: "Experiential Swiss Camps",
      description: "For applicable locations, enjoy a night under the stars in our luxury swiss tents.",
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=600&auto=format&fit=crop",
      tags: ["Luxury Tents", "All Meals"],
      pricePerNight: 4200,
      isDefault: false
    }
  ],
  activityOptions: [
    {
      id: "a1",
      title: "Guided Local Sightseeing",
      description: "Explore the best landmarks and hidden gems with our expert local guides.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
      pricePerPerson: 0,
      priceLabel: "Included in Package"
    },
    {
      id: "a2",
      title: "Adventure Sports Pass",
      description: "Get an adrenaline rush with our adventure sports pass.",
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop",
      pricePerPerson: 2500,
      priceLabel: "+ ₹2,500 / person"
    }
  ],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],
  itinerary: [{ id: Date.now().toString(), dayNumber: 1, title: "Arrival & Welcome", activities: "Check-in and local sightseeing", points: [] }],
  status: 'draft'
}

const PRESET_ACTIVITIES = [
  {
    id: "act-1",
    title: "Guided Local Sightseeing",
    description: "Explore the best landmarks and hidden gems with our expert local guides. Includes photography points and cultural hubs.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    pricePerPerson: 0,
    priceLabel: "Included in Package"
  },
  {
    id: "act-2",
    title: "Adventure Sports Pass",
    description: "Get an adrenaline rush with zip-lining, river rafting, and bungee jumping passes.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop",
    pricePerPerson: 2500,
    priceLabel: "+ ₹2,500 / person"
  },
  {
    id: "act-3",
    title: "Campfire & Music Evening",
    description: "Enjoy a cozy mountain evening under stars with live acoustic music and bonfire.",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
    pricePerPerson: 800,
    priceLabel: "+ ₹800 / person"
  },
  {
    id: "act-4",
    title: "Mountain Trekking & Camping",
    description: "Guided day trek into scenic valley trails with outdoor camping gear provided.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    pricePerPerson: 1800,
    priceLabel: "+ ₹1,800 / person"
  },
  {
    id: "act-5",
    title: "Wildlife Safari Pass",
    description: "Open jeep safari through national park tiger reserves with expert forest guides.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop",
    pricePerPerson: 3200,
    priceLabel: "+ ₹3,200 / person"
  }
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState<Package>(emptyForm)
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [propertySearch, setPropertySearch] = useState('')
  const [activitySearch, setActivitySearch] = useState('')

  const fetchAvailableProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const res = await fetch("/api/cms/properties");
      const json = await res.json();
      if (json.success && Array.isArray(json.properties)) {
        setAvailableProperties(json.properties);
      }
    } catch (err) {
      console.error("Error fetching properties for packages:", err);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const toggleSelectProperty = (prop: any) => {
    setFormData(prev => {
      const currentList = prev.hotelOptions || [];
      const exists = currentList.some(h => h.id === prop.id || h.title === prop.title);
      if (exists) {
        return {
          ...prev,
          hotelOptions: currentList.filter(h => h.id !== prop.id && h.title !== prop.title)
        };
      } else {
        return {
          ...prev,
          hotelOptions: [
            ...currentList,
            {
              id: prop.id,
              title: prop.title,
              description: `Stay at ${prop.title} situated in ${prop.location || prop.city || 'prime location'}.`,
              image: prop.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
              tags: ["AC Rooms", "Breakfast Included"],
              pricePerNight: prop.price || 3500,
              isDefault: currentList.length === 0
            }
          ]
        };
      }
    });
  };

  const toggleSelectActivity = (act: typeof PRESET_ACTIVITIES[0]) => {
    setFormData(prev => {
      const currentList = prev.activityOptions || [];
      const exists = currentList.some(a => a.id === act.id || a.title === act.title);
      if (exists) {
        return {
          ...prev,
          activityOptions: currentList.filter(a => a.id !== act.id && a.title !== act.title)
        };
      } else {
        return {
          ...prev,
          activityOptions: [
            ...currentList,
            {
              id: act.id,
              title: act.title,
              description: act.description,
              image: act.image,
              pricePerPerson: act.pricePerPerson,
              priceLabel: act.priceLabel
            }
          ]
        };
      }
    });
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/packages");
      const json = await res.json();
      if (json.success && Array.isArray(json.packages)) {
        setPackages(json.packages);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();

    const handleLocalUpdate = () => fetchPackages();
    window.addEventListener("cms_packages_updated", handleLocalUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("racoonn_cms_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "PACKAGES_UPDATED") {
          if (Array.isArray(event.data.data)) {
            setPackages(event.data.data);
          } else {
            fetchPackages();
          }
        }
      };
    }

    return () => {
      window.removeEventListener("cms_packages_updated", handleLocalUpdate);
      if (bc) bc.close();
    };
  }, []);

  const savePackagesToServer = async (newList: Package[]) => {
    setPackages(newList);
    try {
      await fetch("/api/cms/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages: newList }),
      });
      window.dispatchEvent(new Event("cms_packages_updated"));
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("racoonn_cms_channel");
        bc.postMessage({ type: "PACKAGES_UPDATED", data: newList });
        bc.close();
      }
    } catch (err) {
      console.error("Error saving packages:", err);
    }
  };

  const handleOpenForm = (pkg?: Package) => {
    if (pkg) {
      setFormData(pkg)
    } else {
      setFormData({ ...emptyForm, id: Date.now().toString() })
    }
    setFormStep(1)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setFormData(emptyForm)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      const updated = packages.filter(p => p.id !== id);
      savePackagesToServer(updated);
    }
  }

  const handleToggleStatus = (id: string) => {
    const updated = packages.map(p => 
      p.id === id ? { ...p, status: (p.status === 'published' ? 'draft' : 'published') as 'draft' | 'published' } : p
    );
    savePackagesToServer(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title) return alert("Title is required")
    if (formData.images.length < 4 || formData.images.length > 6) {
      return alert(`Please upload between 4 and 6 images. Currently you have ${formData.images.length}.`)
    }
    if (formData.pricing.length === 0) return alert("At least one pricing slab is required")
    
    const existingIndex = packages.findIndex(p => p.id === formData.id)
    let updated: Package[] = []
    if (existingIndex >= 0) {
      updated = [...packages]
      updated[existingIndex] = formData
    } else {
      updated = [formData, ...packages]
    }
    savePackagesToServer(updated)
    handleCloseForm()
  }

  // Pricing Handlers
  const addPricingSlab = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, { id: Date.now().toString(), minPersons: 1, maxPersons: 2, pricePerPerson: 0 }]
    }))
  }

  const updatePricingSlab = (id: string, field: keyof PricingSlab, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map(slab => 
        slab.id === id ? { ...slab, [field]: value } : slab
      )
    }))
  }

  const removePricingSlab = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter(slab => slab.id !== id)
    }))
  }

  // Image Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (formData.images.length + files.length > 6) {
      return alert("You can only have up to 6 images total.")
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return
    if (direction === 'right' && index === formData.images.length - 1) return

    const newImages = [...formData.images]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp

    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addKeyword = (value: string) => {
    const trimmed = value.trim().replace(/,$/, "")
    if (trimmed && !formData.metaKeywords.includes(trimmed)) {
      setFormData(prev => ({ ...prev, metaKeywords: [...prev.metaKeywords, trimmed] }))
    }
  }

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((_, i) => i !== index)
    }))
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword(e.currentTarget.value)
      e.currentTarget.value = ''
    }
  }

  const handleKeywordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    addKeyword(e.target.value)
    e.target.value = ''
  }

  // Itinerary Handlers
  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        id: Date.now().toString(), 
        dayNumber: prev.itinerary.length + 1, 
        title: "", 
        activities: "",
        points: []
      }]
    }))
  }

  const updateItineraryDay = (id: string, field: keyof ItineraryDay, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => day.id === id ? { ...day, [field]: value } : day)
    }))
  }

  const removeItineraryDay = (id: string) => {
    setFormData(prev => {
      const filtered = prev.itinerary.filter(day => day.id !== id);
      const renumbered = filtered.map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
      return { ...prev, itinerary: renumbered };
    })
  }

  const updateItineraryPoint = (dayId: string, pointIndex: number, field: keyof ItineraryPoint, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => 
        day.id === dayId 
          ? { ...day, points: (day.points || []).map((pt, i) => i === pointIndex ? { ...pt, [field]: value } : pt) } 
          : day
      )
    }))
  }

  const addItineraryPoint = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => 
        day.id === dayId 
          ? { ...day, points: [...(day.points || []), { title: "", description: "", hasHotelActions: false }] } 
          : day
      )
    }))
  }

  const removeItineraryPoint = (dayId: string, pointIndex: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => 
        day.id === dayId 
          ? { ...day, points: (day.points || []).filter((_, i) => i !== pointIndex) } 
          : day
      )
    }))
  }

  // Hotel Options Handlers
  const addHotelOption = () => {
    setFormData(prev => ({
      ...prev,
      hotelOptions: [
        ...(prev.hotelOptions || []),
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
          tags: ["AC Rooms", "Breakfast Included"],
          pricePerNight: 3500,
          isDefault: (prev.hotelOptions || []).length === 0
        }
      ]
    }))
  }

  const updateHotelOption = (id: string, field: keyof HotelOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      hotelOptions: (prev.hotelOptions || []).map(h => 
        h.id === id ? { ...h, [field]: value } : h
      )
    }))
  }

  const removeHotelOption = (id: string) => {
    setFormData(prev => ({
      ...prev,
      hotelOptions: (prev.hotelOptions || []).filter(h => h.id !== id)
    }))
  }

  // Activity Options Handlers
  const addActivityOption = () => {
    setFormData(prev => ({
      ...prev,
      activityOptions: [
        ...(prev.activityOptions || []),
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
          pricePerPerson: 0,
          priceLabel: "Included in Package"
        }
      ]
    }))
  }

  const updateActivityOption = (id: string, field: keyof ActivityOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      activityOptions: (prev.activityOptions || []).map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }))
  }

  const removeActivityOption = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activityOptions: (prev.activityOptions || []).filter(a => a.id !== id)
    }))
  }

  // Views
  if (isFormOpen) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-center gap-4 border-b pb-6">
          <Button variant="ghost" size="icon" onClick={formStep === 2 ? () => setFormStep(1) : handleCloseForm} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {packages.some(p => p.id === formData.id) ? 'Edit Package' : 'Create New Package'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {formStep === 1 ? 'Step 1: Fill in package details, accommodations & activities.' : 'Step 2: Package Itinerary & Builder'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status" className="text-sm font-medium">Status: {formData.status === 'published' ? 'Published' : 'Draft'}</Label>
              <Switch 
                id="status" 
                checked={formData.status === 'published'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'published' : 'draft'}))}
              />
            </div>
            {formStep === 2 && (
              <Button onClick={handleSave} className="rounded-full px-8 bg-[#1F2E4A] hover:bg-[#2a3c5e]">Save Package</Button>
            )}
            {formStep === 1 && (
              <Button type="button" onClick={() => setFormStep(2)} className="rounded-full px-8 bg-[#E86A70] hover:bg-[#d65b61] text-white">Next Step</Button>
            )}
          </div>
        </div>

        <form onSubmit={formStep === 2 ? handleSave : (e) => { e.preventDefault(); setFormStep(2); }} className="space-y-10">
          {formStep === 1 && (
            <>
              {/* Section 1: Basic Info */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-lg font-bold text-[#1F2E4A]">1. Package Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="title" className="font-semibold text-slate-700">Package Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Kashmir Tour Package – 5 Days & 4 Nights" 
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-12 rounded-xl border-slate-200"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="font-semibold text-slate-700">Location / Destination</Label>
                    <Input 
                      id="location" 
                      placeholder="e.g. Uttarakhand, Himachal, Goa" 
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration" className="font-semibold text-slate-700">Duration</Label>
                    <Input 
                      id="duration" 
                      placeholder="e.g. 6 Days / 5 Nights" 
                      value={formData.duration || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="features" className="font-semibold text-slate-700">Features Line</Label>
                    <Input 
                      id="features" 
                      placeholder="e.g. Meals | Stay | Transfer | Sightseeing" 
                      value={formData.features || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="badge" className="font-semibold text-slate-700">Badge Tag</Label>
                    <Input 
                      id="badge" 
                      placeholder="e.g. Bestseller, Popular, New, Trending" 
                      value={formData.badge || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </section>

          {/* Section 2: Image Gallery */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#1F2E4A]">2. Image Gallery</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload 4 to 6 images. Drag or use arrows to reorder.</p>
              </div>
              <div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full gap-2 border-slate-200"
                  onClick={() => document.getElementById('gallery-upload')?.click()}
                  disabled={formData.images.length >= 6}
                >
                  <ImageIcon className="w-4 h-4" /> Add Photos
                </Button>
                <Input 
                  id="gallery-upload" 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
              {formData.images.length === 0 ? (
                <div className="w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-50">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <p>No images uploaded yet.</p>
                  <p className="text-xs mt-1">Requires 4 to 6 images.</p>
                </div>
              ) : (
                formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-64 h-48 rounded-2xl overflow-hidden shrink-0 border shadow-sm group snap-center">
                    <Image src={img} alt={`Gallery image ${idx + 1}`} fill className="object-cover" />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => moveImage(idx, 'left')} disabled={idx === 0}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => removeImage(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => moveImage(idx, 'right')} disabled={idx === formData.images.length - 1}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    {idx === 0 && <span className="absolute top-3 left-3 bg-white/90 text-xs font-bold px-2 py-1 rounded-md shadow-sm">Cover Image</span>}
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-2">
              <span className={`text-sm font-medium ${formData.images.length >= 4 && formData.images.length <= 6 ? 'text-green-600' : 'text-red-500'}`}>
                {formData.images.length} / 6 images uploaded
              </span>
            </div>
          </section>

          {/* Section 3: Dynamic Pricing */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#1F2E4A]">3. Pricing / Person</h3>
                <p className="text-sm text-muted-foreground mt-1">Define pricing slabs based on the number of travelers.</p>
              </div>
              <Button type="button" variant="outline" onClick={addPricingSlab} className="rounded-full gap-2 border-slate-200">
                <Plus className="w-4 h-4" /> Add Slab
              </Button>
            </div>

            <div className="space-y-4">
              {formData.pricing.map((slab) => (
                <div key={slab.id} className="flex flex-col sm:flex-row items-end gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                  <div className="grid gap-2 flex-1 w-full sm:w-auto">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Min Persons</Label>
                    <Input 
                      type="number" min={1}
                      value={slab.minPersons || ''} 
                      onChange={(e) => updatePricingSlab(slab.id, 'minPersons', parseInt(e.target.value) || 0)}
                      className="bg-white border-slate-200 h-11"
                    />
                  </div>
                  <div className="grid gap-2 flex-1 w-full sm:w-auto">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Max Persons</Label>
                    <Input 
                      type="number" min={1}
                      value={slab.maxPersons || ''} 
                      onChange={(e) => updatePricingSlab(slab.id, 'maxPersons', parseInt(e.target.value) || 0)}
                      className="bg-white border-slate-200 h-11"
                    />
                  </div>
                  <div className="grid gap-2 flex-1 w-full sm:w-auto">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Price per Person (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input 
                        type="number" min={0}
                        value={slab.pricePerPerson || ''} 
                        onChange={(e) => updatePricingSlab(slab.id, 'pricePerPerson', parseInt(e.target.value) || 0)}
                        className="bg-white border-slate-200 pl-9 h-11"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removePricingSlab(slab.id)}
                    className="h-11 w-11 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={formData.pricing.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Accommodations Options (Stays Tab) */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1F2E4A]">4. Accommodations Options (Stays Tab)</h3>
                <p className="text-sm text-muted-foreground mt-1">Select multiple properties from database for package accommodations.</p>
              </div>
            </div>

            {/* Property Selector Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Select Stays / Properties ({formData.hotelOptions?.length || 0} Selected)</Label>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search properties..." 
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="pl-8 h-8 rounded-xl text-xs border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                {isLoadingProperties ? (
                  <div className="col-span-full py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-coral" /> Loading database properties...
                  </div>
                ) : availableProperties.length === 0 ? (
                  <p className="col-span-full py-8 text-center text-xs text-slate-500">No properties available in database.</p>
                ) : (
                  availableProperties
                    .filter(p => p.title.toLowerCase().includes(propertySearch.toLowerCase()) || p.location.toLowerCase().includes(propertySearch.toLowerCase()))
                    .map((prop) => {
                      const isSelected = (formData.hotelOptions || []).some(h => h.id === prop.id || h.title === prop.title);
                      return (
                        <div 
                          key={prop.id}
                          onClick={() => toggleSelectProperty(prop)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected 
                              ? "border-emerald-500 bg-emerald-50/70 shadow-xs" 
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                            <Image src={prop.image} alt={prop.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{prop.title}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{prop.location || 'Uttarakhand'}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Activities Options (Activities Tab) */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1F2E4A]">5. Activities Options (Activities Tab)</h3>
                <p className="text-sm text-muted-foreground mt-1">Select multiple activity options for package activities.</p>
              </div>
            </div>

            {/* Activity Preset Selector Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Select Preset Activities ({formData.activityOptions?.length || 0} Selected)</Label>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search activities..." 
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="pl-8 h-8 rounded-xl text-xs border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                {PRESET_ACTIVITIES
                  .filter(a => a.title.toLowerCase().includes(activitySearch.toLowerCase()) || a.description.toLowerCase().includes(activitySearch.toLowerCase()))
                  .map((act) => {
                    const isSelected = (formData.activityOptions || []).some(a => a.id === act.id || a.title === act.title);
                    return (
                      <div 
                        key={act.id}
                        onClick={() => toggleSelectActivity(act)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50/70 shadow-xs" 
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <Image src={act.image} alt={act.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{act.title}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{act.pricePerPerson === 0 ? 'Included' : `+ ₹${act.pricePerPerson} / person`}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          {/* Section 6: SEO Data */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 text-[#1F2E4A]">6. SEO Metadata</h3>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle" className="font-semibold text-slate-700">Meta Title</Label>
                <Input 
                  id="metaTitle" 
                  placeholder="e.g. Best Kashmir Tour Package 2026" 
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDesc" className="font-semibold text-slate-700">Meta Description</Label>
                <Textarea 
                  id="metaDesc" 
                  placeholder="Brief description for search engines..." 
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="min-h-24 rounded-xl border-slate-200 resize-y"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaKeywords" className="font-semibold text-slate-700">Meta Keywords</Label>
                <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50 min-h-11 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-transparent transition-all">
                  {(Array.isArray(formData.metaKeywords) ? formData.metaKeywords : []).map((keyword, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm text-slate-700">
                      {keyword}
                      <button type="button" onClick={() => removeKeyword(idx)} className="text-slate-400 hover:text-[#E86A70] transition-colors rounded-full focus:outline-none">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    id="metaKeywords"
                    placeholder={formData.metaKeywords.length === 0 ? "e.g. kashmir, tour (Press Enter or Comma)" : "Add keyword..."} 
                    className="flex-1 bg-transparent min-w-37.5 outline-none text-sm px-2 text-slate-700 placeholder:text-slate-400"
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={handleKeywordBlur}
                  />
                </div>
              </div>
            </div>
          </section>
            
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={() => setFormStep(2)} className="rounded-full px-8 h-12 bg-[#E86A70] hover:bg-[#d65b61] text-white text-lg">Next: Build Itinerary <ChevronRight className="ml-2 w-5 h-5" /></Button>
            </div>
          </>
          )}

          {formStep === 2 && (
            <div className="space-y-6">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-100">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2E4A]">Build Your Itinerary</h3>
                    <p className="text-sm text-muted-foreground mt-1">Plan the day-by-day schedule for this package.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addItineraryDay} className="rounded-full gap-2 border-slate-200">
                    <Plus className="w-4 h-4" /> Add Day
                  </Button>
                </div>

                <div className="space-y-6">
                  {(formData.itinerary || []).map((day) => (
                    <div key={day.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-sm transition-all hover:shadow-md">
                      <div className="absolute top-6 right-6">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItineraryDay(day.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                          disabled={formData.itinerary.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#E86A70] text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          {day.dayNumber}
                        </div>
                        <h4 className="text-lg font-bold text-[#1F2E4A]">Day {day.dayNumber}</h4>
                      </div>

                      <div className="grid gap-5">
                        <div className="grid gap-2">
                          <Label className="font-semibold text-slate-700">Day Title</Label>
                          <Input 
                            placeholder="e.g. Arrival in Srinagar" 
                            value={day.title}
                            onChange={(e) => updateItineraryDay(day.id, 'title', e.target.value)}
                            className="bg-white border-slate-200 h-11 rounded-xl"
                          />
                        </div>

                        <div className="grid gap-3 pt-4 border-t border-slate-100">
                          <Label className="font-semibold text-slate-700 flex justify-between items-center">
                            Timeline Events / Points
                            <Button type="button" variant="ghost" size="sm" onClick={() => addItineraryPoint(day.id)} className="h-8 text-[#E86A70] hover:text-[#d65b61] hover:bg-red-50">
                              <Plus className="w-4 h-4 mr-1" /> Add Event
                            </Button>
                          </Label>
                          <div className="space-y-4 pl-8 border-l border-[#E86A70]/30 ml-2 py-2 mt-2">
                            {(day.points || []).map((pt, pIdx) => (
                              <div key={pIdx} className="relative flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="absolute -left-10.25 top-4 w-3 h-3 rounded-full bg-[#E86A70] ring-4 ring-slate-50" />
                                
                                <div className="flex items-start justify-between gap-4">
                                  <div className="w-full grid gap-3">
                                    <Input 
                                      value={pt.title} 
                                      onChange={(e) => updateItineraryPoint(day.id, pIdx, 'title', e.target.value)} 
                                      placeholder="Event Title (e.g. Pickup from Airport)" 
                                      className="font-bold text-[#1F2E4A]"
                                    />
                                    <Textarea
                                      value={pt.description} 
                                      onChange={(e) => updateItineraryPoint(day.id, pIdx, 'description', e.target.value)} 
                                      placeholder="Description (e.g. Our representative will greet you...)" 
                                      className="h-20 resize-none text-slate-600"
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                      <Switch 
                                        id={`hotel-actions-${day.id}-${pIdx}`}
                                        checked={pt.hasHotelActions || false}
                                        onCheckedChange={(checked) => updateItineraryPoint(day.id, pIdx, 'hasHotelActions', checked)}
                                      />
                                      <Label htmlFor={`hotel-actions-${day.id}-${pIdx}`} className="text-sm font-medium text-slate-600 cursor-pointer">
                                        Include Hotel Actions (View/Change Hotel buttons)
                                      </Label>
                                    </div>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItineraryPoint(day.id, pIdx)} className="h-9 w-9 text-slate-400 hover:text-red-500 shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {pt.hasHotelActions && (
                                  <div className="flex gap-3 mt-1">
                                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 border border-[#E86A70] text-[#E86A70] rounded-lg text-[13px] font-semibold bg-white cursor-not-allowed opacity-70">
                                      <Building size={14} /> View Hotel
                                    </div>
                                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-[13px] font-semibold bg-white cursor-not-allowed opacity-70">
                                      <Pencil size={14} /> Change Hotel
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {(day.points || []).length === 0 && (
                              <p className="text-sm text-slate-400 italic py-2">No timeline events added yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="rounded-full px-8 h-12 border-slate-200 text-lg font-medium text-slate-600">
                  <ChevronLeft className="mr-2 w-5 h-5" /> Back to Details
                </Button>
                <Button onClick={handleSave} className="rounded-full px-10 h-12 bg-[#1F2E4A] hover:bg-[#2a3c5e] text-white text-lg font-medium shadow-md transition-transform hover:scale-105 active:scale-95">
                  Save Final Package <Check className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Packages</h2>
          <p className="text-muted-foreground mt-1">Manage and create travel packages displayed on the frontend.</p>
        </div>
        <Button className="gap-2 rounded-full px-6 bg-[#E86A70] hover:bg-[#d65b61] text-white" onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" />
          Create New Package
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 border border-dashed rounded-3xl bg-slate-50">
          <Loader2 className="w-8 h-8 text-brand-coral animate-spin mb-2" />
          <p className="text-muted-foreground font-medium text-sm">Loading real-time packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed rounded-3xl bg-slate-50">
          <p className="text-muted-foreground font-medium mb-4">No packages created yet.</p>
          <Button variant="outline" onClick={() => handleOpenForm()} className="rounded-full">
            Create your first package
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-3xl border shadow-sm items-center">
              <div className="relative w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                {pkg.images && pkg.images.length > 0 ? (
                  <Image src={pkg.images[0]} alt={pkg.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-slate-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-[#1F2E4A] line-clamp-1">{pkg.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => handleToggleStatus(pkg.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${pkg.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {pkg.status}
                      </button>
                      <span className="text-sm text-slate-500 font-medium">{(pkg.pricing || []).length} Pricing Slab(s)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenForm(pkg)} className="rounded-full h-10 w-10 text-[#1F2E4A]">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(pkg.id)} className="rounded-full h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-sm text-slate-600">
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-900">SEO:</span> {pkg.metaTitle || 'No title set'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
