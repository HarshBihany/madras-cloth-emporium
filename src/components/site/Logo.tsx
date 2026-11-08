import Link from "next/link";

export function Monogram({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <path d="M24 2 C 37 2, 46 11, 46 24 L46 46 L2 46 L2 24 C 2 11, 11 2, 24 2 Z" fill="currentColor" />
      <path
        d="M24 6.5 C 34.5 6.5, 41.5 13.5, 41.5 24 L41.5 41.5 L6.5 41.5 L6.5 24 C 6.5 13.5, 13.5 6.5, 24 6.5 Z"
        fill="none"
        stroke="#d9c08a"
        strokeWidth="0.9"
      />
      <text x="24" y="31" textAnchor="middle" fontFamily="var(--font-display)" fontSize="17" fontWeight="600" fill="#efe2c2" letterSpacing="0.5">
        MC
      </text>
      <text x="24" y="38.5" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="3.6" fontWeight="700" fill="#d9c08a" letterSpacing="1.2">
        1970
      </text>
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 sm:gap-3" aria-label="Madras Cloth Emporium — home">
      <Monogram className={`h-9 w-9 shrink-0 sm:h-11 sm:w-11 transition-transform duration-700 group-hover:-translate-y-0.5 ${light ? "text-maroon-deep" : "text-maroon"}`} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`whitespace-nowrap font-display text-[1.12rem] font-semibold tracking-tight sm:text-[1.55rem] ${light ? "text-ivory" : "text-charcoal"}`}>
          Madras Cloth Emporium
        </span>
        <span className={`mt-1 whitespace-nowrap text-[0.52rem] font-bold uppercase tracking-[0.28em] sm:text-[0.58rem] sm:tracking-[0.32em] ${light ? "text-gold-light" : "text-gold-deep"}`}>
          Est. 1970<span className="hidden sm:inline"> · Chas, Bokaro</span>
        </span>
      </span>
    </Link>
  );
}
