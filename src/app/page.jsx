import HeroSection from "@/components/home/HeroSection";
import CityMarquee from "@/components/home/CityMarquee";
import CategoryGallery from "@/components/home/CategoryGallery";
import PropertyListings from "@/components/home/PropertyListings";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PostPropertyCta from "@/components/home/PostPropertyCta";
import { CITIES, CATEGORIES, PROPERTY_TYPES, BUDGETS } from "@/data/catalog";
import { CONTACT } from "@/data/site";
import { getListings, getFeaturedListing } from "@/lib/listings";

export default async function HomePage() {
  const [listings, featured] = await Promise.all([getListings(), getFeaturedListing()]);

  return (
    <>
      <HeroSection cities={CITIES} propertyTypes={PROPERTY_TYPES} budgets={BUDGETS} featured={featured} />
      <CityMarquee cities={CITIES} />
      <CategoryGallery categories={CATEGORIES} />
      <PropertyListings listings={listings} />
      <WhyChooseUs />
      <PostPropertyCta contact={CONTACT} />
    </>
  );
}
