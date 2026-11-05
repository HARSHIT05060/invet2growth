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
          <a href="#categories" className="link-arrow">
            View all <ArrowRight size={16} />
          </a>
        </div>

        <div className="cats" data-reveal>
          {categories.map((c, i) => (
            <a key={c.title} href="#properties" className="cat">
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
