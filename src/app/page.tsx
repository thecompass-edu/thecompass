export default function Home () {
    return (
    <main>
<section className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto px-6 py-16 text-center md:text-left">
  <div className="w-full">
    <section className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto px-6 py-16 text-center md:text-left">
  <div className="w-full">
    <h1 className="text-4xl md:text-5xl font-bold text-[#1b4332] mb-4 leading-tight">
      Know Your Money, Own Your Future.
    </h1>
    <p className="text-lg text-[#4f6f52] mb-8 leading-relaxed">
      Build confidence, long-term habits, and thoughtful financial decisions.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
      <a 
        href="#explore" 
        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold px-6 py-3 rounded-lg text-center transition-colors"
      >
        Explore Articles
      </a>
      <a 
        href="#latest" 
        className="bg-[#e9edc9] hover:bg-[#ccd5ae] text-[#2d6a4f] font-semibold px-6 py-3 rounded-lg text-center transition-colors"
      >
        Read Latest Articles
      </a>
    </div>
  </div>
</section>
    <p className="text-lg text-[#4f6f52] mb-8 leading-relaxed">
      Build confidence, long-term habits, and thoughtful financial decisions.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
      <a 
        href="#explore" 
        className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold px-6 py-3 rounded-lg text-center transition-colors"
      >
        Explore Articles
      </a>
      <a 
        href="#latest" 
        className="bg-[#e9edc9] hover:bg-[#ccd5ae] text-[#2d6a4f] font-semibold px-6 py-3 rounded-lg text-center transition-colors"
      >
        Read Latest Articles
      </a>
    </div>
  </div>
</section>
    </main>
    );
}
