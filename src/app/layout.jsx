import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PublicNavbar, PublicFooter } from "../components/shared/PublicChrome";
import LocationPickerModal from "../components/shared/LocationPickerModal";
import AuthInitializer from "../components/shared/AuthInitializer";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata = {
  title: {
    default: "GharYahan — Rental Homes in Lahore",
    template: "%s | GharYahan",
  },
  description:
    "Find rental houses, portions, flats, and rooms in your exact Lahore neighbourhood. Direct WhatsApp contact with landlords. No agent fees.",
  keywords: [
    "rent lahore",
    "portion for rent lahore",
    "house for rent singhpura",
    "bhagwanpura rent",
    "gulberg flats for rent",
    "hyperlocal rental pakistan",
    "gharyahan",
  ],
  authors: [{ name: "GharYahan" }],
  openGraph: {
    title: "GharYahan — Rental Homes in Lahore",
    description:
      "Find rental houses, portions, flats, and rooms near your exact street. Direct WhatsApp contact. No agent fees.",
    type: "website",
    locale: "en_PK",
    url: "https://gharyahan.com",
    siteName: "GharYahan",
  },
  twitter: {
    card: "summary_large_image",
    title: "GharYahan — Rental Homes in Lahore",
    description: "Find rental houses, portions, flats, and rooms in your exact Lahore neighbourhood.",
  },
  alternates: {
    canonical: "https://gharyahan.com",
  },
};

export default function RootLayout({ children }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GharYahan",
    url: "https://gharyahan.com",
    logo: "https://gharyahan.com/logo.png",
    description: "Hyperlocal rental marketplace for Lahore, Pakistan connecting tenants with landlords.",
  };

  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
        {/* Skip navigation link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:text-sm focus:font-bold focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>

        <Toaster position="top-center" richColors />
        <AuthInitializer />

        {/*
          PublicNavbar renders the sticky top nav on public routes only.
          On /dashboard/** and /admin/** it returns null — those routes
          render their own sidebar chrome via their own layout.jsx.
        */}
        <PublicNavbar />

        {/* Page content — flex-1 fills the viewport on all routes */}
        <div className="flex-1 flex flex-col pb-16 md:pb-0">
          {children}
        </div>

        {/*
          PublicFooter renders Footer + MobileNav on public routes only.
          Returns null on /dashboard/** and /admin/**.
        */}
        <PublicFooter />

        <LocationPickerModal />
      </body>
    </html>
  );
}
