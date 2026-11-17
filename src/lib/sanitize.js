// Allow-list HTML sanitiser for CMS article bodies (XSS protection).
// Runs identically on server and client. The backend must sanitise again on save.

const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "hr", "code", "pre"]);

export function sanitizeHtml(html = "") {
  return String(html)
    .replace(/<(script|style|iframe|object|embed|noscript|template)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)\b([^>]*)>/gi, (m, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return "";
      if (m.startsWith("</")) return `</${t}>`;
      if (t === "a") {
        const href = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs);
        const url = (href?.[2] ?? href?.[3] ?? "").trim();
        const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(url) ? url.replace(/"/g, "&quot;") : "";
        const ext = /^https?:\/\//i.test(safe);
        return safe ? `<a href="${safe}"${ext ? ' target="_blank" rel="noopener noreferrer nofollow"' : ""}>` : "<a>";
      }
      return `<${t}>`;
    });
}
