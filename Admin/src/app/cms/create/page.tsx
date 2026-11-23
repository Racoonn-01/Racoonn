"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Bold, Italic, Link as LinkIcon, List, ListOrdered, Image as ImageIcon, Heading1, Heading2, Quote, Save, Eye, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CreatePage() {
  const [content, setContent] = useState("")

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-full">
            <Input 
              type="text" 
              placeholder="Page Title" 
              className="text-2xl font-bold border-0 shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-slate-300 w-full md:w-96" 
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto gap-2">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button className="w-full sm:w-auto gap-2">
            <Send className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="min-h-150 flex flex-col shadow-sm border-slate-200">
            {/* Toolbar */}
            <div className="border-b border-slate-100 p-2 flex flex-wrap gap-1 bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center border-r pr-1 mr-1 border-slate-200">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><Heading1 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><Heading2 className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center border-r pr-1 mr-1 border-slate-200">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><LinkIcon className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center border-r pr-1 mr-1 border-slate-200">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><ListOrdered className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><Quote className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600"><ImageIcon className="h-4 w-4" /></Button>
              </div>
            </div>
            
            {/* Writing Area */}
            <div className="p-4 flex-1">
              <textarea 
                className="w-full h-full min-h-125 resize-none outline-none text-slate-700 leading-relaxed bg-transparent"
                placeholder="Start writing your amazing content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center border rounded-md px-3 bg-slate-50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <span className="text-slate-400 text-sm">/</span>
                  <Input id="slug" placeholder="e.g. about-us" className="border-0 bg-transparent focus-visible:ring-0 px-1 shadow-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Parent Page</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(No Parent)</SelectItem>
                    <SelectItem value="about">About</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visibility</Label>
                  <p className="text-xs text-slate-500">Show in navigations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">SEO & Meta</CardTitle>
              <CardDescription>Optimize how this page appears in search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" placeholder="Page Title | Racoonn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta Description</Label>
                <textarea 
                  id="metaDesc" 
                  placeholder="A brief description of this page..."
                  className="w-full flex min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                ></textarea>
              </div>
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors">
                  <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to upload image</p>
                  <p className="text-xs text-slate-400 mt-1">1200 x 630px recommended</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
