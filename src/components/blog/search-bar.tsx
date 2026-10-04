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

const SEARCH_PREFIX = "Search for ";

const DYNAMIC_SEARCH_TERMS = [
  "reports, strategies, or company insights…",
  "technical analysis & price action…",
  "quarterly earnings & financial results…",
  "ICT concepts, liquidity & order blocks…",
  "market structure & key levels…",
  "macro trends & economic outlook…",
  "CFA Level 1 study guides & summaries…",
];

export function SearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder,
  className = "",
  isLoading = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(localValue, 300);
  const isClearingRef = useRef(false);

  // Typewriter animation state: "Search for " is static, dynamic terms animate
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(DYNAMIC_SEARCH_TERMS[0].length);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start paused on first complete phrase
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(
    placeholder || `${SEARCH_PREFIX}${DYNAMIC_SEARCH_TERMS[0]}`
  );

  useEffect(() => {
    // If the user has typed text, pause the animation
    if (localValue) return;

    const currentTerm = DYNAMIC_SEARCH_TERMS[phraseIndex % DYNAMIC_SEARCH_TERMS.length];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2200); // 2.2 second pause to read full query
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (charIndex > 0) {
        const deleteTimer = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
          setAnimatedPlaceholder(`${SEARCH_PREFIX}${currentTerm.substring(0, charIndex - 1)}`);
        }, 26); // 26ms smooth backspacing
        return () => clearTimeout(deleteTimer);
      } else {
        // Fully backspaced to static prefix "Search for ", pause briefly before typing next
        const nextPhraseTimer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % DYNAMIC_SEARCH_TERMS.length);
        }, 400); // 400ms pause with just "Search for "
        return () => clearTimeout(nextPhraseTimer);
      }
    } else {
      if (charIndex < currentTerm.length) {
        const typeTimer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
          setAnimatedPlaceholder(`${SEARCH_PREFIX}${currentTerm.substring(0, charIndex + 1)}`);
        }, 55); // 55ms natural typing cadence
        return () => clearTimeout(typeTimer);
      } else {
        // Complete term typed, pause before deleting
        setIsPaused(true);
      }
    }
  }, [charIndex, isDeleting, isPaused, phraseIndex, localValue]);

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
          placeholder={animatedPlaceholder}
          value={localValue}
          onChange={handleInputChange}
          className="w-full min-h-12 pl-5 sm:pl-6 pr-2 py-2 text-sm sm:text-base !bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none !border-none !shadow-none !ring-0 focus:!ring-0"
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
