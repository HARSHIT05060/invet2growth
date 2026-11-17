import { notFound } from "next/navigation";
import Link from "next/link";

// Draft legal copy for the prototype. Have it reviewed by counsel before launch.
const DOCS = {
  disclaimer: {
    title: "Disclaimer",
    updated: "17 November 2026",
    sections: [
      ["Market data", "Stock prices, indices, charts and statistics are provided for information only. During development all market data on this site is simulated. In production it will come from a licensed market data provider and may be delayed; it will be labelled as real-time only where the provider's licence permits. Do not rely on it for trading decisions."],
      ["Not investment advice", "invest2growth is not registered with SEBI as an investment adviser or research analyst. Articles, investment tips and market commentary are general education and do not take into account your objectives, financial situation or needs. Nothing on this site is a recommendation to buy, sell or hold any security. Investments in securities are subject to market risks; read all related documents carefully, and consult a SEBI-registered investment adviser before investing."],
      ["No guaranteed returns", "Past performance is not indicative of future results. We never promise or guarantee returns on any investment, including property."],
      ["Property listings", "Listings are posted by owners, agents, builders and agencies. We moderate listings and verify some details, but we do not guarantee the accuracy of prices, areas, approvals or titles. Verify RERA registration, title documents and approvals independently before paying any money. invest2growth does not collect payments for properties."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "17 November 2026",
    sections: [
      ["What we collect", "Account details (name, mobile number, email, city, role), listings and media you upload, inquiries you send or receive, saved properties, stocks and articles, notification preferences, and device and usage data needed to run the service securely."],
      ["Why we use it", "To provide the marketplace, connect buyers with listers, send OTPs and the notifications you choose, prevent fraud and abuse, comply with law, and improve the product. We do not sell your personal data."],
      ["Sharing", "When you send an inquiry, your name, phone and message are shared with that lister. Service providers (hosting, SMS/OTP, email, storage, analytics) process data on our behalf under contract."],
      ["Your rights", "Under the Digital Personal Data Protection Act, 2023 you can access, correct and erase your personal data and withdraw consent. Use Account → Settings & privacy to download your data or delete your account, or write to our grievance officer."],
      ["Retention & security", "We keep data only as long as needed for the purposes above or as required by law. Data is encrypted in transit, access is role-restricted and admin actions are audit-logged."],
      ["Grievance officer", "privacy@invest2growth.com. We respond within the timelines required by applicable law."],
    ],
  },
  terms: {
    title: "Terms of use",
    updated: "17 November 2026",
    sections: [
      ["Accounts", "You must provide accurate information and keep your login secure. Professional accounts (agents, builders, agencies) are subject to verification."],
      ["Listings", "You may list only properties you are authorised to list. Listings must be accurate, include RERA numbers where required, and comply with law. We may edit, reject or remove listings that break these rules."],
      ["Acceptable use", "No spam, scraping, fake inquiries, misleading content or attempts to bypass security. We may suspend accounts that misuse the platform."],
      ["Content", "News and educational content is provided as-is for general information. See the Disclaimer."],
      ["Liability", "To the extent permitted by law, invest2growth is not liable for transactions between users or for decisions made using information on the site."],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: DOCS[slug]?.title ?? "Legal" };
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <div className="container page-pad narrow legal">
      <p className="eyebrow">Legal</p>
      <h1 className="h-page">{doc.title}</h1>
      <p className="muted">Last updated {doc.updated}</p>
      {doc.sections.map(([h, t]) => (
        <section key={h}>
          <h2>{h}</h2>
          <p>{t}</p>
        </section>
      ))}
      <p className="muted small mt-32">
        Questions? <Link href="/contact">Contact us</Link>.
      </p>
    </div>
  );
}
