import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { NAV, SERVICES_NAV } from "./nav";
import { business, fullAddress, mapsDirectionsUrl, whatsappUrl } from "@/lib/config";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-maroon-ink text-ivory/80">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-gold/20" />
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full border border-gold/10" />
      <div className="container-x relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/70">
              A family clothing house on Bypass Road, Chas — sarees, suits, kurtis and tailoring fabrics, chosen with care since{" "}
              {business.established}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light !min-h-10 !px-4 !py-2">
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
              <a href={`mailto:${business.email}`} className="btn btn-ghost-light !min-h-10 !px-4 !py-2">
                <Mail className="h-4 w-4" aria-hidden /> Email
              </a>
            </div>
          </div>

          <nav aria-label="Collections" className="lg:col-span-2">
            <h2 className="eyebrow !text-gold-light">Collections</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-underline hover:text-ivory">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className="eyebrow !text-gold-light">Services</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {SERVICES_NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-underline hover:text-ivory">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/track" className="link-underline hover:text-ivory">
                  Track an order
                </Link>
              </li>
              <li>
                <Link href="/policies" className="link-underline hover:text-ivory">
                  Shipping, returns & privacy
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow !text-gold-light">Visit the emporium</h2>
            <address className="mt-5 space-y-4 text-sm not-italic">
              <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-ivory">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden />
                <span>{fullAddress}</span>
              </a>
              <a href={`tel:${business.phoneTel}`} className="flex gap-3 hover:text-ivory">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden />
                {business.phoneDisplay}
              </a>
              <a href={`mailto:${business.email}`} className="flex gap-3 break-all hover:text-ivory">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden />
                {business.email}
              </a>
            </address>
          </div>
        </div>

        <div className="gold-rule mt-14 opacity-50" />
        <div className="mt-6 flex flex-col gap-3 text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. Est. {business.established}, Chas, Bokaro.
          </p>
          <p>Products marked “Demo” are illustrative listings, not current stock.</p>
        </div>
      </div>
    </footer>
  );
}
