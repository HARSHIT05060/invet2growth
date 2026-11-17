"use client";

// OpenStreetMap + Leaflet map with price-tag markers. No API key needed.
// To switch to Google Maps later, keep the same props and replace the internals.

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { priceText } from "@/lib/property";

export default function PropertyMap({ items, activeId, onSelect, height = 520, zoom }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const L = useRef(null);
  const fitted = useRef("");

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod.default ?? mod;
      map.current = L.current.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView([22.5, 79], 5);
      L.current
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(map.current);
      layer.current = L.current.layerGroup().addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    if (!map.current || !L.current) return;
    layer.current.clearLayers();
    const pts = items.filter((p) => p.lat && p.lng);
    pts.forEach((p) => {
      const icon = L.current.divIcon({
        className: "",
        html: `<span class="map-pin${p.id === activeId ? " is-active" : ""}">${priceText(p)}</span>`,
        iconSize: null,
      });
      L.current
        .marker([p.lat, p.lng], { icon, title: p.title, keyboard: true })
        .on("click", () => onSelect?.(p.id))
        .addTo(layer.current);
    });
    const key = pts.map((p) => p.id).join();
    if (key === fitted.current) return;
    fitted.current = key;
    if (pts.length === 1) map.current.setView([pts[0].lat, pts[0].lng], zoom ?? 14);
    else if (pts.length > 1) map.current.fitBounds(pts.map((p) => [p.lat, p.lng]), { padding: [48, 48], maxZoom: 13 });
  }

  useEffect(draw, [items, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className="pmap" style={{ height }} role="region" aria-label="Map of properties" />;
}
