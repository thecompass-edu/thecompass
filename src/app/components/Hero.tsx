import Image from "next/image";
import Marquee from "./Marquee";

export default function Hero() {
  return (
    <>
      <section className="hero">
        <nav className="hero-nav">
          <a href="/" className="hero-logo">
            <span className="hero-logo-mark">✥</span>
            <span>THE COMPASS</span>
          </a>

          <div className="hero-links">
            <a href="/">Home</a>
            <a href="/articles">Articles</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-eyebrow">FINANCIAL LITERACY FOR YOUNG PEOPLE</p>

            <h1>
              Know Your Money,
              <br />
              Own Your Future.
            </h1>

            <p className="hero-description">
              We&apos;re a youth organization working to close the financial
              literacy gap through accessible education, real-world tools, and
              community.
            </p>

            <div className="hero-actions">
              <a href="/articles" className="hero-button hero-button-primary">
                Explore Articles
              </a>

              <a href="/articles" className="hero-button hero-button-secondary">
                Read Latest Article
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <Image
              src="/coins-hero.png"
              alt=""
              width={500}
              height={300}
              className="hero-coins"
              priority
            />

            <Image
              src="/piggybank-image.png"
              alt=""
              width={500}
              height={500}
              className="hero-pig"
              priority
            />
          </div>
        </div>
      </section>

      <Marquee />
    </>
  );
}