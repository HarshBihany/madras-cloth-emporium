import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getProductForEdit, listCategoriesAdmin } from "@/lib/data/admin";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { AdminHeader } from "@/components/admin/ui";
import { deleteProduct } from "@/app/actions/admin";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [p, cats, sp] = await Promise.all([getProductForEdit(id), listCategoriesAdmin(), searchParams]);
  if (!p) notFound();
  const initial: ProductFormValues = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? "",
    categoryId: String(p.categoryId),
    shortDescription: p.shortDescription,
    description: p.description,
    fabric: p.fabric,
    colour: p.colour,
    occasion: p.occasion,
    work: p.work,
    widthInches: p.widthInches?.toString() ?? "",
    care: p.care,
    saleUnit: p.saleUnit,
    price: String(p.pricePaise / 100),
    mrp: p.mrpPaise ? String(p.mrpPaise / 100) : "",
    minQty: String(p.minQty),
    qtyStep: String(p.qtyStep),
    stockQty: String(p.stockQty),
    trackStock: p.trackStock,
    lowStockThreshold: String(p.lowStockThreshold),
    isDemo: p.isDemo,
    status: p.status,
    featured: p.featured,
    tags: p.tags.join(", "),
    images: p.images,
    attributes: Object.entries(p.attributes).map(([k, v]) => ({ k, v })),
    artPattern: p.artPattern,
    artColors: p.artColors.length ? p.artColors : ["#6e1a2b", "#d9c08a", "#c9a45a"],
    hsnCode: p.hsnCode ?? "",
    gstRatePct: p.gstRatePct?.toString() ?? "",
    variants: p.variants.map((x) => ({
      id: x.id,
      optionType: x.optionType,
      label: x.label,
      sku: x.sku ?? "",
      price: x.pricePaise != null ? String(x.pricePaise / 100) : "",
      stockQty: String(x.stockQty),
    })),
  };
  return (
    <>
      <AdminHeader
        title={p.name}
        sub={<Link href="/admin/products">← Back to products</Link>}
        actions={
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={p.id} />
            <button className="btn btn-outline !min-h-10 !px-4 !py-2 !text-danger" formNoValidate>
              Delete product
            </button>
          </form>
        }
      />
      <ProductForm initial={initial} categories={cats} saved={sp.saved === "1"} key={p.updatedAt.toISOString()} />
    </>
  );
}
