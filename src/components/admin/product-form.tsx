"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiImageAddLine,
  RiDeleteBinLine,
  RiAddLine,
  RiEyeLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiStarFill,
  RiPriceTag3Line,
} from "@remixicon/react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { productService } from "@/services/product.service";
import { Product, DurationUnit } from "@/types";
import { QuillEditor } from "@/components/admin/quill-editor";
import { AdminSelect } from "@/components/admin/admin-select";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { cn } from "@/lib/utils";

export interface ProductFormProps {
  initialData?: Partial<Product>;
  isEdit?: boolean;
  onSuccess?: (product?: Product) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface FormVariation {
  _id?: string;
  title: string;
  durationValue: number | "";
  durationUnit: DurationUnit;
  actualPrice: number | "";
  sellingPrice: number | "";
  sku: string;
  isDefault: boolean;
  isActive: boolean;
}

// Universal unified input class for tactile contrast, depth, and identical typography
const inputBase =
  "w-full px-3.5 py-2.5 text-sm font-medium bg-neutral-50 dark:bg-[#060b18] border border-border/80 dark:border-[#1a2744] rounded-xl text-foreground placeholder:text-muted-foreground/40 dark:placeholder:text-muted-foreground/30 shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

export function ProductForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
  onDirtyChange,
}: ProductFormProps) {
  // 1. Title & Slug
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");

  // 2. Pricing & Variations
  const [variations, setVariations] = useState<FormVariation[]>(() => {
    if (initialData?.variations && initialData.variations.length > 0) {
      return initialData.variations.map((v) => ({
        _id: v._id,
        title: v.title || "",
        durationValue: v.durationValue ?? 1,
        durationUnit: v.durationUnit || "months",
        actualPrice: v.actualPrice ?? "",
        sellingPrice: v.sellingPrice ?? "",
        sku: v.sku || "",
        isDefault: Boolean(v.isDefault),
        isActive: v.isActive !== false,
      }));
    }
    return [];
  });

  // 3. Featured Image & Status
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.featuredImage || ""
  );
  const [isPublished, setIsPublished] = useState(initialData?.isActive ?? true);

  // 4. Key Highlights (Bullet Points)
  const [points, setPoints] = useState<string[]>(() => {
    if (initialData?.points && initialData.points.length > 0) {
      return initialData.points;
    }
    return [];
  });

  // 5. Short Description (Rich Text Quill)
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );

  // 6. Long Description (Rich Text Quill)
  const [longDescription, setLongDescription] = useState(
    initialData?.longDescription || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize state if initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setSlugStatus("idle");
      setSlugMessage("");
      setIsPublished(initialData.isActive ?? true);
      setShortDescription(initialData.shortDescription || "");
      setLongDescription(initialData.longDescription || "");
      setPoints(initialData.points || []);
      if (initialData.variations && initialData.variations.length > 0) {
        setVariations(
          initialData.variations.map((v) => ({
            _id: v._id,
            title: v.title || "",
            durationValue: v.durationValue ?? 1,
            durationUnit: v.durationUnit || "months",
            actualPrice: v.actualPrice ?? "",
            sellingPrice: v.sellingPrice ?? "",
            sku: v.sku || "",
            isDefault: Boolean(v.isDefault),
            isActive: v.isActive !== false,
          }))
        );
      } else {
        setVariations([]);
      }
      setImagePreview(initialData.featuredImage || "");
      setImageFile(null);
    }
  }, [initialData]);

  // Debounced slug check (edit mode only — matching blog pattern)
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
          const res = await productService.checkSlugAvailability(
            value,
            initialData._id
          );
          if (res.data?.success) {
            if (res.data.available) {
              setSlugStatus("available");
              setSlugMessage(
                res.data.normalized
                  ? `Will be saved as: ${res.data.normalized}`
                  : "Slug is available"
              );
            } else {
              setSlugStatus("taken");
              setSlugMessage("This slug is already used by another product");
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
    [isEdit, initialData]
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val);
    checkSlug(val);
  };

  // Track dirty state
  useEffect(() => {
    const initialTitle = initialData?.title || "";
    const initialSlug = initialData?.slug || "";
    const initialDesc = initialData?.longDescription || "";
    const initialShortDesc = initialData?.shortDescription || "";
    const initialPublished = initialData?.isActive ?? true;

    const hasChanged = initialData
      ? title !== initialTitle ||
        slug !== initialSlug ||
        shortDescription !== initialShortDesc ||
        longDescription !== initialDesc ||
        isPublished !== initialPublished ||
        Boolean(imageFile) ||
        points.length !== (initialData.points?.length || 0) ||
        variations.length !== (initialData.variations?.length || 0)
      : Boolean(
          title.trim() ||
            shortDescription.trim() ||
            longDescription.trim() ||
            imageFile ||
            points.length > 0 ||
            variations.length > 0
        );

    onDirtyChange?.(hasChanged);
  }, [
    title,
    slug,
    shortDescription,
    longDescription,
    isPublished,
    imageFile,
    points,
    variations,
    initialData,
    onDirtyChange,
  ]);

  // Points Handlers
  const handleAddPoint = () => {
    setPoints((prev) => [...prev, ""]);
  };

  const handleUpdatePoint = (index: number, val: string) => {
    setPoints((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemovePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Variations Handlers
  const handleAddVariation = () => {
    const nextDuration =
      variations.length === 0
        ? 1
        : variations.length === 1
        ? 3
        : variations.length === 2
        ? 6
        : 12;

    setVariations((prev) => [
      ...prev,
      {
        title: "",
        durationValue: nextDuration,
        durationUnit: "months",
        actualPrice: "",
        sellingPrice: "",
        sku: "",
        isDefault: prev.length === 0,
        isActive: true,
      },
    ]);
  };

  const handleUpdateVariation = (
    index: number,
    field: keyof FormVariation,
    value: unknown
  ) => {
    setVariations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSetDefaultVariation = (index: number) => {
    setVariations((prev) =>
      prev.map((v, i) => ({
        ...v,
        isDefault: i === index,
      }))
    );
  };

  const handleRemoveVariation = (index: number) => {
    setVariations((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((v) => v.isDefault)) {
        next[0].isDefault = true;
      }
      return next;
    });
  };

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

  // Slug status icon helper
  const slugStatusIcon = () => {
    if (slugStatus === "checking")
      return (
        <RiLoader4Line className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      );
    if (slugStatus === "available")
      return <RiCheckLine className="h-3.5 w-3.5 text-emerald-500" />;
    if (slugStatus === "taken" || slugStatus === "error")
      return <RiCloseLine className="h-3.5 w-3.5 text-red-500" />;
    return null;
  };

  const slugMessageColor =
    slugStatus === "available"
      ? "text-emerald-500"
      : slugStatus === "taken" || slugStatus === "error"
      ? "text-red-500"
      : "text-muted-foreground";

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (isEdit) {
      if (!slug.trim()) {
        toast.error("Slug cannot be empty");
        return;
      }
      if (slugStatus === "taken") {
        toast.error("Please choose a different slug — this one is already in use");
        return;
      }
      if (slugStatus === "checking") {
        toast.error("Please wait while we verify slug availability");
        return;
      }
    }

    if (variations.length === 0) {
      toast.error("Please add at least one subscription plan tier");
      return;
    }

    // Validate variations
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      if (!v.title.trim()) {
        toast.error(`Plan Tier #${i + 1} requires a title (e.g. 1 Month Access)`);
        return;
      }
      if (v.sellingPrice === "" || Number(v.sellingPrice) < 0) {
        toast.error(`Plan Tier #${i + 1} requires a valid selling price`);
        return;
      }
      if (!v.sku.trim()) {
        toast.error(`Plan Tier #${i + 1} requires a unique gateway SKU`);
        return;
      }
    }

    if (!isEdit && !imageFile && !imagePreview) {
      toast.error("A featured cover image is required");
      return;
    }

    // Sanitize rich descriptions
    const cleanShortDesc = sanitizeHtml(shortDescription);
    const plainShortText = cleanShortDesc.replace(/<[^>]*>/g, "").trim();
    if (!plainShortText) {
      toast.error("Short description cannot be empty");
      return;
    }

    const cleanLongDesc = sanitizeHtml(longDescription);
    const cleanPoints = points.map((p) => p.trim()).filter(Boolean);

    const cleanVariations = variations.map((v) => ({
      ...v,
      title: v.title.trim(),
      durationValue: Math.max(1, Number(v.durationValue) || 1),
      actualPrice:
        v.actualPrice === "" ? 0 : Math.max(0, Number(v.actualPrice) || 0),
      sellingPrice: Math.max(0, Number(v.sellingPrice) || 0),
      sku: v.sku.trim().toUpperCase(),
    }));

    if (!cleanVariations.some((v) => v.isDefault)) {
      cleanVariations[0].isDefault = true;
    }

    try {
      setIsSaving(true);
      const productPayload: Record<string, unknown> = {
        title: title.trim(),
        shortDescription: cleanShortDesc,
        longDescription: cleanLongDesc,
        points: cleanPoints,
        variations: cleanVariations,
        isActive: Boolean(isPublished),
        featuredImage: imagePreview,
      };

      if (isEdit && slug.trim()) {
        productPayload.slug = slug.trim();
      }

      const formData = new FormData();
      formData.append("product", JSON.stringify(productPayload));
      if (imageFile) {
        formData.append("featuredImage", imageFile);
      }

      if (isEdit && initialData?._id) {
        const res = await productService.updateProduct(initialData._id, formData);
        if (res.data?.success) {
          toast.success(res.data.message || "Product updated successfully");
          onDirtyChange?.(false);
          const returnedProduct = res.data.product || res.data.data;
          onSuccess?.(returnedProduct);
        } else {
          toast.error(res.data?.message || "Failed to update product");
        }
      } else {
        const res = await productService.createProduct(formData);
        if (res.data?.success) {
          toast.success(res.data.message || "Product created successfully");
          onDirtyChange?.(false);
          const returnedProduct = res.data.product || res.data.data;
          onSuccess?.(returnedProduct);
        } else {
          toast.error(res.data?.message || "Failed to create product");
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* =========================================================================
          1. Title & URL Slug (Slug in Edit Mode Only)
         ========================================================================= */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Futures & Options (F&O) Mastery"
            className={inputBase}
            required
          />
        </div>

        {/* Slug Field — Only rendered in Edit mode */}
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
                placeholder="futures-and-options-mastery"
                spellCheck={false}
                className={cn(
                  inputBase,
                  "font-mono pr-9",
                  slugStatus === "taken" || slugStatus === "error"
                    ? "border-red-500/60 focus:border-red-500"
                    : slugStatus === "available"
                    ? "border-emerald-500/60 focus:border-emerald-500"
                    : ""
                )}
              />
              {slugStatusIcon() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {slugStatusIcon()}
                </span>
              )}
            </div>
            <div
              className={`mt-1.5 flex items-center justify-between gap-2 text-[11px] ${slugMessageColor}`}
            >
              <span>
                {slugMessage ||
                  (slug === initialData?.slug
                    ? "Current URL slug — modify only if you want to alter the public link"
                    : "")}
              </span>
              {slug && (
                <span className="text-muted-foreground shrink-0 truncate max-w-[280px]">
                  /product/<span className="font-mono text-foreground font-semibold">{slug}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. Subscription Plans & Pricing (Variations)
         ========================================================================= */}
      <div className="space-y-4 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subscription Plans & Pricing (Variations) <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Configure duration tiers and pricing. Star a plan to set it as the default selected option.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddVariation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <RiAddLine className="h-4 w-4" />
            <span>Add Plan Tier</span>
          </button>
        </div>

        {variations.length === 0 ? (
          <div
            onClick={handleAddVariation}
            className="p-8 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 text-center space-y-2 cursor-pointer transition-colors bg-neutral-50/50 dark:bg-[#060b18]/40"
          >
            <div className="h-10 w-10 mx-auto rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
              <RiPriceTag3Line className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              No subscription plans added yet
            </p>
            <p className="text-[11px] text-muted-foreground">
              Click &quot;+ Add Plan Tier&quot; to configure your first duration option (e.g., 1 Month, 3 Months, 1 Year).
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {variations.map((v, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border transition-all space-y-4 bg-card",
                  v.isDefault
                    ? "border-primary/50 shadow-2xs ring-1 ring-primary/20"
                    : "border-border/80 hover:border-border"
                )}
              >
                {/* Header Row: Tier Index, Default Star Badge, Active Toggle, Delete */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-foreground tracking-tight">
                      Tier #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetDefaultVariation(index)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                        v.isDefault
                          ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                          : "bg-neutral-100 text-neutral-600 dark:bg-[#060b18] dark:text-neutral-400 hover:text-foreground border border-border/70"
                      )}
                      title={v.isDefault ? "Default pre-selected plan" : "Click to set as default"}
                    >
                      <RiStarFill
                        className={cn(
                          "h-3.5 w-3.5",
                          v.isDefault ? "text-primary" : "text-muted-foreground/40"
                        )}
                      />
                      <span>{v.isDefault ? "Default Plan" : "Set as Default"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={v.isActive}
                        onChange={(e) =>
                          handleUpdateVariation(index, "isActive", e.target.checked)
                        }
                        className="rounded text-primary focus:ring-primary/40 cursor-pointer h-3.5 w-3.5"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(index)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove plan tier"
                    >
                      <RiDeleteBinLine className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Clean 2-Row Form Grid with Balanced Proportions */}
                <div className="space-y-3">
                  {/* Row 1: Plan Title (7 cols) & Gateway SKU (5 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Plan Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) =>
                          handleUpdateVariation(index, "title", e.target.value)
                        }
                        placeholder="e.g. 1 Month Access"
                        className={inputBase}
                        required
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Gateway SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) =>
                          handleUpdateVariation(
                            index,
                            "sku",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="e.g. TC-TG-1M"
                        className={cn(inputBase, "font-mono uppercase")}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Duration (4 cols), MRP Price (4 cols), Selling Price (4 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={v.durationValue}
                          onChange={(e) =>
                            handleUpdateVariation(
                              index,
                              "durationValue",
                              e.target.value === ""
                                ? ""
                                : Math.max(1, parseInt(e.target.value, 10) || 1)
                            )
                          }
                          placeholder="1"
                          className={cn(inputBase, "w-20 text-center")}
                          required
                        />
                        <div className="flex-1">
                          <AdminSelect
                            value={v.durationUnit}
                            onChange={(val) =>
                              handleUpdateVariation(
                                index,
                                "durationUnit",
                                val as DurationUnit
                              )
                            }
                            options={[
                              { value: "days", label: "Days" },
                              { value: "months", label: "Months" },
                              { value: "years", label: "Years" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Original Price (MRP ₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.actualPrice}
                        onChange={(e) =>
                          handleUpdateVariation(
                            index,
                            "actualPrice",
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        placeholder="e.g. 1999"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Selling Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.sellingPrice}
                        onChange={(e) =>
                          handleUpdateVariation(
                            index,
                            "sellingPrice",
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        placeholder="e.g. 999"
                        className={inputBase}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          3. Featured Cover Image (1:1 Square) & Publication Status
         ========================================================================= */}
      <div className="space-y-4 pt-2 border-t border-border/60">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Featured Image (1:1 Square) {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <p className="text-[11px] text-muted-foreground mb-3">
            Displayed on store cards, product page hero, and checkout. Required aspect ratio: <strong>1:1 Square (1000×1000px or 1200×1200px)</strong>.
          </p>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <PhotoProvider speed={() => 300} maskOpacity={0.85}>
              <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border border-border/80 dark:border-white/[0.08] group bg-muted">
                <PhotoView src={imagePreview}>
                  <img
                    src={imagePreview}
                    alt="Product Cover"
                    className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-102"
                  />
                </PhotoView>
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <PhotoView src={imagePreview}>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 text-xs font-semibold bg-white text-black rounded-lg shadow-md cursor-pointer pointer-events-auto flex items-center gap-1 hover:bg-neutral-100 transition-colors"
                      title="Preview in full screen"
                    >
                      <RiEyeLine className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                  </PhotoView>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-white text-black rounded-lg shadow-md cursor-pointer pointer-events-auto hover:bg-neutral-100 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="p-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg shadow-md cursor-pointer pointer-events-auto hover:bg-red-600 transition-colors"
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
              className="aspect-square max-w-xs mx-auto w-full rounded-2xl border-2 border-dashed border-border/80 dark:border-[#1e2c4f] hover:border-primary/60 bg-neutral-50 dark:bg-[#060b18] hover:bg-neutral-100/80 dark:hover:bg-[#0a1226] transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer p-6"
            >
              <div className="h-10 w-10 rounded-xl bg-card dark:bg-[#0d162c] border border-border/80 dark:border-[#1e2c4f] flex items-center justify-center text-primary">
                <RiImageAddLine className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center">
                Upload 1:1 Square Product Image
              </span>
              <span className="text-[11px] text-muted-foreground text-center">
                1000×1000px (1:1 Square) • PNG, JPG, or WebP
              </span>
            </button>
          )}
        </div>

        {/* Integrated Publication Status Strip — Clean, No Empty Space */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-[#060b18] border border-border/80 dark:border-[#1a2744]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Publication Status
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isPublished
                ? "Published — Live, active, and visible to customers in the store."
                : "Draft — Unpublished and hidden from customer view."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/70 shrink-0">
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                !isPublished
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                isPublished
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isPublished ? "bg-emerald-400" : "bg-muted-foreground"
                )}
              />
              <span>Published</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. Key Highlights / Feature Bullet Points
         ========================================================================= */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Key Highlights / Features (Optional)
            </label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Add bullet points that highlight what members get inside the channel.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddPoint}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-foreground border border-border/80 transition-colors cursor-pointer shrink-0"
          >
            <RiAddLine className="h-3.5 w-3.5" />
            <span>Add Point</span>
          </button>
        </div>

        {points.length === 0 ? (
          <div
            onClick={handleAddPoint}
            className="p-5 rounded-xl border border-dashed border-border/80 hover:border-primary/50 text-center text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-neutral-50/50 dark:bg-[#060b18]/40"
          >
            No feature highlights added yet. Click &quot;+ Add Point&quot; to add a bullet point.
          </div>
        ) : (
          <div className="space-y-2">
            {points.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-surface text-muted-foreground flex items-center justify-center text-xs font-mono shrink-0 border border-border/70 font-semibold">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleUpdatePoint(index, e.target.value)}
                  placeholder="e.g. Daily Live Market Analysis & High Probability Setups"
                  className={cn(inputBase, "flex-1")}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePoint(index)}
                  className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove point"
                >
                  <RiDeleteBinLine className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          5. Short Description (Rich Text Editor)
         ========================================================================= */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Short Description <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-muted-foreground mb-2">
            A concise overview of the product, key value propositions, and who it is for.
          </p>
        </div>
        <QuillEditor
          value={shortDescription}
          onChange={setShortDescription}
          placeholder="Write a concise overview of the product, trading focus, and core value proposition..."
        />
      </div>

      {/* =========================================================================
          6. Full / Long Description (Rich Text Editor)
         ========================================================================= */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Full Description (Optional)
          </label>
          <p className="text-[11px] text-muted-foreground mb-2">
            Compose comprehensive product details, curriculum/channel breakdown, and trading methodology.
          </p>
        </div>
        <QuillEditor
          value={longDescription}
          onChange={setLongDescription}
          placeholder="Compose detailed product description, trading methodology, and channel benefits..."
        />
      </div>

      {/* =========================================================================
          7. Footer Buttons
         ========================================================================= */}
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
          disabled={
            isSaving ||
            (isEdit && (slugStatus === "taken" || slugStatus === "error"))
          }
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSaving && (
            <div className="h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
          )}
          <span>
            {isEdit
              ? "Update Product"
              : isPublished
              ? "Publish Product"
              : "Save as Draft"}
          </span>
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
