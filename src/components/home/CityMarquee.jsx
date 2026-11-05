export default function CityMarquee({ cities }) {
  // Rendered twice so the loop is seamless.
  const row = (hidden) => (
    <div className="marquee__row" aria-hidden={hidden || undefined}>
      {cities.map((c, i) => (
        <span key={c} className={i % 2 ? "is-outline" : ""}>
          {c}
          <i aria-hidden="true">✦</i>
        </span>
      ))}
    </div>
  );
  return (
    <section className="marquee" aria-label="Cities we cover">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
