import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";


import { TooltipProvider } from "@/components/ui/tooltip";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Racoonn Super Admin Portal",
  description: "Enterprise SaaS Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} antialiased light`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans bg-background text-foreground" suppressHydrationWarning>
        <TooltipProvider delay={300}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
