import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/shared/Navbar";
import ConditionalFooter from "@/components/shared/ConditionalFooter";
import ScrollToTop from "@/components/shared/ScrollToTop";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Racoonn | Book Luxury Hotels, Resorts & Tour Packages",
    template: "%s | Racoonn",
  },
  description: "Find Your Perfect Stay & Holiday Tour Packages Effortlessly with Racoonn. Verified hotels, luxury resorts, cozy homestays, and curated itineraries.",
  keywords: [
    "hotel booking",
    "luxury resorts",
    "holiday packages",
    "tour packages India",
    "homestays in Uttarakhand",
    "Racoonn stays",
    "vacation rentals",
    "travel packages",
    "weekend getaways",
  ],
  authors: [{ name: "Racoonn Hospitality" }],
  creator: "Racoonn",
  publisher: "Racoonn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Racoonn",
    title: "Racoonn | Book Luxury Hotels, Resorts & Tour Packages",
    description: "Discover boutique stays, luxury resorts, and curated holiday packages across top destinations in India.",
    images: [
      {
        url: "/icon.jpg",
        width: 1200,
        height: 630,
        alt: "Racoonn - Hotel Booking & Holiday Packages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Racoonn | Book Luxury Hotels, Resorts & Tour Packages",
    description: "Discover boutique stays, luxury resorts, and curated holiday packages with Racoonn.",
    images: ["/icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
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
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-68XYEXQF98"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-68XYEXQF98');
          `}
        </Script>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T28N6CBN');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T28N6CBN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <QueryProvider>
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <ConditionalFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
