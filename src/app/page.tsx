import Navbar from "@/components/home/Navbar";

import HeroSection from "@/sections/home/HeroSection";
import { TodayFeatured } from "@/sections/home/TodayFeatured";
import PurposeSection from "@/sections/home/PurposeSection";
import RecentArticles from "@/sections/home/RecentArticles";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />

      <HeroSection />

      <TodayFeatured />

      <RecentArticles />

      <PurposeSection />

      <Footer />
    </main>
  );
}