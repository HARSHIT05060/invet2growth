"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, RemoveFormatting, ImagePlus, X, AlertTriangle, ShieldCheck,
  Send, Save, CalendarClock, ExternalLink, ArrowLeft, Trash2,
} from "lucide-react";
import { useDb, actions, canAdmin, getState } from "@/lib/db/store";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify, dateTime } from "@/lib/format";
import { estimateReadMins, complianceLabel, COMPLIANCE_TONE } from "@/lib/articles";
import { Field, Toggle, Status } from "@/components/ui/bits";
import { Confirm } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { PageHeader } from "./ui";

// Categories where content can read as investment advice → compliance review required before publishing.
export const REVIEW_CATEGORIES = ["investment-tips", "market-analysis", "mutual-funds", "ipo-updates", "property-investment"];

// Phrases that conflict with SEBI advertising norms / our content policy.
const RISKY = [
  [/guarantee[ds]?\s+(returns?|profit)/i, "Guaranteed returns"],
  [/assured\s+(returns?|profit)/i, "Assured returns"],
  [/risk[-\s]?free/i, "“Risk-free” claim"],
  [/sure[-\s]?shot/i, "“Sure-shot” claim"],
  [/multibagger/i, "“Multibagger” claim"],
  [/\b(buy|sell)\s+(now|today|immediately)\b/i, "Direct buy/sell call"],
  [/target\s+price/i, "Target price (research analyst territory)"],
  [/double\s+your\s+money/i, "“Double your money” claim"],
];

const BLANK = {
  title: "", slug: "", excerpt: "", category: "stock-market-news", tags: [], image: "", body: "<p></p>", author: "", featured: false, trending: false,
  seoTitle: "", metaDescription: "", status: "draft", scheduledAt: null, publishedAt: null, compliance: "not-required", likes: 0, views: 0, deletedAt: null,
};

function compress(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function ArticleEditor({ id, defaultCategory }) {
  const router = useRouter();
  const existing = useDb((s) => (id ? s.articles.find((a) => a.id === id) : null), [id]);
  const cats = useDb((s) => s.articleCategories);
  const tagPool = useDb((s) => s.articleTags);
  const admin = useDb((s) => s.admins.find((a) => a.id === s.adminSession?.adminId));
  const canReview = useDb((s) => canAdmin(s, "compliance"));
  const [a, setA] = useState(() => ({ ...BLANK, category: defaultCategory ?? BLANK.category, author: admin?.name ?? "" }));
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [mode, setMode] = useState("now"); // now | schedule
  const [del, setDel] = useState(false);
  const [errors, setErrors] = useState({});
  const editor = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (existing && !loaded.current) {
      loaded.current = true;
      setA({ ...BLANK, ...existing });
      setSlugTouched(true);
      if (existing.status === "scheduled") setMode("schedule");
      if (editor.current) editor.current.innerHTML = sanitizeHtml(existing.body);
    }
  }, [existing]);

  useEffect(() => {
    if (!id && editor.current && !editor.current.innerHTML) editor.current.innerHTML = BLANK.body;
  }, [id]);

  const set = (x) => setA((o) => ({ ...o, ...x }));
  const needsReview = REVIEW_CATEGORIES.includes(a.category);
  const plain = (a.body || "").replace(/<[^>]+>/g, " ");
  const flags = useMemo(() => RISKY.filter(([re]) => re.test(`${a.title} ${a.excerpt} ${plain}`)).map(([, l]) => l), [a.title, a.excerpt, plain]);

  if (id && !existing) return <p className="muted">Article not found. <Link href="/admin/articles">Back to articles</Link></p>;

  function exec(cmd, val) {
    editor.current?.focus();
    document.execCommand(cmd, false, val);
    syncBody();
  }
  function syncBody() {
    set({ body: editor.current?.innerHTML ?? "" });
  }

  function validate(publishing) {
    const e = {};
    if (a.title.trim().length < 10) e.title = "At least 10 characters";
    if (!a.slug.trim()) e.slug = "Required";
    else if (getState().articles.some((x) => x.slug === a.slug && x.id !== a.id)) e.slug = "Another article uses this slug";
    if (a.excerpt.trim().length < 30) e.excerpt = "At least 30 characters";
    if (publishing && !a.image) e.image = "Add a featured image before publishing";
    if (publishing && plain.trim().split(/\s+/).length < 40) e.body = "Write at least 40 words before publishing";
    if (publishing && mode === "schedule" && (!a.scheduledAt || Date.parse(a.scheduledAt) <= Date.now())) e.scheduledAt = "Pick a future date and time";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function save(kind) {
    const publishing = kind === "publish";
    if (!validate(publishing)) return toast("Please fix the highlighted fields", "error");
    if (publishing && needsReview && a.compliance !== "approved") {
      return toast("This category needs compliance approval before it can be published", "error");
    }
    if (publishing && flags.length) return toast("Remove the flagged phrases before publishing", "error");
    const body = sanitizeHtml(editor.current?.innerHTML ?? a.body);
    const record = {
      ...a,
      body,
      readMins: estimateReadMins(body),
      tags: a.tags,
      ...(kind === "draft" && { status: a.status === "published" ? "published" : "draft" }),
      ...(kind === "unpublish" && { status: "draft" }),
      ...(publishing && mode === "now" && { status: "published", publishedAt: a.publishedAt ?? new Date().toISOString(), scheduledAt: null }),
      ...(publishing && mode === "schedule" && { status: "scheduled", publishedAt: null }),
      ...(kind === "review" && { compliance: "pending" }),
    };
    const saved = actions.adminSave("articles", record, kind === "publish" ? (mode === "schedule" ? `Scheduled “${a.title}”` : `Published “${a.title}”`) : kind === "review" ? `Sent “${a.title}” for compliance review` : `Saved “${a.title}”`);
    toast({ publish: mode === "schedule" ? "Article scheduled" : "Article published", draft: "Saved", review: "Sent for compliance review", unpublish: "Moved back to drafts" }[kind]);
    if (!id) router.replace(`/admin/articles/${saved.id}`);
  }

  function setCompliance(decision) {
    set({ compliance: decision });
    actions.adminSave("articles", { ...a, body: editor.current?.innerHTML ?? a.body, compliance: decision }, `Compliance ${decision}: “${a.title}”`);
    toast(decision === "approved" ? "Compliance approved" : "Compliance rejected");
  }

  async function onImage(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Choose an image file", "error");
    set({ image: await compress(f) });
  }

  function addTag(v) {
    const t = v.trim().replace(/^#/, "");
    if (t && !a.tags.includes(t)) set({ tags: [...a.tags, t] });
    setTagInput("");
  }

  const seoTitle = a.seoTitle || a.title;
  const metaDesc = a.metaDescription || a.excerpt;

  return (
    <>
      <PageHeader
        title={id ? "Edit article" : "New article"}
        description={
          existing ? (
            <>
              <Status tone={{ published: "good", draft: "neutral", scheduled: "info" }[existing.status]}>{existing.status}</Status>{" "}
              {existing.status === "scheduled" && `for ${dateTime(existing.scheduledAt)}`}
              {existing.publishedAt && existing.status === "published" && `since ${dateTime(existing.publishedAt)}`}
            </>
          ) : (
            "Write, review and publish news, tips and analysis."
          )
        }
        actions={
          <>
            <Link href="/admin/articles" className="btn btn--ghost btn--sm">
              <ArrowLeft size={15} /> All articles
            </Link>
            {existing?.status === "published" && (
              <Link href={`/news/${existing.slug}`} target="_blank" className="btn btn--ghost btn--sm">
                <ExternalLink size={15} /> View live
              </Link>
            )}
          </>
        }
      />

      <div className="editor">
        <div className="editor__main">
          <section className="panel form-stack">
            <Field label="Title" error={errors.title}>
              <input
                className="input input--title"
                value={a.title}
                onChange={(e) => set({ title: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })}
                placeholder="Headline"
              />
            </Field>
            <Field label="URL slug" hint={`/news/${a.slug || "…"}`} error={errors.slug}>
              <input
                className="input"
                value={a.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: slugify(e.target.value) });
                }}
              />
            </Field>
            <Field label="Short description" hint={`${a.excerpt.length}/220 · shown on cards and as the article standfirst`} error={errors.excerpt}>
              <textarea className="input" rows={2} maxLength={220} value={a.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
            </Field>

            <div className="f">
              <span className="f__label">Content</span>
              <div className="rte">
                <div className="rte__bar" role="toolbar" aria-label="Formatting">
                  {[
                    [Bold, "Bold", () => exec("bold")],
                    [Italic, "Italic", () => exec("italic")],
                    [Heading2, "Heading", () => exec("formatBlock", "<h2>")],
                    [Heading3, "Subheading", () => exec("formatBlock", "<h3>")],
                    [List, "Bulleted list", () => exec("insertUnorderedList")],
                    [ListOrdered, "Numbered list", () => exec("insertOrderedList")],
                    [Quote, "Quote", () => exec("formatBlock", "<blockquote>")],
                    [
                      Link2,
                      "Link",
                      () => {
                        const url = window.prompt("Link URL (https://… or /path)");
                        if (url && /^(https?:\/\/|\/)/.test(url)) exec("createLink", url);
                      },
                    ],
                    [RemoveFormatting, "Clear formatting", () => { exec("removeFormat"); exec("formatBlock", "<p>"); }],
                  ].map(([Icon, label, fn]) => (
                    <button key={label} type="button" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={fn}>
                      <Icon size={16} />
                    </button>
                  ))}
                  <span className="rte__count">{plain.trim().split(/\s+/).filter(Boolean).length} words · {estimateReadMins(a.body)} min read</span>
                </div>
                <div
                  ref={editor}
                  className="rte__area prose"
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline="true"
                  aria-label="Article content"
                  onInput={syncBody}
                  onBlur={syncBody}
                  onPaste={(e) => {
                    e.preventDefault();
                    const html = e.clipboardData.getData("text/html");
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertHTML", false, html ? sanitizeHtml(html) : text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]).replace(/\n/g, "<br>"));
                    syncBody();
                  }}
                />
              </div>
              {errors.body && <span className="f__error">{errors.body}</span>}
            </div>
          </section>

          <section className="panel form-stack">
            <div className="panel__head">
              <h2>SEO</h2>
            </div>
            <Field label="SEO title" hint={`${seoTitle.length}/60 characters${seoTitle.length > 60 ? " — may be cut off in search results" : ""}`}>
              <input className="input" value={a.seoTitle} placeholder={a.title} onChange={(e) => set({ seoTitle: e.target.value })} />
            </Field>
            <Field label="Meta description" hint={`${metaDesc.length}/160 characters`}>
              <textarea className="input" rows={2} value={a.metaDescription} placeholder={a.excerpt} onChange={(e) => set({ metaDescription: e.target.value })} />
            </Field>
            <div className="serp" aria-label="Search result preview">
              <span className="serp__url">invest2growth.com › news › {a.slug || "article"}</span>
              <span className="serp__title">{seoTitle.slice(0, 60) || "Article title"}{seoTitle.length > 60 && "…"}</span>
              <span className="serp__desc">{metaDesc.slice(0, 160) || "Meta description"}{metaDesc.length > 160 && "…"}</span>
            </div>
          </section>
        </div>

        <aside className="editor__side">
          <section className="panel form-stack">
            <div className="panel__head">
              <h2>Publish</h2>
            </div>
            <div className="seg seg--light seg--full">
              <button type="button" className={mode === "now" ? "is-active" : ""} onClick={() => setMode("now")}>
                Publish now
              </button>
              <button type="button" className={mode === "schedule" ? "is-active" : ""} onClick={() => setMode("schedule")}>
                <CalendarClock size={15} /> Schedule
              </button>
            </div>
            {mode === "schedule" && (
              <Field label="Publish at (your local time)" error={errors.scheduledAt}>
                <input className="input" type="datetime-local" value={toLocalInput(a.scheduledAt)} onChange={(e) => set({ scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </Field>
            )}
            <Toggle label="Featured" description="Show in the featured slot on News" checked={a.featured} onChange={(v) => set({ featured: v })} />
            <Toggle label="Trending" description="Show in the trending list" checked={a.trending} onChange={(v) => set({ trending: v })} />
            <div className="editor__btns">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => save("draft")}>
                <Save size={15} /> Save {a.status === "published" ? "changes" : "draft"}
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => save("publish")}>
                <Send size={15} /> {mode === "schedule" ? "Schedule" : a.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
            {existing && existing.status !== "draft" && (
              <button type="button" className="link-inline" onClick={() => save("unpublish")}>
                Unpublish (move to drafts)
              </button>
            )}
            {existing && (
              <button type="button" className="link-inline btn--danger-text" onClick={() => setDel(true)}>
                <Trash2 size={14} /> Move to trash
              </button>
            )}
          </section>

          <section className={`panel form-stack compliance${needsReview ? " is-required" : ""}`}>
            <div className="panel__head">
              <h2>
                <ShieldCheck size={18} /> Compliance
              </h2>
              <Status tone={COMPLIANCE_TONE[a.compliance]}>{complianceLabel(a.compliance)}</Status>
            </div>
            {needsReview ? (
              <p className="small muted">
                This category can be read as investment advice. A compliance reviewer must approve it before publishing. Content must be
                educational: no guaranteed returns, no personalised buy/sell calls.
              </p>
            ) : (
              <p className="small muted">Review is optional for this category.</p>
            )}
            {flags.length > 0 && (
              <div className="banner banner--bad small">
                <AlertTriangle size={16} />
                <span>
                  Flagged phrases: <strong>{flags.join(", ")}</strong>. Rephrase before publishing.
                </span>
              </div>
            )}
            {a.compliance !== "pending" && a.compliance !== "approved" && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => save("review")}>
                Submit for review
              </button>
            )}
            {canReview && a.compliance === "pending" && (
              <div className="editor__btns">
                <button type="button" className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setCompliance("rejected")}>
                  Reject
                </button>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setCompliance("approved")} disabled={flags.length > 0}>
                  Approve
                </button>
              </div>
            )}
            {!canReview && a.compliance === "pending" && <p className="small muted">Waiting for a reviewer with the Compliance permission.</p>}
          </section>

          <section className="panel form-stack">
            <div className="panel__head">
              <h2>Details</h2>
            </div>
            <Field label="Category">
              <select className="input" value={a.category} onChange={(e) => set({ category: e.target.value })}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Author">
              <input className="input" value={a.author} onChange={(e) => set({ author: e.target.value })} />
            </Field>
            <div className="f">
              <span className="f__label">Tags</span>
              <div className="chips">
                {a.tags.map((t) => (
                  <span key={t} className="fchip fchip--legend">
                    #{t}
                    <button type="button" aria-label={`Remove ${t}`} onClick={() => set({ tags: a.tags.filter((x) => x !== t) })}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                className="input input--sm mt-8"
                list="tag-pool"
                value={tagInput}
                placeholder="Add a tag and press Enter"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
              <datalist id="tag-pool">
                {tagPool.filter((t) => !a.tags.includes(t)).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="f">
              <span className="f__label">Featured image</span>
              {a.image ? (
                <div className="feat-img">
                  <img src={a.image} alt="Featured" />
                  <button type="button" className="thumbs__btn" aria-label="Remove image" onClick={() => set({ image: "" })}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="dropzone dropzone--sm">
                  <ImagePlus size={22} />
                  <span className="small">Upload image (16:9 works best)</span>
                  <input type="file" accept="image/*" hidden onChange={onImage} />
                </label>
              )}
              {errors.image && <span className="f__error">{errors.image}</span>}
            </div>
          </section>
        </aside>
      </div>

      <Confirm
        open={del}
        onClose={() => setDel(false)}
        danger
        title="Move this article to trash?"
        message="It will be removed from the website. You can restore it from the Trash filter."
        confirmLabel="Move to trash"
        onConfirm={() => {
          actions.adminRemove("articles", id, { soft: true, label: `Trashed “${a.title}”` });
          toast("Article moved to trash");
          router.push("/admin/articles");
        }}
      />
    </>
  );
}
