"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { AddBlogForm } from "@/components/admin/add-blog-form";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";

export default function AdminAddBlogPage() {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmLeave(true);
    } else {
      router.push("/admin/listBlog");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2"
          >
            <RiArrowLeftLine className="h-4 w-4" />
            <span>Back to Blog Posts</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Create New Blog Post
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Full page editor with cover thumbnail, categories, attachments, and rich article content.
          </p>
        </div>
      </div>

      {/* Main Form Card Container */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        <AddBlogForm
          onSuccess={() => {
            router.push("/admin/listBlog");
          }}
          onCancel={handleBack}
          onDirtyChange={setIsDirty}
        />
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showConfirmLeave}
        title="Discard unsaved changes?"
        description="You have unsaved changes in this post. Leaving this page will discard your current progress."
        confirmText="Discard & Leave"
        cancelText="Stay on Page"
        confirmVariant="warning"
        onConfirm={() => {
          setShowConfirmLeave(false);
          router.push("/admin/listBlog");
        }}
        onCancel={() => setShowConfirmLeave(false)}
      />
    </div>
  );
}
