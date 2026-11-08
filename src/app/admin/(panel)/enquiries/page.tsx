import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listEnquiries } from "@/lib/data/admin";
import { updateEnquiry } from "@/app/actions/admin";
import { AdminHeader, Pager, Pill, STATUS_TONE, sp1 } from "@/components/admin/ui";
import { FORMS } from "@/lib/forms";
import { enquiryStatusEnum, enquiryTypeEnum } from "@/lib/db/schema";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

export const metadata = { title: "Enquiries" };

const TYPE_LABEL: Record<string, string> = { contact: "Enquiry", wedding: "Wedding", bulk: "Bulk quote", tailoring: "Tailoring", product: "Product" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const type = (enquiryTypeEnum.enumValues as readonly string[]).includes(sp1(sp.type)) ? sp1(sp.type) : "";
  const status = (enquiryStatusEnum.enumValues as readonly string[]).includes(sp1(sp.status)) ? sp1(sp.status) : "";
  const { rows, total, page, pages } = await listEnquiries({ type, status, page: Number(sp1(sp.page)) || 1 });
  const link = (patch: Record<string, string>) => {
    const n = new URLSearchParams({ ...(type && { type }), ...(status && { status }), ...patch });
    for (const [k, v] of [...n.entries()]) if (!v) n.delete(k);
    return `/admin/enquiries${n.size ? `?${n}` : ""}`;
  };

  return (
    <>
      <AdminHeader title="Enquiries" sub={`${total} enquiries — contact, wedding consultations, bulk quotations and tailoring requests.`} />
      <div className="mb-3 flex flex-wrap gap-2">
        {["", ...enquiryTypeEnum.enumValues.filter((t) => t !== "product")].map((t) => (
          <Link key={t || "all"} href={link({ type: t, page: "" })} className={`chip !min-h-9 !py-1 text-xs ${type === t ? "is-active" : ""}`}>
            {t ? TYPE_LABEL[t] : "All types"}
          </Link>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {["", ...enquiryStatusEnum.enumValues].map((s) => (
          <Link key={s || "all"} href={link({ status: s, page: "" })} className={`chip !min-h-9 !py-1 text-xs ${status === s ? "is-active" : ""}`}>
            {s ? s.replace("_", " ") : "Any status"}
          </Link>
        ))}
      </div>

      <ul className="space-y-4">
        {rows.map((e) => {
          const labels = Object.fromEntries((FORMS[e.type as keyof typeof FORMS]?.fields ?? []).map((f) => [f.name, f.label]));
          return (
            <li key={e.id} className="rounded-2xl border border-sand bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="maroon">{TYPE_LABEL[e.type]}</Pill>
                    <Pill tone={STATUS_TONE[e.status]}>{e.status.replace("_", " ")}</Pill>
                    <span className="font-mono text-xs text-stone">ENQ-{e.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">
                    {e.name}
                    {e.city && <span className="font-normal text-stone"> · {e.city}</span>}
                  </p>
                  <p className="text-sm text-stone">
                    +91 {e.phone}
                    {e.email && <> · {e.email}</>} · {e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(`Hello ${e.name}, this is Madras Cloth Emporium regarding your ${TYPE_LABEL[e.type].toLowerCase()} request.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-9 !px-3 !py-1 !text-[0.65rem]">
                    <WhatsAppIcon className="h-4 w-4" /> Reply
                  </a>
                  {e.email && (
                    <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your ${TYPE_LABEL[e.type].toLowerCase()} request — Madras Cloth Emporium`)}`} className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]">
                      Email
                    </a>
                  )}
                </div>
              </div>
              {Object.keys(e.details).length > 0 && (
                <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[12rem_1fr]">
                  {Object.entries(e.details).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-stone">{labels[k] ?? k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {e.message && <p className="mt-3 whitespace-pre-line rounded-xl bg-cream/50 p-3 text-sm">{e.message}</p>}
              <form action={updateEnquiry} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={e.id} />
                <select name="status" defaultValue={e.status} aria-label="Enquiry status" className="field !min-h-9 !w-36 !py-1 text-sm">
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
                <input name="adminNotes" defaultValue={e.adminNotes ?? ""} placeholder="Internal note" aria-label="Internal note" className="field !min-h-9 min-w-0 flex-1 !py-1 text-sm" />
                <button className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]">Save</button>
              </form>
            </li>
          );
        })}
        {!rows.length && <li className="rounded-2xl border border-dashed border-sand-deep p-10 text-center text-stone">No enquiries yet.</li>}
      </ul>
      <Pager page={page} pages={pages} href={(p) => link({ page: String(p) })} />
    </>
  );
}
