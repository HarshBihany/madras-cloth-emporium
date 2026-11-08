"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORTS } from "@/lib/sorts";

export function SortSelect() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="hidden text-xs font-bold uppercase tracking-[0.14em] text-stone sm:block">
        Sort
      </label>
      <select
        id="sort"
        className="field !min-h-11 !w-auto !py-2 text-sm"
        value={sp.get("sort") ?? "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
        }}
      >
        {Object.entries(SORTS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
