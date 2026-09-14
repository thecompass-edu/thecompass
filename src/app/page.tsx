import Hero from "./components/Hero";
import { TodayFeatured } from "@/sections/home/TodayFeatured";
import PurposesSection from "@/sections/home/PurposesSection";
import RecentArticles from "@/sections/home/RecentArticles";

export default function Home() {
  return (
    <main>
      <Hero />
      <TodayFeatured />
      <PurposesSection />
      <RecentArticles />
    </main>
  );
}