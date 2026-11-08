import Image from "next/image";
import { FabricArt, shapeForCategory } from "@/components/fabric/FabricArt";

type Media = {
  slug: string;
  name: string;
  images: string[];
  artPattern: string;
  artColors: string[];
  category: { slug: string };
};

/** Product photo if available; otherwise illustrative fabric artwork. */
export function ProductMedia({
  p,
  view = "full",
  index = 0,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
  className = "h-full w-full object-cover",
}: {
  p: Media;
  view?: "full" | "detail" | "border";
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const img = p.images[index];
  if (img) {
    return <Image src={img} alt={p.name} fill sizes={sizes} priority={priority} className={className} />;
  }
  return (
    <FabricArt
      seed={p.slug}
      pattern={p.artPattern}
      colors={p.artColors}
      shape={shapeForCategory(p.category.slug)}
      view={view}
      className={className}
    />
  );
}
