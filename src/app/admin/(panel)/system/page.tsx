import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader, Card, Pill } from "@/components/admin/ui";
import { storageMode } from "@/lib/storage";
import { paymentsEnabled } from "@/lib/integrations/payments";
import { LOYALTY_RULES } from "@/lib/integrations/loyalty";
import { siteUrl } from "@/lib/config";

export const metadata = { title: "System" };

export default async function SystemPage() {
  await requireAdmin();
  const dbMode = process.env.DATABASE_URL ? "Postgres (DATABASE_URL)" : "Local embedded database (development only)";
  const rows: [string, string, "green" | "gold" | "neutral", string][] = [
    ["Database", dbMode, process.env.DATABASE_URL ? "green" : "gold", "Supabase free tier: 500 MB database. Projects pause after ~7 days without activity — see docs/DEPLOYMENT.md."],
    ["Image storage", storageMode() === "supabase" ? "Supabase Storage" : storageMode() === "local" ? "Local /public/uploads (dev)" : "Not configured", storageMode() === "supabase" ? "green" : "gold", "Supabase free tier: 1 GB storage. Compress photos to ~200–400 KB each."],
    ["Owner email alerts", process.env.RESEND_API_KEY ? "Resend" : "Off", process.env.RESEND_API_KEY ? "green" : "neutral", "Optional. Orders & enquiries are always saved here regardless."],
    ["WhatsApp ordering", "On (wa.me links — free)", "green", "No WhatsApp Business API needed."],
    ["Online payments (Razorpay)", paymentsEnabled() ? "On" : "Ready — not enabled", paymentsEnabled() ? "green" : "neutral", "src/lib/integrations/payments"],
    ["Courier integration", "Manual tracking numbers", "neutral", "src/lib/integrations/shipping"],
    ["GST invoicing", "HSN/GST fields ready", "neutral", "src/lib/integrations/invoicing — confirm rates with your CA"],
    ["Loyalty points", LOYALTY_RULES.enabled ? "On" : "Ready — not enabled", "neutral", "src/lib/integrations/loyalty"],
    ["Customer accounts", "Ready — not enabled", "neutral", "customers table + Supabase Auth (free tier) planned"],
  ];
  return (
    <>
      <AdminHeader title="System" sub={`Site URL: ${siteUrl}`} />
      <Card>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-sand">
            {rows.map(([k, v, tone, note]) => (
              <tr key={k}>
                <th className="w-56 py-3 pr-4 text-left font-semibold">{k}</th>
                <td className="py-3 pr-4">
                  <Pill tone={tone}>{v}</Pill>
                </td>
                <td className="py-3 text-stone">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="mt-6">
        <h2 className="text-2xl">Backups</h2>
        <p className="mt-2 text-sm text-charcoal-soft">
          Free database tiers don&apos;t include automatic backups you can download. Use <a href="/api/admin/export" className="text-maroon underline">Export products CSV</a> regularly, and see docs/DEPLOYMENT.md for a full database dump command.
        </p>
      </Card>
    </>
  );
}
