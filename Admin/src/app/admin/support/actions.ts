"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Models, Query } from "node-appwrite";
import { sendResolvedEmail } from "@/lib/actions/email";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const TICKETS_COLLECTION_ID = process.env.APPWRITE_TICKETS_COLLECTION_ID!;

export async function getAppwriteConfig() {
  return {
    endpoint:
      process.env.APPWRITE_ENDPOINT ||
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://cloud.appwrite.io/v1",
    projectId:
      process.env.APPWRITE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
      "",
    databaseId: process.env.APPWRITE_DATABASE_ID || "",
    ticketsCollectionId: process.env.APPWRITE_TICKETS_COLLECTION_ID || ""
  };
}

interface UserProfileDocument extends Models.Document {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
}

export async function getAllTickets() {
  try {
    const { databases } = appwriteServer;
    
    const tickets = await databases.listDocuments(
      DATABASE_ID,
      TICKETS_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    
    // For now we just return tickets. In a real app we might fetch user/vendor info from vendors collection.
    // Assuming vendorId is used, let's fetch vendor profiles to map the name.
    const vendorIds = [...new Set(tickets.documents.map(t => t.vendorId))].filter(Boolean);
    
    let userProfiles: UserProfileDocument[] = [];
    try {
        if (vendorIds.length > 0) {
            const profileResp = await databases.listDocuments<UserProfileDocument>(
                DATABASE_ID,
                'userprofiles',
                [Query.equal('userId', vendorIds), Query.limit(100)]
            );
            userProfiles = profileResp.documents;
        }
    } catch (e) {
        console.warn("Could not fetch userprofiles collection:", e);
    }
    
    return tickets.documents.map(ticket => {
        const profile = userProfiles.find(v => v.userId === ticket.vendorId);
        const userName = profile ? profile.name : ticket.vendorId;
        
        let priority = "Medium";
        if (ticket.category === "Guest Dispute" || ticket.category === "Technical Issue") priority = "High";
        
        return {
            id: ticket.$id,
            displayId: `TKT-${ticket.$id.substring(0,4).toUpperCase()}`,
            subject: ticket.subject,
            user: userName || 'Unknown Vendor',
            priority,
            status: ticket.status || 'Open',
            time: new Date(ticket.$createdAt).toLocaleString(),
            category: ticket.category,
            description: ticket.description || 'No description provided.',
            vendorEmail: profile ? profile.email : 'N/A',
            vendorPhone: profile ? profile.phone : 'N/A',
            vendorBusinessName: profile && profile.businessName ? profile.businessName : userName
        };
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return [];
  }
}

export async function updateTicketStatus(ticketId: string, status: string, vendorEmail?: string, vendorName?: string, ticketDisplayId?: string, ticketCategory?: string, ticketSubject?: string) {
    try {
        const { databases } = appwriteServer;
        await databases.updateDocument(
            DATABASE_ID,
            TICKETS_COLLECTION_ID,
            ticketId,
            { status }
        );
        
        if (status === "Resolved" && vendorEmail) {
            await sendResolvedEmail(
                vendorEmail,
                vendorName || "Vendor",
                {
                    id: ticketId,
                    displayId: ticketDisplayId || ticketId,
                    subject: ticketSubject || "Support Ticket",
                    category: ticketCategory || "General"
                }
            );
        }
        
        return { success: true };
    } catch (error) {
        console.error("Failed to update ticket status:", error);
        return { success: false };
    }
}
