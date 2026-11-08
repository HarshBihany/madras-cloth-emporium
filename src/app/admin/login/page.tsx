import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";
import { Monogram } from "@/components/site/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-maroon-ink px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] bg-ivory p-8 shadow-2xl sm:p-10">
        <Monogram className="h-14 w-14 text-maroon" />
        <h1 className="mt-6 text-4xl">Emporium admin</h1>
        <p className="mt-2 text-sm text-stone">Authorised staff only.</p>
        <LoginForm />
      </div>
    </main>
  );
}
