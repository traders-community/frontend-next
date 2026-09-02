"use client";

import React from "react";
import { RiFilePdf2Line, RiExternalLinkLine } from "@remixicon/react";
import { api } from "@/lib/api/client";

interface PdfAttachmentProps {
  blogIdOrSlug: string;
  pdf: {
    name?: string;
    contentType?: string;
  };
}

export function PdfAttachment({ blogIdOrSlug, pdf }: PdfAttachmentProps) {
  if (!pdf || !pdf.name) return null;

  const pdfUrl = `${api.baseURL}/blog/${blogIdOrSlug}/pdf`;

  return (
    <section aria-label="Attachments" className="w-full mt-10">
      <h3 className="text-base font-semibold mb-3 text-primary flex items-center gap-2">
        <span>Attachments</span>
      </h3>

      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between p-4 bg-card/90 border border-border hover:border-primary/60 rounded-xl transition-all duration-200 shadow-sm max-w-md cursor-pointer hover:shadow-md hover:shadow-primary/5"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <RiFilePdf2Line className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate pr-2 group-hover:text-primary transition-colors">
              {pdf.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">PDF Document</p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity pl-3">
          <span>Preview</span>
          <RiExternalLinkLine className="w-3.5 h-3.5" />
        </div>
      </a>
    </section>
  );
}

export default PdfAttachment;
