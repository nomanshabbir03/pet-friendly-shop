  import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';
import FloatingVeterinaryButton from '@/components/FloatingVeterinaryButton';
import AnnouncementBar from '@/components/AnnouncementBar';
import { getLiveCategories } from '@/lib/category-data';
import { getSiteSettings } from '@/lib/site-settings';
import "./globals.css";

const poppins = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pet’s Friendly Shop",
  description: "Pet’s Friendly Shop ecommerce storefront",
  icons: {
    icon: "/pets-friendly-logo.png",
    shortcut: "/pets-friendly-logo.png",
    apple: "/pets-friendly-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched once here (site-wide, every route) for the Navbar's "Category" mega-menu.
  // getLiveCategories() is wrapped in React's cache(), so when app/page.tsx also calls it for
  // the homepage's "Shop by category" grid, that reuses this same result instead of re-querying.
  const categories = await getLiveCategories();

  // Also fetched once here for the Footer and floating WhatsApp button — both are Client
  // Components, so the data is fetched in this Server Component and passed down as props
  // rather than each one fetching it client-side. getSiteSettings() is cache()-wrapped, so
  // other pages (Contact, order-confirmation, TrustBar) calling it again in the same request
  // reuse this same result.
  const siteSettings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <AnnouncementBar />
          <Navbar categories={categories} />
          <div className="flex-1">{children}</div>
          <Footer settings={siteSettings} />
          <FloatingVeterinaryButton />
          <FloatingWhatsAppButton whatsappNumber={siteSettings.whatsappNumber} />
        </CartProvider>
      </body>
    </html>
  );
}
