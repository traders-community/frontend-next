"use client";

import React, { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { cn } from "@/lib/utils";
import "@/styles/quill.snow.css";

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
  const [activeTab, setActiveTab] = useState<"editor" | "html" | "preview">("editor");
  const [isQuillReady, setIsQuillReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInternalChangeRef = useRef(false);

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

        // Set initial HTML
        if (value) {
          quill.clipboard.dangerouslyPasteHTML(value, "api");
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

  // Sync external changes (e.g. form reset or initialData load) into Quill,
  // but only when user is not actively editing in the HTML tab
  useEffect(() => {
    if (activeTab !== "html" && isQuillReady && quillInstanceRef.current && !isInternalChangeRef.current) {
      const currentHtml = quillInstanceRef.current.root.innerHTML;
      const cleanCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;
      if (cleanCurrent !== (value || "")) {
        quillInstanceRef.current.clipboard.dangerouslyPasteHTML(value || "", "api");
      }
    }
  }, [value, isQuillReady, activeTab]);

  // Handle switching tabs
  const handleTabChange = (nextTab: "editor" | "html" | "preview") => {
    if (activeTab === "html" && nextTab === "editor") {
      // Sync HTML edits back into Quill
      pasteHtml(value);
    }
    setActiveTab(nextTab);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextHtml = e.target.value;
    onChange(nextHtml);
  };

  return (
    <div className={cn("space-y-2", className)}>
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
