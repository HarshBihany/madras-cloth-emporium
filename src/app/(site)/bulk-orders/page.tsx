import type { Metadata } from "next";
import { Building2, GraduationCap, PartyPopper, Ruler } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Bulk Orders & Uniform Fabric Quotations",
  description:
    "Request a quotation for school and office uniform fabric, gifting sarees, dress materials and stitching in quantity from Madras Cloth Emporium, Chas, Bokaro.",
  alternates: { canonical: "/bulk-orders" },
};

export default function BulkPage() {
  return (
    <>
      <PageHero
        eyebrow="Bulk & uniform orders"
        title={
          <>
            Quantity, with <em className="text-maroon">consistency</em>.
          </>
        }
        intro="Schools, offices, hospitals, events and family functions — share what you need and we'll prepare a written quotation with fabric options, shade matching and timelines."
        art={{ pattern: "pinstripe", colors: ["#1d2a44", "#c8c8c8", "#c9a45a"], shape: "bolt" }}
      />
      <section className="container-x py-16 sm:py-20">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [GraduationCap, "Schools & colleges", "Shirting and suiting for uniforms, matched across batches."],
            [Building2, "Offices & institutions", "Staff uniforms, corporate gifting and festive orders."],
            [PartyPopper, "Events & weddings", "Gifting sarees and coordinated family outfits."],
            [Ruler, "Tailors & retailers", "Fabric by the metre in quantity — ask about trade quotations."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Ruler;
            return (
              <li key={t as string} data-reveal>
                <I className="h-8 w-8 text-gold-deep" strokeWidth={1.3} aria-hidden />
                <h2 className="mt-4 text-2xl">{t as string}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{d as string}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="border-t border-sand bg-cream/60 py-16 sm:py-20" aria-labelledby="bulk-form">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Request a quotation</p>
            <h2 id="bulk-form" className="mt-3 text-4xl sm:text-5xl">
              What do you <em className="text-maroon">need</em>?
            </h2>
            <p className="mt-4 text-charcoal-soft">
              Quotations are prepared individually and depend on fabric, quantity and timelines. We&apos;ll contact you to confirm details and share swatches.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-sand bg-ivory p-6 sm:p-9 lg:col-span-8">
            <EnquiryForm type="bulk" submitLabel="Request quotation" />
          </div>
        </div>
      </section>
    </>
  );
}
