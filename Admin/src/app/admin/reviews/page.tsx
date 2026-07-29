"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, AlertTriangle, CheckCircle2, Loader2, Calendar, Filter } from "lucide-react"
import { getAllReviews } from "./actions"

export type ReviewData = {
  id: string;
  realId: string;
  property: string;
  author: string;
  rating: number;
  text?: string;
  status: string;
  date: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null)
  
  const [propertyFilter, setPropertyFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getAllReviews()
        setReviews(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadReviews()
  }, [])

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    let totalRating = 0;
    let flagged = 0;
    
    reviews.forEach(r => {
      totalRating += r.rating;
      if (r.status === 'Flagged') flagged++;
    });

    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "0.0";
    const autoApproved = totalReviews > 0 ? Math.round(((totalReviews - flagged) / totalReviews) * 100) : 0;

    return { totalReviews, averageRating, flagged, autoApproved };
  }, [reviews])

  const uniqueProperties = useMemo(() => {
    return [...new Set(reviews.map(r => r.property))].sort();
  }, [reviews])

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchProperty = propertyFilter === "all" || review.property === propertyFilter;
      const matchRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
      return matchProperty && matchRating;
    })
  }, [reviews, propertyFilter, ratingFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h2>
          <p className="text-muted-foreground mt-1">Monitor user reviews, manage flagged content, and oversee moderation.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString('en-US')}</div>
            <p className="text-xs text-muted-foreground">All time reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flagged}</div>
            <p className="text-xs text-muted-foreground">Requires moderation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoApproved}%</div>
            <p className="text-xs text-muted-foreground">Passed filter</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reviews</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={propertyFilter} onValueChange={(val) => setPropertyFilter(val ?? "all")}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {uniqueProperties.map(prop => (
                    <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val ?? "all")}>
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading reviews...</p>
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No reviews found matching the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.id}</TableCell>
                    <TableCell>{review.property}</TableCell>
                    <TableCell>{review.author}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {review.rating} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.status === "Published" ? "default" : review.status === "Flagged" ? "destructive" : "secondary"}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full details of the review for {selectedReview?.property}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{selectedReview.author}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {selectedReview.date}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{selectedReview.rating}</span>
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </div>
                  <Badge variant={selectedReview.status === "Published" ? "default" : selectedReview.status === "Flagged" ? "destructive" : "secondary"}>
                    {selectedReview.status}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReview.text || "No review text provided."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
