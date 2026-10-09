"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, Ban, Mail, Car, MapPin, Filter, UserPlus, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getAllCabs, CabOwnerData, getCabCategories, createCabCategory, updateCabCategory, deleteCabCategory, createCab, deleteCab, CabCategory } from "./actions"
import { Pencil, Trash2 } from "lucide-react"

export default function CabsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [cabs, setCabs] = useState<CabOwnerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMandatoryField, setNewMandatoryField] = useState("")
  const [mandatoryFields, setMandatoryFields] = useState<string[]>([])
  const [categories, setCategories] = useState<CabCategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CabCategory | null>(null)
  const [contactToDelete, setContactToDelete] = useState<{id: string, name: string} | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null)
  const [isAddCabOpen, setIsAddCabOpen] = useState(false)
  const [newCabData, setNewCabData] = useState({
    name: '', contactNo: '', location: '', category: ''
  })
  const [customData, setCustomData] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [cabsData, categoriesData] = await Promise.all([
          getAllCabs(),
          getCabCategories()
        ])
        setCabs(cabsData)
        const uniqueCategories = Array.from(new Map(categoriesData.map(c => [c.name, c])).values());
        setCategories(uniqueCategories)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddCab = async () => {
    if (!newCabData.name) return;
    
    // Optimistic UI update (optional, but good for UX)
    const tempCab: CabOwnerData = {
      id: Math.random().toString(),
      name: newCabData.name,
      contactNo: newCabData.contactNo,
      address: newCabData.location,
      category: newCabData.category,
      status: 'active',
      joined: new Date().toISOString(),
      customData: customData
    };
    
    // Update local state immediately
    setCabs(prev => [tempCab, ...prev])
    setIsAddCabOpen(false)
    setNewCabData({ name: '', contactNo: '', location: '', category: '' })
    setCustomData({})
    
    // Persist to database
    await createCab(tempCab);
  }

  const filteredCabs = cabs.filter(c => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    return matchesTab && matchesCategory;
  })

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Useful Contacts</h2>
          <p className="text-muted-foreground mt-1 text-lg">Manage useful contacts, service providers, and their details.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-11" />
          </div>
          <Button variant="outline" onClick={() => setIsAddCategoryOpen(true)} className="h-11 px-6 rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
            Add Category
          </Button>
          <Button variant="outline" onClick={() => setIsManageCategoriesOpen(true)} className="h-11 px-6 rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
            Manage Categories
          </Button>
          <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
            setIsAddCategoryOpen(open);
            if (!open) {
              setEditingCategory(null);
              setNewCategoryName("");
              setMandatoryFields([]);
            }
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="name" className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">
                    Name
                  </Label>
                  <Input id="name" autoComplete="off" className="flex-1" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                </div>

                <div className="pt-2 border-t mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Default Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {['Name', 'Contact no', 'Location'].map((field) => (
                      <Badge key={field} variant="outline" className="px-2.5 py-1 text-xs bg-slate-50 text-slate-500 border-slate-200">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                {mandatoryFields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mandatoryFields.map((field, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200">
                        {field}
                        <button 
                          type="button" 
                          onClick={() => setMandatoryFields(mandatoryFields.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-1 text-base leading-none"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Add Custom Field</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. GST Number" 
                      autoComplete="off"
                      value={newMandatoryField} 
                      onChange={(e) => setNewMandatoryField(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newMandatoryField.trim() && !mandatoryFields.includes(newMandatoryField.trim())) {
                            setMandatoryFields([...mandatoryFields, newMandatoryField.trim()]);
                            setNewMandatoryField("");
                          }
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => {
                        if (newMandatoryField.trim() && !mandatoryFields.includes(newMandatoryField.trim())) {
                          setMandatoryFields([...mandatoryFields, newMandatoryField.trim()]);
                          setNewMandatoryField("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" disabled={!newCategoryName.trim()} onClick={async () => {
                  if (newCategoryName.trim()) {
                    const name = newCategoryName.trim()
                    
                    // Optimistic update
                    if (editingCategory && editingCategory.id) {
                      if (categories.find(c => c.name === name && c.id !== editingCategory.id)) return;
                      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name, customFields: mandatoryFields } : c));
                      await updateCabCategory(editingCategory.id, name, mandatoryFields);
                    } else {
                      if (!categories.find(c => c.name === name)) {
                        setCategories([...categories, { name, customFields: mandatoryFields }]);
                      }
                      await createCabCategory(name, mandatoryFields);
                    }
                    setNewCategoryName("");
                    setIsAddCategoryOpen(false);
                    setMandatoryFields([]);
                    setNewMandatoryField("");
                    setEditingCategory(null);
                  }
                }}>{editingCategory ? "Update Category" : "Save Category"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-muted-foreground text-center">No categories found.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id || cat.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.customFields.length} custom fields</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                            setMandatoryFields([...cat.customFields]);
                            setIsManageCategoriesOpen(false);
                            setIsAddCategoryOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (cat.id) {
                              setCategoryToDelete({ id: cat.id, name: cat.name })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => setIsAddCabOpen(true)} className="h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
            <UserPlus className="mr-2 h-5 w-5" /> Add Contact
          </Button>
          <Dialog open={isAddCabOpen} onOpenChange={setIsAddCabOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">Category</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={newCabData.category} 
                    onChange={e => {
                      setNewCabData({...newCabData, category: e.target.value});
                      setCustomData({});
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                {newCabData.category && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">Name</Label>
                      <Input placeholder="e.g. John Doe" className="flex-1" value={newCabData.name} onChange={e => setNewCabData({...newCabData, name: e.target.value})} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">Contact no</Label>
                      <Input placeholder="e.g. +91 98765..." className="flex-1" value={newCabData.contactNo} onChange={e => setNewCabData({...newCabData, contactNo: e.target.value})} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">Location</Label>
                      <Input placeholder="e.g. Mumbai" className="flex-1" value={newCabData.location} onChange={e => setNewCabData({...newCabData, location: e.target.value})} />
                    </div>
                  </>
                )}

                {/* Dynamic Fields */}
                {newCabData.category && categories.find(c => c.name === newCabData.category)?.customFields.map(field => (
                  <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label className="text-left font-semibold sm:w-28 shrink-0 text-slate-800">{field}</Label>
                    <Input 
                      placeholder={`e.g. ${field}`} 
                      className="flex-1" 
                      value={customData[field] || ''} 
                      onChange={e => setCustomData({...customData, [field]: e.target.value})} 
                    />
                  </div>
                ))}

              </div>
              <DialogFooter>
                <Button type="button" disabled={!newCabData.name.trim() || !newCabData.category} onClick={handleAddCab}>Save Contact</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contacts by name or detail..." className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-10" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex p-1 bg-muted/50 rounded-full">
              {['all', 'active', 'suspended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex items-center overflow-x-auto pb-4 pt-2 px-2 hide-scrollbar">
            <span className="text-sm font-semibold text-muted-foreground mr-6 shrink-0 tracking-wide">Categories:</span>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 ${
                  activeCategory === 'all' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 ${
                    activeCategory === cat.name 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold h-12">Name</TableHead>
                <TableHead className="font-semibold h-12">Contact no</TableHead>
                <TableHead className="font-semibold h-12">Location</TableHead>
                <TableHead className="font-semibold h-12">Additional Info</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="text-right font-semibold h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx} className="hover:bg-transparent">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCabs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCabs.map((cab) => (
                  <TableRow key={cab.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cab.name}&backgroundColor=0B1120`} alt={cab.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{cab.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{cab.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {cab.contactNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground max-w-50">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="truncate">{cab.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cab.category && <Badge variant="outline" className="mb-1 mr-1 bg-slate-50">{cab.category}</Badge>}
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {cab.customData && Object.entries(cab.customData).map(([key, value]) => (
                          value ? (
                            <span key={key} className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-full">
                              <span className="font-medium mr-1">{key}:</span>
                              {String(value)}
                            </span>
                          ) : null
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cab.status === 'active' ? 'default' : 'destructive'}
                        className={`
                          px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                          ${cab.status === 'active' && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'}
                          ${cab.status === 'suspended' && 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20'}
                        `}
                      >
                        {cab.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-muted/50">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer rounded-md">
                              <Mail className="mr-2 h-4 w-4" /> Contact Owner
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="cursor-pointer rounded-md">
                                <Car className="mr-2 h-4 w-4" /> Assign Category
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-40 rounded-xl border-muted/50">
                                  {categories.length === 0 ? (
                                    <DropdownMenuItem disabled className="text-muted-foreground text-xs">No categories found</DropdownMenuItem>
                                  ) : (
                                    categories.map(cat => (
                                      <DropdownMenuItem key={cat.name} className="cursor-pointer rounded-md">
                                        {cat.name}
                                      </DropdownMenuItem>
                                    ))
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 cursor-pointer rounded-md"
                              onClick={() => {
                                setContactToDelete({ id: cab.id, name: cab.name })
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" /> Delete Contact
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="p-4 border-t border-muted/30 bg-muted/5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to {filteredCabs.length} of {cabs.length} contacts</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4">Next</Button>
          </div>
        </div>
        <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-slate-600">Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (categoryToDelete) {
                  setCategories(categories.filter(c => c.id !== categoryToDelete.id));
                  await deleteCabCategory(categoryToDelete.id);
                  setCategoryToDelete(null);
                }
              }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-slate-600">Are you sure you want to delete the contact "{contactToDelete?.name}"? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (contactToDelete) {
                  setCabs(cabs.filter(c => c.id !== contactToDelete.id));
                  await deleteCab(contactToDelete.id);
                  setContactToDelete(null);
                }
              }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
