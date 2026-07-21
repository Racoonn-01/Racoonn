"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LifeBuoy, Clock, Users, TicketCheck, Loader2, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllTickets, updateTicketStatus, getAppwriteConfig } from "./actions"
import { Client } from "appwrite"

export interface Ticket {
  id: string;
  displayId: string;
  subject: string;
  user: string;
  priority: string;
  status: string;
  time: string;
  category: string;
  description: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorBusinessName: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const loadTickets = async () => {
    setIsLoading(true)
    try {
      const data = await getAllTickets()
      setTickets(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
    let unsubscribe: () => void;

    // Setup realtime subscription
    getAppwriteConfig().then(config => {
      const client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);
      
      unsubscribe = client.subscribe(
        `databases.${config.databaseId}.collections.${config.ticketsCollectionId}.documents`,
        () => {
          loadTickets();
        }
      );
    });

    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setTickets(current => 
      current.map(t => t.id === id ? { ...t, status: newStatus } : t)
    )
    try {
      // Find ticket details for email
      const ticketToUpdate = tickets.find(t => t.id === id);
      await updateTicketStatus(
        id, 
        newStatus, 
        ticketToUpdate?.vendorEmail, 
        ticketToUpdate?.vendorBusinessName !== 'N/A' && ticketToUpdate?.vendorBusinessName ? ticketToUpdate?.vendorBusinessName : ticketToUpdate?.user,
        ticketToUpdate?.displayId,
        ticketToUpdate?.category,
        ticketToUpdate?.subject
      )
    } catch {
      // Revert if failed
      loadTickets()
    }
  }

  const stats = useMemo(() => {
    const openTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length
    const resolvedTickets = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length
    const highPriority = tickets.filter(t => t.priority === "High" && (t.status === "Open" || t.status === "In Progress")).length
    return { openTickets, resolvedTickets, highPriority }
  }, [tickets])

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
          <h2 className="text-3xl font-heading font-bold text-secondary">Ticket Details</h2>
        </div>
        
        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{selectedTicket.subject}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                  <Badge variant="outline">{selectedTicket.displayId}</Badge>
                  <span>•</span>
                  <span>Submitted on {selectedTicket.time}</span>
                  <span>•</span>
                  <Badge variant={selectedTicket.priority === "High" ? "destructive" : selectedTicket.priority === "Medium" ? "default" : "secondary"}>
                    {selectedTicket.priority} Priority
                  </Badge>
                </div>
              </div>
              <div className="w-50">
                <Select value={selectedTicket.status} onValueChange={(val) => {
                  handleStatusChange(selectedTicket.id, val)
                  setSelectedTicket({...selectedTicket, status: val})
                }}>
                  <SelectTrigger className={`h-10 w-full ${selectedTicket.status === "Open" ? "text-amber-600 border-amber-200 bg-amber-50" : selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-blue-600 border-blue-200 bg-blue-50"}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ticket Information</h3>
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Category</div>
                      <div className="font-medium">{selectedTicket.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Description / Reason</div>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {selectedTicket.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Vendor Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Name</div>
                      <div className="font-medium text-base">{selectedTicket.user}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Property Name</div>
                      <div className="font-medium">{selectedTicket.vendorBusinessName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Email</div>
                      <div className="font-medium">{selectedTicket.vendorEmail}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone</div>
                      <div className="font-medium">{selectedTicket.vendorPhone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Center</h2>
          <p className="text-muted-foreground mt-1">Manage customer and vendor support tickets and queries.</p>
        </div>
        <Button>Create Ticket</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">{stats.highPriority} require immediate action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 hrs</div>
            <p className="text-xs text-muted-foreground">-1.1 hrs from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Resolved</CardTitle>
            <TicketCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">Total resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex justify-center mb-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.displayId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-xs text-muted-foreground">{ticket.category}</div>
                    </TableCell>
                    <TableCell>{ticket.user}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.priority === "High" ? "destructive" : ticket.priority === "Medium" ? "default" : "secondary"}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={ticket.status} onValueChange={(val) => handleStatusChange(ticket.id, val)}>
                        <SelectTrigger className={`h-8 w-32.5 ${ticket.status === "Open" ? "text-amber-600 border-amber-200 bg-amber-50" : ticket.status === "Resolved" || ticket.status === "Closed" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-blue-600 border-blue-200 bg-blue-50"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{ticket.time}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>Respond</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
