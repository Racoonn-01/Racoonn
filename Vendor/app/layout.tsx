import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vendor Dashboard | Racoonn",
  description: "Manage your properties and bookings seamlessly.",
};

import { Toaster } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AuthGuard>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
        </AuthGuard>
      </body>
    </html>
  );
}
