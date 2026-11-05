/** 1 → "01" */
export const pad = (n) => String(n).padStart(2, "0");

/** Smooth-scroll to an element by id, through Lenis when it's running. */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -88 });
  else el.scrollIntoView({ behavior: "smooth" });
}
