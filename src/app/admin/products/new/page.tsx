"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { FadeIn } from "@/components/motion";

export default function AddProductPage() {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmLeave(true);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <FadeIn duration={0.38} distance={14}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2"
            >
              <RiArrowLeftLine className="h-4 w-4" />
              <span>Back to Products</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Create Subscription Product
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Configure subscription duration options, pricing tiers, and unique gateway SKUs.
            </p>
          </div>
        </div>

        {/* Main Form Card Container */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <ProductForm
            onSuccess={() => {
              router.push("/admin/products");
            }}
            onCancel={handleBack}
            onDirtyChange={setIsDirty}
          />
        </div>

        {/* Discard Confirmation Dialog */}
        <ConfirmationModal
          isOpen={showConfirmLeave}
          title="Discard unsaved changes?"
          description="You have unsaved changes in this product. Leaving this page will discard your current progress."
          confirmText="Discard & Leave"
          cancelText="Stay on Page"
          confirmVariant="warning"
          onConfirm={() => {
            setShowConfirmLeave(false);
            router.push("/admin/products");
          }}
          onCancel={() => setShowConfirmLeave(false)}
        />
      </div>
    </FadeIn>
  );
}
