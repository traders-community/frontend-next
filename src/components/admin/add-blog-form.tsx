"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiImageAddLine,
  RiFilePdfLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiEyeLine,
} from "@remixicon/react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { categoryService } from "@/services/category.service";
import { blogService } from "@/services/blog.service";
import { Blog, Category } from "@/types";
import { QuillEditor } from "@/components/admin/quill-editor";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

export interface AddBlogFormProps {
  initialData?: Partial<Blog>;
  isEdit?: boolean;
  onSuccess?: (blog?: Blog) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

export function AddBlogForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
  onDirtyChange,
}: AddBlogFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [subTitle, setSubTitle] = useState(initialData?.subTitle || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Files & Attachments
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>(
    initialData?.pdf?.name || ""
  );
  const [removePdf, setRemovePdf] = useState(false);

  // Statuses
  const [isSaving, setIsSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setSlugStatus("idle");
      setSlugMessage("");
      setSubTitle(initialData.subTitle || "");
      setCategory(initialData.category || "");
      setDescription(initialData.description || "");
      setIsPublished(initialData.isPublished ?? false);
      setImagePreview(initialData.image || "");
      setPdfFileName(initialData.pdf?.name || "");
      setRemovePdf(false);
      setImageFile(null);
      setPdfFile(null);
    }
  }, [initialData]);

  // Debounced slug availability check (edit mode only)
  const checkSlug = useCallback(
    (value: string) => {
      if (!isEdit || !initialData?._id) return;
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);

      if (value === (initialData?.slug || "")) {
        setSlugStatus("idle");
        setSlugMessage("");
        return;
      }

      if (!value.trim()) {
        setSlugStatus("error");
        setSlugMessage("Slug cannot be empty");
        return;
      }

      setSlugStatus("checking");
      setSlugMessage("");

      slugDebounceRef.current = setTimeout(async () => {
        try {
          const res = await blogService.checkSlugAvailability(value, initialData._id);
          if (res.data?.success) {
            if (res.data.available) {
              setSlugStatus("available");
              setSlugMessage(res.data.normalized ? `Will be saved as: ${res.data.normalized}` : "Slug is available");
            } else {
              setSlugStatus("taken");
              setSlugMessage("This slug is already used by another post");
            }
          } else {
            setSlugStatus("error");
            setSlugMessage(res.data?.message || "Could not check availability");
          }
        } catch {
          setSlugStatus("error");
          setSlugMessage("Could not check slug availability");
        }
      }, 500);
    },
    [isEdit, initialData?._id, initialData?.slug]
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val);
    checkSlug(val);
  };

  // Dirty state tracker
  useEffect(() => {
    const initialTitle = initialData?.title || "";
    const initialSlug = initialData?.slug || "";
    const initialSubTitle = initialData?.subTitle || "";
    const initialCategory = initialData?.category || "";
    const initialDesc = initialData?.description || "";
    const initialPublished = initialData?.isPublished ?? false;

    const hasChanged = initialData
      ? title !== initialTitle ||
        slug !== initialSlug ||
        subTitle !== initialSubTitle ||
        (Boolean(category) && category !== initialCategory) ||
        description !== initialDesc ||
        isPublished !== initialPublished ||
        Boolean(imageFile) ||
        Boolean(pdfFile) ||
        removePdf
      : Boolean(
          title.trim() ||
            subTitle.trim() ||
            description.trim() ||
            imageFile ||
            pdfFile
        );

    onDirtyChange?.(hasChanged);
  }, [
    title,
    slug,
    subTitle,
    category,
    description,
    isPublished,
    imageFile,
    pdfFile,
    removePdf,
    initialData,
    onDirtyChange,
  ]);

  // Fetch Public Categories
  useEffect(() => {
    categoryService
      .getPublicCategories()
      .then((res) => {
        if (res.data?.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          if (!category) {
            setCategory(res.data.categories[0].name);
          }
        }
      })
      .catch(() => {
        toast.error("Failed to load categories");
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, [category]);

  // Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WEBP)");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // PDF Selection
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a valid PDF document");
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
      setRemovePdf(false);
    }
  };

  // Slug status icon helper
  const slugStatusIcon = () => {
    if (slugStatus === "checking") return <RiLoader4Line className="h-3.5 w-3.5 animate-spin text-muted-foreground" />;
    if (slugStatus === "available") return <RiCheckLine className="h-3.5 w-3.5 text-emerald-500" />;
    if (slugStatus === "taken" || slugStatus === "error") return <RiCloseLine className="h-3.5 w-3.5 text-red-500" />;
    return null;
  };

  const slugMessageColor =
    slugStatus === "available" ? "text-emerald-500"
    : (slugStatus === "taken" || slugStatus === "error") ? "text-red-500"
    : "text-muted-foreground";

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    // Slug validation in edit mode
    if (isEdit) {
      if (!slug.trim()) { toast.error("Slug cannot be empty"); return; }
      if (slugStatus === "taken") { toast.error("Please choose a different slug — this one is already in use"); return; }
      if (slugStatus === "checking") { toast.error("Please wait while we verify the slug availability"); return; }
    }

    // Strip empty HTML like <p><br></p>
    const cleanDescription = sanitizeHtml(description);
    const plainText = cleanDescription.replace(/<[^>]*>/g, "").trim();
    const hasMedia = /<img|<iframe/i.test(cleanDescription);

    if (!plainText && !hasMedia) {
      toast.error("Blog description cannot be empty");
      return;
    }

    if (!isEdit && !imageFile && !imagePreview) {
      toast.error("A thumbnail cover image is required");
      return;
    }

    try {
      setIsSaving(true);
      const blogPayload: Record<string, unknown> = {
        title: title.trim(),
        subTitle: subTitle.trim(),
        description: cleanDescription,
        category,
        isPublished: Boolean(isPublished),
        removePdf,
      };

      // Always include slug when editing so the backend preserves/updates it
      if (isEdit) blogPayload.slug = slug.trim();

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blogPayload));
      if (imageFile) formData.append("image", imageFile);
      if (pdfFile) formData.append("pdf", pdfFile);

      if (isEdit && initialData?._id) {
        const res = await blogService.updateBlog(initialData._id, formData);
        if (res.data?.success) {
          toast.success(res.data.message || "Blog updated successfully");
          onDirtyChange?.(false);
          onSuccess?.(res.data.blog);
        } else {
          toast.error(res.data?.message || "Failed to update blog");
        }
      } else {
        const res = await blogService.addBlog(formData);
        if (res.data?.success) {
          toast.success(res.data.message || "Blog created successfully");
          onDirtyChange?.(false);
          onSuccess?.(res.data.blog);
        } else {
          toast.error(res.data?.message || "Failed to create blog post");
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to save blog post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Title, Slug & Subtitle */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Post Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master the Key Levels in Modern Market Structure"
            className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            required
          />
        </div>

        {/* Slug field — always visible in edit mode (WordPress-style) */}
        {isEdit && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              URL Slug
            </label>
            <div className="relative">
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="url-friendly-slug"
                spellCheck={false}
                className={`w-full pl-4 pr-9 py-2.5 text-sm bg-card border rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono ${
                  slugStatus === "taken" || slugStatus === "error"
                    ? "border-red-500/60 focus:border-red-500"
                    : slugStatus === "available"
                    ? "border-emerald-500/60 focus:border-emerald-500"
                    : "border-border/80 focus:border-primary"
                }`}
              />
              {slugStatusIcon() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {slugStatusIcon()}
                </span>
              )}
            </div>
            <div className={`mt-1 flex items-center justify-between gap-2 text-[11px] ${slugMessageColor}`}>
              <span>
                {slugMessage || (slug === initialData?.slug ? "Current slug — change only if you want to update the URL" : "")}
              </span>
              {slug && (
                <span className="text-muted-foreground shrink-0 truncate max-w-[220px]">
                  /blog/<span className="font-mono text-foreground">{slug}</span>
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Subtitle / Summary
          </label>
          <input
            type="text"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Brief hook or summary for previews and social share cards"
            className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* 2. Category & Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loadingCategories}
            className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publish Status Toggle */}
        <div className="flex flex-col justify-end">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Publication Status
          </label>
          <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/80 bg-card cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/30 cursor-pointer accent-primary"
            />
            <span className="text-sm font-medium text-foreground">
              {isPublished ? "Published" : "Unpublished"}
            </span>
          </label>
        </div>
      </div>

      {/* 3. Cover Image & PDF Attachments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cover Image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Cover Thumbnail {!isEdit && <span className="text-red-500">*</span>}
          </label>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <PhotoProvider speed={() => 300} maskOpacity={0.85}>
              <div className="relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden border border-border/80 group bg-muted">
                <PhotoView src={imagePreview}>
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    className="h-full w-full object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                  />
                </PhotoView>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <PhotoView src={imagePreview}>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded-lg shadow cursor-pointer pointer-events-auto flex items-center gap-1 hover:bg-neutral-100 transition-colors"
                      title="Preview in full screen"
                    >
                      <RiEyeLine className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                  </PhotoView>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded-lg shadow cursor-pointer pointer-events-auto hover:bg-neutral-100 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="p-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg shadow cursor-pointer pointer-events-auto hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </PhotoProvider>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="aspect-video w-full max-w-sm rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-surface/40 hover:bg-surface/70 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RiImageAddLine className="h-8 w-8 text-primary" />
              <span className="text-xs font-semibold">Upload Cover Image</span>
              <span className="text-[11px] text-muted-foreground">16:9 Widescreen (PNG, JPG, WebP)</span>
            </button>
          )}
        </div>

        {/* PDF Attachment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Optional PDF Guide
          </label>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="hidden"
          />

          {pdfFileName && !removePdf ? (
            <div className="h-40 w-full rounded-2xl border border-border/80 bg-card p-4 flex flex-col items-center justify-center text-center gap-2">
              <RiFilePdfLine className="h-10 w-10 text-red-500" />
              <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                {pdfFileName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  Replace
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPdfFile(null);
                    setPdfFileName("");
                    setRemovePdf(true);
                  }}
                  className="text-xs text-red-500 font-medium hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="h-40 w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-surface/40 hover:bg-surface/70 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RiFilePdfLine className="h-8 w-8 text-red-400" />
              <span className="text-xs font-semibold">Attach PDF Resource</span>
              <span className="text-[11px] text-muted-foreground">Optional cheat sheet / document</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Rich Article Content with Quill WYSIWYG */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Article Content <span className="text-red-500">*</span>
        </label>
        <QuillEditor
          value={description}
          onChange={setDescription}
          placeholder="Compose your article with full headings, lists, formatting, links, and images..."
        />
      </div>

      {/* 5. Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-border/80 text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || (isEdit && (slugStatus === "taken" || slugStatus === "error"))}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSaving && (
            <div className="h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
          )}
          <span>{isEdit ? "Update Post" : isPublished ? "Publish Post" : "Save as Draft"}</span>
        </button>
      </div>
    </form>
  );
}

export default AddBlogForm;
