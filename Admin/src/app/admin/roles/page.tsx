"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldHalf,
  ShieldCheck,
  Plus,
  Loader2,
  Edit,
  Mail,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Key,
  Send,
  Save,
  RefreshCw
} from "lucide-react";
import {
  getRolesAndStaffData,
  assignEmployeeRole,
  updateEmployeeAccess,
  createCustomRole,
  updateRolePermissions,
  RoleItem,
  StaffUserItem
} from "./actions";

const AVAILABLE_MODULE_TABS = [
  { id: "Dashboard", label: "Dashboard Overview" },
  { id: "Vendors", label: "Vendor Management" },
  { id: "Verification", label: "Verification Center" },
  { id: "Properties", label: "Properties & Rooms" },
  { id: "Bookings", label: "Bookings Management" },
  { id: "Customers", label: "Customer Profiles" },
  { id: "Revenue", label: "Revenue & Earnings" },
  { id: "Payments", label: "Payments Gateway" },
  { id: "Payouts", label: "Vendor Payouts" },
  { id: "Invoices", label: "Invoice System" },
  { id: "Reviews", label: "Customer Reviews" },
  { id: "Support", label: "Support & Escalations" },
  { id: "Marketing", label: "Marketing & Promotions" },
  { id: "Reports", label: "Financial Reports" },
  { id: "Notifications", label: "Notifications Center" },
  { id: "Fraud", label: "Fraud Detection" },
  { id: "Roles", label: "Role Management (RBAC)" },
  { id: "Settings", label: "System Settings" }
];

export default function RolesPage() {
  const [data, setData] = useState<{
    totalStaffCount: number;
    customRolesCount: number;
    pendingInvitesCount: number;
    apiKeysCount: number;
    roles: RoleItem[];
    staffMembers: StaffUserItem[];
  }>({
    totalStaffCount: 0,
    customRolesCount: 0,
    pendingInvitesCount: 0,
    apiKeysCount: 2,
    roles: [],
    staffMembers: []
  });

  const [isLoading, setIsLoading] = useState(true);
  
  // Modals State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isEditPermissionModalOpen, setIsEditPermissionModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [editAccessText, setEditAccessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Invite / Assign Role Form State
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Support Moderator",
    allowedTabs: ["Dashboard", "Bookings", "Support"] as string[]
  });

  // Create Role Form State
  const [roleForm, setRoleForm] = useState({
    name: "",
    access: "Bookings, Support, Properties View Only"
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getRolesAndStaffData();
      setData(res);
      if (res.roles.length > 0 && !editingEmployeeId) {
        setInviteForm(prev => ({ ...prev, role: res.roles[0].name }));
      }
    } catch (err) {
      console.error("Failed to load roles data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignModal = () => {
    setEditingEmployeeId(null);
    setInviteForm({
      name: "",
      email: "",
      password: "",
      role: data.roles[0]?.name || "Support Moderator",
      allowedTabs: ["Dashboard", "Bookings", "Support"]
    });
    setIsInviteModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: StaffUserItem) => {
    setEditingEmployeeId(emp.id);
    setInviteForm({
      name: emp.name,
      email: emp.email,
      password: emp.password || "",
      role: emp.role,
      allowedTabs: emp.allowedTabs || ["Dashboard", "Bookings", "Support"]
    });
    setIsInviteModalOpen(true);
  };

  const handleToggleTabPermission = (tabId: string) => {
    setInviteForm(prev => {
      const exists = prev.allowedTabs.includes(tabId);
      if (exists) {
        return { ...prev, allowedTabs: prev.allowedTabs.filter(t => t !== tabId) };
      } else {
        return { ...prev, allowedTabs: [...prev.allowedTabs, tabId] };
      }
    });
  };

  const handleSelectAllTabs = () => {
    if (inviteForm.allowedTabs.length === AVAILABLE_MODULE_TABS.length) {
      setInviteForm(prev => ({ ...prev, allowedTabs: [] }));
    } else {
      setInviteForm(prev => ({ ...prev, allowedTabs: AVAILABLE_MODULE_TABS.map(t => t.id) }));
    }
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    try {
      setIsSubmitting(true);
      
      if (editingEmployeeId) {
        // Edit Access Mode -> DO NOT SEND EMAIL
        const res = await updateEmployeeAccess(inviteForm);
        if (res.success) {
          setIsInviteModalOpen(false);
          setEditingEmployeeId(null);
          setSuccessBanner(`Updated access permissions for ${inviteForm.email} (No email sent).`);
          setTimeout(() => setSuccessBanner(null), 5000);
          await loadData();
        }
      } else {
        // New Assignment Mode -> Send Email
        const res = await assignEmployeeRole(inviteForm);
        if (res.success) {
          setIsInviteModalOpen(false);
          setSuccessBanner(`Verification email sent directly to ${inviteForm.email}.`);
          setTimeout(() => setSuccessBanner(null), 6000);

          setInviteForm({
            name: "",
            email: "",
            password: "",
            role: data.roles[0]?.name || "Support Moderator",
            allowedTabs: ["Dashboard", "Bookings", "Support"]
          });
          await loadData();
        }
      }
    } catch (err) {
      console.error("Failed to save employee role:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async (emp: StaffUserItem) => {
    try {
      setSuccessBanner(`Resending verification email to ${emp.email}...`);
      await assignEmployeeRole({
        name: emp.name,
        email: emp.email,
        role: emp.role,
        allowedTabs: emp.allowedTabs
      });
      setSuccessBanner(`Verification email resent to ${emp.email}.`);
      setTimeout(() => setSuccessBanner(null), 5000);
      await loadData();
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await createCustomRole(roleForm);
      if (res.success) {
        setIsCreateRoleModalOpen(false);
        setRoleForm({ name: "", access: "Bookings, Support, Properties View Only" });
        await loadData();
      }
    } catch (err) {
      console.error("Failed to create role:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditPermissions = (role: RoleItem) => {
    setSelectedRole(role);
    setEditAccessText(role.access);
    setIsEditPermissionModalOpen(true);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !editAccessText.trim()) return;

    try {
      setIsSubmitting(true);
      await updateRolePermissions(selectedRole.id, editAccessText);
      setIsEditPermissionModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to update role permissions:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground mt-1">Configure role-based access control (RBAC) and assign tab permissions to employees.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateRoleModalOpen(true)}
            variant="outline" 
            className="rounded-full h-11 px-5 font-semibold"
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Create Custom Role
          </Button>
          <Button 
            onClick={handleOpenAssignModal}
            className="rounded-full px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" /> Assign Role to Employee
          </Button>
        </div>
      </div>

      {/* Realtime Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff Users</CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStaffCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active employees in platform</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom RBAC Roles</CardTitle>
            <ShieldHalf className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customRolesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Configured access levels</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <UserPlus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingInvitesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting email verification</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API & Service Keys</CardTitle>
            <KeyRound className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.apiKeysCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active integration tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Defined RBAC Roles Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Defined RBAC System Roles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading system roles...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Role ID</TableHead>
                  <TableHead className="font-semibold h-12">Role Name</TableHead>
                  <TableHead className="font-semibold h-12">Assigned Employees</TableHead>
                  <TableHead className="font-semibold h-12">Access Scope & Module Permissions</TableHead>
                  <TableHead className="font-semibold h-12">Last Updated</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium font-mono text-xs text-foreground">{role.id}</TableCell>
                    <TableCell className="font-bold text-foreground">{role.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold">
                        {role.usersCount} Employees
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">{role.access}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{role.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        onClick={() => handleOpenEditPermissions(role)}
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full px-3.5 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staff Roster & Assigned Employees Table */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Assigned Staff Members & Tab Access Permissions</CardTitle>
          <Button 
            onClick={handleOpenAssignModal}
            size="sm"
            className="rounded-full px-4 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Assign Employee
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data.staffMembers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No employees assigned yet. Click &quot;Assign Employee&quot; above to invite one with custom tab access.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold h-12">Employee ID</TableHead>
                  <TableHead className="font-semibold h-12">Staff Name</TableHead>
                  <TableHead className="font-semibold h-12">Email & Login Pass</TableHead>
                  <TableHead className="font-semibold h-12">Assigned Role</TableHead>
                  <TableHead className="font-semibold h-12">Allowed Tab Access</TableHead>
                  <TableHead className="font-semibold h-12">Status</TableHead>
                  <TableHead className="text-right font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.staffMembers.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold font-mono text-xs text-foreground">{emp.id}</TableCell>
                    <TableCell className="font-bold text-foreground">{emp.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-mono text-slate-700 font-bold">{emp.email}</span>
                        <span className="text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Key className="w-3 h-3 text-slate-400" /> {emp.password || "••••••••"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-800 text-sm">{emp.role}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(emp.allowedTabs || ["Dashboard", "Bookings", "Support"]).slice(0, 4).map(tab => (
                          <Badge key={tab} variant="outline" className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold border-slate-200">
                            {tab}
                          </Badge>
                        ))}
                        {(emp.allowedTabs || []).length > 4 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 font-bold border-rose-200">
                            +{(emp.allowedTabs || []).length - 4} More
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${emp.status === "Active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}
                          ${emp.status === "Pending Verification" && "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                        `}
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {emp.status === "Pending Verification" && (
                          <Button 
                            onClick={() => handleResendEmail(emp)}
                            variant="outline" 
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs font-semibold border-amber-300 text-amber-800 hover:bg-amber-50"
                          >
                            <Send className="w-3 h-3 mr-1" /> Resend
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleOpenEditEmployee(emp)}
                          variant="outline" 
                          size="sm"
                          className="h-8 rounded-full px-3.5 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit Access
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal 1: Assign / Edit Employee Role & Tab Access */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-xl w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl max-h-[90vh] flex flex-col">
          <form onSubmit={handleAssignRoleSubmit} className="flex flex-col h-full overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#E86A70]" />
                  <h3 className="text-xl font-black">
                    {editingEmployeeId ? "Edit Employee Tab Permissions" : "Assign Role & Tab Access"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {editingEmployeeId ? "Modify allowed tab access without sending emails." : "Set employee credentials and select accessible modules."}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Employee Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Employee Full Name</label>
                <Input 
                  placeholder="e.g. Rahul Sharma" 
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                  className="rounded-xl h-11 border-slate-300"
                />
              </div>

              {/* Work Email & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Email Address</label>
                  <Input 
                    type="email"
                    placeholder="ra8912626@gmail.com" 
                    value={inviteForm.email}
                    readOnly={Boolean(editingEmployeeId)}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                    className={`rounded-xl h-11 border-slate-300 ${editingEmployeeId ? 'bg-slate-100 font-mono text-slate-600' : ''}`}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Employee Password</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter login password" 
                      value={inviteForm.password}
                      onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                      required
                      className="rounded-xl h-11 border-slate-300 pr-10 font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Assigned Role</label>
                <select 
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-300 px-3 bg-background text-sm font-bold text-slate-800"
                >
                  {data.roles.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Tab Access Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#E86A70]" /> Select Module & Tab Access Permissions
                  </label>
                  <button 
                    type="button"
                    onClick={handleSelectAllTabs}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    {inviteForm.allowedTabs.length === AVAILABLE_MODULE_TABS.length ? "Deselect All" : "Select All Tabs"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  {AVAILABLE_MODULE_TABS.map((tab) => {
                    const isChecked = inviteForm.allowedTabs.includes(tab.id);
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleToggleTabPermission(tab.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition-all ${
                          isChecked 
                            ? "bg-rose-50 border-rose-200 text-rose-900 font-bold" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 mt-auto">
              <Button 
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                variant="outline"
                className="rounded-xl px-5 h-11 font-semibold border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : editingEmployeeId ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {editingEmployeeId ? "Save Updated Access & Permissions" : "Assign & Send Verification Email"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Create Custom Role */}
      <Dialog open={isCreateRoleModalOpen} onOpenChange={setIsCreateRoleModalOpen}>
        <DialogContent className="sm:max-w-md w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl">
          <form onSubmit={handleCreateRoleSubmit} className="flex flex-col">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#E86A70]" />
                  <h3 className="text-xl font-black">Create Custom RBAC Role</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Define new access scope and module permission levels.</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Title</label>
                <Input 
                  placeholder="e.g. Operations Manager" 
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                  className="rounded-xl h-11 border-slate-300 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Scope & Module Permissions</label>
                <Input 
                  placeholder="e.g. Bookings, Customer Support, Properties Read-Only" 
                  value={roleForm.access}
                  onChange={(e) => setRoleForm({ ...roleForm, access: e.target.value })}
                  required
                  className="rounded-xl h-11 border-slate-300"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button 
                type="button"
                onClick={() => setIsCreateRoleModalOpen(false)}
                variant="outline"
                className="rounded-xl px-5 h-11 font-semibold border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Create System Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Edit Role Permissions */}
      <Dialog open={isEditPermissionModalOpen} onOpenChange={setIsEditPermissionModalOpen}>
        <DialogContent className="sm:max-w-md w-full rounded-3xl p-0 overflow-hidden bg-background border border-border shadow-2xl">
          <form onSubmit={handleSavePermissions} className="flex flex-col">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#E86A70]" />
                  <h3 className="text-xl font-black">Edit Permissions: {selectedRole?.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Modify allowed module access scopes for this role.</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Scope</label>
                <Input 
                  value={editAccessText}
                  onChange={(e) => setEditAccessText(e.target.value)}
                  required
                  className="rounded-xl h-11 border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button 
                type="button"
                onClick={() => setIsEditPermissionModalOpen(false)}
                variant="outline"
                className="rounded-xl px-5 h-11 font-semibold border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-6 h-11 bg-[#E86A70] hover:bg-[#d5585e] text-white font-bold shadow-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
