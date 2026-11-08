import type { Metadata } from "next";
import { TrackForm } from "@/components/forms/TrackForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your Madras Cloth Emporium order using your order reference and phone number.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="container-x max-w-3xl pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">Order tracking</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        Where&apos;s my <em className="text-maroon">order</em>?
      </h1>
      <p className="mt-4 text-charcoal-soft">Enter the reference you received (e.g. MCE-241108-AB2CD) and the phone number used for the order.</p>
      <TrackForm />
    </div>
  );
}
