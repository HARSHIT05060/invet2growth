import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Log in",
  description: "invest2growth accounts are coming soon.",
};

export default function LoginPage() {
  return (
    <section className="page page--center">
      <div className="container">
        <div className="page__intro" data-reveal>
          <p className="eyebrow">Accounts</p>
          <h1>
            Log in is <em>coming soon.</em>
          </h1>
          <p>
            Saved homes and listing management are on the way. Until then, our team can help you buy, sell or rent by
            phone or email.
          </p>
          <div className="page__actions">
            <Link href="/" className="btn btn--ghost btn--lg">
              <ArrowLeft size={18} /> Back to home
            </Link>
            <Link href="/contact" className="btn btn--primary btn--lg">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
