/**
 * FabricArt — deterministic, illustrative SVG textile artwork.
 * Used as an elegant placeholder until real product photography exists.
 * Pure render (no hooks) so it works in Server and Client Components.
 */
import type { ReactNode } from "react";

export type ArtPattern =
  | "buti"
  | "paisley"
  | "jaal"
  | "floral"
  | "bandhani"
  | "ikat"
  | "chevron"
  | "checks"
  | "gingham"
  | "pinstripe"
  | "stripe"
  | "herringbone"
  | "twill"
  | "plain";

export type ArtShape = "swatch" | "saree" | "kurti" | "suit-set" | "bolt";

export const ART_PATTERNS: ArtPattern[] = [
  "buti",
  "paisley",
  "jaal",
  "floral",
  "bandhani",
  "ikat",
  "chevron",
  "checks",
  "gingham",
  "pinstripe",
  "stripe",
  "herringbone",
  "twill",
  "plain",
];

type Props = {
  pattern?: string;
  colors?: string[];
  seed: string;
  shape?: ArtShape;
  view?: "full" | "detail" | "border";
  className?: string;
  title?: string;
};

const DEFAULT_COLORS = ["#6e1a2b", "#d9c08a", "#b08a43"];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lighten (amt>0) or darken (amt<0) a hex colour. */
function shade(hex: string, amt: number) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c: number) => {
    const v = amt >= 0 ? c + (255 - c) * amt : c * (1 + amt);
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const PAISLEY =
  "M0 -16 C 12 -15, 15 3, 3 12 C -5 18, -14 11, -12 2 C -10 -5, -2 -5, 0 -1 C 3 -6, -3 -11, 0 -16 Z";

function Petals({ r, fill, count = 5 }: { r: number; fill: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ellipse key={i} cx={0} cy={-r} rx={r * 0.55} ry={r} fill={fill} transform={`rotate(${(360 / count) * i})`} />
      ))}
    </>
  );
}

/** Returns <pattern> body for the motif layer. */
function motif(pattern: string, base: string, accent: string, gold: string, rand: () => number): { size: [number, number]; body: ReactNode } {
  const soft = shade(base, 0.18);
  const deep = shade(base, -0.25);
  switch (pattern) {
    case "buti":
      return {
        size: [56, 56],
        body: (
          <>
            <g transform="translate(14 14)">
              <Petals r={4.2} fill={accent} />
              <circle r={2} fill={gold} />
            </g>
            <g transform="translate(42 42)">
              <Petals r={4.2} fill={accent} />
              <circle r={2} fill={gold} />
            </g>
            <circle cx={42} cy={14} r={1.2} fill={gold} opacity={0.8} />
            <circle cx={14} cy={42} r={1.2} fill={gold} opacity={0.8} />
          </>
        ),
      };
    case "paisley":
      return {
        size: [70, 70],
        body: (
          <>
            <g transform="translate(18 20) rotate(-20)">
              <path d={PAISLEY} fill={accent} />
              <path d={PAISLEY} fill="none" stroke={gold} strokeWidth={1.2} transform="scale(0.62)" />
              <circle r={2} cx={-3} cy={2} fill={gold} />
            </g>
            <g transform="translate(53 54) rotate(160)">
              <path d={PAISLEY} fill={accent} />
              <path d={PAISLEY} fill="none" stroke={gold} strokeWidth={1.2} transform="scale(0.62)" />
              <circle r={2} cx={-3} cy={2} fill={gold} />
            </g>
            <circle cx={53} cy={18} r={1.6} fill={gold} />
            <circle cx={18} cy={55} r={1.6} fill={gold} />
          </>
        ),
      };
    case "jaal":
      return {
        size: [48, 48],
        body: (
          <>
            <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="none" stroke={gold} strokeWidth={1.1} opacity={0.85} />
            <path d="M24 10 C 28 18, 28 30, 24 38 C 20 30, 20 18, 24 10 Z" fill={accent} opacity={0.9} />
            <circle cx={0} cy={24} r={2.4} fill={accent} />
            <circle cx={48} cy={24} r={2.4} fill={accent} />
            <circle cx={24} cy={0} r={2.4} fill={accent} />
            <circle cx={24} cy={48} r={2.4} fill={accent} />
          </>
        ),
      };
    case "floral":
      return {
        size: [90, 90],
        body: (
          <>
            <g transform="translate(25 25)">
              <path d="M0 0 C 14 -6, 22 2, 26 12" stroke={shade(accent, -0.35)} strokeWidth={1.4} fill="none" />
              <ellipse cx={16} cy={-2} rx={7} ry={3} fill={shade(accent, -0.3)} transform="rotate(-20 16 -2)" opacity={0.8} />
              <Petals r={8} fill={accent} count={6} />
              <circle r={4} fill={gold} />
              <circle r={1.6} fill={deep} />
            </g>
            <g transform="translate(68 68) rotate(30)">
              <Petals r={6} fill={soft === accent ? gold : shade(accent, 0.25)} count={5} />
              <circle r={2.6} fill={gold} />
            </g>
            <circle cx={70} cy={20} r={2} fill={accent} opacity={0.7} />
            <circle cx={20} cy={72} r={2} fill={accent} opacity={0.7} />
          </>
        ),
      };
    case "bandhani":
      return {
        size: [24, 24],
        body: (
          <>
            {[
              [6, 6],
              [18, 18],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                <circle r={3.2} fill="none" stroke={accent} strokeWidth={1.4} />
                <circle r={1.1} fill={accent} />
              </g>
            ))}
          </>
        ),
      };
    case "ikat":
      return {
        size: [60, 40],
        body: (
          <>
            <path d="M0 20 L15 5 L30 20 L45 5 L60 20" fill="none" stroke={accent} strokeWidth={6} strokeDasharray="7 2 3 2" />
            <path d="M0 38 L15 23 L30 38 L45 23 L60 38" fill="none" stroke={gold} strokeWidth={3} strokeDasharray="5 3" opacity={0.85} />
          </>
        ),
      };
    case "chevron":
      return {
        size: [40, 24],
        body: <path d="M0 18 L20 4 L40 18" fill="none" stroke={accent} strokeWidth={4} />,
      };
    case "checks": {
      const w = 34 + Math.floor(rand() * 18);
      return {
        size: [w, w],
        body: (
          <>
            <rect x={0} y={0} width={w * 0.42} height={w} fill={accent} opacity={0.32} />
            <rect x={0} y={0} width={w} height={w * 0.42} fill={accent} opacity={0.32} />
            <rect x={w * 0.62} y={0} width={1.5} height={w} fill={gold} opacity={0.7} />
            <rect x={0} y={w * 0.62} width={w} height={1.5} fill={gold} opacity={0.7} />
          </>
        ),
      };
    }
    case "gingham":
      return {
        size: [16, 16],
        body: (
          <>
            <rect width={8} height={16} fill={accent} opacity={0.45} />
            <rect width={16} height={8} fill={accent} opacity={0.45} />
          </>
        ),
      };
    case "pinstripe":
      return { size: [12, 12], body: <rect x={0} y={0} width={0.9} height={12} fill={accent} opacity={0.85} /> };
    case "stripe":
      return {
        size: [22, 22],
        body: (
          <>
            <rect x={0} y={0} width={6} height={22} fill={accent} opacity={0.75} />
            <rect x={10} y={0} width={1.4} height={22} fill={gold} opacity={0.8} />
          </>
        ),
      };
    case "herringbone":
      return {
        size: [16, 16],
        body: (
          <>
            <path d="M0 0 L8 8 M0 8 L8 16 M0 -8 L8 0" stroke={accent} strokeWidth={1.8} opacity={0.7} />
            <path d="M16 0 L8 8 M16 8 L8 16 M16 -8 L8 0" stroke={shade(accent, -0.2)} strokeWidth={1.8} opacity={0.55} />
          </>
        ),
      };
    case "twill":
      return {
        size: [8, 8],
        body: <path d="M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6" stroke={accent} strokeWidth={1.1} opacity={0.5} />,
      };
    default:
      return {
        size: [6, 6],
        body: <path d="M0 6 L6 0" stroke={shade(base, 0.08)} strokeWidth={0.8} opacity={0.6} />,
      };
  }
}

/** Temple-style zari border tile ("kumbam"-like triangles). */
function BorderTile({ id, base, gold, accent }: { id: string; base: string; gold: string; accent: string }) {
  return (
    <pattern id={id} width={28} height={44} patternUnits="userSpaceOnUse">
      <rect width={28} height={44} fill={gold} />
      <rect y={4} width={28} height={2} fill={shade(gold, -0.35)} />
      <path d="M0 30 L7 12 L14 30 L21 12 L28 30 Z" fill={base} />
      <path d="M7 24 L7 18 M21 24 L21 18" stroke={shade(gold, 0.35)} strokeWidth={1.4} />
      <rect y={33} width={28} height={2} fill={shade(gold, -0.35)} />
      <circle cx={14} cy={39} r={2} fill={accent} />
      <circle cx={0} cy={39} r={2} fill={accent} />
      <circle cx={28} cy={39} r={2} fill={accent} />
    </pattern>
  );
}

export function FabricArt({ pattern = "buti", colors, seed, shape = "swatch", view = "full", className, title }: Props) {
  const palette = colors && colors.length ? colors : DEFAULT_COLORS;
  const base = palette[0] ?? DEFAULT_COLORS[0];
  const accent = palette[1] ?? shade(base, 0.45);
  const gold = palette[2] ?? "#c9a45a";
  const h = hash(`${seed}:${pattern}:${shape}`);
  const rand = rng(h);
  const uid = `fa${h.toString(36)}${view[0]}`;
  const m = motif(pattern, base, accent, gold, rand);
  const zoom = view === "detail" ? 2.4 : view === "border" ? 1.4 : 1;
  const rot = pattern === "ikat" || pattern === "chevron" || pattern === "plain" ? 0 : Math.round((rand() - 0.5) * 8);
  const bg = "#f3eadb";

  const defs = (
    <defs>
      <pattern
        id={`${uid}m`}
        width={m.size[0]}
        height={m.size[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`scale(${zoom}) rotate(${rot})`}
      >
        <rect width={m.size[0]} height={m.size[1]} fill={base} />
        {m.body}
      </pattern>
      <BorderTile id={`${uid}b`} base={shade(base, -0.15)} gold={gold} accent={accent} />
      <linearGradient id={`${uid}pleat`} x1="0" x2="1" y1="0" y2="0">
        {Array.from({ length: 9 }).map((_, i) => (
          <stop key={i} offset={`${(i / 8) * 100}%`} stopColor={i % 2 ? "#000" : "#fff"} stopOpacity={i % 2 ? 0.16 : 0.08} />
        ))}
      </linearGradient>
      <linearGradient id={`${uid}sheen`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.22} />
        <stop offset="45%" stopColor="#fff" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.22} />
      </linearGradient>
      <radialGradient id={`${uid}vig`} cx="50%" cy="45%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.18} />
      </radialGradient>
      <filter id={`${uid}sh`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#2e0911" floodOpacity="0.22" />
      </filter>
    </defs>
  );

  let content: ReactNode;

  if (view === "detail" || shape === "swatch") {
    content = (
      <>
        <rect width={400} height={500} fill={`url(#${uid}m)`} />
        <rect width={400} height={500} fill={`url(#${uid}sheen)`} />
        {view === "detail" && <rect width={400} height={500} fill={`url(#${uid}pleat)`} opacity={0.5} />}
      </>
    );
  } else if (shape === "saree" || view === "border") {
    const borderY = view === "border" ? 280 : 400;
    content = (
      <>
        <rect width={400} height={500} fill={`url(#${uid}m)`} />
        {/* pallu: diagonal band with richer weave */}
        {view !== "border" && (
          <g>
            <path d="M250 0 L400 0 L400 210 Z" fill={shade(base, -0.12)} />
            <path d="M250 0 L400 210 L400 250 L222 0 Z" fill={`url(#${uid}b)`} />
            {Array.from({ length: 5 }).map((_, i) => (
              <path key={i} d={`M${290 + i * 22} 0 L400 ${150 - i * 30}`} stroke={gold} strokeWidth={i % 2 ? 1 : 3} opacity={0.75} />
            ))}
          </g>
        )}
        <rect y={borderY} width={400} height={500 - borderY} fill={`url(#${uid}b)`} />
        <rect y={borderY - 6} width={400} height={3} fill={gold} />
        <rect width={400} height={500} fill={`url(#${uid}pleat)`} />
        <rect width={400} height={500} fill={`url(#${uid}sheen)`} />
      </>
    );
  } else if (shape === "kurti") {
    const body =
      "M152 52 Q200 104 248 52 L300 66 Q318 70 326 88 L364 196 L322 214 L292 140 L296 300 Q300 360 334 462 Q200 482 66 462 Q100 360 104 300 L108 140 L78 214 L36 196 L74 88 Q82 70 100 66 Z";
    content = (
      <>
        <rect width={400} height={500} fill={bg} />
        <ellipse cx={200} cy={474} rx={150} ry={12} fill="#2e0911" opacity={0.08} />
        <g filter={`url(#${uid}sh)`}>
          <clipPath id={`${uid}k`}>
            <path d={body} />
          </clipPath>
          <g clipPath={`url(#${uid}k)`}>
            <rect width={400} height={500} fill={`url(#${uid}m)`} />
            <rect y={436} width={400} height={40} fill={`url(#${uid}b)`} />
            <path d="M322 214 L364 196 L357 176 L315 194 Z" fill={`url(#${uid}b)`} />
            <path d="M78 214 L36 196 L43 176 L85 194 Z" fill={`url(#${uid}b)`} />
            <rect width={400} height={500} fill={`url(#${uid}sheen)`} />
          </g>
          <path d="M152 52 Q200 104 248 52" fill="none" stroke={gold} strokeWidth={5} />
          <path d="M200 92 L200 170" stroke={gold} strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" />
        </g>
      </>
    );
  } else if (shape === "suit-set") {
    content = (
      <>
        <rect width={400} height={500} fill={bg} />
        {/* salwar / bottom piece */}
        <g filter={`url(#${uid}sh)`} transform="rotate(-4 200 380)">
          <rect x={70} y={300} width={270} height={150} rx={6} fill={shade(accent, -0.05)} />
          <rect x={70} y={300} width={270} height={150} rx={6} fill={`url(#${uid}sheen)`} />
        </g>
        {/* dupatta with border */}
        <g filter={`url(#${uid}sh)`} transform="rotate(5 200 300)">
          <rect x={60} y={190} width={280} height={150} rx={6} fill={shade(base, 0.35)} />
          <rect x={60} y={300} width={280} height={40} fill={`url(#${uid}b)`} />
          <rect x={60} y={190} width={280} height={150} rx={6} fill={`url(#${uid}sheen)`} />
        </g>
        {/* kameez fabric on top */}
        <g filter={`url(#${uid}sh)`} transform="rotate(-2 200 160)">
          <rect x={50} y={40} width={300} height={200} rx={6} fill={`url(#${uid}m)`} />
          <rect x={50} y={200} width={300} height={8} fill={gold} opacity={0.85} />
          <rect x={50} y={40} width={300} height={200} rx={6} fill={`url(#${uid}sheen)`} />
          <path d="M50 120 L350 120" stroke="#000" strokeOpacity={0.08} strokeWidth={3} />
        </g>
      </>
    );
  } else {
    // bolt: folded fabric with selvedge
    content = (
      <>
        <rect width={400} height={500} fill={bg} />
        <g filter={`url(#${uid}sh)`}>
          <rect x={44} y={34} width={312} height={432} rx={4} fill={`url(#${uid}m)`} />
          <rect x={44} y={34} width={312} height={432} rx={4} fill={`url(#${uid}sheen)`} />
          {[150, 280].map((y) => (
            <g key={y}>
              <rect x={44} y={y - 10} width={312} height={10} fill="#000" opacity={0.08} />
              <rect x={44} y={y} width={312} height={3} fill="#fff" opacity={0.18} />
            </g>
          ))}
          <rect x={44} y={34} width={312} height={14} fill={shade(base, -0.2)} />
          <text
            x={200}
            y={44.5}
            textAnchor="middle"
            fontSize={7.5}
            letterSpacing={3}
            fill={shade(accent, 0.5)}
            fontFamily="Georgia, serif"
          >
            MADRAS CLOTH EMPORIUM · EST. 1970 · CHAS
          </text>
          <path d="M276 466 L356 466 L356 386 Z" fill={shade(base, 0.28)} />
          <path d="M276 466 L356 386" stroke="#000" strokeOpacity={0.18} strokeWidth={1.5} />
        </g>
      </>
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {defs}
      {content}
      <rect width={400} height={500} fill={`url(#${uid}vig)`} />
    </svg>
  );
}

export function shapeForCategory(slug?: string | null): ArtShape {
  switch (slug) {
    case "sarees":
      return "saree";
    case "kurtis":
      return "kurti";
    case "suits-dress-materials":
      return "suit-set";
    case "shirting-fabrics":
    case "suiting-fabrics":
      return "bolt";
    default:
      return "swatch";
  }
}
