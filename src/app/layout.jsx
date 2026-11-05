import { Urbanist, Instrument_Serif } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const description =
  "Verified flats, houses, plots and commercial spaces across India. Buy, sell or rent with owners and brokers directly.";

export const metadata = {
  // Set NEXT_PUBLIC_SITE_URL in Vercel once you have a custom domain.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000")
  ),
  title: {
    default: "invest2growth | Buy, Sell & Rent Properties Across India",
    template: "%s | invest2growth",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "invest2growth",
    title: "invest2growth | Buy, Sell & Rent Properties Across India",
    description,
    images: ["/images/hero.webp"],
  },
};

export const viewport = {
  themeColor: "#f4f2ee",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: browser extensions (ColorZilla, launchers, etc.)
    // add attributes to <html>/<body> before React loads. This only silences
    // attribute warnings on these two tags, not on the rest of the page.
    <html lang="en" className={`${urbanist.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide reveal-on-scroll content only when JS is running.
            If the page scripts haven't started after 3s, show everything anyway. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__motionReady)d.classList.remove('js')},3000)",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
