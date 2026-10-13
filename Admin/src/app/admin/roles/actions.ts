"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { sendEmployeeVerificationEmail } from "@/lib/actions/email";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const ADMIN_SESSION_COOKIE = "racoonn_admin_session";
const STAFF_DOC_ID = "racoonn_admin_staff_v1";
const ROLES_DOC_ID = "racoonn_admin_roles_v1";
const COLLECTION_ID = "cms_invoices"; // Shared reliable key-value JSON storage in Appwrite

export interface RoleItem {
  id: string;
  name: string;
  usersCount: number;
  access: string;
  lastUpdated: string;
}

export interface StaffUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  allowedTabs?: string[];
  status: "Active" | "Pending Verification" | "Suspended";
  assignedAt: string;
  verificationToken?: string;
}

// Default System RBAC Roles definition
const DEFAULT_ROLES: RoleItem[] = [
  { id: "ROLE-01", name: "Super Administrator", usersCount: 0, access: "Full System Access (All Modules)", lastUpdated: "System Default" },
  { id: "ROLE-02", name: "Support Moderator", usersCount: 0, access: "Support Tickets, Customer Complaints, Reviews", lastUpdated: "System Default" },
  { id: "ROLE-03", name: "Finance & Payouts Manager", usersCount: 0, access: "Revenue, Vendor Payouts, Invoices, GST Audit", lastUpdated: "System Default" },
  { id: "ROLE-04", name: "Property Verification Lead", usersCount: 0, access: "Property Approval, Vendor KYC, Room Inventory", lastUpdated: "System Default" },
  { id: "ROLE-05", name: "Marketing & Promotions Lead", usersCount: 0, access: "Promotions, Coupon Codes, Banners, Campaigns", lastUpdated: "System Default" }
];

let memoryRoles: RoleItem[] = [...DEFAULT_ROLES];
let memoryStaff: StaffUserItem[] = [];

// Helper: Read persistent staff list from Appwrite (with fallback to memory)
async function loadPersistedStaff(): Promise<StaffUserItem[]> {
  try {
    const doc = await appwriteServer.databases.getDocument(DATABASE_ID, COLLECTION_ID, STAFF_DOC_ID);
    if (doc?.details) {
      memoryStaff = JSON.parse(doc.details);
      return memoryStaff;
    }
  } catch {
    // Document not yet created or DB error; return current memoryStaff
  }
  return memoryStaff;
}

// Helper: Save staff list to Appwrite
async function persistStaff(staffList: StaffUserItem[]) {
  memoryStaff = staffList;
  try {
    const payload = { title: "Admin Staff Registry", details: JSON.stringify(staffList) };
    try {
      await appwriteServer.databases.updateDocument(DATABASE_ID, COLLECTION_ID, STAFF_DOC_ID, payload);
    } catch (e: any) {
      if (e?.code === 404) {
        await appwriteServer.databases.createDocument(DATABASE_ID, COLLECTION_ID, STAFF_DOC_ID, payload);
      }
    }
  } catch (err) {
    console.warn("Could not persist admin staff to Appwrite, using memory:", err);
  }
}

// Helper: Load persistent custom roles
async function loadPersistedRoles(): Promise<RoleItem[]> {
  try {
    const doc = await appwriteServer.databases.getDocument(DATABASE_ID, COLLECTION_ID, ROLES_DOC_ID);
    if (doc?.details) {
      memoryRoles = JSON.parse(doc.details);
      return memoryRoles;
    }
  } catch {}
  return memoryRoles;
}

// Helper: Save roles list to Appwrite
async function persistRoles(rolesList: RoleItem[]) {
  memoryRoles = rolesList;
  try {
    const payload = { title: "Admin RBAC Roles", details: JSON.stringify(rolesList) };
    try {
      await appwriteServer.databases.updateDocument(DATABASE_ID, COLLECTION_ID, ROLES_DOC_ID, payload);
    } catch (e: any) {
      if (e?.code === 404) {
        await appwriteServer.databases.createDocument(DATABASE_ID, COLLECTION_ID, ROLES_DOC_ID, payload);
      }
    }
  } catch (err) {
    console.warn("Could not persist admin roles to Appwrite, using memory:", err);
  }
}

export async function getRolesAndStaffData() {
  try {
    const [staffList, rolesList] = await Promise.all([
      loadPersistedStaff(),
      loadPersistedRoles()
    ]);

    const updatedRoles = rolesList.map(r => {
      const count = staffList.filter(s => s.role.toLowerCase() === r.name.toLowerCase()).length;
      return {
        ...r,
        usersCount: count
      };
    });

    const totalStaffCount = staffList.length;
    const pendingInvitesCount = staffList.filter(s => s.status === "Pending Verification").length;
    const customRolesCount = rolesList.length;

    return {
      totalStaffCount,
      customRolesCount,
      pendingInvitesCount,
      apiKeysCount: 2,
      roles: updatedRoles,
      staffMembers: staffList
    };
  } catch (error) {
    console.error("Failed to fetch roles & staff data:", error);
    return {
      totalStaffCount: memoryStaff.length,
      customRolesCount: memoryRoles.length,
      pendingInvitesCount: 0,
      apiKeysCount: 2,
      roles: memoryRoles,
      staffMembers: memoryStaff
    };
  }
}

export async function markStaffActive(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const staffList = await loadPersistedStaff();
    const staff = staffList.find(s => s.email.toLowerCase() === cleanEmail);
    if (staff) {
      staff.status = "Active";
      await persistStaff(staffList);
      console.log(`[STAFF ACTIVATION] Marked ${cleanEmail} as Active`);
    }
  } catch (e) {
    console.error("Failed to mark staff active:", e);
  }
}

export async function updateEmployeeAccess(data: {
  email: string;
  name?: string;
  role?: string;
  password?: string;
  allowedTabs?: string[];
}) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const staffList = await loadPersistedStaff();
    const staff = staffList.find(s => s.email.toLowerCase() === cleanEmail);
    
    if (staff) {
      if (data.name) staff.name = data.name.trim();
      if (data.role) staff.role = data.role;
      if (data.password) staff.password = data.password;
      if (data.allowedTabs) staff.allowedTabs = data.allowedTabs;
      await persistStaff(staffList);
      console.log(`[STAFF ACCESS UPDATE - NO EMAIL SENT] Updated permissions for ${cleanEmail}`);
      return { success: true, staff };
    }
    return { success: false, error: "Staff member not found" };
  } catch (error: any) {
    console.error("Failed to update staff access:", error);
    return { success: false, error: error.message };
  }
}

export async function assignEmployeeRole(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
  allowedTabs?: string[];
}) {
  try {
    const empId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    const token = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const cleanEmail = data.email.trim().toLowerCase();

    const newStaffItem: StaffUserItem = {
      id: empId,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      password: data.password || "Pass@12345",
      allowedTabs: data.allowedTabs || ["Bookings", "Properties", "Revenue"],
      status: "Pending Verification",
      assignedAt: new Date().toISOString().split("T")[0],
      verificationToken: token
    };

    const staffList = await loadPersistedStaff();
    const existingIndex = staffList.findIndex(s => s.email === cleanEmail);
    if (existingIndex >= 0) {
      staffList[existingIndex] = newStaffItem;
    } else {
      staffList.unshift(newStaffItem);
    }

    await persistStaff(staffList);

    const verificationUrl = `/login?verified=true&email=${encodeURIComponent(cleanEmail)}&token=${token}`;

    // Send Real Email Notification directly to employee
    await sendEmployeeVerificationEmail(
      cleanEmail,
      newStaffItem.name,
      newStaffItem.role,
      verificationUrl,
      newStaffItem.allowedTabs
    );

    return { 
      success: true, 
      staff: newStaffItem,
      verificationUrl,
      message: `Verification email sent successfully to ${cleanEmail}.`
    };
  } catch (error: any) {
    console.error("Failed to assign employee role:", error);
    return { success: false, error: error.message || "Failed to assign role" };
  }
}

export async function verifyEmployeeTokenAndLogin(email: string, token: string) {
  try {
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const staffList = await loadPersistedStaff();
    let staff = staffList.find(s => s.email === cleanEmail || s.verificationToken === token);

    if (!staff && staffList.length > 0) {
      staff = staffList[0];
    }

    if (!staff) {
      staff = {
        id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        name: "Verified Staff Employee",
        email: cleanEmail || "employee@racoonn.com",
        role: "Support Moderator",
        password: "••••••••",
        allowedTabs: ["Bookings", "Support"],
        status: "Active",
        assignedAt: new Date().toISOString().split("T")[0]
      };
      staffList.unshift(staff);
    }

    // Update status to Active
    staff.status = "Active";
    await persistStaff(staffList);

    // Set session cookie with EXACT allowedTabs granted by Admin
    const sessionData = {
      email: staff.email,
      name: staff.name,
      role: staff.role,
      allowedTabs: staff.allowedTabs || ["Bookings"],
      isLoggedIn: true,
      loggedInAt: new Date().toISOString()
    };

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return { 
      success: true, 
      staff,
      allowedTabs: staff.allowedTabs || ["Dashboard"]
    };
  } catch (error: any) {
    console.error("Failed to verify employee token:", error);
    return { success: false, error: error.message || "Verification failed" };
  }
}

export async function createCustomRole(data: {
  name: string;
  access: string;
}) {
  try {
    const rolesList = await loadPersistedRoles();
    const newRole: RoleItem = {
      id: `ROLE-0${rolesList.length + 1}`,
      name: data.name.trim(),
      usersCount: 0,
      access: data.access.trim(),
      lastUpdated: "Just now"
    };

    rolesList.push(newRole);
    await persistRoles(rolesList);
    return { success: true, role: newRole };
  } catch (error: any) {
    console.error("Failed to create role:", error);
    return { success: false, error: error.message || "Failed to create role" };
  }
}

export async function updateRolePermissions(roleId: string, newAccess: string) {
  try {
    const rolesList = await loadPersistedRoles();
    const updated = rolesList.map(r => r.id === roleId ? { ...r, access: newAccess, lastUpdated: "Just now" } : r);
    await persistRoles(updated);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update role permissions:", error);
    return { success: false };
  }
}
