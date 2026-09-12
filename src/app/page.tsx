
export default function Home () {
    return (
    <main>
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfbf7] flex flex-col items-center">
      <section className="w-full max-w-md px-6 pt-10 flex flex-col items-center text-center">
        <h1 className="font-serif text-4xl text-[#1b3b18] font-bold leading-tight mb-4">
          Know Your Money, Own Your Future.
        </h1>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          We’re a youth organization working to close the financial literacy gap through accessible education, real-world tools, and community.
        </p>

        <div className="w-full flex flex-col space-y-3 mb-8">
          <Link 
            href="#articles" 
            className="w-full py-3 bg-[#223d1e] text-white font-medium rounded-xl shadow hover:bg-[#1b3b18] transition text-center"
          >
            Explore Articles
          </Link>
          <Link 
            href="#latest" 
            className="w-full py-3 bg-white border border-stone-300 text-stone-800 font-medium rounded-xl hover:bg-stone-50 transition text-center"
          >
            Read Latest Article
          </Link>
        </div>
      </section>

      <div className="w-full overflow-hidden whitespace-nowrap bg-[#f4f1ea] py-3 border-y border-[#e6dec9] my-4">
        <div className="inline-block animate-[marquee_20s_linear_infinite] space-x-8 text-sm text-stone-700 font-medium">
          <span>Build confidence</span>
          <span>•</span>
          <span>Long Term Mindset</span>
          <span>•</span>
          <span>Develop better</span>
          <span>•</span>
          <span>Build confidence</span>
          <span>•</span>
          <span>Long Term Mindset</span>
          <span>•</span>
          <span>Develop better</span>
        </div>
      </div>
    </main>
  );

    </main>
    );
}
