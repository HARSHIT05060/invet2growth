import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { pad } from "@/lib/utils";

export default function CategoryGallery({ categories }) {
  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="section__head" data-reveal>
          <div>
            <p className="eyebrow">Browse by category</p>
            <h2>
              Aap kya <em>dhoondh</em> rahe hain?
            </h2>
          </div>
          <Link href="/properties" className="link-arrow">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="cats" data-reveal>
          {categories.map((c, i) => (
            <Link key={c.title} href={c.href} className="cat">
              <img src={c.image} alt="" loading="lazy" />
              <span className="cat__shade" />
              <span className="cat__num">{pad(i + 1)}</span>
              <span className="cat__vert" aria-hidden="true">
                {c.title}
              </span>
              <div className="cat__label glass">
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.note}</p>
                </div>
                <span className="cat__go" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
