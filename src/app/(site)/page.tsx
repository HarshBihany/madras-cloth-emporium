import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Phone, Mail, Scissors, Users, Sparkles } from "lucide-react";
import { FabricArt, shapeForCategory } from "@/components/fabric/FabricArt";
import { Monogram } from "@/components/site/Logo";
import { ProductCard } from "@/components/product/ProductCard";
import { MetreGuide } from "@/components/home/MetreGuide";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { getCategories, getCategoryCovers, getFeatured } from "@/lib/data/catalog";
import { business, fullAddress, mapsDirectionsUrl, mapsEmbedUrl, whatsappUrl, yearsSince } from "@/lib/config";

export const dynamic = "force-dynamic";

const MARQUEE = ["Silk", "Cotton", "Georgette", "Chiffon", "Chanderi", "Organza", "Linen", "Poly-Viscose", "Terry-Rayon", "Wool Blends", "Zari", "Bandhani", "Ikat"];

const TILE_LAYOUT: Record<string, string> = {
  sarees: "col-span-2 row-span-2 lg:col-span-5 lg:row-span-2 min-h-[30rem] lg:min-h-0",
  "suits-dress-materials": "col-span-2 sm:col-span-1 lg:col-span-4 min-h-[19rem]",
  kurtis: "col-span-2 sm:col-span-1 lg:col-span-3 min-h-[19rem]",
  "shirting-fabrics": "col-span-2 sm:col-span-1 lg:col-span-3 min-h-[19rem]",
  "suiting-fabrics": "col-span-2 sm:col-span-1 lg:col-span-4 min-h-[19rem]",
};

export default async function HomePage() {
  const [featured, cats, covers] = await Promise.all([getFeatured(8), getCategories(), getCategoryCovers()]);
  const anyDemo = featured.some((p) => p.isDemo);

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="grain relative overflow-hidden" aria-labelledby="hero-title">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-24 h-[34rem] w-[34rem] rounded-full bg-gold-pale/50 blur-3xl" />
        <div className="container-x relative grid items-center gap-14 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
          <div className="lg:col-span-6 xl:col-span-6">
            <p className="eyebrow flex animate-fade-up items-center gap-3">
              <span className="h-px w-10 bg-gold" aria-hidden />
              Bypass Road, Chas · Est. {business.established}
            </p>
            <h1
              id="hero-title"
              className="mt-6 animate-fade-up text-[3.1rem] leading-[0.95] text-charcoal [animation-delay:120ms] sm:text-7xl lg:text-[5.2rem] xl:text-[6rem]"
            >
              Woven into Bokaro&apos;s <em className="font-normal text-maroon">celebrations</em> since 1970.
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-charcoal-soft [animation-delay:240ms]">
              Sarees for the wedding, suits for the festival, cloth by the metre for your tailor — a family emporium that has
              spent {yearsSince()} years learning what Bokaro loves to wear. Premium choice, honest prices.
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:360ms]">
              <Link href="/shop" className="btn btn-primary">
                Explore the collection <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/wedding" className="btn btn-outline">
                Plan wedding shopping
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg animate-fade-up grid-cols-3 gap-4 sm:gap-6 border-t border-sand pt-7 [animation-delay:480ms]">
              {[
                ["Since", String(business.established)],
                ["Collections", "Five"],
                ["Delivery", "Pan-India*"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-stone">{k}</dt>
                  <dd className="mt-1 whitespace-nowrap font-display text-2xl text-maroon sm:text-3xl">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.7rem] text-stone">*On request — charges confirmed on WhatsApp.</p>
          </div>

          {/* Composition */}
          <div className="relative mx-auto w-full max-w-[34rem] lg:col-span-6 lg:max-w-none xl:pl-10" aria-hidden>
            <div className="relative ml-auto w-[80%] animate-fade-up [animation-delay:200ms]">
              <div className="arch absolute -inset-3 border border-gold/50" />
              <div className="arch relative aspect-[4/5] overflow-hidden bg-cream shadow-[0_60px_100px_-50px_rgba(46,9,17,0.6)]">
                <FabricArt seed="hero-saree" pattern="buti" colors={["#6e1a2b", "#d9c08a", "#c9a45a"]} shape="saree" className="h-full w-full" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-maroon-ink/40 to-transparent" />
              </div>
            </div>
            <div className="absolute -left-1 bottom-10 w-[38%] -rotate-6 animate-float sm:left-0">
              <div className="overflow-hidden rounded-2xl border-[6px] border-ivory shadow-2xl">
                <FabricArt seed="hero-shirting" pattern="checks" colors={["#efe4cf", "#9b1b30", "#1d2a44"]} shape="bolt" className="aspect-[4/5] w-full" />
              </div>
            </div>
            <div className="absolute -top-4 left-[8%] w-[27%] rotate-[5deg] animate-float-slow">
              <div className="overflow-hidden rounded-2xl border-[6px] border-ivory shadow-xl">
                <FabricArt seed="hero-kurti" pattern="floral" colors={["#2b3a67", "#f7f1e5", "#c9a227"]} shape="kurti" className="aspect-[4/5] w-full" />
              </div>
            </div>
            <div className="absolute -bottom-6 right-[-0.5rem] h-32 w-32 sm:h-36 sm:w-36">
              <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow text-maroon">
                <defs>
                  <path id="circle-text" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <circle cx="100" cy="100" r="98" fill="#fbf7f0" />
                <text fontSize="15.5" fontWeight="700" letterSpacing="5.2" fill="currentColor" fontFamily="var(--font-sans)">
                  <textPath href="#circle-text">MADRAS CLOTH EMPORIUM · SINCE 1970 ·</textPath>
                </text>
              </svg>
              <Monogram className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-maroon" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <div className="overflow-hidden border-y border-maroon-deep bg-maroon py-5 text-gold-pale" aria-hidden>
        <div className="flex w-max animate-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {MARQUEE.map((w) => (
                <span key={`${k}-${w}`} className="flex items-center font-display text-2xl italic sm:text-3xl">
                  <span className="px-7">{w}</span>
                  <span className="text-sm text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────────── COLLECTIONS ───────────── */}
      <section className="container-x py-20 sm:py-28" aria-labelledby="collections-title">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="collections-title"
            eyebrow="The collections"
            title={
              <>
                Five counters, <em className="text-maroon">one family</em>.
              </>
            }
          />
          <p className="max-w-md text-charcoal-soft lg:text-right" data-reveal>
            From six yards of silk to a metre and a half of crisp cotton — every piece chosen by people who know cloth by touch.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(17rem,auto)] grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-12">
          {cats.map((c, i) => {
            const cover = covers.get(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
                className={`group relative overflow-hidden rounded-[1.4rem] bg-maroon-ink ${TILE_LAYOUT[c.slug] ?? "col-span-2 lg:col-span-4 min-h-[19rem]"}`}
              >
                <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-silk)] group-hover:scale-[1.07]">
                  <FabricArt
                    seed={`cat-${c.slug}`}
                    pattern={cover?.artPattern ?? "buti"}
                    colors={cover?.artColors}
                    shape={i === 0 ? "saree" : "swatch"}
                    view={i === 0 ? "full" : "detail"}
                    className="h-full w-full"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-ink/95 via-maroon-ink/45 to-maroon-ink/5" />
                <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
                  <span className="font-display text-lg italic text-gold-light">0{i + 1}</span>
                  <div>
                    <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-gold-light">{c.tagline}</p>
                    <h3 className={`mt-2 text-ivory ${i === 0 ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"}`}>{c.name}</h3>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-sm text-ivory/75">
                        {c.productCount} {c.productCount === 1 ? "design" : "designs"}
                        {c.defaultSaleUnit === "metre" ? " · by the metre" : ""}
                      </span>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-all duration-500 group-hover:border-gold-light group-hover:bg-gold-light group-hover:text-maroon-ink">
                        <ArrowUpRight className="h-5 w-5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────── HERITAGE ───────────── */}
      <section className="relative overflow-hidden bg-maroon-deep py-20 text-ivory sm:py-28" aria-labelledby="heritage-title">
        <div aria-hidden className="absolute inset-0 opacity-[0.07]">
          <FabricArt seed="heritage-bg" pattern="jaal" colors={["#4a0f1c", "#d9c08a", "#d9c08a"]} className="h-full w-full" />
        </div>
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p aria-hidden className="text-outline-gold select-none font-display text-[8rem] leading-none sm:text-[12rem] lg:text-[15rem]">
              1970
            </p>
            <p className="mt-4 font-display text-2xl italic text-gold-light">The year the doors first opened on Bypass Road.</p>
          </div>
          <div className="lg:col-span-6">
            <SectionHeading
              light
              id="heritage-title"
              eyebrow="Our heritage"
              title={
                <>
                  A family counter, <em className="text-gold-light">built on trust</em>.
                </>
              }
              intro="In a town where families return to the same counter for weddings, school uniforms and festivals, trust is everything. Good cloth deserves to be seen, felt and chosen with care — so we unroll the bolt, drape the saree and measure the metre right in front of you."
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-3" data-reveal>
              {[
                ["Seen & felt", "Every saree draped, every bolt unrolled before you choose."],
                ["Honest pricing", "Premium presentation, everyday affordable prices."],
                ["Family service", "Advice for weddings, uniforms and tailoring."],
              ].map(([t, d]) => (
                <li key={t} className="border-t border-gold/40 pt-4">
                  <h3 className="font-display text-xl text-gold-pale">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/70">{d}</p>
                </li>
              ))}
            </ul>
            <Link href="/heritage" className="btn btn-ghost-light mt-10">
              Read our story <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURED ───────────── */}
      <section className="container-x py-20 sm:py-28" aria-labelledby="featured-title">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading id="featured-title" eyebrow="From the counters" title={<>Pieces we&apos;d show you <em className="text-maroon">first</em>.</>} />
          <Link href="/shop" className="btn btn-outline self-start sm:self-auto" data-reveal>
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {anyDemo && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-pale/60 px-4 py-2 text-xs font-medium text-gold-deep" data-reveal>
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Showing demonstration listings until the live catalogue is uploaded.
          </p>
        )}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 80}ms` }}>
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── METRE GUIDE ───────────── */}
      <section className="bg-cream py-20 sm:py-28" aria-labelledby="metre-title">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              id="metre-title"
              eyebrow="Shirting & suiting"
              title={
                <>
                  Cloth by the metre, <em className="text-maroon">cut to your plan</em>.
                </>
              }
              intro="Choose your shirting or suiting, tell us the metres, and take it to your tailor — or let ours stitch it. Fabric is cut in neat quarter-metre steps, so you only pay for what you need."
            />
            <div className="mt-8 grid grid-cols-2 gap-4" data-reveal>
              {(["shirting-fabrics", "suiting-fabrics"] as const).map((slug) => {
                const cover = covers.get(slug);
                return (
                  <Link key={slug} href={`/collections/${slug}`} className="group card-lift overflow-hidden rounded-2xl bg-ivory">
                    <div className="aspect-[5/4] overflow-hidden">
                      <FabricArt seed={`guide-${slug}`} pattern={cover?.artPattern ?? "twill"} colors={cover?.artColors} shape={shapeForCategory(slug)} className="h-full w-full transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <p className="flex items-center justify-between px-4 py-3 font-display text-xl">
                      {slug === "shirting-fabrics" ? "Shirting" : "Suiting"} <ArrowUpRight className="h-4 w-4 text-gold-deep" aria-hidden />
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div data-reveal>
            <MetreGuide />
          </div>
        </div>
      </section>

      {/* ───────────── SERVICES ───────────── */}
      <section className="container-x py-20 sm:py-28" aria-labelledby="services-title">
        <SectionHeading
          align="center"
          id="services-title"
          eyebrow="Beyond the counter"
          title={
            <>
              Help for the moments that <em className="text-maroon">matter</em>.
            </>
          }
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              href: "/wedding",
              icon: Sparkles,
              title: "Wedding consultation",
              body: "Bridal sarees, family outfits, gifting sarees and groom's suiting — planned together in one unhurried appointment.",
              cta: "Book a consultation",
              cls: "bg-maroon text-ivory",
              sub: "text-ivory/75",
              pattern: "jaal",
              colors: ["#6e1a2b", "#d9c08a", "#c9a45a"],
            },
            {
              href: "/bulk-orders",
              icon: Users,
              title: "Bulk & uniform orders",
              body: "Schools, offices, events and family functions — request a quotation for uniform fabric, gifting sarees or dress materials in quantity.",
              cta: "Request a quote",
              cls: "bg-charcoal text-ivory",
              sub: "text-ivory/70",
              pattern: "pinstripe",
              colors: ["#33302d", "#c8c8c8", "#c9a45a"],
            },
            {
              href: "/tailoring",
              icon: Scissors,
              title: "Custom tailoring",
              body: "Blouses, suits, kurtas, trousers and more — share your measurements and design ideas, and we'll arrange the stitching.",
              cta: "Request tailoring",
              cls: "bg-gold-pale text-maroon-ink",
              sub: "text-charcoal-soft",
              pattern: "buti",
              colors: ["#efe2c2", "#b08a43", "#6e1a2b"],
            },
          ].map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
              className={`group card-lift relative flex min-h-[26rem] flex-col overflow-hidden rounded-t-[12rem] rounded-b-[1.4rem] p-8 pt-24 ${s.cls}`}
            >
              <div aria-hidden className="absolute inset-x-0 top-0 h-48 opacity-30 transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,black_30%,transparent)] group-hover:opacity-50">
                <FabricArt seed={`svc-${s.href}`} pattern={s.pattern} colors={s.colors} view="detail" className="h-full w-full" />
              </div>
              <s.icon className="relative h-8 w-8" aria-hidden strokeWidth={1.3} />
              <h3 className="relative mt-6 text-3xl">{s.title}</h3>
              <p className={`relative mt-4 flex-1 leading-relaxed ${s.sub}`}>{s.body}</p>
              <span className="relative mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                {s.cta} <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── HOW ORDERING WORKS ───────────── */}
      <section className="border-y border-sand bg-ivory-deep py-20 sm:py-24" aria-labelledby="how-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="how-title" eyebrow="Ordering made personal" title={<>Shop online, <em className="text-maroon">talk to a person</em>.</>} />
          </div>
          <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {[
              ["Choose", "Add sarees, suits or fabric metres to your bag — browse at your own pace."],
              ["Send on WhatsApp", "Your order arrives with us as a ready message. No account, no app to install."],
              ["Confirm with us", "We confirm availability, final price, payment and delivery or store pickup with you directly."],
            ].map(([t, d], i) => (
              <li key={t} className="relative" data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
                <span className="font-display text-7xl leading-none text-gold/70">{i + 1}</span>
                <h3 className="mt-3 text-2xl">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── VISIT ───────────── */}
      <section className="container-x py-20 sm:py-28" aria-labelledby="visit-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              id="visit-title"
              eyebrow="Visit the emporium"
              title={
                <>
                  Come in, <em className="text-maroon">feel the cloth</em>.
                </>
              }
              intro="Nothing replaces seeing a saree drape in natural light. Visit us on Bypass Road, Chas — or message us and we'll share photos and videos of pieces before you visit."
            />
            <ul className="mt-9 space-y-5" data-reveal>
              <li className="flex gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />
                <div>
                  <p className="font-semibold">{fullAddress}</p>
                  <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-maroon">
                    Get directions
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />
                <div>
                  <a href={`tel:${business.phoneTel}`} className="font-semibold">
                    {business.phoneDisplay}
                  </a>
                  <p className="text-sm text-stone">{business.hours ?? "Please call or WhatsApp to confirm today's timings."}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />
                <a href={`mailto:${business.email}`} className="break-all font-semibold">
                  {business.email}
                </a>
              </li>
            </ul>
            <a href={whatsappUrl("Hello! I'd like to visit the store. Could you share today's timings?")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-9" data-reveal>
              <WhatsAppIcon className="h-5 w-5" /> Message before you visit
            </a>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <div className="relative h-[24rem] overflow-hidden rounded-[1.6rem] border border-sand bg-cream shadow-[0_40px_80px_-50px_rgba(46,9,17,0.5)] sm:h-full sm:min-h-[30rem]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <MapPin className="h-8 w-8 text-gold-deep" aria-hidden />
                <p className="font-display text-2xl">{fullAddress}</p>
                <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-sm font-semibold text-maroon">
                  Open in Google Maps
                </a>
              </div>
              <iframe
                title={`Map showing ${business.name}, ${fullAddress}`}
                src={mapsEmbedUrl}
                className="absolute inset-0 h-full w-full grayscale-[35%] sepia-[15%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
