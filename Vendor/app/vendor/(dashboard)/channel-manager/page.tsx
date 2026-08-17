"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link as LinkIcon, RefreshCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ChannelManagerPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      try {
        const propsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          [Query.equal("vendorId", user.$id)]
        );
        setProperties(propsRes.documents);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [user]);

  const handleConnect = async (propertyId: string, cmPropertyId: string) => {
    if (!cmPropertyId.trim()) return toast.error("Channel Manager Property ID required");
    
    setIsSyncing(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.propertyCollectionId,
        propertyId,
        { cmPropertyId }
      );
      
      setProperties(prev => prev.map(p => 
        p.$id === propertyId ? { ...p, cmPropertyId } : p
      ));
      
      toast.success("Successfully connected to Channel Manager!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect property");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestSync = async () => {
    setIsSyncing(true);
    try {
      // Mock sync call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Sync completed successfully!");
    } catch {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading properties...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-heading font-black text-secondary tracking-tight">Channel Manager</h1>
          <p className="text-slate-500 mt-2 text-lg">Sync your properties with Booking.com, Airbnb, Agoda, and 100+ OTAs</p>
        </div>
        <Button 
          onClick={handleTestSync} 
          disabled={isSyncing}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20"
        >
          {isSyncing ? <RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
          Test Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-heading text-secondary">{property.name}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </div>
                  {property.cmPropertyId ? (
                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-bold border border-amber-200">
                      <Settings2 className="w-4 h-4 mr-2" />
                      Not Configured
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label className="text-secondary font-bold">Channex Property ID</Label>
                    <div className="flex gap-3">
                      <Input 
                        id={`cm-id-${property.$id}`}
                        placeholder="e.g. 12345678" 
                        defaultValue={property.cmPropertyId || ""}
                        className="bg-slate-50 border-slate-200 rounded-xl font-mono"
                      />
                      <Button 
                        onClick={() => {
                          const val = (document.getElementById(`cm-id-${property.$id}`) as HTMLInputElement).value;
                          handleConnect(property.$id, val);
                        }}
                        disabled={isSyncing}
                        className="rounded-xl bg-secondary text-white hover:bg-secondary/90"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">Enter the Property ID provided by your Channel Manager dashboard.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {properties.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-secondary mb-2">No properties found</h3>
            <p className="text-slate-500">You need to add a property before you can connect a Channel Manager.</p>
          </div>
        )}
      </div>
    </div>
  );
}
