const items = [
  "Build confidence",
  "Long Term Mindset",
  "Develop better habits",
  "Thoughtful Decisions",
  "Understand your money",
];

export default function Marquee() {
  return (
    <div className="marquee" aria-label="The Compass values">
      <div className="marquee-track">
        {[...items, ...items].map((item, index) => (
          <div className="marquee-item" key={`${item}-${index}`}>
            <span>{item}</span>
            <span className="marquee-symbol" aria-hidden="true">
              ✧
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}