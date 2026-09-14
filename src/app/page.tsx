import {TodayFeatured} from "@/sections/home/TodayFeatured";
import PurposeSection from "@/sections/home/PurposeSection";
import RecentArticles from "@/sections/home/RecentArticles";

export default function Home() {
  return (
    <main>
      <TodayFeatured />  
      <RecentArticles />
      <PurposeSection />
    </main>
  );
}