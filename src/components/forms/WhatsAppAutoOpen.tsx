"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

/**
 * After a successful order/enquiry, automatically opens WhatsApp with the
 * request pre-written to the shop's number. The customer only taps "Send".
 * (Sending fully automatically would need the paid WhatsApp Business API.)
 * The button stays as a fallback if the browser blocks the redirect.
 */
export function WhatsAppAutoOpen({ url, label = "Send on WhatsApp", delayMs = 1500 }: { url: string; label?: string; delayMs?: number }) {
  const [left, setLeft] = useState(Math.ceil(delayMs / 1000));
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    const go = setTimeout(() => {
      setOpened(true);
      window.location.href = url;
    }, delayMs);
    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, [url, delayMs]);

  return (
    <div className="mt-6">
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full sm:w-auto">
        <WhatsAppIcon className="h-5 w-5" /> {label}
      </a>
      <p className="mt-3 text-sm text-stone" aria-live="polite">
        {opened
          ? "WhatsApp opened — just tap Send. If it didn't open, use the button above."
          : `Opening WhatsApp in ${left}s… your message is already written, just tap Send.`}
      </p>
    </div>
  );
}
