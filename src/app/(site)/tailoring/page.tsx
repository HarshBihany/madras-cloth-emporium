import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Custom Tailoring — Blouses, Suits, Kurtas & Menswear",
  description: "Request custom stitching for saree blouses, salwar suits, kurtas, shirts, trousers and suits with fabric from Madras Cloth Emporium, Chas, Bokaro.",
  alternates: { canonical: "/tailoring" },
};

export default async function TailoringPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const product = typeof sp.product === "string" ? sp.product.slice(0, 120).replace(/[^a-z0-9-]/gi, "") : "";
  return (
    <>
      <PageHero
        eyebrow="Custom tailoring"
        title={
          <>
            Cloth, <em className="text-maroon">made yours</em>.
          </>
        }
        intro="Choose fabric from our counters — or bring your own — and we'll arrange stitching for blouses, suits, kurtas, shirts, trousers and menswear. Share your measurements on WhatsApp or visit us to be measured."
        art={{ pattern: "floral", colors: ["#2b3a67", "#f7f1e5", "#c9a227"], shape: "kurti" }}
      />
      <section className="py-16 sm:py-20" aria-labelledby="tailor-form">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Tailoring request</p>
            <h2 id="tailor-form" className="mt-3 text-4xl sm:text-5xl">
              Describe your <em className="text-maroon">design</em>.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-charcoal-soft">
              <li>• Stitching charges and timelines are confirmed after we see the design and fabric.</li>
              <li>• Reference photos are welcome — send them on WhatsApp after submitting.</li>
              <li>• For weddings, request early so trials can be scheduled.</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-sand bg-white/60 p-6 sm:p-9 lg:col-span-8">
            <EnquiryForm type="tailoring" submitLabel="Send tailoring request" defaults={product ? { product, fabric: "I'll buy fabric from you" } : {}} />
          </div>
        </div>
      </section>
    </>
  );
}
