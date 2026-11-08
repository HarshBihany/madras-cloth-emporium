import Link from "next/link";
import { FabricArt } from "@/components/fabric/FabricArt";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4 py-16">
      <div className="grid max-w-4xl items-center gap-10 md:grid-cols-2">
        <div className="mx-auto w-56 md:w-full">
          <div className="arch aspect-[4/5] overflow-hidden">
            <FabricArt seed="404" pattern="paisley" colors={["#6e1a2b", "#d9c08a", "#c9a45a"]} shape="saree" className="h-full w-full" />
          </div>
        </div>
        <div>
          <p className="eyebrow">Page not found</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">
            This thread seems to have <em className="text-maroon">come loose</em>.
          </h1>
          <p className="mt-4 text-charcoal-soft">The page may have moved, or the product may no longer be listed.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">
              Browse the collection
            </Link>
            <Link href="/" className="btn btn-outline">
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
