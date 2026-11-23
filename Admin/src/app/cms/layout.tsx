import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CMSSidebar } from "@/components/layout/CMSSidebar"
import { CMSNavbar } from "@/components/layout/CMSNavbar"

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <CMSSidebar />
      <SidebarInset>
        <CMSNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
