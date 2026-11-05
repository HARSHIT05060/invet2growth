import { ShieldCheck, Users, CalendarCheck, Headphones } from "lucide-react";
import { pad } from "@/lib/utils";

// Fixed marketing copy with icons, so it lives with the view.
const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Verified listings",
    text: "Every listing is checked before it goes live, so you see real homes at real prices.",
  },
  {
    icon: Users,
    title: "Owner & broker options",
    text: "Deal directly with owners, or work with a broker you trust. Your choice, every time.",
  },
  {
    icon: CalendarCheck,
    title: "Easy site visits",
    text: "Pick a time that suits you and book a visit in a few taps.",
  },
  {
    icon: Headphones,
    title: "Local support",
    text: "Talk to people who know your city, in Hindi or English.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section" id="why">
      <div className="container">
        <div className="promises">
          <div className="promises__intro" data-reveal>
            <p className="eyebrow">Why invest2growth</p>
            <h2>
              A simpler, more <em>honest</em> way to find property.
            </h2>
            <p>
              India&apos;s transparent property marketplace, connecting buyers, owners and tenants with verified homes and
              commercial spaces.
            </p>
          </div>
          <ol className="promises__list">
            {PROMISES.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="promise" data-reveal style={{ "--d": i }}>
                <span className="promise__num">{pad(i + 1)}</span>
                <div className="promise__body">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <span className="promise__icon">
                  <Icon size={22} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
