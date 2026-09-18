import { ShieldCheck, CheckCircle2, Building, MessageSquareCode, BadgeDollarSign } from "lucide-react";

export default function TrustPartners() {
  const TRUST_ITEMS = [
    {
      Icon: ShieldCheck,
      title: "100% Verified Landlords",
      subtitle: "CNIC & Ownership Vetted",
    },
    {
      Icon: MessageSquareCode,
      title: "Direct WhatsApp",
      subtitle: "Official Business Routing",
    },
    {
      Icon: BadgeDollarSign,
      title: "0% Brokerage Commission",
      subtitle: "Direct Tenant-Owner Deal",
    },
    {
      Icon: Building,
      title: "10+ Lahore Mohallas",
      subtitle: "Hyperlocal Street Coverage",
    },
    {
      Icon: CheckCircle2,
      title: "Live Deal Status",
      subtitle: "No Wasted Visits",
    },
  ];

  return (
    <section className="py-8 border-y border-border/80 bg-surface/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted">
            Trusted Hyperlocal Rental Ecosystem in Lahore
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {TRUST_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/60 hover:border-primary/40 transition-colors shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
                <item.Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-foreground truncate">{item.title}</div>
                <div className="text-[10px] text-muted truncate">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
