import Link from "next/link";

export function AdminHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-stone">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-sand bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "green" | "red" | "maroon" | "blue" }) {
  const tones = {
    neutral: "bg-cream text-charcoal-soft",
    gold: "bg-gold-pale text-gold-deep",
    green: "bg-success/10 text-success",
    red: "bg-danger/10 text-danger",
    maroon: "bg-maroon text-ivory",
    blue: "bg-[#e7eef7] text-[#284a73]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-outline !min-h-9 !px-4 !py-1">
          ← Prev
        </Link>
      ) : (
        <span />
      )}
      <span className="text-stone">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="btn btn-outline !min-h-9 !px-4 !py-1">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export const STATUS_TONE: Record<string, "neutral" | "gold" | "green" | "red" | "maroon" | "blue"> = {
  pending: "gold",
  confirmed: "blue",
  packed: "blue",
  shipped: "blue",
  delivered: "green",
  completed: "green",
  cancelled: "red",
  new: "gold",
  in_progress: "blue",
  closed: "neutral",
  active: "green",
  draft: "neutral",
  archived: "red",
};

export function sp1(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.slice(0, 100) ?? "";
}
