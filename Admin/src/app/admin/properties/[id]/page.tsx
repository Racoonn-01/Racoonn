import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, BedDouble, Star, Image as ImageIcon, Building2, Calendar, User, Clock, ShieldCheck, Users, Maximize } from "lucide-react";
import PhotosGallery from "./PhotosGallery";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";
const PROJECT_ID = "6a3bce6900381359c3ce";
const BUCKET_ID = "6a3e398000280b2b3d20";

function getImageUrl(fileIdOrUrl: string) {
  if (!fileIdOrUrl || typeof fileIdOrUrl !== 'string' || fileIdOrUrl.trim() === '') return null;
  if (fileIdOrUrl.startsWith('http')) return fileIdOrUrl;
  return `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileIdOrUrl}/view?project=${PROJECT_ID}`;
}

export default async function PropertyViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let property: any = null;
  let vendorName = "Unknown Vendor";
  let minPrice = 0;
  let totalRooms = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let roomsList: any[] = [];

  try {
    const db = appwriteServer.databases;
    
    // Fetch property
    property = await db.getDocument(DATABASE_ID, 'properties', id);

    // Fetch vendor if exists
    if (property.vendorId || property.userId) {
      try {
        const vendor = await db.getDocument(DATABASE_ID, VENDOR_COLLECTION, property.vendorId || property.userId);
        vendorName = vendor.businessName || vendor.firstName || "Unknown Vendor";
      } catch (_) {
        console.error("Vendor not found");
      }
    }

    // Fetch rooms
    try {
      const roomsReq = await db.listDocuments(DATABASE_ID, 'rooms', [
        Query.equal('propertyId', id)
      ]);
      
      roomsList = roomsReq.documents;
      totalRooms = roomsReq.total;
      
      let lowest = Number.MAX_VALUE;
      roomsReq.documents.forEach(r => {
        const price = r.discountPrice && r.discountPrice > 0 ? r.discountPrice : r.price;
        if (price && price < lowest) lowest = price;
      });
      if (lowest < Number.MAX_VALUE) minPrice = lowest;
      
    } catch (_) {
      console.error("Error fetching rooms");
    }

  } catch (error) {
    console.error("Error fetching property:", error);
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Property Not Found</h2>
        <Link href="/admin/properties">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  const status = property.status || 'Pending';
  const priceDisplay = property.price || (minPrice > 0 ? minPrice : "N/A");
  const rawImageUrl = property.imageUrl || (property.photos && property.photos.length > 0 ? property.photos[0] : null);
  const imageUrl = getImageUrl(rawImageUrl);
  const amenities = property.amenities || [];
  
  // Parse photos array to valid URLs
  const rawPhotos = property.photos || [];
  const photos = rawPhotos.map((p: string) => getImageUrl(p)).filter(Boolean) as string[];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/properties">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Property Details</h2>
        </div>
        <Link href={`/admin/properties/${id}/edit`}>
          <Button>Edit Property</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <div className="h-80 bg-muted relative flex items-center justify-center">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageUrl} alt={property.propertyName || "Property"} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-20 w-20 text-muted-foreground opacity-30" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80" />
              <Badge 
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                  status.toLowerCase() === 'active' || status.toLowerCase() === 'approved' ? 'bg-emerald-500/90 text-white' : 
                  status.toLowerCase() === 'pending' ? 'bg-amber-500/90 text-white' : 
                  'bg-red-500/90 text-white'
                }`}
              >
                {status}
              </Badge>
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-black">{property.propertyName || property.title || "Unnamed Property"}</h1>
                <div className="flex items-center mt-2 text-white/90">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span className="text-lg">{[property.city, property.state].filter(Boolean).join(", ") || property.location || "Location not set"}</span>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8 space-y-8">
              <section>
                <h3 className="text-xl font-bold mb-4">Description & About</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description || property.details || "No description provided for this property."}
                </p>
              </section>

              {amenities.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 rounded-full text-sm font-medium">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section className="grid sm:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Clock className="h-5 w-5 text-primary" /> Check-in / Check-out
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Check-in: <span className="font-semibold text-foreground">{property.checkInTime || "2:00 PM"}</span></p>
                    <p>Check-out: <span className="font-semibold text-foreground">{property.checkOutTime || "11:00 AM"}</span></p>
                  </div>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Cancellation Policy
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {property.cancellationPolicy || "Standard cancellation policy applies."}
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Rooms Section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" /> 
                Rooms ({totalRooms})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {roomsList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No rooms have been added to this property yet.
                </div>
              ) : (
                <div className="divide-y">
                  {roomsList.map((room) => (
                    <div key={room.$id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-muted/30 transition-colors">
                      <div className="w-full sm:w-48 h-32 bg-muted rounded-xl overflow-hidden shrink-0 relative">
                        {room.photos && room.photos.length > 0 && getImageUrl(room.photos[0]) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={getImageUrl(room.photos[0]) as string} alt={room.roomName || "Room"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-bold">{room.roomName || room.title || "Unnamed Room"}</h4>
                          <div className="text-right">
                            {room.discountPrice && room.discountPrice < room.price ? (
                              <>
                                <p className="text-sm text-muted-foreground line-through">₹{room.price}</p>
                                <p className="text-lg font-bold text-primary">₹{room.discountPrice}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                              </>
                            ) : (
                              <p className="text-lg font-bold text-primary">₹{room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {room.occupancy && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" /> Up to {room.occupancy} guests
                            </div>
                          )}
                          {room.size && (
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" /> {room.size}
                            </div>
                          )}
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.amenities.slice(0, 4).map((am: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0">{am}</Badge>
                            ))}
                            {room.amenities.length > 4 && (
                              <Badge variant="outline" className="text-[10px] py-0">+{room.amenities.length - 4} more</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg border-b pb-3">Quick Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Property Type</p>
                    <p className="font-bold">{property.propertyType || "Property"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-lg shrink-0">
                    <Star className="h-5 w-5 fill-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rating & Reviews</p>
                    <p className="font-bold">{property.rating > 0 ? property.rating : "New"} <span className="text-sm font-normal text-muted-foreground">({property.reviewsCount || 0} reviews)</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                    <p className="font-bold">{vendorName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rooms & Pricing</p>
                    <p className="font-bold">{totalRooms} Rooms</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Starting at <span className="text-foreground font-semibold">₹{priceDisplay}/night</span></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Listed On</p>
                    <p className="font-bold">{new Date(property.$createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Photos Side Gallery */}
          <PhotosGallery photos={photos} />
        </div>
      </div>
    </div>
  );
}
