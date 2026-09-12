import Image from "next/image";
import Link from "next/link";
import TodayFeaturedImage from "@/assets/TodayFeatured/Today_Featured.png";
import MainCard from "@/assets/TodayFeatured/Main_Card.png";
import MaincardMobile from "@/assets/TodayFeatured/Main_Card_Mobile.png";
import HighlightCard from "@/assets/TodayFeatured/Highlight_Card.png";

export const TodayFeatured = () => {
    return (
        <section className="w-full py-16 px-0 md:px-8 flex justify-center bg-[#FEFEFE]">
            <div className="max-w-295 w-full relative p-6 md:p-10 flex flex-col md:flex-row gap-3 md:gap-8">
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={MaincardMobile} 
                        alt="Torn paper background" 
                        fill 
                        className="object-fill md:hidden"
                        priority
                        sizes="(max-width: 768px) 100vw, 0vw"
                    />
                    <Image 
                        src={MainCard} 
                        alt="Torn paper background" 
                        fill 
                        className="object-fill hidden md:block"
                        priority
                        sizes="(max-width: 768px) 0vw, 100vw"
                    />
                </div>
                <span className="block md:hidden relative z-10 text-xs font-essays tracking-widest opacity-90 text-white">
                    Today&rsquo;s Featured Read
                </span>
                <div className="relative z-10 w-full flex flex-col md:flex-row gap-3 md:gap-8 text-white">
                    <div className="w-full md:w-[55%] relative h-45 md:h-auto md:min-h-100">
                        <div className="absolute top-4 md:top-8 -left-1 md:-left-1.5 z-20 px-4 py-3 flex items-center justify-center font-essays font-bold text-sm md:text-base">
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={HighlightCard} 
                                    alt="White torn paper" 
                                    fill 
                                    className="object-fill" 
                                    sizes="250px"
                                />
                            </div>
                            <span className="relative z-10 text-[#354E27] font-medium">Economic & Historical Analysis</span>
                        </div>
                        <div className="relative w-full h-full overflow-hidden grayscale z-10">
                            <Image
                                src={TodayFeaturedImage}
                                alt="Historical farmers"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 55vw"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-[45%] flex flex-col">
                        <div className="md:flex-1 flex flex-col justify-center">
                            <span className="hidden md:block text-xs md:text-[16px] font-essays tracking-widest mb-4 opacity-90">
                                Today&rsquo;s Featured Read
                            </span>
                            <h2 className="text-[25px] md:text-[45px] font-essays font-medium leading-tight mb-1">
                                The Traces That Never Really Disappeared
                            </h2>
                            <p className="text-[16px] md:text-[20px] font-essays mb-3 md:mb-4 text-[#8F9D7A]">
                                How the colonial institutions still shape Indonesia&rsquo;s Economy
                            </p>
                            <div className="bg-white px-3 py-1 md:px-6 md:py-3 flex justify-between items-center font-essays font-semibold  text-xs md:text-[16px] mb-4 md:mb-12 text-[#41563A]">
                                <span>Writer : Insani Dwika</span>
                                <span>Aug 01, 2026</span>
                            </div>                                                                                        
                        </div>
                        <div className="flex justify-end relative z-10">
                            <Link
                                href="https://thecompassedu.substack.com/p/the-traces-that-never-really-disappeared"
                                className="flex items-center gap-2 hover:underline text-sm md:text-[18px] font-essays decoration-1 underline-offset-4"
                            >
                                Read Article
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className="transition-transform duration-300 group-hover:translate-x-1" 
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}