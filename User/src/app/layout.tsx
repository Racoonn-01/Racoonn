import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/shared/Navbar";
import ConditionalFooter from "@/components/shared/ConditionalFooter";
import PromoPopup from "@/components/shared/PromoPopup";
import ScrollToTop from "@/components/shared/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Racoonn - Hotel Booking",
  description: "Find Your Perfect Stay, Effortlessly with Racoonn.",
};

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
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <ConditionalFooter />
          <PromoPopup />
        </QueryProvider>
      </body>
    </html>
  );
}
