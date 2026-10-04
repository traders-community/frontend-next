"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { FadeIn } from "@/components/motion";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  useEffect(() => {
    productService
      .getAdminProductById(id)
      .then((res) => {
        if (res.data?.success && res.data.product) {
          setProduct(res.data.product);
        } else {
          toast.error(res.data?.message || "Failed to load product details");
          router.push("/admin/products");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load product details");
        router.push("/admin/products");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmLeave(true);
    } else {
      router.push("/admin/products");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RiLoader4Line className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-medium text-muted-foreground">
          Loading product configuration...
        </span>
      </div>
    );
  }

  if (!product) {
    return null;
  }

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
              Edit Product: {product.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Update duration plan tiers, prices, gateway SKUs, and product details.
            </p>
          </div>
        </div>

        {/* Main Form Card Container */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <ProductForm
            isEdit={true}
            initialData={product}
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
