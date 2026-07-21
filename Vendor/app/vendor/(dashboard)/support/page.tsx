"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LifeBuoy, FileText, Phone, Mail, Loader2, Ticket, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createSupportTicket, getVendorTickets, submitTicketReview } from "@/lib/appwrite/support";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { client, appwriteConfig } from "@/lib/appwrite/client";
import { sendTicketEmail } from "@/lib/actions/email";

function SupportContent() {
  const { user } = useAuthStore();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Billing & Payouts");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Review states
  const [reviewTicket, setReviewTicket] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const loadTickets = async () => {
    if (!user?.$id) return;
    setIsLoadingTickets(true);
    try {
      const data = await getVendorTickets(user.$id);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.ticketsCollectionId}.documents`,
      (response: any) => {
        // If a ticket is created/updated for this vendor, reload
        if (response.payload && response.payload.vendorId === user?.$id) {
          loadTickets();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Handle auto-opening the review modal from email link
  useEffect(() => {
    const reviewTicketId = searchParams.get('reviewTicket');
    if (reviewTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.$id === reviewTicketId);
      if (ticket && ticket.status === 'Resolved' && !ticket.rating) {
        setReviewTicket(ticket);
        
        // Clean up URL so it doesn't pop up again on refresh
        const url = new URL(window.location.href);
        url.searchParams.delete('reviewTicket');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    }
  }, [tickets, searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id || !subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const ticketResponse = await createSupportTicket({
        subject,
        category,
        description,
        vendorId: user.$id
      });
      
      // Fire off the email asynchronously (we don't await so UI is snappy)
      if (user.email) {
        sendTicketEmail(user.email, user.name || 'Vendor', {
          id: ticketResponse.$id,
          subject,
          category,
          description
        });
      }

      setSubject("");
      setDescription("");
      setCategory("Billing & Payouts");
      setSuccessMsg("Ticket submitted successfully! Our team will reach out soon.");
      loadTickets(); // Refresh list
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewTicket || rating === 0) return;
    setIsSubmittingReview(true);
    try {
      await submitTicketReview(reviewTicket.$id, rating, reviewText);
      setSuccessMsg("Thank you for your review!");
      setReviewTicket(null);
      setRating(0);
      setReviewText("");
      loadTickets(); // Refresh tickets to show rating
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-heading font-bold text-secondary">Help & Support</h2>
        <p className="text-slate-500 mt-1">Get assistance with your vendor account or contact the Racoonn team.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-secondary text-lg">Documentation</h3>
            <p className="text-sm text-slate-500">Read our guides on managing properties and optimizing bookings.</p>
            <Button variant="outline" className="w-full mt-2 border-slate-200 text-slate-600">Browse Docs</Button>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-secondary text-lg">Phone Support</h3>
            <p className="text-sm text-slate-500">Available 24/7 for premium vendors and urgent booking issues.</p>
            <Button variant="outline" className="w-full mt-2 border-slate-200 text-slate-600">Call Us</Button>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-secondary text-lg">Email Support</h3>
            <p className="text-sm text-slate-500">Expect a response within 24 hours for non-urgent inquiries.</p>
            <Button variant="outline" className="w-full mt-2 border-slate-200 text-slate-600">Send Email</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-secondary">Submit a Ticket</h3>
                <p className="text-sm text-slate-500">Describe your issue in detail.</p>
              </div>
            </div>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-md border border-emerald-100">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g., Issue with payout for booking BKG-1234" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option>Billing & Payouts</option>
                  <option>Technical Issue</option>
                  <option>Guest Dispute</option>
                  <option>Property Management</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible..." 
                  className="min-h-37.5" 
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !user} className="bg-primary hover:bg-primary/90 text-white mt-4">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white flex flex-col">
          <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-secondary">My Tickets</h3>
                  <p className="text-sm text-slate-500">Track your submitted requests.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto -mx-2 px-2">
              {isLoadingTickets ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No support tickets yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <div key={ticket.$id} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-secondary">{ticket.subject}</h4>
                        <Badge variant={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'default' : ticket.status === 'In Progress' ? 'secondary' : 'destructive'} className="ml-2 shrink-0">
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                        <span className="truncate mr-4">{ticket.category}</span>
                        <div className="flex items-center gap-4">
                          {ticket.status === 'Resolved' && !ticket.rating && (
                            <Button variant="outline" size="sm" onClick={() => setReviewTicket(ticket)} className="text-primary hover:text-primary">
                              Write Review
                            </Button>
                          )}
                          {ticket.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium text-slate-700">{ticket.rating}/5</span>
                            </div>
                          )}
                          <span className="shrink-0">{new Date(ticket.$createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={!!reviewTicket} onOpenChange={(open) => !open && setReviewTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate our support</DialogTitle>
            <DialogDescription>
              How did we do on ticket {reviewTicket?.subject}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)}
                  className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            
            <div className="w-full space-y-2 mt-4">
              <Label htmlFor="reviewText">Additional Feedback (Optional)</Label>
              <Textarea 
                id="reviewText" 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                placeholder="Tell us what you liked or how we can improve..."
                className="h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTicket(null)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview || rating === 0} className="bg-primary text-white hover:bg-primary/90">
              {isSubmittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SupportContent />
    </Suspense>
  );
}
