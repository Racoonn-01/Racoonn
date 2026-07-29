"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Eye, EyeOff, Sparkles, AlertTriangle, Check, Search, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export interface PopularStaySection {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  isActive: boolean;
  order: number;
  propertyIds?: string[];
}

export interface AvailableProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  image: string;
}

const STORAGE_KEY = "racoonn_cms_popular_stays_sections_v3";

export default function PopularStaysCMSPage() {
  const [sections, setSections] = useState<PopularStaySection[]>([]);
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([]);
  const [propSearch, setPropSearch] = useState("");
  const [isLoadingProps, setIsLoadingProps] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PopularStaySection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [titleInput, setTitleInput] = useState("");
  const [subtitleInput, setSubtitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  // Fetch Available Properties from Appwrite DB via API
  useEffect(() => {
    async function fetchProperties() {
      setIsLoadingProps(true);
      try {
        const res = await fetch("/api/cms/properties");
        const json = await res.json();
        if (json.success && Array.isArray(json.properties)) {
          setAvailableProperties(json.properties);
        }
      } catch (err) {
        console.error("Failed to load properties for CMS:", err);
      } finally {
        setIsLoadingProps(false);
      }
    }
    fetchProperties();
  }, []);

  // Fetch CMS sections from Appwrite DB
  useEffect(() => {
    async function loadCMSSections() {
      try {
        const res = await fetch("/api/cms/popular-stays");
        const json = await res.json();
        if (json.success && Array.isArray(json.sections)) {
          setSections(json.sections);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.sections));
        }
      } catch (err) {
        console.error("Failed to load CMS sections from DB:", err);
      }
    }
    loadCMSSections();
  }, []);

  // Save to Appwrite DB & localStorage & Broadcast
  const saveSections = async (newSections: PopularStaySection[]) => {
    setSections(newSections);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      window.dispatchEvent(new Event("cms_popular_stays_updated"));

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("racoonn_cms_channel");
        bc.postMessage({ type: "POPULAR_STAYS_UPDATED", data: newSections });
        bc.close();
      }

      await fetch("/api/cms/popular-stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: newSections }),
      });
    } catch (err) {
      console.error("Failed to save CMS sections:", err);
    }
  };

  const toggleSelectProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    setTitleInput("");
    setSubtitleInput("");
    setLocationInput("");
    setSelectedPropertyIds([]);
    setPropSearch("");
    setIsAddOpen(true);
  };

  const handleCreate = () => {
    if (!titleInput.trim()) return;

    const newSec: PopularStaySection = {
      id: `sec-${Date.now()}`,
      title: titleInput.trim(),
      subtitle: subtitleInput.trim() || "Handpicked popular stays for your getaway.",
      location: locationInput.trim() || "All",
      isActive: true,
      order: sections.length + 1,
      propertyIds: selectedPropertyIds,
    };

    saveSections([...sections, newSec]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (sec: PopularStaySection) => {
    setEditingSection(sec);
    setTitleInput(sec.title);
    setSubtitleInput(sec.subtitle);
    setLocationInput(sec.location);
    setSelectedPropertyIds(sec.propertyIds || []);
    setPropSearch("");
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingSection || !titleInput.trim()) return;

    const updated = sections.map((sec) =>
      sec.id === editingSection.id
        ? {
            ...sec,
            title: titleInput.trim(),
            subtitle: subtitleInput.trim(),
            location: locationInput.trim() || "All",
            propertyIds: selectedPropertyIds,
          }
        : sec
    );

    saveSections(updated);
    setIsEditOpen(false);
    setEditingSection(null);
  };

  const handleToggleActive = (id: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, isActive: !sec.isActive } : sec
    );
    saveSections(updated);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const updated = sections.filter((sec) => sec.id !== deletingId);
    saveSections(updated);
    setDeletingId(null);
  };

  const filteredAvailableProps = availableProperties.filter(
    (p) =>
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-rose-500" size={28} /> Popular Stays CMS
          </h1>
          <p className="text-gray-500 mt-1">
            Manage, create, edit, or remove Popular Stays sections displayed on the homepage.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md gap-2 font-semibold"
        >
          <Plus size={18} /> Add New Section
        </Button>
      </div>

      {/* Sections List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <Card
            key={section.id}
            className={`border rounded-2xl shadow-sm transition-all overflow-hidden ${
              section.isActive ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50/70 opacity-75"
            }`}
          >
            <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100 flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={section.isActive ? "default" : "secondary"} className="rounded-md">
                    Section #{index + 1}
                  </Badge>
                  {section.location && (
                    <Badge variant="outline" className="gap-1 border-rose-200 text-rose-700 bg-rose-50">
                      <MapPin size={12} /> {section.location}
                    </Badge>
                  )}
                  {section.propertyIds && section.propertyIds.length > 0 && (
                    <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-700 bg-emerald-50">
                      <Building size={12} /> {section.propertyIds.length} Selected Stays
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold mt-2 text-gray-900">{section.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">{section.subtitle}</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={section.isActive}
                  onCheckedChange={() => handleToggleActive(section.id)}
                  title={section.isActive ? "Hide Section" : "Show Section"}
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 flex items-center justify-between bg-white pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                {section.isActive ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Eye size={14} /> Visible on Homepage
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 font-semibold">
                    <EyeOff size={14} /> Hidden from Homepage
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(section)}
                  className="rounded-lg gap-1 hover:bg-gray-100 text-gray-700 font-semibold"
                >
                  <Edit2 size={14} /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletingId(section.id)}
                  className="rounded-lg gap-1 font-semibold"
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center bg-gray-50">
            <Sparkles className="mx-auto text-gray-400 mb-3" size={36} />
            <h3 className="text-lg font-bold text-gray-700">No Popular Stays Sections Uploaded</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Click "Add New Section" above to upload custom popular stay sections for your website homepage.
            </p>
            <Button
              onClick={handleOpenAdd}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow"
            >
              Add New Section
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Upload / Create Section */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold">Upload Popular Stays Section</DialogTitle>
            <DialogDescription>
              Create a new highlighted stays section and choose which popular stays to feature.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-900">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Section Title *
              </label>
              <Input
                placeholder="e.g. Popular Stays in Nainital"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Subtitle
              </label>
              <Input
                placeholder="e.g. Discover highly rated properties with beautiful views."
                value={subtitleInput}
                onChange={(e) => setSubtitleInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Filter by City / Location
              </label>
              <Input
                placeholder="e.g. Nainital or Dehradun or Mussoorie"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Select Popular Stays / Properties Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Select Popular Stays ({selectedPropertyIds.length} Selected)
                </label>
                {selectedPropertyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPropertyIds([])}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Search property input */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search vendor stays to feature..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                />
              </div>

              {/* Properties Grid Selector */}
              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-2xl p-2 bg-gray-50/50">
                {isLoadingProps ? (
                  <p className="text-xs text-gray-500 p-4 text-center">Loading properties from Appwrite...</p>
                ) : filteredAvailableProps.length === 0 ? (
                  <p className="text-xs text-gray-500 p-4 text-center">No matching properties found.</p>
                ) : (
                  filteredAvailableProps.map((prop) => {
                    const isSelected = selectedPropertyIds.includes(prop.id);
                    return (
                      <div
                        key={prop.id}
                        onClick={() => toggleSelectProperty(prop.id)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/60 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                          <Image src={prop.image} alt={prop.title} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{prop.title}</h4>
                          <p className="text-[11px] text-gray-500 truncate">{prop.location}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-rose-600 border-rose-600 text-white" : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!titleInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
            >
              Upload Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Section */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold">Edit Popular Stays Section</DialogTitle>
            <DialogDescription>Update section details and selected stays.</DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-900">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Section Title *
              </label>
              <Input
                placeholder="Section Title"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Subtitle
              </label>
              <Input
                placeholder="Subtitle"
                value={subtitleInput}
                onChange={(e) => setSubtitleInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Filter by City / Location
              </label>
              <Input
                placeholder="Location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Select Popular Stays / Properties Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Select Popular Stays ({selectedPropertyIds.length} Selected)
                </label>
                {selectedPropertyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPropertyIds([])}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search vendor stays to feature..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-2xl p-2 bg-gray-50/50">
                {isLoadingProps ? (
                  <p className="text-xs text-gray-500 p-4 text-center">Loading properties from Appwrite...</p>
                ) : filteredAvailableProps.length === 0 ? (
                  <p className="text-xs text-gray-500 p-4 text-center">No matching properties found.</p>
                ) : (
                  filteredAvailableProps.map((prop) => {
                    const isSelected = selectedPropertyIds.includes(prop.id);
                    return (
                      <div
                        key={prop.id}
                        onClick={() => toggleSelectProperty(prop.id)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/60 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                          <Image src={prop.image} alt={prop.title} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{prop.title}</h4>
                          <p className="text-[11px] text-gray-500 truncate">{prop.location}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-rose-600 border-rose-600 text-white" : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!titleInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Section */}
      <Dialog open={Boolean(deletingId)} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle size={22} /> Delete Section?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Popular Stays section? It will immediately be removed from the website homepage.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="ghost" onClick={() => setDeletingId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
