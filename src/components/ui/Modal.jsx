"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Accessible dialog. Closes on Escape and backdrop click; returns focus on close. */
export default function Modal({ open, onClose, title, children, footer, size = "md", side = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const last = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("has-modal");
    window.__lenis?.stop();
    const first = ref.current?.querySelector("input, select, textarea, button:not(.modal__close)");
    (first ?? ref.current)?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("has-modal");
      window.__lenis?.start();
      last?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={`modal${side ? " modal--side" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className={`modal__panel modal__panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        ref={ref}
        tabIndex={-1}
        data-lenis-prevent
      >
        <div className="modal__head">
          <h2>{title}</h2>
          <button type="button" className="modal__close icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/** Small yes/no dialog. */
export function Confirm({ open, onClose, onConfirm, title = "Are you sure?", message, confirmLabel = "Confirm", danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn--sm ${danger ? "btn--danger" : "btn--primary"}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted">{message}</p>
    </Modal>
  );
}
