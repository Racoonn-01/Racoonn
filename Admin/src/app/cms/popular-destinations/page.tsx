"use client"

import { useState } from "react"
import { MapPin, Plus, Trash2, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock initial data based on the screenshot
const initialDestinations = [
  { 
    id: 1, 
    city: "Kedarnath", 
    description: "A sacred journey to the Himalayas.", 
    price: "3,999", 
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80" 
  },
  { 
    id: 2, 
    city: "Goa", 
    description: "Pristine beaches and vibrant nightlife.", 
    price: "4,499", 
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80" 
  },
  { 
    id: 3, 
    city: "Jaipur", 
    description: "Experience the royal heritage of Rajasthan.", 
    price: "2,999", 
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80" 
  }
]

export default function PopularDestinationsPage() {
  const [destinations, setDestinations] = useState(initialDestinations)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // Form state
  const [newCity, setNewCity] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newImage, setNewImage] = useState("")

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCity || !newDesc || !newPrice || !newImage) return

    const newDest = {
      id: Date.now(),
      city: newCity,
      description: newDesc,
      price: newPrice,
      image: newImage
    }

    setDestinations([newDest, ...destinations])
    setNewCity("")
    setNewDesc("")
    setNewPrice("")
    setNewImage("")
    setIsAddDialogOpen(false)
  }

  const handleRemove = (id: number) => {
    setDestinations(destinations.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Popular Destinations</h2>
          <p className="text-muted-foreground mt-1">Manage the popular destinations displayed on the frontend.</p>
        </div>
        
        <Button className="gap-2 rounded-full px-6" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <form onSubmit={handleAddDestination}>
              <div className="flex flex-col md:flex-row">
                
                {/* Left Column: Text Inputs */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold text-[#1F2E4A]">Add Destination</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new popular destination to the frontend.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="text-slate-600 font-semibold">City Name</Label>
                      <Input 
                        id="city" 
                        placeholder="e.g. Kedarnath" 
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="desc" className="text-slate-600 font-semibold">Short Description</Label>
                      <Input 
                        id="desc" 
                        placeholder="e.g. A sacred journey to the Himalayas." 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-slate-600 font-semibold">Starting Price (₹)</Label>
                      <Input 
                        id="price" 
                        placeholder="e.g. 3,999" 
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button type="button" variant="ghost" className="h-11 px-6 rounded-full" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="h-11 px-8 rounded-full bg-[#E86A70] hover:bg-[#d65b61] text-white">Add Destination</Button>
                  </DialogFooter>
                </div>

                {/* Right Column: Image Upload & Preview */}
                <div className="w-full md:w-85 bg-slate-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col items-center justify-center">
                  <div className="mb-4 text-center w-full">
                    <Label className="text-slate-700 font-bold text-sm uppercase tracking-wider">Destination Photo</Label>
                    <p className="text-xs text-slate-500 mt-1">Portrait orientation recommended</p>
                  </div>
                  
                  <div 
                    className={`relative w-full aspect-3/4 max-w-65 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden shadow-sm flex flex-col items-center justify-center group ${newImage ? 'border-transparent' : 'border-slate-300 hover:border-[#E86A70]/50 bg-white'}`}
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setNewImage(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    
                    {newImage ? (
                      <>
                        <Image src={newImage} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                          <div className="bg-white/20 p-3 rounded-full mb-2">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-medium text-sm">Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#E86A70]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Plus className="w-7 h-7 text-[#E86A70]" />
                        </div>
                        <span className="font-bold text-slate-700">Upload Image</span>
                        <span className="text-xs text-slate-400 mt-2">Click to browse your files</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="relative group w-full aspect-3/4 max-w-sm mx-auto rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
            {/* Background Image */}
            <Image 
              src={dest.image} 
              alt={dest.city}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Remove Button (Admin Only) */}
            <button 
              onClick={() => handleRemove(dest.id)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-destructive text-white backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              title="Remove destination"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Top Left Badge - City */}
            <div className="absolute top-5 left-5 bg-white text-slate-900 rounded-full px-4 py-2 flex items-center gap-2 font-bold shadow-md z-10">
              <MapPin className="h-4 w-4 text-[#E86A70] fill-[#E86A70]" />
              {dest.city}
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-5 z-10">
              <h3 className="text-white text-2xl font-medium leading-snug drop-shadow-sm">
                {dest.description}
              </h3>
              <div className="bg-white text-[#1F2E4A] rounded-full px-5 py-3 font-bold shadow-md self-start flex items-center text-sm">
                Stays from <IndianRupee className="h-3.5 w-3.5 ml-1 mr-0.5" /> {dest.price}
              </div>
            </div>
          </div>
        ))}
        
        {destinations.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
            <h3 className="text-xl font-medium text-muted-foreground">No popular destinations added yet.</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Add one to highlight it on the frontend.</p>
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="gap-2 rounded-full">
              <Plus className="h-4 w-4" /> Add your first destination
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
