"use client";

import React, { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiCloseLine, RiLoader4Line } from "@remixicon/react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "Search reports, strategies, or company insights…",
  className = "",
  isLoading = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(localValue, 300);
  const isClearingRef = useRef(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmed = localValue.trim();
    onChange(trimmed);
    if (onSubmit) onSubmit();
  };

  const handleClear = () => {
    isClearingRef.current = true;
    setLocalValue("");
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isClearingRef.current = false;
    setLocalValue(e.target.value);
  };

  // Synchronize debounced value without reverting clear operations
  useEffect(() => {
    if (isClearingRef.current) {
      if (debouncedValue === "") {
        isClearingRef.current = false;
      }
      return;
    }
    if (debouncedValue !== value) {
      onChange(debouncedValue.trim());
    }
  }, [debouncedValue, onChange, value]);

  return (
    <div suppressHydrationWarning className="w-full px-4 sm:px-0">
      <form
        suppressHydrationWarning
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search reports, strategies, or company insights"
        className={`mx-auto w-full sm:max-w-lg relative flex items-center
                   border border-primary/50 bg-card/85 backdrop-blur-md rounded-full overflow-hidden
                   shadow-md shadow-primary/5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20
                   transition-all duration-200 ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          className="w-full min-h-12 pl-5 sm:pl-6 pr-2 py-2 text-sm sm:text-base bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none"
          aria-label="Search input"
        />

        {/* Clear Button when input has text */}
        {localValue.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-none p-2 mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition active:scale-95"
            aria-label="Clear search"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        )}

        {/* Single Right Search Button (Original Design) */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-none bg-primary text-black font-semibold
                     h-10 w-10 sm:h-11 sm:w-11 m-1 rounded-full hover:bg-primary/90 active:scale-95
                     transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-80"
          aria-label="Submit search"
        >
          {isLoading ? (
            <RiLoader4Line className="w-4 h-4 text-black animate-spin" />
          ) : (
            <RiSearchLine className="w-4 h-4 text-black" />
          )}
          <span className="sr-only">Search</span>
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
