import {TodayFeatured} from "@/sections/home/TodayFeatured";
import PurposeSection from "@/sections/home/PurposeSection";
import RecentArticles from "@/sections/home/RecentArticles";
import Navbar from "@/components/home/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <TodayFeatured />  
      <RecentArticles />
      <PurposeSection />

    </main>
  );
}