import Link from "next/link";
import { Building2, MapPin, Calculator, ShieldCheck, PhoneCall } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-secondary pb-24 md:pb-12 pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-foreground tracking-tight">
                  Ghar<span className="text-primary">Yahan</span>
                </span>
                <span className="block text-[10px] font-semibold text-muted uppercase tracking-wider">
                  گھر یہاں · Lahore Rentals
                </span>
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed max-w-sm">
              Pakistan&apos;s dedicated hyperlocal rental marketplace. Connecting tenants directly with landlords across Lahore with 0% broker commission, verified utilities, and real-time deal status.
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-primary pt-1">
              <span className="inline-flex items-center gap-1.5 bg-primary-light px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                100% Verified Mohallas
              </span>
              <span className="inline-flex items-center gap-1.5 bg-accent-light px-3 py-1 rounded-full text-amber-900">
                <PhoneCall className="h-3.5 w-3.5 text-amber-800" />
                Direct WhatsApp
              </span>
            </div>
          </div>

          {/* Quick Mohallas */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Popular Mohallas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?area=Gulberg" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> Gulberg (II & III)
                </Link>
              </li>
              <li>
                <Link href="/search?area=DHA" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> DHA Lahore (Ph 1-6)
                </Link>
              </li>
              <li>
                <Link href="/search?area=Johar+Town" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> Johar Town (G & R)
                </Link>
              </li>
              <li>
                <Link href="/search?area=Model+Town" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> Model Town Blocks
                </Link>
              </li>
              <li>
                <Link href="/search?area=Singhpura" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> Singhpura / GT Road
                </Link>
              </li>
              <li>
                <Link href="/search?area=Allama+Iqbal+Town" className="hover:text-primary transition-colors flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted" /> Iqbal Town
                </Link>
              </li>
            </ul>
          </div>

          {/* Rental Types */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Rental Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?type=portion" className="hover:text-primary transition-colors">
                  Upper & Lower Portions
                </Link>
              </li>
              <li>
                <Link href="/search?type=house" className="hover:text-primary transition-colors">
                  Independent Houses
                </Link>
              </li>
              <li>
                <Link href="/search?type=flat" className="hover:text-primary transition-colors">
                  Flats & Apartments
                </Link>
              </li>
              <li>
                <Link href="/search?type=room" className="hover:text-primary transition-colors">
                  Rooms & Hostels
                </Link>
              </li>
              <li>
                <Link href="/search?status=vacancy_only" className="hover:text-primary transition-colors">
                  Upcoming Vacancies
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Landlords */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Tenant & Landlord Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#calculator" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-primary">
                  <Calculator className="h-3 w-3" /> Rent Calculator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-primary transition-colors font-medium">
                  List Property (Free)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Landlord Portal
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-primary transition-colors">
                  Saved Shortlists
                </Link>
              </li>
              <li>
                <Link href="/tenant" className="hover:text-primary transition-colors">
                  Tenant Management
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <p>© {new Date().getFullYear()} GharYahan. Built with pride for Lahore, Pakistan.</p>
            <p className="flex items-center gap-1 font-medium">
              Powered by{" "}
              <a 
                href="https://muhammadanzamuneebkhan.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark hover:underline font-bold transition-colors"
              >
                Anza Muneeb Khan
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 font-medium">
            <span>Zero Broker Commission</span>
            <span className="hidden sm:inline">·</span>
            <span>Real-time Deals</span>
            <span className="hidden sm:inline">·</span>
            <span>Direct WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
