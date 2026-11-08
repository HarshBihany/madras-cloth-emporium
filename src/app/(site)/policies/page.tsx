import type { Metadata } from "next";
import { business } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shipping, Returns & Privacy",
  description: `Shipping, exchange and privacy information for ${business.name}.`,
  alternates: { canonical: "/policies" },
};

/*
 * DRAFT POLICIES — review with the family (and a professional where needed) before launch.
 * They describe how the website works today (WhatsApp-confirmed orders, no online payment).
 */
export default function PoliciesPage() {
  return (
    <div className="container-x max-w-3xl pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">Policies</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        Shipping, returns <em className="text-maroon">& privacy</em>
      </h1>
      <p className="mt-4 rounded-xl border border-gold/50 bg-gold-pale/40 px-4 py-3 text-sm text-charcoal-soft">
        These policies are a working draft and may be updated. If anything is unclear, please ask us on WhatsApp before ordering.
      </p>
      <div className="prose-mce mt-6">
        <h2 id="ordering">How ordering works</h2>
        <p>
          Orders placed on this website are <strong>requests</strong>. Nothing is charged online. After you send your order on WhatsApp, our team
          confirms availability, the final price, any delivery charges and the payment method with you directly. Your order is accepted only after
          that confirmation.
        </p>
        <h2 id="shipping">Shipping & pickup</h2>
        <ul>
          <li>Store pickup is available at {business.address.street}, {business.address.locality}, {business.address.city}.</li>
          <li>Delivery across India is available on request. Charges and expected timelines depend on the destination and are confirmed before payment.</li>
          <li>Once shipped, we share the courier name and tracking number, also visible on the Track Order page.</li>
        </ul>
        <h2 id="returns">Exchanges & returns</h2>
        <ul>
          <li>Please inspect your purchase on delivery or pickup and tell us about any issue as soon as possible.</li>
          <li>Fabric cut to length by the metre, and stitched or altered garments, are generally not returnable unless faulty.</li>
          <li>Exchange eligibility for other items is confirmed with you on WhatsApp at the time of purchase.</li>
        </ul>
        <h2 id="demo">Demonstration listings</h2>
        <p>
          While our live catalogue is being uploaded, some products are marked <strong>“Demo”</strong>. These are illustrative examples only: they
          are not current stock, and their prices and artwork are indicative. We&apos;ll gladly suggest similar pieces available in the store.
        </p>
        <h2 id="privacy">Privacy notice</h2>
        <p>When you place an order or send an enquiry we collect your name, phone number and, optionally, your email, address and notes.</p>
        <ul>
          <li>
            <strong>Why:</strong> only to respond to your request, process and deliver your order, and keep basic business records.
          </li>
          <li>
            <strong>Sharing:</strong> we never sell your data. We share delivery details with a courier only when you ask us to ship.
          </li>
          <li>
            <strong>Storage:</strong> data is stored securely with our database provider. Your bag and wishlist are stored only in your own browser.
          </li>
          <li>
            <strong>Security:</strong> the website does not store raw IP addresses; anti-spam checks use one-way hashed values.
          </li>
          <li>
            <strong>Your rights:</strong> to see, correct or delete your information, email{" "}
            <a href={`mailto:${business.email}`} className="text-maroon underline">
              {business.email}
            </a>{" "}
            or message us on WhatsApp.
          </li>
        </ul>
        <h2 id="contact">Contact</h2>
        <p>
          {business.name}, {business.address.street}, {business.address.locality}, {business.address.city}, {business.address.state}. Phone/WhatsApp{" "}
          {business.phoneDisplay}. Email {business.email}.
        </p>
      </div>
    </div>
  );
}
