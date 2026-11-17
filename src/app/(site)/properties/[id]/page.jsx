import PropertyDetail from "@/components/property/PropertyDetail";
import { PROPERTIES } from "@/mock/properties";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = PROPERTIES.find((x) => x.id === id);
  if (!p) return { title: "Property" };
  return {
    title: `${p.title}, ${p.city}`,
    description: p.description.slice(0, 155),
    openGraph: { images: [p.images[0]] },
  };
}

export default async function PropertyPage({ params }) {
  const { id } = await params;
  return <PropertyDetail id={id} />;
}
