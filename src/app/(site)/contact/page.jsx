import { Phone, Mail, Plus, ArrowUpRight } from "lucide-react";
import { CONTACT } from "@/data/site";

export const metadata = {
  title: "Contact us",
  description: "Call or email invest2growth to buy, sell or rent property, or to list your property for free.",
};

export default function ContactPage() {
  const cards = [
    { icon: Phone, label: "Call us", value: CONTACT.phone, href: CONTACT.phoneHref },
    { icon: Mail, label: "Email us", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    {
      icon: Plus,
      label: "List your property",
      value: "Free for owners & brokers",
      href: `mailto:${CONTACT.email}?subject=${encodeURIComponent("List my property")}`,
    },
  ];

  return (
    <section className="page">
      <div className="container">
        <div className="page__intro" data-reveal>
          <p className="eyebrow">Contact</p>
          <h1>
            Let&apos;s find your <em>place.</em>
          </h1>
          <p>Buying, selling or renting? Talk to our team and we&apos;ll help you take the next step.</p>
        </div>

        <div className="contact-grid">
          {cards.map(({ icon: Icon, label, value, href }, i) => (
            <a key={label} href={href} className="contact-card" data-reveal style={{ "--d": i }}>
              <span className="contact-card__icon">
                <Icon size={22} />
              </span>
              <span className="contact-card__label">{label}</span>
              <span className="contact-card__value">{value}</span>
              <span className="contact-card__go" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
