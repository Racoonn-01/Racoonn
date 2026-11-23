"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Trash2, UploadCloud, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { storage } from "@/lib/appwrite/client"
import { ID } from "appwrite"

export default function AdminPhotoManager({
  title,
  collectionId,
  documentId,
  photos,
  bucketId = "6a3e398000280b2b3d20",
  projectId = "6a3bce6900381359c3ce"
}: {
  title: string
  collectionId: string
  documentId: string
  photos: string[]
  bucketId?: string
  projectId?: string
}) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url.replace('/view', '/preview');
    return `https://sgp.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${url}/preview?project=${projectId}`;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const newUrls: string[] = []
      
      for (const file of Array.from(files)) {
        const safeFile = new File([file], `admin_upload_${Date.now()}.jpg`, { type: file.type || "image/jpeg" })
        const uploadedFile = await storage.createFile(bucketId, ID.unique(), safeFile)
        const fileUrl = storage.getFilePreview(bucketId, uploadedFile.$id).toString()
        newUrls.push(fileUrl)
      }

      const updatedPhotos = [...(photos || []), ...newUrls]

      const res = await fetch(`/api/admin/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, documentId, photos: updatedPhotos })
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert("Failed to update photos in database")
      }
    } catch (error) {
      console.error(error)
      alert("Error uploading photos")
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDelete = async (e: React.MouseEvent, photoUrl: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this photo?")) return

    setIsDeleting(photoUrl)
    try {
      const updatedPhotos = (photos || []).filter(p => p !== photoUrl)

      const res = await fetch(`/api/admin/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, documentId, photos: updatedPhotos })
      })

      if (res.ok) {
        router.refresh()
        // If the deleted photo is currently open, close modal or shift index
        if (selectedIndex !== null && photos[selectedIndex] === photoUrl) {
           setIsOpen(false);
           setSelectedIndex(null);
        }
      } else {
        alert("Failed to delete photo from database")
      }
    } catch (error) {
      console.error(error)
      alert("Error deleting photo")
    } finally {
      setIsDeleting(null)
    }
  }

  const nextPhoto = () => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      <Card className="shadow-sm mt-4 bg-muted/30 border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <CardTitle className="text-sm font-bold text-muted-foreground">{title}</CardTitle>
          <div className="relative">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              disabled={isUploading}
            />
            <Button size="sm" variant="outline" disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              Add Photos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!photos || photos.length === 0 ? (
            <p className="text-xs text-muted-foreground">No photos found.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {photos.map((photo, i) => (
                <div 
                  key={i} 
                  onClick={() => { setSelectedIndex(i); setIsOpen(true); }}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-muted rounded-xl relative group overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(photo)} alt="Photo" className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => handleDelete(e, photo)}
                    disabled={isDeleting === photo}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-100 transition-colors disabled:opacity-50 shadow-md"
                  >
                    {isDeleting === photo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) setSelectedIndex(null); }}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] h-[95vh] flex flex-col p-0 overflow-hidden bg-background border-muted/20">
          {selectedIndex !== null && photos && (
            <div className="flex flex-col h-full bg-black relative">
              <div className="p-4 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Close
                </Button>
                <span className="text-white/80 text-sm font-medium">{selectedIndex + 1} of {photos.length}</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4 relative h-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(photos[selectedIndex])} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded-md" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 z-20 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
