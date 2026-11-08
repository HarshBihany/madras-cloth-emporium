"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV, SERVICES_NAV } from "./nav";
import { useCart, useHydrated, useWishlist } from "@/lib/store/cart";
import { business, whatsappUrl } from "@/lib/config";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const cartCount = useCart((s) => s.lines.length);
  const wishCount = useWishlist((s) => s.items.length);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlays on navigation (adjust state during render — no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <>
      <div className="bg-maroon-ink text-gold-pale">
        <div className="container-x flex h-9 items-center justify-center gap-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] sm:justify-between">
          <span className="hidden sm:inline">Serving families since {business.established}</span>
          <span className="truncate">Order on WhatsApp<span className="hidden sm:inline"> · Pan-India delivery on request</span></span>
          <a href={`tel:${business.phoneTel}`} className="hidden hover:text-white sm:inline">
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled ? "border-sand/80 bg-ivory/90 shadow-[0_10px_30px_-20px_rgba(46,9,17,0.35)] backdrop-blur-md" : "border-transparent bg-ivory"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
          <button
            type="button"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="min-w-0 flex-1 lg:flex-none">
            <Logo />
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.78rem] font-semibold uppercase tracking-[0.14em]">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`link-underline py-2 ${pathname === n.href ? "text-maroon" : "text-charcoal hover:text-maroon"}`}
                    aria-current={pathname === n.href ? "page" : undefined}
                  >
                    {n.label.replace(" & Dress Materials", "")}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/wedding" className="link-underline py-2 text-gold-deep hover:text-maroon">
                  Wedding
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/wishlist"
              aria-label={`Wishlist${hydrated && wishCount ? `, ${wishCount} items` : ""}`}
              className="relative hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream sm:inline-flex"
            >
              <Heart className="h-5 w-5" />
              {hydrated && wishCount > 0 && <Badge n={wishCount} />}
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart${hydrated && cartCount ? `, ${cartCount} items` : ""}`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream"
            >
              <ShoppingBag className="h-5 w-5" />
              {hydrated && cartCount > 0 && <Badge n={cartCount} />}
            </Link>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        hidden={!searchOpen}
        className="fixed inset-0 z-50 bg-maroon-ink/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
      >
        <div className="bg-ivory shadow-2xl">
          <form
            className="container-x flex h-24 items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
              setSearchOpen(false);
            }}
          >
            <Search className="h-6 w-6 shrink-0 text-gold-deep" aria-hidden />
            <label htmlFor="site-search" className="sr-only">
              Search sarees, suits, kurtis and fabrics
            </label>
            <input
              ref={searchRef}
              id="site-search"
              name="q"
              type="search"
              maxLength={80}
              placeholder="Search silk sarees, linen shirting, bandhani…"
              className="h-14 min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-stone/60 sm:text-3xl"
            />
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream">
              <X className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 lg:hidden ${open ? "visible" : "invisible"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className={`absolute inset-0 bg-maroon-ink/60 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-ivory shadow-2xl transition-transform duration-500 ease-[var(--ease-silk)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-sand px-5 py-4">
            <span className="eyebrow">Menu</span>
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 px-5 py-6">
            <p className="eyebrow mb-3">Shop</p>
            <ul className="space-y-1">
              <li>
                <Link href="/shop" className="block py-2 font-display text-2xl">
                  All collections
                </Link>
              </li>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-2 font-display text-2xl">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="gold-rule my-6" />
            <p className="eyebrow mb-3">Services</p>
            <ul className="space-y-1">
              {SERVICES_NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block py-2 text-base font-medium">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/wishlist" className="block py-2 text-base font-medium">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/track" className="block py-2 text-base font-medium">
                  Track an order
                </Link>
              </li>
            </ul>
          </nav>
          <div className="border-t border-sand p-5">
            <a href={whatsappUrl("Hello Madras Cloth Emporium, I'd like some help choosing.")} className="btn btn-whatsapp w-full" target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-1 top-1 inline-flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-maroon px-1 text-[0.62rem] font-bold text-ivory">
      {n > 99 ? "99+" : n}
    </span>
  );
}
