import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Racoonn | Discover the Best Stays, Camps & Activities in Uttarakhand",
  description: "Racoonn is your ultimate platform to discover and book extraordinary hotels, luxury camps, homestays, and adventure activities across Uttarakhand and the majestic Himalayas. From Nainital to Rishikesh, Mussoorie, and Jim Corbett—prepare to explore like never before.",
  keywords: [
    "Uttarakhand tourism", "hotels in Uttarakhand", "camps in Rishikesh", "homestays in Nainital",
    "Jim Corbett resorts", "Mussoorie hotels", "Auli snow camps", "trekking in Uttarakhand",
    "Uttarakhand adventure activities", "book hotels Uttarakhand", "Himalayan travel",
    "Racoonn", "Racoonn travel", "Uttarakhand vacation", "Dehradun stays", "Kedarnath helicopter booking"
  ],
  authors: [{ name: "Racoonn" }, { name: "Preet Tech", url: "https://preettech.com" }],
  openGraph: {
    title: "Racoonn | Discover the Best Stays, Camps & Activities in Uttarakhand",
    description: "Your ultimate platform to discover and book extraordinary hotels, camps, and activities across Uttarakhand.",
    url: "https://racoonn.com",
    siteName: "Racoonn",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Racoonn | Discover the Best Stays, Camps & Activities in Uttarakhand",
    description: "Your ultimate platform to discover and book extraordinary hotels, camps, and activities across Uttarakhand.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
