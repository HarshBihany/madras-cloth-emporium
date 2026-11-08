import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { business, fullAddress, mapsDirectionsUrl, mapsEmbedUrl, whatsappUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Visit & Contact — Bypass Road, Chas, Bokaro",
  description: `Visit ${business.name} on Bypass Road, Chas, Bokaro. WhatsApp ${business.phoneDisplay}, email ${business.email}, or send an enquiry online.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-x pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">Visit & contact</p>
      <h1 className="mt-3 text-5xl sm:text-6xl lg:text-7xl">
        We&apos;d love to <em className="text-maroon">hear from you</em>.
      </h1>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <a href={whatsappUrl("Hello Madras Cloth Emporium!")} target="_blank" rel="noopener noreferrer" className="card-lift rounded-3xl bg-[#1f7a4d] p-6 text-white">
          <WhatsAppIcon className="h-7 w-7" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/80">WhatsApp — fastest</p>
          <p className="mt-1 font-display text-2xl">{business.phoneDisplay}</p>
        </a>
        <a href={`tel:${business.phoneTel}`} className="card-lift rounded-3xl border border-sand bg-white/60 p-6">
          <Phone className="h-7 w-7 text-gold-deep" aria-hidden />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-stone">Call</p>
          <p className="mt-1 font-display text-2xl">{business.phoneDisplay}</p>
        </a>
        <a href={`mailto:${business.email}`} className="card-lift rounded-3xl border border-sand bg-white/60 p-6">
          <Mail className="h-7 w-7 text-gold-deep" aria-hidden />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-stone">Email</p>
          <p className="mt-1 break-all font-display text-xl">{business.email}</p>
        </a>
        <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="card-lift rounded-3xl border border-sand bg-white/60 p-6">
          <MapPin className="h-7 w-7 text-gold-deep" aria-hidden />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-stone">Directions</p>
          <p className="mt-1 font-display text-xl">{fullAddress}</p>
        </a>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="contact-form">
          <h2 id="contact-form" className="text-4xl">
            Send an enquiry
          </h2>
          <p className="mt-2 text-charcoal-soft">Questions about a product, delivery, an exchange or anything else — we reply on WhatsApp or email.</p>
          <div className="mt-8 rounded-[1.75rem] border border-sand bg-white/60 p-6 sm:p-8">
            <EnquiryForm type="contact" submitLabel="Send enquiry" />
          </div>
        </section>
        <section className="lg:col-span-5" aria-labelledby="map-title">
          <h2 id="map-title" className="text-4xl">
            Find us
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-charcoal-soft">
            <Clock className="h-4 w-4 text-gold-deep" aria-hidden />
            {business.hours ?? "Please call or WhatsApp to confirm today's timings."}
          </p>
          <div className="relative mt-8 aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-sand bg-cream sm:aspect-square lg:aspect-[4/5]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <MapPin className="h-8 w-8 text-gold-deep" aria-hidden />
              <p className="font-display text-2xl">{fullAddress}</p>
            </div>
            <iframe title={`Map: ${business.name}, ${fullAddress}`} src={mapsEmbedUrl} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-5 w-full">
            Open directions in Google Maps
          </a>
        </section>
      </div>
    </div>
  );
}
