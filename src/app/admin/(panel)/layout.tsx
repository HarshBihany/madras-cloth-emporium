import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "@/app/actions/auth";
import { Monogram } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f7f3ec] lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-sand bg-maroon-ink text-ivory lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Monogram className="h-9 w-9 text-maroon" />
            <span className="font-display text-xl leading-tight">
              Emporium
              <br className="hidden lg:block" /> <span className="text-gold-light">Admin</span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="text-xs font-semibold uppercase tracking-wider text-gold-light">Sign out</button>
          </form>
        </div>
        <AdminNav />
        <div className="mt-auto hidden px-5 py-6 text-xs text-ivory/60 lg:absolute lg:bottom-0 lg:block">
          <p className="truncate">{s.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="hover:text-ivory" target="_blank">
              View site ↗
            </Link>
            <form action={logout}>
              <button className="hover:text-ivory">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
