"use client";

import { useEffect, useRef, useState } from "react";
import { market } from "./index";
import { useDb } from "@/lib/db/store";

/**
 * Polls a market call while the page is visible. With a streaming provider this
 * is where a WebSocket subscription would plug in; the return shape stays the same.
 * Returns { data, error, loading }.
 */
export function useMarket(fetcher, deps = [], { poll = true } = {}) {
  const cfg = useDb((s) => s.marketConfig);
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const fn = useRef(fetcher);
  fn.current = fetcher;

  useEffect(() => {
    let alive = true;
    let timer;
    const run = async () => {
      try {
        const data = await fn.current(market, cfg);
        if (alive) setState({ data, error: null, loading: false });
      } catch (error) {
        if (alive) setState((s) => ({ data: s.data, error, loading: false }));
      }
    };
    run();
    if (poll) {
      const ms = Math.max(2, cfg.refreshSeconds || 5) * 1000;
      timer = setInterval(() => document.visibilityState === "visible" && run(), ms);
    }
    return () => {
      alive = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, poll, ...deps]);

  return state;
}

/** Remembers the previous value so a cell can flash green/red when it ticks. */
export function useTick(value) {
  const prev = useRef(value);
  const [dir, setDir] = useState(null);
  useEffect(() => {
    if (prev.current != null && value != null && value !== prev.current) {
      setDir(value > prev.current ? "up" : "down");
      const t = setTimeout(() => setDir(null), 700);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  return dir;
}
