"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Upload, ShoppingCart, MessageSquare, Settings2 } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/import", label: "CSV import", icon: Upload },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/system", label: "System", icon: Settings2 },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-ivory/10 text-gold-pale" : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"}`}
              >
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
