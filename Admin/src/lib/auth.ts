"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRolesAndStaffData, markStaffActive } from "@/app/admin/roles/actions";

const ADMIN_SESSION_COOKIE = "racoonn_admin_session";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const rootAdminEmail = (process.env.ROOT_ADMIN_EMAIL || "").toLowerCase();
  const rootAdminPassword = process.env.ROOT_ADMIN_PASSWORD || "";

  const isRootAdmin = rootAdminEmail !== "" && cleanEmail === rootAdminEmail;
  const validAdminPasswords = [rootAdminPassword];

  if (isRootAdmin && !validAdminPasswords.includes(password)) {
    return { success: false, error: "Invalid admin password" };
  }

  let staffUser = null;
  let allowedTabs: string[] = ["all"];

  if (!isRootAdmin) {
    // Look up staff user created in Role Management
    const { staffMembers } = await getRolesAndStaffData();
    staffUser = staffMembers.find(s => s.email.toLowerCase() === cleanEmail);

    if (!staffUser) {
      return { success: false, error: "Invalid email or password" };
    }

    if (staffUser.password !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    allowedTabs = staffUser.allowedTabs || ["Dashboard"];
    // Mark employee account as ACTIVE upon successful email verification login!
    await markStaffActive(cleanEmail);
  }

  const sessionData = {
    email: cleanEmail,
    name: isRootAdmin ? "Super Administrator" : (staffUser?.name || "Admin Staff"),
    role: isRootAdmin ? "Super Administrator" : (staffUser?.role || "Operations Lead"),
    allowedTabs: isRootAdmin ? ["all"] : allowedTabs,
    isLoggedIn: true,
    loggedInAt: new Date().toISOString()
  };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(sessionData), {
    httpOnly: false, // Allow client-side reading for dynamic sidebar tab filtering
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/"
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/login");
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
