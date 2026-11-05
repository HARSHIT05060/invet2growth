import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="page page--center">
      <div className="container">
        <div className="page__intro">
          <p className="eyebrow">Error 404</p>
          <h1>
            This page has <em>moved out.</em>
          </h1>
          <p>The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
          <div className="page__actions">
            <Link href="/" className="btn btn--primary btn--lg">
              <ArrowLeft size={18} /> Back to home
            </Link>
            <Link href="/contact" className="btn btn--ghost btn--lg">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
