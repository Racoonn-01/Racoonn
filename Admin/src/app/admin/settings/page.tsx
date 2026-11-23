"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground mt-1">Configure global platform preferences, integrations, and branding.</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Basic configuration for the Racoonn platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="Racoonn" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" defaultValue="support@racoonn.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="UTC" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Default language and currency settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Base Currency</Label>
                <Input id="currency" defaultValue="INR (₹)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Primary Language</Label>
                <Input id="language" defaultValue="English (US)" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding Assets</CardTitle>
              <CardDescription>Manage logos and brand colors used across the app and emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Primary Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-48 bg-slate-100 rounded-md border flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Logo.png</span>
                  </div>
                  <Button variant="outline">Change Logo</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Primary Color</Label>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-[#E86A70] border"></div>
                  <Input defaultValue="#E86A70" className="w-32 font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Configure Stripe and PayPal keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Stripe Public Key</Label>
                <Input type="password" defaultValue="pk_test_123456789" />
              </div>
              <div className="grid gap-2">
                <Label>Stripe Secret Key</Label>
                <Input type="password" defaultValue="sk_test_123456789" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible system actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-destructive">Purge Cache</h4>
                  <p className="text-sm text-muted-foreground">Clear all Redis and CDN caches immediately.</p>
                </div>
                <Button variant="destructive">Purge Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
