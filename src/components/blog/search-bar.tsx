"use client";

import React, { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search reports, strategies, or company insights…",
  className = "",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localValue.trim();
    onChange(trimmed);
    if (onSubmit) onSubmit();
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  // Debounced realtime search (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue.trim());
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <div className="w-full px-4 sm:px-0">
      <form
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
          className="flex-none bg-primary text-black font-semibold
                     h-10 w-10 sm:h-11 sm:w-11 m-1 rounded-full hover:bg-primary/90 active:scale-95
                     transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer"
          aria-label="Submit search"
        >
          <RiSearchLine className="w-4 h-4 text-black" />
          <span className="sr-only">Search</span>
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
