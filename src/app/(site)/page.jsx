import HeroSection from "@/components/home/HeroSection";
import CityMarquee from "@/components/home/CityMarquee";
import CategoryGallery from "@/components/home/CategoryGallery";
import PropertyListings from "@/components/home/PropertyListings";
import MarketSnapshot from "@/components/home/MarketSnapshot";
import LatestNews from "@/components/home/LatestNews";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PostPropertyCta from "@/components/home/PostPropertyCta";
import AdSlot from "@/components/ui/AdSlot";
import { CITIES, CATEGORIES } from "@/data/catalog";
import { CONTACT } from "@/data/site";

export default function HomePage() {
  return (
    <>
      <HeroSection cities={CITIES} />
      <CityMarquee cities={CITIES} />
      <CategoryGallery categories={CATEGORIES} />
      <PropertyListings />
      <div className="container">
        <AdSlot placement="home-mid" />
      </div>
      <MarketSnapshot />
      <LatestNews />
      <WhyChooseUs />
      <PostPropertyCta contact={CONTACT} />
    </>
  );
}
