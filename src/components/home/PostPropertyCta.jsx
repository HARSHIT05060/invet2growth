import Link from "next/link";
import { Phone, Plus } from "lucide-react";

export default function PostPropertyCta({ contact }) {
  return (
    <section className="section" id="post">
      <div className="container">
        <div className="cta" data-reveal>
          <div className="cta__media">
            <img src="/images/categories/flats.webp" alt="" loading="lazy" className="cta__img" data-parallax="0.15" />
          </div>
          <div className="cta__veil" />
          <div className="cta__copy">
            <p className="eyebrow eyebrow--light">For owners & brokers</p>
            <h2>
              Har sapne ke ghar tak, ab aur <em>aasan</em> raasta.
            </h2>
            <p>List your property for free and reach serious buyers and tenants in your city.</p>
            <div className="cta__actions">
              <Link href="/post-property" className="btn btn--white btn--lg">
                <Plus size={18} strokeWidth={2.4} /> Post property free
              </Link>
              <a href={contact.phoneHref} className="btn btn--glass btn--lg">
                <Phone size={17} /> Talk to us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
