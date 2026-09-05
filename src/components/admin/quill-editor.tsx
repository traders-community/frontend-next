"use client";

import React, { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { cn } from "@/lib/utils";
import "@/styles/quill.snow.css";

/**
 * Tags that Quill's Delta model cannot represent.
 * If the content contains any of these, switching to the Visual Editor
 * would silently destroy the author's rich formatting.
 */
const RICH_TAGS = [
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "dl", "dt", "dd",
  "figure", "figcaption",
  "article", "section", "aside",
  "details", "summary",
  "mark", "abbr", "cite", "time",
  "sup", "sub", "kbd",
];

function hasRichHtml(html: string): boolean {
  if (!html) return false;
  return RICH_TAGS.some((tag) => new RegExp(`<${tag}\\b`, "i").test(html));
}

// Declare Quill on window
declare global {
  interface Window {
    Quill: any;
  }
}

// Global promise singleton to prevent duplicate script loads
let quillLoadingPromise: Promise<any> | null = null;

function loadQuillScript(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Quill can only be loaded in the browser"));
  }

  if (window.Quill) {
    return Promise.resolve(window.Quill);
  }

  if (quillLoadingPromise) {
    return quillLoadingPromise;
  }

  quillLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("quill-script") as HTMLScriptElement | null;
    if (existingScript) {
      if (window.Quill) {
        resolve(window.Quill);
      } else {
        existingScript.addEventListener("load", () => resolve(window.Quill));
        existingScript.addEventListener("error", (err) => reject(err));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "quill-script";
    script.src = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js";
    script.async = true;
    script.onload = () => {
      if (window.Quill) {
        resolve(window.Quill);
      } else {
        reject(new Error("Quill failed to attach to window"));
      }
    };
    script.onerror = (err) => {
      quillLoadingPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return quillLoadingPromise;
}

export interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuillEditor({
  value,
  onChange,
  placeholder = "Write your blog post content here...",
  className,
}: QuillEditorProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "html" | "preview">(
    // If the initial content has tags Quill can't represent, start on HTML tab
    // to avoid corrupting the content before the user even touches anything.
    hasRichHtml(value) ? "html" : "editor"
  );
  const [isQuillReady, setIsQuillReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Warning dialog shown when switching to Visual Editor with rich HTML
  const [showRichHtmlWarning, setShowRichHtmlWarning] = useState(false);
  const pendingTabRef = useRef<"editor" | "html" | "preview" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInternalChangeRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Paste safe HTML into Quill without moving cursor if already identical
  const pasteHtml = (html: string) => {
    const quill = quillInstanceRef.current;
    if (!quill) return;
    const safeHtml = html || "";
    if (quill.root.innerHTML === safeHtml) return;
    quill.clipboard.dangerouslyPasteHTML(safeHtml, "api");
  };

  // Load and initialize Quill
  useEffect(() => {
    let isMounted = true;

    loadQuillScript()
      .then((Quill) => {
        if (!isMounted || !containerRef.current || quillInstanceRef.current) return;

        // Create Quill instance with exact React options
        // Heading 1 removed to enforce single H1 per page (the blog title)
        const quill = new Quill(containerRef.current, {
          theme: "snow",
          placeholder,
          modules: {
            toolbar: [
              [{ header: [2, 3, 4, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "code-block"],
              [{ color: [] }, { background: [] }],
              ["link", "image"],
              ["clean"],
            ],
          },
        });

        quillInstanceRef.current = quill;

        // Set initial HTML — skip if content has rich tags Quill can't represent
        // (user was routed to HTML tab, so loading into Quill would corrupt it)
        if (value && !hasRichHtml(value)) {
          quill.clipboard.dangerouslyPasteHTML(value, "api");
          hasInitializedRef.current = true;
        }

        // Listen for user edits only.
        // Checking source === "user" prevents programmatic pastes or tab switches
        // from reformatting/stripping custom tags or transforming bullet lists.
        quill.on("text-change", (_delta: any, _oldDelta: any, source: string) => {
          if (source !== "user") return;
          isInternalChangeRef.current = true;
          const html = quill.root.innerHTML;
          const clean = html === "<p><br></p>" ? "" : html;
          onChange(clean);
          setTimeout(() => {
            isInternalChangeRef.current = false;
          }, 0);
        });

        setIsQuillReady(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load Quill:", err);
        setLoadError("Failed to load rich text editor. Please check your network connection.");
      });

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  // If value arrives asynchronously with rich HTML while on editor tab, route safely to HTML tab
  useEffect(() => {
    if (value && hasRichHtml(value) && activeTab === "editor") {
      setActiveTab("html");
    }
  }, [value, activeTab]);

  // Sync external changes (e.g. form reset or initialData load when empty) into Quill
  useEffect(() => {
    if (!isQuillReady || !quillInstanceRef.current || isInternalChangeRef.current) return;

    // External reset (e.g. form cleared from outside)
    if (!value && hasInitializedRef.current) {
      quillInstanceRef.current.setText("", "api");
      hasInitializedRef.current = false;
      return;
    }

    // First time content arrives into Quill if it wasn't available on mount
    if (value && !hasInitializedRef.current && !hasRichHtml(value)) {
      quillInstanceRef.current.clipboard.dangerouslyPasteHTML(value, "api");
      hasInitializedRef.current = true;
    }
  }, [value, isQuillReady]);

  // Handle switching tabs
  const handleTabChange = (nextTab: "editor" | "html" | "preview") => {
    if (nextTab === "editor" && activeTab !== "editor" && hasRichHtml(value)) {
      // Warn user that switching to Quill will lose rich formatting
      pendingTabRef.current = nextTab;
      setShowRichHtmlWarning(true);
      return;
    }
    if (activeTab === "html" && nextTab === "editor") {
      // Normal switch without rich content — sync HTML into Quill
      pasteHtml(value);
    }
    setActiveTab(nextTab);
  };

  // Called when user confirms they accept losing rich styling
  const confirmRichHtmlSwitch = () => {
    setShowRichHtmlWarning(false);
    const next = pendingTabRef.current ?? "editor";
    pendingTabRef.current = null;
    pasteHtml(value);
    hasInitializedRef.current = true;
    setActiveTab(next);
  };

  const cancelRichHtmlSwitch = () => {
    setShowRichHtmlWarning(false);
    pendingTabRef.current = null;
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextHtml = e.target.value;
    onChange(nextHtml);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Rich HTML Warning Dialog */}
      {showRichHtmlWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelRichHtmlSwitch} />
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-foreground">Visual Editor Has Limited HTML Support</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Your content contains rich HTML elements (tables, definitions, figures, etc.) that the Visual Editor <strong>cannot represent</strong>. Switching to Visual Editor will <strong className="text-red-500">permanently remove that formatting</strong> from your content.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  To preserve your styling, stay in the <strong>HTML Source</strong> tab.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={cancelRichHtmlSwitch}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                Stay in HTML Source
              </button>
              <button
                type="button"
                onClick={confirmRichHtmlSwitch}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Lose Styling & Switch
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/80 shadow-2xs">
          {(["editor", "html", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {tab === "editor" ? "Visual Editor" : tab === "html" ? "HTML Source" : "Live Preview"}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground font-medium hidden sm:block">
          {activeTab === "editor" && "Rich Text Editor (Quill 2.0)"}
          {activeTab === "html" && "Raw HTML code"}
          {activeTab === "preview" && "Rendered Output (Exact Blog Styling)"}
        </div>
      </div>

      {/* Editor Tab */}
      <div className={cn("w-full transition-all", activeTab === "editor" ? "block" : "hidden")}>
        {hasRichHtml(value) && (
          <div className="mb-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5 select-none">⚠️</span>
            <div className="space-y-1 flex-1">
              <p className="font-bold">Advanced HTML elements detected</p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                This post contains custom elements (such as tables, definitions, highlights, or accordions) that cannot be edited in the Visual Editor without losing custom formatting. We recommend making edits in the <strong>HTML Source</strong> tab.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("html")}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Switch to HTML Source
                </button>
              </div>
            </div>
          </div>
        )}
        {loadError ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs">
            <p className="font-semibold">{loadError}</p>
            <p className="mt-1 text-muted-foreground">
              You can still edit content using the <strong>HTML Source</strong> tab above.
            </p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-border/80 bg-card shadow-2xs">
            {!isQuillReady && (
              <div className="min-h-[280px] p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Loading rich text editor...</span>
              </div>
            )}
            <div
              ref={containerRef}
              className={cn(
                "quill-editor-wrapper transition-opacity duration-200",
                isQuillReady ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
              )}
            />
          </div>
        )}
      </div>

      {/* HTML Tab */}
      {activeTab === "html" && (
        <div className="rounded-xl overflow-hidden border border-border/80 bg-card shadow-2xs">
          <textarea
            value={value}
            onChange={handleHtmlChange}
            rows={16}
            placeholder="<p>Write your raw HTML content here...</p>"
            className="w-full p-4 font-mono text-xs leading-relaxed bg-surface/40 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-y"
          />
        </div>
      )}

      {/* Live Preview Tab - Exactly reproduces the final blog page layout & rich-text styles */}
      {activeTab === "preview" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs min-h-[360px] overflow-y-auto">
          {value.trim() ? (
            <div className="w-full max-w-4xl mx-auto">
              <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-6 pb-2.5 border-b border-border/60 flex items-center justify-between">
                <span>Article Output Preview</span>
                <span className="text-primary font-mono text-[10px] tracking-normal">Exact Blog Styling</span>
              </div>
              <ArticleRenderer html={sanitizeHtml(value)} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[240px] text-muted-foreground text-center">
              <p className="text-xs italic">No article content written yet.</p>
              <p className="text-[11px] mt-1">Switch to the Visual Editor or HTML Source tab to start writing.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuillEditor;
