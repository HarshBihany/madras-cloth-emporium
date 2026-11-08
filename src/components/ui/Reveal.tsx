"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement scroll reveal. Adds `js-reveal` to <html>,
 * then observes every [data-reveal] element. Without JS, content is simply visible.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () =>
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("is-visible");
        else io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    const showAll = () => document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    window.addEventListener("beforeprint", showAll);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("beforeprint", showAll);
    };
  }, []);
  return null;
}
