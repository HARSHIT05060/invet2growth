"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Page-wide motion, mounted once in the root layout:
 *  - Lenis smooth scrolling (skipped when the user prefers reduced motion)
 *  - [data-reveal]         → gets .is-in once it scrolls into view
 *  - [data-parallax="0.2"] → drifts vertically at that speed while on screen
 * Elements are looked up on every update, so pages opened by client-side
 * navigation work without a reload.
 */
export default function SmoothScroll() {
  useEffect(() => {
    window.__motionReady = true;
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis;

    if (!reduce) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -88 } });
      window.__lenis = lenis;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;

      // Reveal anything whose top has entered the lower ~92% of the screen
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-in");
      });

      if (reduce) return;
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const max = r.height * 0.075; // images have ~8% slack top and bottom
        let offset = (r.top + r.height / 2 - vh / 2) * -speed;
        offset = Math.max(-max, Math.min(max, offset));
        el.style.setProperty("--py", `${offset.toFixed(1)}px`);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Page changes and filtered listings add new nodes; check them too.
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
