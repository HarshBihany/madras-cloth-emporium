import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FabricArt } from "@/components/fabric/FabricArt";
import { business, yearsSince } from "@/lib/config";

export const metadata: Metadata = {
  title: "Our Heritage — A Family Emporium Since 1970",
  description: `${business.name} has served families from Bypass Road, Chas, Bokaro since 1970 — sarees, suits, kurtis and fine fabrics, chosen with care.`,
  alternates: { canonical: "/heritage" },
};

/*
 * EDITORIAL NOTE FOR THE FAMILY:
 * This page deliberately avoids invented facts. Replace or extend the copy below with
 * your own story — founders' names, how the shop began, milestones, photos — so every
 * word on this page is true. Only the founding year (1970) and location are stated as fact.
 */
export default function HeritagePage() {
  const years = yearsSince();
  return (
    <>
      <section className="relative overflow-hidden bg-maroon-deep text-ivory">
        <div aria-hidden className="absolute inset-0 opacity-[0.08]">
          <FabricArt seed="heritage-hero" pattern="paisley" colors={["#4a0f1c", "#d9c08a", "#d9c08a"]} className="h-full w-full" />
        </div>
        <div className="container-x relative py-20 sm:py-28">
          <p className="eyebrow !text-gold-light">Our heritage</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">
            {years} years on <em className="text-gold-light">Bypass Road</em>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/75">
            Madras Cloth Emporium opened its doors in Chas in {business.established}. Since then, it has remained what it began as: a family
            business, built around the simple belief that good cloth should be seen, felt and chosen with care.
          </p>
        </div>
      </section>

      <section className="container-x grid gap-14 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative mx-auto w-[85%]">
            <div className="arch absolute -inset-3 border border-gold/50" />
            <div className="arch relative aspect-[4/5] overflow-hidden">
              <FabricArt seed="heritage-story" pattern="buti" colors={["#6e1a2b", "#d9c08a", "#c9a45a"]} shape="saree" className="h-full w-full" />
            </div>
          </div>
        </div>
        <div className="prose-mce lg:col-span-7">
          <h2>What hasn&apos;t changed</h2>
          <p>
            Families come to our counters for the moments that matter — wedding sarees, festival suits, school uniforms and the cloth for a
            first suit. We still unfold the fabric for you, drape the saree so you can see its fall, and cut each metre with care.
          </p>
          <p>
            Our shelves hold sarees, suits and dress materials, kurtis, and shirting and suiting fabrics for every occasion and budget —
            presented with care, priced to stay within reach.
          </p>
          <h2>What&apos;s new</h2>
          <p>
            This website brings our counters to your phone. Browse at your own pace, save favourites, and send your bag to us on WhatsApp — our
            team confirms availability, price and delivery personally, just as we would in the store. Pan-India delivery is available on request.
          </p>
          <h2>Our promise</h2>
          <ul>
            <li>Premium choice, presented with care — at prices that stay honest.</li>
            <li>Real advice from people who know cloth by touch.</li>
            <li>No pressure, no hidden charges: everything is confirmed with you first.</li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">
              Explore the collection <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Visit the store
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
