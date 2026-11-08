import type { Metadata } from "next";
import { CalendarHeart, Gift, Palette, Scissors } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { whatsappUrl } from "@/lib/config";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

export const metadata: Metadata = {
  title: "Wedding Shopping Consultation in Chas, Bokaro",
  description:
    "Plan bridal sarees, family outfits, gifting sarees and groom's suiting in one unhurried consultation at Madras Cloth Emporium, Bypass Road, Chas — in store or on WhatsApp video.",
  alternates: { canonical: "/wedding" },
};

export default function WeddingPage() {
  return (
    <>
      <PageHero
        eyebrow="Wedding consultation"
        title={
          <>
            The whole wedding, <em className="text-maroon">one counter</em>.
          </>
        }
        intro="From the bride's sarees to the groom's bandhgala fabric, gifting sarees for relatives and suits for the sangeet — tell us about your celebration, and we'll prepare a selection before you arrive."
        art={{ pattern: "jaal", colors: ["#9b1b30", "#d9c08a", "#c9a45a"], shape: "saree" }}
      >
        <a href={whatsappUrl("Hello! We'd like to plan our wedding shopping with you.")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <WhatsAppIcon className="h-5 w-5" /> Start on WhatsApp
        </a>
      </PageHero>

      <section className="container-x py-16 sm:py-20" aria-label="How the consultation works">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [CalendarHeart, "Share your dates", "Ceremonies, colours and family members — we plan around your calendar."],
            [Palette, "A curated selection", "We set aside sarees, suits and fabrics in your colours and budget."],
            [Gift, "Gifting in quantity", "Matching or graded gifting sarees for relatives, packed for the occasion."],
            [Scissors, "Stitching arranged", "Blouses, suits and the groom's outfit — tailoring coordinated for you."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof CalendarHeart;
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

      <section className="border-t border-sand bg-cream/60 py-16 sm:py-20" aria-labelledby="wedding-form">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Book a consultation</p>
            <h2 id="wedding-form" className="mt-3 text-4xl sm:text-5xl">
              Tell us about <em className="text-maroon">your day</em>.
            </h2>
            <p className="mt-4 text-charcoal-soft">There&apos;s no charge for a consultation. We&apos;ll reply on WhatsApp to fix a convenient time.</p>
          </div>
          <div className="rounded-[1.75rem] border border-sand bg-ivory p-6 sm:p-9 lg:col-span-8">
            <EnquiryForm type="wedding" submitLabel="Request consultation" />
          </div>
        </div>
      </section>
    </>
  );
}
