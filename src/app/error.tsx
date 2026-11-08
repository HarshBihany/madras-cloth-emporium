"use client";

import Link from "next/link";
import { whatsappUrl } from "@/lib/config";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-5xl">We&apos;re straightening the shelves.</h1>
        <p className="mt-4 text-charcoal-soft">Please try again in a moment. If it keeps happening, message us on WhatsApp — we&apos;ll help directly.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <a href={whatsappUrl("Hello! The website showed an error — could you help?")} className="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
          <Link href="/" className="btn btn-outline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
