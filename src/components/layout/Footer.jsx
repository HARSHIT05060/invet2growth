import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import BackToTop from "@/components/ui/BackToTop";
import { CONTACT } from "@/data/site";
import { CITIES, CATEGORIES } from "@/data/catalog";

const SOCIAL = [
  {
    label: "Instagram",
    path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
  },
  {
    label: "Facebook",
    path: "M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z",
  },
  {
    label: "YouTube",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <p className="footer__lead">
              Ready to find your <em>place?</em>
            </p>
            <ul className="footer__contact">
              <li>
                <a href={CONTACT.phoneHref}>
                  <Phone size={16} /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Mail size={16} /> {CONTACT.email}
                </a>
              </li>
            </ul>
            <div className="social">
              {SOCIAL.map((s) => (
                <a key={s.label} href="#" aria-label={s.label}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d={s.path} fillRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Popular cities</h4>
            <ul>
              {CITIES.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link href="/#properties">Properties in {c}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.title}>
                  <Link href="/#categories">{c.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/login">Log in</Link>
              </li>
              <li>
                <Link href="/#post">Post property</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <p>© {year} invest2growth. All rights reserved.</p>
          <BackToTop />
        </div>
      </div>

      <div className="footer__mark" aria-hidden="true">
        invest<span>2</span>growth
      </div>
    </footer>
  );
}
