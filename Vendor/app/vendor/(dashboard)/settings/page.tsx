"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CreditCard, Bell, Shield, User, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig, account, storage } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, profile, checkAuth } = useAuthStore();
  
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "upi">("bank");
  
  // General State
  const [bizType, setBizType] = useState("company");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Billing State
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [routingNumber, setRoutingNumber] = useState(""); // IFSC
  const [accountNumber, setAccountNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isSavingBilling, setIsSavingBilling] = useState(false);
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Populate data on mount
  useEffect(() => {
    if (profile) {
      setBizType(profile.bizType || "company");
      setBusinessName(profile.businessName || "");
      setGstNumber(profile.gstNumber || "");
      setPanNumber(profile.panNumber || "");
      setAadharNumber(profile.aadharNumber || "");
      setAddress(profile.address || "");
      
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
      
      setBankName(profile.bankName || "");
      setAccountHolder(profile.accountHolder || "");
      setAccountNumber(profile.accountNumber || "");
      setRoutingNumber(profile.ifsc || "");
      setUpiId(profile.upiId || "");
      
      if (profile.upiId && !profile.accountNumber) {
        setPayoutMethod("upi");
      }
    }
    if (user) {
      setEmail(user.email);
    }
  }, [profile, user]);

  const handleSaveGeneral = async () => {
    if (!profile) return;
    setIsSavingGeneral(true);
    try {
      const updateData: any = { address };
      if (bizType === "company") {
        updateData.businessName = businessName;
        updateData.gstNumber = gstNumber;
        updateData.panNumber = panNumber;
      } else {
        updateData.panNumber = panNumber;
        updateData.aadharNumber = aadharNumber;
      }

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        profile.$id,
        updateData
      );
      await checkAuth();
      toast.success("Business information updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update business information");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSavingProfile(true);
    let newProfileImageId = profile.profileImage;
    
    if (profilePicFile) {
      if (profilePicFile.size > 100 * 1024 * 1024) {
        toast.error("Profile picture must be less than 100MB");
        setIsSavingProfile(false);
        return;
      }
      
      try {
        // Compress the image to a small standardized JPEG using Canvas to bypass Appwrite crashes
        const compressedFile = await new Promise<File>((resolve, reject) => {
          const img = new window.Image();
          img.src = URL.createObjectURL(profilePicFile);
          img.onload = () => {
            const canvas = document.createElement("canvas");
            // Max width/height of 500px for profile picture
            const MAX_SIZE = 500;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Failed to get canvas context"));
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error("Canvas to Blob failed"));
                resolve(new File([blob], "profile_image.jpg", { type: "image/jpeg" }));
              },
              "image/jpeg",
              0.8
            );
          };
          img.onerror = () => reject(new Error("Failed to load image for compression"));
        });

        const uploadedFile = await storage.createFile(
          appwriteConfig.profileImagesBucketId,
          ID.unique(),
          compressedFile
        );
        newProfileImageId = uploadedFile.$id;
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
        toast.error(`Upload failed: ${uploadError?.message || 'Server Error'}`);
        setIsSavingProfile(false);
        return;
      }
    }
    
    const updatePayload: any = {};
    
    if (firstName.trim() !== "") updatePayload.firstName = firstName;
    if (lastName.trim() !== "") updatePayload.lastName = lastName;
    if (phone.trim() !== "") updatePayload.phone = phone;
    
    if (newProfileImageId && newProfileImageId !== profile.profileImage) {
      updatePayload.profileImage = newProfileImageId;
    }
    
    if (Object.keys(updatePayload).length === 0) {
      toast.success("No changes to save");
      setIsSavingProfile(false);
      return;
    }
    
    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.$id, updatePayload }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      setProfilePicFile(null); // Clear selected file after successful save
      await checkAuth();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "Unknown error";
      const errorCode = error?.code || "No code";
      const errorType = error?.type || "No type";
      toast.error(`Error: ${errorMsg} (Code: ${errorCode}, Type: ${errorType})`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview locally, don't save yet!
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSaveBilling = async () => {
    if (!profile) return;
    setIsSavingBilling(true);
    try {
      const billingData = payoutMethod === "bank" ? {
        bankName,
        accountHolder,
        accountNumber,
        ifsc: routingNumber,
        upiId: "" // clear upi if bank is chosen
      } : {
        upiId,
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        ifsc: ""
      };

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        profile.$id,
        billingData
      );
      await checkAuth();
      toast.success("Billing details updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update billing details");
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await account.updatePassword(newPassword, currentPassword);
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <motion.div layout className="space-y-6 max-w-5xl mx-auto">
      <motion.div layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <h2 className="text-3xl font-heading font-bold text-secondary">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </motion.div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-xl w-full justify-start overflow-x-auto h-auto inline-flex gap-1">
          <TabsTrigger value="general" className="data-active:bg-white data-active:text-primary data-active:shadow-sm text-slate-500 rounded-full h-auto py-2 px-5 flex items-center gap-2 font-medium transition-all shrink-0">
            <Building2 className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-active:bg-white data-active:text-primary data-active:shadow-sm text-slate-500 rounded-full h-auto py-2 px-5 flex items-center gap-2 font-medium transition-all shrink-0">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-active:bg-white data-active:text-primary data-active:shadow-sm text-slate-500 rounded-full h-auto py-2 px-5 flex items-center gap-2 font-medium transition-all shrink-0">
            <CreditCard className="w-4 h-4" /> Billing & Payouts
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-active:bg-white data-active:text-primary data-active:shadow-sm text-slate-500 rounded-full h-auto py-2 px-5 flex items-center gap-2 font-medium transition-all shrink-0">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-active:bg-white data-active:text-primary data-active:shadow-sm text-slate-500 rounded-full h-auto py-2 px-5 flex items-center gap-2 font-medium transition-all shrink-0">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="general" className="space-y-6 outline-none">
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6 sm:px-8">
                <CardTitle className="font-heading text-xl">Business Information</CardTitle>
                <CardDescription className="text-slate-500">Update your company details and tax information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bizType === "company" ? (
                    <>
                      <div className="space-y-2.5">
                        <Label htmlFor="businessName" className="text-sm font-semibold text-slate-700">Legal Business Name</Label>
                        <Input id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="panNumber" className="text-sm font-semibold text-slate-700">PAN Number</Label>
                        <Input id="panNumber" value={panNumber} onChange={e => setPanNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="gstNumber" className="text-sm font-semibold text-slate-700">GST Number</Label>
                        <Input id="gstNumber" value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <Label htmlFor="panNumber" className="text-sm font-semibold text-slate-700">PAN Number</Label>
                        <Input id="panNumber" value={panNumber} onChange={e => setPanNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="aadharNumber" className="text-sm font-semibold text-slate-700">Aadhar Number</Label>
                        <Input id="aadharNumber" value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                    </>
                  )}
                  <div className={`space-y-2.5 ${bizType === 'individual' ? 'md:col-span-2' : ''}`}>
                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Registered Address</Label>
                    <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={isSavingGeneral} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                    {isSavingGeneral ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 outline-none">
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6 sm:px-8">
                <CardTitle className="font-heading text-xl">Profile Settings</CardTitle>
                <CardDescription className="text-slate-500">Manage your personal profile information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex items-center gap-6 pb-2">
                  <div className="h-20 w-20 rounded-full bg-slate-100 ring-4 ring-slate-50 overflow-hidden flex items-center justify-center relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Image 
                      src={profilePicPreview || (profile?.profileImage ? storage.getFilePreview(appwriteConfig.profileImagesBucketId, profile.profileImage).toString() : "https://github.com/shadcn.png")} 
                      alt="Profile" 
                      width={80} 
                      height={80} 
                      className="w-full h-full object-cover" 
                      unoptimized 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white font-medium">Change</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Profile Picture</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-3">JPG, GIF or PNG. Max size of 100MB.</p>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleProfileImageSelect} 
                      />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-8 text-xs font-medium rounded-lg">
                        Upload New
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setProfilePicFile(null);
                          setProfilePicPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="h-8 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2.5">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address (Read Only)</Label>
                    <Input id="email" type="email" disabled value={email} className="h-11 rounded-xl border-slate-200 bg-slate-100 text-slate-500 transition-all text-sm shadow-sm cursor-not-allowed" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                    {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 outline-none">
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6 sm:px-8">
                <CardTitle className="font-heading text-xl">Billing & Payouts</CardTitle>
                <CardDescription className="text-slate-500">Manage your payment methods and payout preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">Payout Method</h3>
                    <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit">
                      <button 
                        onClick={() => setPayoutMethod("bank")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${payoutMethod === "bank" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Bank Account
                      </button>
                      <button 
                        onClick={() => setPayoutMethod("upi")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${payoutMethod === "upi" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        UPI
                      </button>
                    </div>
                  </div>

                  {payoutMethod === "bank" ? (
                    <div key="bank-details" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="bankName" className="text-sm font-semibold text-slate-700">Bank Name</Label>
                          <Select value={bankName} onValueChange={(val) => val && setBankName(val)}>
                            <SelectTrigger id="bankName" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm">
                              <SelectValue placeholder="Select a bank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sbi">State Bank of India (SBI)</SelectItem>
                              <SelectItem value="hdfc">HDFC Bank</SelectItem>
                              <SelectItem value="icici">ICICI Bank</SelectItem>
                              <SelectItem value="axis">Axis Bank</SelectItem>
                              <SelectItem value="pnb">Punjab National Bank (PNB)</SelectItem>
                              <SelectItem value="bob">Bank of Baroda</SelectItem>
                              <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="accountName" className="text-sm font-semibold text-slate-700">Account Holder Name</Label>
                          <Input id="accountName" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="routingNumber" className="text-sm font-semibold text-slate-700">Routing Number / IFSC Code</Label>
                          <Input id="routingNumber" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="accountNumber" className="text-sm font-semibold text-slate-700">Account Number</Label>
                          <Input id="accountNumber" type="password" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key="upi-details" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="upiId" className="text-sm font-semibold text-slate-700">UPI ID</Label>
                          <Input id="upiId" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="example@upi" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="upiName" className="text-sm font-semibold text-slate-700">Registered Name</Label>
                          <Input id="upiName" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Name linked to UPI" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl mt-2">
                        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600">Your UPI payments will be settled directly to the bank account linked with this UPI ID.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <Button onClick={handleSaveBilling} disabled={isSavingBilling} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                    {isSavingBilling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 outline-none">
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl">
              <CardHeader>
                <CardTitle className="font-heading">Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-secondary">New Bookings</Label>
                    <p className="text-sm text-slate-500">Receive an email when a new booking is made.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-secondary">Cancellations</Label>
                    <p className="text-sm text-slate-500">Receive an SMS when a booking is cancelled.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-secondary">New Guest Messages</Label>
                    <p className="text-sm text-slate-500">Receive push notifications for chat messages.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 outline-none">
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl">
              <CardHeader>
                <CardTitle className="font-heading">Security Settings</CardTitle>
                <CardDescription>Manage your password and account security preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-6 sm:p-8">
                {/* Change Password Section */}
                <div className="space-y-6">
                  <h3 className="text-base font-semibold text-slate-800">Change Password</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">Current Password</Label>
                      <Input id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" placeholder="••••••••" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">New Password</Label>
                        <Input id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="••••••••" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm New Password</Label>
                        <Input id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-all w-full sm:w-auto">
                    {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </div>

                {/* Two-Factor Authentication Section */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        Two-Factor Authentication (2FA)
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Enabled</span>
                      </h3>
                      <p className="text-sm text-slate-500">Protect your account with an extra layer of security.</p>
                    </div>
                    <Switch defaultChecked className="mt-1 sm:mt-0" />
                  </div>
                  <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50 font-medium transition-all w-full sm:w-auto">
                    Manage 2FA Settings
                  </Button>
                </div>

                {/* Active Sessions Section */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-800">Active Sessions</h3>
                    <p className="text-sm text-slate-500">Manage devices that are currently logged into your account.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">MacBook Pro (Mac OS)</p>
                          <p className="text-xs text-slate-500">Mumbai, India • Active Now</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">Current Device</p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">iPhone 14 Pro (iOS)</p>
                          <p className="text-xs text-slate-500">New Delhi, India • Last active 2h ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium h-9 px-3 rounded-lg">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
