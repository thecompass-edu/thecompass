import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#F6F1EA] py-16 px-8 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Left Side: Branding & Mission */}
        <div className="flex flex-col space-y-4 max-w-sm">
          <span className="font-serif font-bold text-lg tracking-tight text-gray-900">THE COMPASS</span>
          <p className="font-serif italic text-gray-700 text-sm leading-relaxed">
            bridging the gap of financial literacy across the world.
          </p>
          <span className="text-gray-500 text-xs pt-6">
            © 2026 The Compass.
          </span>
        </div>

        {/* Right Side: Navigation Columns */}
        <div className="flex space-x-16 text-sm">
          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-gray-900">The Compass</span>
            <Link href="/" className="text-gray-600 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/articles" className="text-gray-600 hover:text-black transition-colors">
              Articles
            </Link>
            <Link href="/purpose" className="text-gray-600 hover:text-black transition-colors">
              Our Purpose
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-black transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-gray-900">Contact Us</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
              Instagram
            </a>
            <a href="mailto:info@thecompass.edu" className="text-gray-600 hover:text-black transition-colors">
              Email
            </a>
            <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
              Substack
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
