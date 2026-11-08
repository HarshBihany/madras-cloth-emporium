import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listCategoriesAdmin } from "@/lib/data/admin";
import { ProductForm, EMPTY_PRODUCT } from "@/components/admin/ProductForm";
import { AdminHeader } from "@/components/admin/ui";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  await requireAdmin();
  const cats = await listCategoriesAdmin();
  return (
    <>
      <AdminHeader title="New product" sub={<Link href="/admin/products">← Back to products</Link>} />
      <ProductForm initial={EMPTY_PRODUCT} categories={cats} />
    </>
  );
}
