import { FabricArt } from "@/components/fabric/FabricArt";

/** Editorial hero used by service pages: text left, arched textile art right. */
export function PageHero({
  eyebrow,
  title,
  intro,
  art,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  art: { pattern: string; colors: string[]; shape?: "swatch" | "saree" | "kurti" | "suit-set" | "bolt" };
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden border-b border-sand bg-ivory-deep">
      <div className="container-x relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow flex animate-fade-up items-center gap-3">
            <span className="h-px w-10 bg-gold" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="mt-5 animate-fade-up text-5xl leading-[0.98] [animation-delay:100ms] sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-charcoal-soft [animation-delay:200ms]">{intro}</p>
          {children && <div className="mt-8 animate-fade-up [animation-delay:300ms]">{children}</div>}
        </div>
        <div className="hidden lg:col-span-5 lg:block" aria-hidden>
          <div className="relative ml-auto w-[78%]">
            <div className="arch absolute -inset-3 border border-gold/50" />
            <div className="arch relative aspect-[4/5] overflow-hidden shadow-[0_50px_90px_-50px_rgba(46,9,17,0.6)]">
              <FabricArt seed={`hero-${eyebrow}`} pattern={art.pattern} colors={art.colors} shape={art.shape ?? "saree"} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
