"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-heading font-bold text-secondary">My Profile</h2>
        <p className="text-slate-500 mt-1">Manage your personal information and credentials.</p>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-slate-50">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">VD</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-sm ring-2 ring-white">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center">JPG, GIF or PNG. Max size of 800K</p>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@luxuryresort.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Property Owner" disabled className="bg-slate-50 text-slate-500" />
              </div>
              
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button variant="outline" className="border-slate-200 text-slate-600">Cancel</Button>
                <Button className="bg-primary text-white">Save Changes</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
