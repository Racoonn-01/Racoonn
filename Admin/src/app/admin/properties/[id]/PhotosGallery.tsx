"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ArrowLeft, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"

interface PhotosGalleryProps {
  photos: string[];
}

export default function PhotosGallery({ photos }: PhotosGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const handleOpenModal = () => {
    setSelectedIndex(null);
    setIsOpen(true);
  };

  const nextPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Photos Gallery</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 4).map((url, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted relative group cursor-pointer" onClick={() => { setSelectedIndex(idx); setIsOpen(true); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gallery preview ${idx+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="text-white h-6 w-6 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
          {photos.length > 4 && (
            <Button variant="outline" className="w-full mt-4" onClick={handleOpenModal}>
              View all {photos.length} photos
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) setSelectedIndex(null); }}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] h-[95vh] flex flex-col p-0 overflow-hidden bg-background border-muted/20">
          {selectedIndex !== null ? (
            <div className="flex flex-col h-full bg-black relative">
              <div className="p-4 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)} className="text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Grid
                </Button>
                <span className="text-white/80 text-sm font-medium">{selectedIndex + 1} of {photos.length}</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4 relative h-full">
                {/* Navigation Buttons */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[selectedIndex]} alt="Full size" className="max-w-full max-h-[70vh] object-contain rounded-md" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>

              {/* Thumbnails Scrollbar */}
              <div className="h-24 bg-black/90 border-t border-white/10 p-2 shrink-0">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex w-max space-x-2 p-1">
                    {photos.map((url, idx) => (
                      <div 
                        key={idx} 
                        className={`w-20 h-16 shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${idx === selectedIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-100'}`}
                        onClick={() => setSelectedIndex(idx)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Thumb ${idx+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="bg-white/10" />
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 pb-4 border-b shrink-0">
                <DialogTitle className="text-2xl">Property Photos</DialogTitle>
                <DialogDescription>
                  All {photos.length} photos available for this property. Click any image to enlarge.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                  {photos.map((url, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-4/3 rounded-xl overflow-hidden bg-muted relative group cursor-pointer shadow-sm hover:shadow-lg transition-all"
                      onClick={() => setSelectedIndex(idx)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Property image ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button variant="secondary" size="lg" className="rounded-full shadow-xl pointer-events-none">
                          <Maximize2 className="mr-2 h-4 w-4" /> Enlarge
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
