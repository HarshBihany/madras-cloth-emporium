export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  light = false,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  id?: string;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl`} data-reveal>
      <p className={`eyebrow flex items-center gap-3 ${align === "center" ? "justify-center" : ""} ${light ? "!text-gold-light" : ""}`}>
        <span className={`h-px w-8 ${light ? "bg-gold-light/60" : "bg-gold"}`} aria-hidden />
        {eyebrow}
      </p>
      <h2 id={id} className={`mt-4 text-[2.4rem] leading-[1.02] sm:text-5xl lg:text-[3.6rem] ${light ? "text-ivory" : "text-charcoal"}`}>
        {title}
      </h2>
      {intro && <p className={`mt-5 text-base leading-relaxed sm:text-lg ${light ? "text-ivory/75" : "text-charcoal-soft"}`}>{intro}</p>}
    </div>
  );
}
