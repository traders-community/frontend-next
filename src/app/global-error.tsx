"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#080e1e] text-[#f4f4f4] p-6 font-sans">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight">System Encountered an Error</h1>
          <p className="text-sm text-gray-400">
            A fatal error occurred. Please try reloading the application.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-gray-500">ID: {error.digest}</p>
          )}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#00c950] text-[#080e1e] font-semibold rounded-xl hover:bg-[#00b046] transition-colors cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
