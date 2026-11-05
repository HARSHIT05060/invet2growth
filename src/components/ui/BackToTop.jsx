"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  function toTop() {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <button type="button" className="to-top" onClick={toTop}>
      Back to top <ArrowUp size={15} />
    </button>
  );
}
